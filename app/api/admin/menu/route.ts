import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Columns a client is allowed to write. `PUT` previously spread the whole
 * request body straight into `.update()`, so any column - including ones the
 * UI never shows - could be set to any value, and a typo in a field name
 * failed silently instead of erroring. Everything now goes through this list.
 */
const WRITABLE = [
    'category_id', 'title', 'price', 'description', 'image_src',
    'badges', 'portion_note', 'group_price', 'add_on_note', 'angled',
] as const;

type Writable = (typeof WRITABLE)[number];

/** The menu page is statically cached; a write has to invalidate it or the
 *  admin appears to do nothing until the next revalidation window. */
function refreshPublicMenu() {
    revalidatePath('/menu');
    revalidatePath('/');
}

function pickWritable(body: Record<string, unknown>): Partial<Record<Writable, unknown>> {
    const out: Partial<Record<Writable, unknown>> = {};
    for (const key of WRITABLE) {
        if (body[key] !== undefined) out[key] = body[key];
    }
    return out;
}

/** Returns an error string, or null when the payload is usable. */
function validate(fields: Partial<Record<Writable, unknown>>, { partial }: { partial: boolean }) {
    const required: Writable[] = ['category_id', 'title', 'price'];
    if (!partial) {
        for (const key of required) {
            if (typeof fields[key] !== 'string' || !(fields[key] as string).trim()) {
                return `\`${key}\` is required.`;
            }
        }
    }
    for (const key of ['category_id', 'title', 'price', 'description', 'image_src'] as Writable[]) {
        if (fields[key] !== undefined && fields[key] !== null && typeof fields[key] !== 'string') {
            return `\`${key}\` must be a string.`;
        }
    }
    if (fields.badges !== undefined && !Array.isArray(fields.badges)) {
        return '`badges` must be an array.';
    }
    if (fields.angled !== undefined && typeof fields.angled !== 'boolean') {
        return '`angled` must be a boolean.';
    }
    if (typeof fields.title === 'string' && fields.title.length > 200) {
        return '`title` is too long (max 200 characters).';
    }
    return null;
}

export async function GET() {
    const supabase = createAdminClient();

    // The admin UI needs the category list to build its picker. Hardcoding it
    // was the original bug: the form offered five invented labels ("Starters",
    // "Curries") while `menu_items.category_id` is a foreign key onto
    // `menu_categories.id`, whose values are slugs ("a-appetizers"). Every
    // insert failed on a constraint violation. Serve the real rows instead.
    const [{ data: items, error: itemsError }, { data: categories, error: catError }] =
        await Promise.all([
            supabase.from('menu_items').select('*').order('sort_order'),
            supabase.from('menu_categories').select('id, name').order('sort_order'),
        ]);

    const error = itemsError || catError;
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: items, categories });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const fields = pickWritable(body);

        const invalid = validate(fields, { partial: false });
        if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

        const supabase = createAdminClient();

        // Ordering by sort_order and then reading that row's item_number gave
        // the item_number of whichever row happened to sort last, not the
        // highest one. Ask the database for each maximum on its own column.
        const [{ data: lastSort }, { data: lastNumber }] = await Promise.all([
            supabase.from('menu_items').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('menu_items').select('item_number').order('item_number', { ascending: false }).limit(1).maybeSingle(),
        ]);

        const { data, error } = await supabase
            .from('menu_items')
            .insert([{
                ...fields,
                badges: fields.badges ?? [],
                angled: fields.angled ?? false,
                item_number: (lastNumber?.item_number ?? 0) + 1,
                sort_order: (lastSort?.sort_order ?? 0) + 1,
            }])
            .select()
            .single();

        if (error) {
            // A foreign-key violation here means an unknown category_id, which
            // is worth saying plainly rather than leaking the raw PG message.
            const message = error.code === '23503'
                ? 'That category does not exist. Pick one from the list.'
                : error.message;
            return NextResponse.json({ error: message }, { status: 400 });
        }

        refreshPublicMenu();
        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json({ error: 'Failed to create menu item.' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (typeof id !== 'string' || !id) {
            return NextResponse.json({ error: 'Missing item id.' }, { status: 400 });
        }

        const fields = pickWritable(body);
        if (Object.keys(fields).length === 0) {
            return NextResponse.json({ error: 'No updatable fields provided.' }, { status: 400 });
        }

        const invalid = validate(fields, { partial: true });
        if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('menu_items')
            .update(fields)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            const message = error.code === '23503'
                ? 'That category does not exist. Pick one from the list.'
                : error.message;
            return NextResponse.json({ error: message }, { status: 400 });
        }

        refreshPublicMenu();
        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json({ error: 'Failed to update menu item.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing item id.' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase.from('menu_items').delete().eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        refreshPublicMenu();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete menu item.' }, { status: 500 });
    }
}
