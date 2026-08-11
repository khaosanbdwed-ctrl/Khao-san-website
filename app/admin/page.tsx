import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

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
    const supabase = createAdminClient();

    const [{ count: dishCount }, { count: categoryCount }] = await Promise.all([
        supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        supabase.from('menu_categories').select('*', { count: 'exact', head: true }),
    ]);

    const stats = [
        { label: 'Dishes on the menu', value: dishCount ?? '—' },
        { label: 'Menu categories', value: categoryCount ?? '—' },
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

            <div style={{ backgroundColor: 'var(--color-surface-base)', padding: '40px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Managing the menu</h2>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '62ch', lineHeight: 1.7, marginBottom: '20px' }}>
                    Everything on the public menu page is served from this database, so any dish you add,
                    edit or delete in <strong>Menu Control</strong> appears on the live site straight away.
                    Dish photos must be <strong>PNG files with the background removed</strong> — the menu
                    presents each dish floating on the page, and only a transparent PNG can do that.
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
