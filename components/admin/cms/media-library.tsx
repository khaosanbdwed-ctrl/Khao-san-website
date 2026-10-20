"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MAX_SECONDS, OptimizeUnsupported, optimizePhoto, optimizeVideo } from './optimize-media';

export type MediaKind = 'image' | 'video';
export type MediaFile = {
    path: string; kind: MediaKind; name: string; size: number | null; createdAt: string | null; url: string;
    optimised?: boolean; poster?: string | null;
};

const ACCEPT: Record<MediaKind, string> = {
    image: 'image/jpeg,image/png,image/webp,image/avif,image/gif',
    video: 'video/mp4,video/webm',
};

type Progress = (stage: string, fraction?: number) => void;

const browserStorage = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
).storage.from('site-media');

async function post(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed.');
    return json;
}

async function put(target: { path: string; token: string }, blob: Blob, type: string) {
    const { error } = await browserStorage().uploadToSignedUrl(target.path, target.token, blob, { contentType: type });
    if (error) throw new Error(error.message);
}

async function uploadOne(file: Blob, name: string, type: string): Promise<string> {
    const target = await post({ name, type, size: file.size });
    await put(target, file, type);
    return target.publicUrl as string;
}

/**
 * Upload one file to the media library and return its public URL, plus a
 * short note on what was done to it.
 *
 * Every file is prepared for the web first (optimize-media.ts): a video
 * becomes a computer version, a phone version and a still; a photo is scaled
 * and re-saved as WebP. Then each file goes straight from the browser to
 * Supabase with a short-lived signed URL from /api/admin/media - never through
 * our own server, which caps a request at ~4.5 MB on Vercel.
 */
export async function uploadMedia(file: File, onProgress: Progress = () => {}): Promise<{ url: string; note: string }> {
    const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;

    if (file.type.startsWith('video/')) {
        try {
            onProgress('Optimising for phones and computers', 0);
            const v = await optimizeVideo(file, f => onProgress('Optimising for phones and computers', f));
            onProgress('Uploading');
            const set = await post({ set: 'video', name: file.name, sizes: { large: v.large.size, small: v.small.size, poster: v.poster.size } });
            await Promise.all([
                put(set.large, v.large, 'video/mp4'),
                put(set.small, v.small, 'video/mp4'),
                put(set.poster, v.poster, v.poster.type),
            ]);
            return {
                url: set.publicUrl,
                note: `Optimised: ${mb(file.size)} → ${mb(v.large.size)} for computers, ${mb(v.small.size)} for phones.`
                    + (v.trimmed ? ` Trimmed to the first ${MAX_SECONDS} seconds (it plays on a loop).` : ''),
            };
        } catch (e) {
            if (!(e instanceof OptimizeUnsupported)) throw e;
            // An old browser: still let the upload through, but say so.
            onProgress('Uploading');
            const url = await uploadOne(file, file.name, file.type);
            return { url, note: `This browser could not optimise video, so it was uploaded as it is (${mb(file.size)}). For a faster site, upload from a current Chrome, Edge or Safari.` };
        }
    }

    onProgress('Optimising');
    const photo = await optimizePhoto(file);
    onProgress('Uploading');
    const url = await uploadOne(photo, photo.name, photo.type);
    return {
        url,
        note: photo === file ? 'Uploaded.' : `Optimised: ${mb(file.size)} → ${mb(photo.size)}. Each screen gets its own size automatically.`,
    };
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

/** A button that opens the file picker, optimises and uploads what is
 *  chosen, and reports what it did. */
export function UploadButton({ kind, onUploaded, label, className = 'cms-btn cms-btn--primary cms-btn--small' }: {
    kind: MediaKind;
    onUploaded: (url: string) => void;
    label?: string;
    className?: string;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<{ stage: string; fraction?: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);

    const pick = async (file: File | undefined) => {
        if (!file) return;
        setProgress({ stage: 'Preparing' });
        setError(null);
        setNote(null);
        try {
            const result = await uploadMedia(file, (stage, fraction) => setProgress({ stage, fraction }));
            setNote(result.note);
            onUploaded(result.url);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setProgress(null);
            if (input.current) input.current.value = '';
        }
    };

    const busyLabel = progress
        ? `${progress.stage}${progress.fraction !== undefined ? ` ${Math.round(progress.fraction * 100)}%` : '…'}`
        : null;

    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, maxWidth: 360 }}>
            <button type="button" className={className} disabled={!!progress} onClick={() => input.current?.click()}>
                {busyLabel ?? (label ?? (kind === 'image' ? 'Upload photo' : 'Upload video'))}
            </button>
            {progress?.fraction !== undefined && (
                <progress max={1} value={progress.fraction} style={{ width: '100%', height: 6 }} />
            )}
            <input ref={input} type="file" accept={ACCEPT[kind]} hidden onChange={e => pick(e.target.files?.[0])} />
            {error && <span className="cms-small" style={{ color: 'var(--cms-danger)' }}>{error}</span>}
            {note && <span className="cms-small" style={{ color: 'var(--cms-ok)' }}>{note}</span>}
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
                <span className="cms-small cms-muted">Upload any photo or video straight from your phone or camera - it is resized and compressed automatically, with a separate lighter version for phones. Photos up to 10 MB, videos up to 50 MB; longer videos are trimmed to {MAX_SECONDS} seconds.</span>
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
                                    {f.kind === 'image' || f.poster
                                        // eslint-disable-next-line @next/next/no-img-element
                                        ? <img src={f.poster || f.url} alt="" loading="lazy" />
                                        : <video src={f.url} muted preload="metadata" />}
                                </div>
                                <div className="cms-lib__name">{f.kind === 'video' ? '▶ ' : ''}{f.name} {formatSize(f.size)}{f.optimised ? ' · phone + computer' : ''}</div>
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
