import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminRoute, readJson } from '@/lib/cms/api';
import { CmsError } from '@/lib/cms/admin-store';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Menu categories. The id is a URL slug ("e-noodles") that the menu page uses
 * as its anchor (/menu#e-noodles), so it is fixed at creation and only the
 * display name can change - renaming must not break links into the menu.
 */
function refresh() {
    revalidatePath('/menu');
    revalidatePath('/');
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

export const POST = adminRoute(async (req: Request) => {
    const { name } = await readJson(req);
    if (typeof name !== 'string' || !name.trim()) throw new CmsError('Give the category a name.', 400);
    const db = createAdminClient();
    const { data: existing } = await db.from('menu_categories').select('id, sort_order');
    const ids = new Set((existing ?? []).map(c => c.id));
    const base = slug(name) || 'category';
    let id = base;
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    const sortOrder = Math.max(-1, ...(existing ?? []).map(c => c.sort_order)) + 1;
    const { data, error } = await db.from('menu_categories').insert({ id, name: name.trim().slice(0, 80), sort_order: sortOrder }).select().single();
    if (error) throw new CmsError(error.message);
    refresh();
    return NextResponse.json({ category: data });
});

/** Rename and/or replace the add-ons. Body: { id, name?, addOns?: [{ title, price }] }. */
export const PUT = adminRoute(async (req: Request) => {
    const { id, name, addOns } = await readJson(req);
    if (typeof id !== 'string') throw new CmsError('Missing category id.', 400);
    const db = createAdminClient();
    if (typeof name === 'string') {
        if (!name.trim()) throw new CmsError('The category name cannot be empty.', 400);
        const { error } = await db.from('menu_categories').update({ name: name.trim().slice(0, 80) }).eq('id', id);
        if (error) throw new CmsError(error.message);
    }
    if (Array.isArray(addOns)) {
        const rows = addOns
            .filter((a): a is { title: string; price?: string } => typeof a?.title === 'string' && a.title.trim() !== '')
            .slice(0, 50)
            .map(a => ({ category_id: id, title: a.title.trim().slice(0, 120), price: typeof a.price === 'string' ? a.price.slice(0, 40) : '' }));
        const del = await db.from('menu_category_addons').delete().eq('category_id', id);
        if (del.error) throw new CmsError(del.error.message);
        if (rows.length) {
            const ins = await db.from('menu_category_addons').insert(rows);
            if (ins.error) throw new CmsError(ins.error.message);
        }
    }
    refresh();
    return NextResponse.json({ ok: true });
});

/** Only empty categories can be deleted - deleting would otherwise take its dishes with it. */
export const DELETE = adminRoute(async (req: Request) => {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) throw new CmsError('Missing category id.', 400);
    const db = createAdminClient();
    const { count } = await db.from('menu_items').select('id', { count: 'exact', head: true }).eq('category_id', id);
    if (count) throw new CmsError(`This category still has ${count} dish${count === 1 ? '' : 'es'}. Move or delete them first.`, 409);
    const { error } = await db.from('menu_categories').delete().eq('id', id);
    if (error) throw new CmsError(error.message);
    refresh();
    return NextResponse.json({ ok: true });
});
