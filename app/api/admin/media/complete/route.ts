import { NextResponse } from 'next/server';
import { adminRoute, readJson } from '@/lib/cms/api';
import { CmsError } from '@/lib/cms/admin-store';
import { MEDIA_BUCKET, MEDIA_PATH, MEDIA_TYPES, extensionOf, matchesSignature } from '@/lib/cms/media';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Step 2 of an upload: verify what actually arrived in Storage and record it
 * in the media library. A file whose bytes do not match its extension is
 * deleted again - the extension alone proves nothing.
 */
export const POST = adminRoute(async (req: Request) => {
    const { path, name, width, height } = await readJson(req);
    if (typeof path !== 'string' || !MEDIA_PATH.test(path)) throw new CmsError('Invalid upload path.', 400);
    const ext = extensionOf(path);
    const type = MEDIA_TYPES[ext];
    if (!type) throw new CmsError('Unsupported file type.', 415);

    const db = createAdminClient();
    const url = db.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

    const head = await fetch(url, { headers: { Range: 'bytes=0-63' }, cache: 'no-store' });
    if (!head.ok) throw new CmsError('The upload did not arrive. Please try again.', 400);
    const bytes = new Uint8Array(await head.arrayBuffer());
    const total = Number(head.headers.get('content-range')?.split('/')[1] ?? head.headers.get('content-length') ?? 0);

    if (!matchesSignature(ext, bytes)) {
        await db.storage.from(MEDIA_BUCKET).remove([path]);
        throw new CmsError(`That file is not really a .${ext} file, so it was removed.`, 415);
    }

    const { data, error } = await db.from('cms_media').insert({
        bucket: MEDIA_BUCKET,
        path,
        url,
        kind: type.kind,
        mime: type.mime,
        size: Number.isFinite(total) ? total : 0,
        width: typeof width === 'number' ? Math.round(width) : null,
        height: typeof height === 'number' ? Math.round(height) : null,
        name: typeof name === 'string' ? name.slice(0, 200) : '',
    }).select().single();
    if (error) throw new CmsError(error.message);
    return NextResponse.json({ item: data });
});
