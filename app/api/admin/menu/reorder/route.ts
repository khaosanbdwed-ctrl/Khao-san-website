import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminRoute, readJson } from '@/lib/cms/api';
import { CmsError } from '@/lib/cms/admin-store';
import { isMissingTable } from '@/lib/cms/store';
import { createAdminClient } from '@/lib/supabase/admin';

const UUID = /^[0-9a-f-]{36}$/i;

/** Save a drag-and-drop order. Body: { categories: id[], items: id[] } - full lists, in order. */
export const POST = adminRoute(async (req: Request) => {
    const { categories, items } = await readJson(req);
    if (!Array.isArray(categories) || !categories.every(c => typeof c === 'string')) throw new CmsError('Invalid category order.', 400);
    if (!Array.isArray(items) || !items.every(i => typeof i === 'string' && UUID.test(i))) throw new CmsError('Invalid dish order.', 400);
    const { error } = await createAdminClient().rpc('menu_reorder', { p_categories: categories, p_items: items });
    if (error) {
        if (isMissingTable(error)) throw new CmsError('Reordering needs the CMS migration. Run it in Supabase (see CMS.md).', 503);
        throw new CmsError(error.message);
    }
    revalidatePath('/menu');
    revalidatePath('/');
    return NextResponse.json({ ok: true });
});
