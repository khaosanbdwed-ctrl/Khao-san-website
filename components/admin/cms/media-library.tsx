"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export type MediaKind = 'image' | 'video';
export type MediaFile = { path: string; kind: MediaKind; name: string; size: number | null; createdAt: string | null; url: string };

const ACCEPT: Record<MediaKind, string> = {
    image: 'image/jpeg,image/png,image/webp,image/avif,image/gif',
    video: 'video/mp4,video/webm',
};

/**
 * Upload one file to the media library and return its public URL.
 *
 * Two steps, because the file must not go through our own server (Vercel caps
 * a request at ~4.5 MB and videos are far bigger): the dashboard asks
 * /api/admin/media for a short-lived signed URL, then the browser sends the
 * file straight to Supabase Storage with it.
 */
export async function uploadMedia(file: File): Promise<string> {
    const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed.');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } },
    );
    const { error } = await supabase.storage
        .from('site-media')
        .uploadToSignedUrl(json.path, json.token, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    return json.publicUrl as string;
}

async function fetchLibrary(): Promise<{ files: MediaFile[]; error: string | null }> {
    try {
        const res = await fetch('/api/admin/media');
        const json = await res.json();
        if (!res.ok) return { files: [], error: json.error || 'Could not load the media library.' };
        return { files: json.files, error: null };
    } catch {
        return { files: [], error: 'Could not load the media library.' };
    }
}

const formatSize = (n: number | null) =>
    n == null ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

/** A button that opens the file picker and uploads what is chosen. */
export function UploadButton({ kind, onUploaded, label, className = 'cms-btn cms-btn--primary cms-btn--small' }: {
    kind: MediaKind;
    onUploaded: (url: string) => void;
    label?: string;
    className?: string;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pick = async (file: File | undefined) => {
        if (!file) return;
        setBusy(true);
        setError(null);
        try {
            onUploaded(await uploadMedia(file));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
            if (input.current) input.current.value = '';
        }
    };

    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
            <button type="button" className={className} disabled={busy} onClick={() => input.current?.click()}>
                {busy ? 'Uploading…' : (label ?? (kind === 'image' ? 'Upload photo' : 'Upload video'))}
            </button>
            <input ref={input} type="file" accept={ACCEPT[kind]} hidden onChange={e => pick(e.target.files?.[0])} />
            {error && <span className="cms-small" style={{ color: 'var(--cms-danger)' }}>{error}</span>}
        </span>
    );
}

/** The library grid. `onChoose` turns it into a picker; without it, it is the
 *  management view (with delete). */
export function MediaGrid({ kind, onChoose }: { kind?: MediaKind; onChoose?: (url: string) => void }) {
    const [files, setFiles] = useState<MediaFile[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<MediaKind | 'all'>(kind ?? 'all');

    // Bumped to reload the list after an upload or delete.
    const [version, setVersion] = useState(0);
    const load = useCallback(() => setVersion(v => v + 1), []);

    useEffect(() => {
        let live = true;
        fetchLibrary().then(r => {
            if (!live) return;
            setFiles(r.files);
            setError(r.error);
        });
        return () => { live = false; };
    }, [version]);

    const remove = async (file: MediaFile) => {
        if (!confirm(`Delete ${file.name}?\n\nIf a section of the website still uses it, that photo or video will disappear from the site.`)) return;
        const res = await fetch('/api/admin/media', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: file.path }),
        });
        if (!res.ok) setError((await res.json()).error || 'Could not delete.');
        load();
    };

    const shown = (files ?? []).filter(f => filter === 'all' || f.kind === filter);

    return (
        <div>
            <div className="cms-row" style={{ marginBottom: 14 }}>
                {!kind && (
                    <select className="cms-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value as MediaKind | 'all')}>
                        <option value="all">All files</option>
                        <option value="image">Photos</option>
                        <option value="video">Videos</option>
                    </select>
                )}
                <UploadButton kind={kind ?? (filter === 'video' ? 'video' : 'image')} onUploaded={url => { load(); onChoose?.(url); }} />
                {!kind && <UploadButton kind="video" label="Upload video" className="cms-btn cms-btn--small" onUploaded={() => load()} />}
                <span className="cms-small cms-muted">Photos up to 10 MB (JPG, PNG, WebP). Videos up to 50 MB (MP4 recommended, 720p is plenty for a background).</span>
            </div>
            {error && <div className="cms-banner cms-banner--error">{error}</div>}
            {files === null ? (
                <p className="cms-muted">Loading…</p>
            ) : shown.length === 0 ? (
                <p className="cms-muted">Nothing uploaded yet. Files you upload appear here and can be reused anywhere on the site.</p>
            ) : (
                <div className="cms-lib">
                    {shown.map(f => (
                        <div key={f.path} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <button type="button" className="cms-lib__item" onClick={() => onChoose ? onChoose(f.url) : window.open(f.url, '_blank')} title={f.name}>
                                <div className="cms-lib__thumb">
                                    {f.kind === 'image'
                                        // eslint-disable-next-line @next/next/no-img-element
                                        ? <img src={f.url} alt="" loading="lazy" />
                                        : <video src={f.url} muted preload="metadata" />}
                                </div>
                                <div className="cms-lib__name">{f.kind === 'video' ? '▶ ' : ''}{f.name} {formatSize(f.size)}</div>
                            </button>
                            {!onChoose && <button type="button" className="cms-btn cms-btn--small cms-btn--danger" onClick={() => remove(f)}>Delete</button>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function MediaPickerModal({ kind, onChoose, onClose }: { kind: MediaKind; onChoose: (url: string) => void; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="cms-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="cms-modal" role="dialog" aria-modal="true" aria-label="Media library">
                <div className="cms-modal__head">
                    <h2>{kind === 'image' ? 'Choose a photo' : 'Choose a video'}</h2>
                    <button type="button" className="cms-btn cms-btn--small" onClick={onClose}>Close</button>
                </div>
                <div className="cms-modal__body">
                    <MediaGrid kind={kind} onChoose={url => { onChoose(url); onClose(); }} />
                </div>
            </div>
        </div>
    );
}
