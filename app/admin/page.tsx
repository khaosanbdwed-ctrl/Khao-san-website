import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth/require-admin';
import { getHiddenIds } from '@/lib/menu-visibility';

/** These are live counts, so the page must not be prerendered at build time —
 *  otherwise it reports whatever the totals were when the site was deployed. */
export const dynamic = 'force-dynamic';

/**
 * This page previously rendered three hardcoded numbers — "42 active menu
 * items", "1,248 visitors", "386 menu clicks" — styled exactly like live
 * metrics, with nothing marking them as placeholder. The real dish count was
 * 75. Invented figures in a client-facing dashboard are read as the business's
 * actual numbers, so the fabricated tiles are gone: what can be counted is
 * counted for real, and what needs an analytics provider says so plainly
 * instead of guessing.
 */
export default async function AdminOverview() {
    // This page reads with the service key, so it checks the session itself
    // rather than relying on proxy.ts alone (see lib/auth/require-admin.ts).
    if (!(await isAdmin())) redirect('/admin/login');
    const supabase = createAdminClient();

    // Counted the same way app/menu/page.tsx builds the public menu — dishes
    // hidden in Menu Control are left out, and a category counts only when it has
    // something on it — so the numbers here match what visitors see. Counting
    // raw rows reported 74 dishes while the menu showed 70.
    const [{ data: items, error: itemsError }, { data: categories, error: categoriesError }, { data: addOns, error: addOnsError }] = await Promise.all([
        supabase.from('menu_items').select('id, title, category_id').order('sort_order'),
        supabase.from('menu_categories').select('id'),
        supabase.from('menu_category_addons').select('category_id'),
    ]);
    const hidden = await getHiddenIds(items ?? []).catch(() => null);
    const loaded = !itemsError && !categoriesError && !addOnsError && hidden !== null;

    const liveItems = (items ?? []).filter(item => !hidden?.has(item.id));
    const hiddenItems = (items ?? []).filter(item => hidden?.has(item.id));
    const liveCategoryCount = (categories ?? []).filter(cat =>
        liveItems.some(item => item.category_id === cat.id) || (addOns ?? []).some(a => a.category_id === cat.id),
    ).length;

    const stats = [
        { label: 'Dishes on the menu', value: loaded ? liveItems.length : '—' },
        { label: 'Menu categories', value: loaded ? liveCategoryCount : '—' },
        { label: 'Hidden from the menu', value: loaded ? hiddenItems.length : '—' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <h1 className="display-2" style={{ fontSize: '3rem', marginBottom: '8px' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Welcome back to the Khao San command center.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ backgroundColor: 'var(--color-surface-base)', padding: '32px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                        <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {!loaded && (
                <p role="alert" style={{ color: 'var(--color-primary)', marginTop: '-32px', marginBottom: '48px' }}>
                    The menu could not be loaded from the database, so these figures are unavailable. Refresh the page to try again.
                </p>
            )}

            {loaded && hiddenItems.length > 0 && (
                <div style={{ backgroundColor: 'var(--color-surface-base)', padding: '32px 40px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '12px' }}>Kept in the database, hidden from the menu</h2>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '62ch', lineHeight: 1.7, marginBottom: '12px' }}>
                        These dishes are saved but not shown to visitors, so they are not counted above.
                        Show any of them again with the <strong>Show</strong> button in Menu Control.
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                        {hiddenItems.map(item => <li key={item.id}>{item.title}</li>)}
                    </ul>
                </div>
            )}

            <div style={{ backgroundColor: 'var(--color-surface-base)', padding: '40px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Managing the website</h2>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '62ch', lineHeight: 1.7, marginBottom: '20px' }}>
                    Every word, photo, video and background on the site - the homepage sections, the menu
                    page, the header and footer, outlet addresses and opening hours, the legal pages and how
                    the site looks when shared - is edited in <strong>Website Content</strong>. Changes are
                    saved as a draft, previewed on the real site, and only go live when you press{' '}
                    <strong>Publish</strong>. Every published version is kept and can be restored.
                </p>
                <Link href="/admin/content" className="btn btn-primary">Open Website Content</Link>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface-base)', padding: '40px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Managing the menu</h2>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '62ch', lineHeight: 1.7, marginBottom: '20px' }}>
                    Everything on the public menu page is served from this database, so any dish you add,
                    edit or delete in <strong>Menu Control</strong> appears on the live site straight away.
                    Upload each dish photo <strong>with the background removed</strong> (a PNG or WebP with a
                    see-through background). The dashboard places it on the menu&apos;s studio backdrop with a
                    soft shadow, at the same size as every other dish, so new dishes always match.
                </p>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '62ch', lineHeight: 1.7, marginBottom: '24px' }}>
                    Visitor and click figures are not shown here because no analytics provider is connected
                    yet. Once one is, they can be added to this page — until then this dashboard reports only
                    numbers it can actually verify.
                </p>
                <Link href="/admin/menu" className="btn btn-primary">Open Menu Control</Link>
            </div>
        </div>
    );
}
