import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Page not found | Khao San',
    robots: { index: false },
};

/**
 * Shown for any address that is not a page - an old link, a typo, a shared
 * URL from a previous version of the site. Same frame as the legal pages
 * (components/legal-page.tsx), inside the normal header and footer, so a
 * visitor who lands here is still on the brand and one tap from the menu.
 */
export default function NotFound() {
    return (
        <div style={{ minHeight: '72vh', display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
            <div className="container" style={{ padding: '140px max(8vw, 24px) 100px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '24px', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                    Page not found.
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, maxWidth: '46ch', margin: '0 auto 44px' }}>
                    This link may be out of date. The menu and our three dining rooms are right where you left them.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" className="btn btn-primary">Back to Home</Link>
                    <Link href="/menu" className="btn btn-secondary">Explore Menu</Link>
                </div>
            </div>
        </div>
    );
}
