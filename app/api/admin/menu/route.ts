import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { safeMediaUrl } from '@/lib/cms/fields';
import { requireAdmin } from '@/lib/auth/require-admin';

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

/** The four marks the site knows how to draw (components/ui/dish-tags.tsx). */
const BADGES = ['spicy', 'special', 'featured', 'new'];

/** Longest value each text column may hold. Generous for real content, and
 *  a cap on what a malformed request can put in front of every visitor. */
const MAX_LENGTH: Partial<Record<Writable, number>> = {
    category_id: 80, title: 200, price: 40, description: 1000, image_src: 1000,
    portion_note: 80, group_price: 80, add_on_note: 300,
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The menu page is statically cached; a write has to invalidate it or the
 *  admin appears to do nothing until the next revalidation window. */
function refreshPublicMenu() {
    revalidatePath('/menu');
    revalidatePath('/');
}

function pickWritable(body: Record<string, unknown>): Partial<Record<Writable, unknown>> {
    const out: Partial<Record<Writable, unknown>> = {};
    for (const key of WRITABLE) {
        if (body[key] === undefined) continue;
        const v = body[key];
        // Optional text columns store NULL rather than an empty string, so the
        // menu's `|| undefined` checks treat a cleared field as absent.
        out[key] = typeof v === 'string' && !['category_id', 'title', 'price'].includes(key)
            ? (v.trim() ? v.trim() : null)
            : typeof v === 'string' ? v.trim() : v;
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
    for (const key of Object.keys(MAX_LENGTH) as Writable[]) {
        const v = fields[key];
        if (v === undefined || v === null) continue;
        if (typeof v !== 'string') return `\`${key}\` must be text.`;
        if (v.length > MAX_LENGTH[key]!) return `\`${key}\` is too long (max ${MAX_LENGTH[key]} characters).`;
    }
    if (partial) {
        for (const key of required) {
            if (fields[key] !== undefined && (typeof fields[key] !== 'string' || !(fields[key] as string).trim())) {
                return `\`${key}\` cannot be empty.`;
            }
        }
    }
    if (typeof fields.image_src === 'string' && !safeMediaUrl(fields.image_src)) {
        return 'The photo address is not valid.';
    }
    if (fields.badges !== undefined && (!Array.isArray(fields.badges) || fields.badges.some(b => !BADGES.includes(b as string)))) {
        return `\`badges\` must be a list of: ${BADGES.join(', ')}.`;
    }
    if (fields.angled !== undefined && typeof fields.angled !== 'boolean') {
        return '`angled` must be true or false.';
    }
    return null;
}

export async function GET(request: Request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;
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
    const denied = await requireAdmin(request);
    if (denied) return denied;
    try {
        const body = await request.json();
        if (typeof body !== 'object' || !body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
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
    const denied = await requireAdmin(request);
    if (denied) return denied;
    try {
        const body = await request.json();
        const { id } = body;

        if (typeof id !== 'string' || !UUID.test(id)) {
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
    const denied = await requireAdmin(request);
    if (denied) return denied;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || !UUID.test(id)) {
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
