import { Fragment } from 'react';
import Link from 'next/link';
import type { LegalPageContent } from '@/lib/cms/docs/legal';
import { RichBlocks } from '@/components/cms/cms-ui';

/** Privacy and Terms share one layout; their words are CMS content
 *  (Privacy & Terms in the dashboard; defaults in lib/cms/docs/legal.ts). */
export default function LegalPage({ page }: { page: LegalPageContent }) {
  const h2: React.CSSProperties = { fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' };
  return (
    // A <div>, not <main>: ClientWrapper already wraps every page in the one
    // <main> landmark a document may have.
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
      <div className="container" style={{ padding: '120px max(8vw, 24px)', maxWidth: '900px', margin: '0 auto' }}>
        {page.backLabel && (
          <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '48px', display: 'inline-block' }}>{page.backLabel}</Link>
        )}

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '48px', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{page.title}</h1>

        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          {page.blocks.map((block, i) => (
            <Fragment key={i}>
              {block.heading && <h2 style={h2}>{block.heading}</h2>}
              <RichBlocks
                text={block.body}
                listStyle={{ marginLeft: '20px', marginBottom: '16px' }}
                linkStyle={{ color: 'var(--color-primary)' }}
              />
            </Fragment>
          ))}

          {page.updated && <p style={{ marginTop: '60px', fontSize: '0.9rem', opacity: 0.6 }}>{page.updated}</p>}
        </div>
      </div>
    </div>
  );
}
