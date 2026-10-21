"use client";

/**
 * Last resort, for an error in the root layout itself (where the header,
 * footer and stylesheet live), so it carries its own minimal styling in the
 * brand colours rather than relying on anything that may have failed.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="en">
            <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#ffffff', color: '#1e417b', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', textAlign: 'center', padding: '24px' }}>
                <main>
                    <h1 style={{ fontSize: '2rem', margin: '0 0 12px' }}>Khao San</h1>
                    <p style={{ color: '#55606E', margin: '0 0 28px', lineHeight: 1.6 }}>The site did not load. Please try again in a moment.</p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        style={{ background: '#ff964f', color: '#ffffff', border: 0, borderRadius: 999, padding: '14px 32px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                    >Try again</button>
                </main>
            </body>
        </html>
    );
}
