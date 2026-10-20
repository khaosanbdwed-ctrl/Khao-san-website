"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Doc = { key: string; title: string; description: string; hasDraft: boolean; publishedAt: string | null };

/** Every editable area of the website, with what state each one is in. */
export default function WebsiteContent() {
    const [docs, setDocs] = useState<Doc[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/content')
            .then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not load.'); setDocs(j.docs); })
            .catch(e => setError(e.message));
    }, []);

    return (
        <div className="cms-admin">
            <div style={{ marginBottom: 28 }}>
                <h1>Website content</h1>
                <p className="cms-muted" style={{ maxWidth: '68ch' }}>
                    Change any words, photos, videos, backgrounds and links on the website. Edits are saved as a
                    draft first, so you can preview them on the real site before you publish. Every publish is kept
                    in History and can be restored. Dishes and prices are edited in <Link href="/admin/menu">Menu Control</Link>.
                </p>
            </div>
            {error && <div className="cms-banner cms-banner--error">{error}</div>}
            {!docs && !error && <p className="cms-muted">Loading…</p>}
            <div className="cms-doc-grid">
                {docs?.map(d => (
                    <Link key={d.key} href={`/admin/content/${d.key}`} className="cms-doc-card">
                        <div className="cms-row" style={{ justifyContent: 'space-between' }}>
                            <h2>{d.title}</h2>
                        </div>
                        <p className="cms-muted cms-small" style={{ lineHeight: 1.5, flex: 1 }}>{d.description}</p>
                        <div>
                            {d.hasDraft
                                ? <span className="cms-pill cms-pill--draft">Unpublished changes</span>
                                : d.publishedAt
                                    ? <span className="cms-pill cms-pill--live">Live</span>
                                    : <span className="cms-pill cms-pill--default">Original content</span>}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
