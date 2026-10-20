import { NextResponse } from 'next/server';
import { adminRoute, readJson } from '@/lib/cms/api';
import { CmsError } from '@/lib/cms/admin-store';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingTable } from '@/lib/cms/store';

export const GET = adminRoute(async (req: Request) => {
    const kind = new URL(req.url).searchParams.get('kind');
    let query = createAdminClient().from('cms_media').select('*').order('created_at', { ascending: false }).limit(1000);
    if (kind === 'image' || kind === 'video' || kind === 'font') query = query.eq('kind', kind);
    const { data, error } = await query;
    if (error) {
        if (isMissingTable(error)) return NextResponse.json({ items: [], setupRequired: true });
        throw new CmsError(error.message);
    }
    return NextResponse.json({ items: data ?? [] });
});

/** Rename / describe a file. Body: { id, name?, alt? }. */
export const PATCH = adminRoute(async (req: Request) => {
    const { id, name, alt } = await readJson(req);
    if (typeof id !== 'string') throw new CmsError('Missing file id.', 400);
    const patch: Record<string, string> = {};
    if (typeof name === 'string') patch.name = name.slice(0, 200);
    if (typeof alt === 'string') patch.alt = alt.slice(0, 500);
    const { data, error } = await createAdminClient().from('cms_media').update(patch).eq('id', id).select().single();
    if (error) throw new CmsError(error.message);
    return NextResponse.json({ item: data });
});

/**
 * Delete a file - but not while the site still uses it, which would leave a
 * broken image on a live page. Every content document (draft and published)
 * and every dish photo is searched for the file's address first.
 */
export const DELETE = adminRoute(async (req: Request) => {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) throw new CmsError('Missing file id.', 400);
    const db = createAdminClient();
    const { data: item, error } = await db.from('cms_media').select('*').eq('id', id).maybeSingle();
    if (error) throw new CmsError(error.message);
    if (!item) return NextResponse.json({ ok: true });

    const [drafts, published, dishes] = await Promise.all([
        db.from('cms_drafts').select('key, data'),
        db.from('cms_published').select('key, data'),
        db.from('menu_items').select('title').eq('image_src', item.url),
    ]);
    const usedIn = new Set<string>();
    for (const row of [...(drafts.data ?? []), ...(published.data ?? [])]) {
        if (JSON.stringify(row.data).includes(item.url)) usedIn.add(row.key);
    }
    for (const dish of dishes.data ?? []) usedIn.add(`dish "${dish.title}"`);
    if (usedIn.size) {
        throw new CmsError(`This file is still used on the site (${[...usedIn].join(', ')}). Replace it there first, then delete it.`, 409);
    }

    await db.storage.from(item.bucket).remove([item.path]);
    const { error: delError } = await db.from('cms_media').delete().eq('id', id);
    if (delError) throw new CmsError(delError.message);
    return NextResponse.json({ ok: true });
});
