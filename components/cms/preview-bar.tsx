"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Shown only while previewing unpublished changes from the dashboard. */
export default function PreviewBar() {
    const [busy, setBusy] = useState(false);
    const pathname = usePathname();
    if (pathname?.startsWith('/admin')) return null;
    const exit = async () => {
        setBusy(true);
        await fetch('/api/preview/exit', { method: 'POST' });
        window.location.reload();
    };
    return (
        <div className="cms-preview-bar" role="status">
            <span className="cms-preview-bar__dot" aria-hidden="true" />
            <span className="cms-preview-bar__text">Preview: you are seeing unpublished changes</span>
            <Link href="/admin/content">Back to editor</Link>
            <button type="button" onClick={exit} disabled={busy}>{busy ? 'Leaving…' : 'Exit preview'}</button>
        </div>
    );
}
