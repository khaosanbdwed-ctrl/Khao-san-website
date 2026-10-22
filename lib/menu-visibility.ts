import { readJson, writeJson } from '@/lib/cms/bucket';

/**
 * Which dishes are kept in the database but hidden from the public menu.
 *
 * This is the single source for what the public menu shows: /menu filters by
 * it, the admin overview counts by it, and Menu Control's "Hide / Show"
 * button writes it - so the dashboard always reports the dishes a visitor
 * actually sees. (The list used to be hardcoded inside app/menu/page.tsx, so
 * the overview counted every database row - 74 - while the menu showed 70,
 * and hiding a dish meant editing code.)
 *
 * Stored as one small JSON file in the private `site-content` bucket, like
 * the rest of the CMS (see lib/cms/bucket.ts for why Storage, not a table):
 *
 *   menu-visibility/hidden.json   { ids: string[], savedAt }
 *
 * Dishes are recorded by id, so renaming a dish does not un-hide it.
 */
const FILE = 'menu-visibility/hidden.json';

/** What was hidden before the dashboard could do it. Used only until the file
 *  is first written, so the live menu does not change on deploy. */
const LEGACY_HIDDEN_TITLES = new Set([
    'Jumbo Dim Sum Assortment',
    'Soft Drinks (Fountain)',
    'Soft Drinks (Can/Bottle)',
    'Water',
]);

type Stored = { ids: string[]; savedAt: string };
type Dish = { id: string; title: string };

/**
 * The ids of the hidden dishes among `items`.
 *
 * Unreadable storage throws at runtime (an ISR render that throws keeps the
 * last good page, rather than suddenly showing every hidden dish) and falls
 * back to the legacy list during `next build`, the same policy as
 * lib/cms/content.ts.
 */
export async function getHiddenIds(items: Dish[]): Promise<Set<string>> {
    let stored: Stored | null;
    try {
        stored = await readJson<Stored>(FILE);
    } catch (e) {
        if (process.env.NEXT_PHASE !== 'phase-production-build') throw e;
        console.warn(`[menu] ${(e as Error).message}; building with the default hidden dishes.`);
        stored = null;
    }
    if (stored && Array.isArray(stored.ids)) return new Set(stored.ids);
    return new Set(items.filter(item => LEGACY_HIDDEN_TITLES.has(item.title)).map(item => item.id));
}

/** Hide or show one dish. `items` is the current menu, used to resolve the
 *  legacy list on the first write and to drop ids of deleted dishes. */
export async function setHidden(id: string, hidden: boolean, items: Dish[]) {
    const ids = await getHiddenIds(items);
    if (hidden) ids.add(id);
    else ids.delete(id);
    const existing = new Set(items.map(item => item.id));
    await writeJson(FILE, { ids: [...ids].filter(x => existing.has(x)), savedAt: new Date().toISOString() } satisfies Stored);
}
