"use client";

import Link from 'next/link';
import { renderInline } from '@/lib/cms/inline';
import { useContent } from './content-context';

const H2: React.CSSProperties = { fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' };

/** The privacy and terms pages, from their CMS documents. */
export default function LegalView({ doc }: { doc: 'privacy' | 'terms' }) {
    const page = useContent()[doc];

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
            <div className="container" style={{ padding: '120px max(8vw, 24px)', maxWidth: '900px', margin: '0 auto' }}>
                {page.backLabel && (
                    <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '48px', display: 'inline-block' }}>{page.backLabel}</Link>
                )}

                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '48px', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{page.title}</h1>

                <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                    {page.blocks.map((block, i) => {
                        if (block.kind === 'heading') return <h2 key={i} style={H2}>{block.text}</h2>;
                        if (block.kind === 'bullets') {
                            return (
                                <ul key={i} style={{ marginLeft: '20px', marginBottom: '16px' }}>
                                    {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                                </ul>
                            );
                        }
                        return <p key={i}>{renderInline(block.text)}</p>;
                    })}

                    {page.lastUpdated && <p style={{ marginTop: '60px', fontSize: '0.9rem', opacity: 0.6 }}>{page.lastUpdated}</p>}
                </div>
            </div>
        </main>
    );
}
