"use client";

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * If a page fails to render (most likely: the content store could not be
 * reached for a page that had no cached copy yet), the visitor gets this
 * instead of a blank framework error - still inside the header and footer,
 * with a way to retry and a way to keep going.
 */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{ minHeight: '72vh', display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
            <div className="container" style={{ padding: '140px max(8vw, 24px) 100px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '24px', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                    Something went wrong.
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, maxWidth: '46ch', margin: '0 auto 44px' }}>
                    This page did not load. Please try again in a moment.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-primary" onClick={() => reset()}>Try Again</button>
                    <Link href="/" className="btn btn-secondary">Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
