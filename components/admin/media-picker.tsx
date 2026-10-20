"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Film, Type, UploadCloud, X } from 'lucide-react';
import { api } from './api';
import { ACCEPT, formatBytes, uploadFile, type MediaItem } from './upload';
import { isSafeSrc } from '@/lib/cms/safe';

export type PickKind = 'image' | 'video' | 'font';
export interface Picked { src: string; alt?: string }

export function Modal({ title, onClose, children, footer, narrow }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    narrow?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const closeRef = useRef(onClose);
    useEffect(() => { closeRef.current = onClose; }, [onClose]);
    // Runs once per open: focus moves in, Escape closes, focus returns on close.
    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        ref.current?.querySelector<HTMLElement>('.cms-modal-body button, .cms-modal-body input, .cms-modal-body select, .cms-modal-body textarea, [role="tab"], .cms-modal-head button')?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            // Modals can stack (a photo picker inside the dish editor): only the top one closes.
            const all = document.querySelectorAll('.cms-modal');
            if (all[all.length - 1] === ref.current) closeRef.current();
        };
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('keydown', onKey); previous?.focus?.(); };
    }, []);
    return (
        <div className="cms-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div ref={ref} className={`cms-modal${narrow ? ' cms-modal--narrow' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="cms-modal-head">
                    <h2>{title}</h2>
                    <button type="button" className="cms-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
                </div>
                {children}
                {footer && <div className="cms-modal-foot">{footer}</div>}
            </div>
        </div>
    );
}

/** A small preview of any media source. */
export function MediaPreview({ src, kind }: { src: string; kind: PickKind }) {
    if (!src) return <div className="cms-media-preview" aria-hidden="true">—</div>;
    if (kind === 'video') {
        return (
            <div className="cms-media-preview">
                {/* #t= makes the browser show a real frame rather than black. */}
                <video src={`${src}#t=0.5`} muted playsInline preload="metadata" />
            </div>
        );
    }
    if (kind === 'font') return <div className="cms-media-preview"><Type size={22} aria-hidden="true" /></div>;
    return (
        <div className="cms-media-preview">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of arbitrary sources */}
            <img src={src} alt="" loading="lazy" />
        </div>
    );
}

export function UploadDrop({ kind, multiple = false, onUploaded, onError }: {
    kind: PickKind | 'any';
    multiple?: boolean;
    onUploaded: (item: MediaItem) => void;
    onError: (message: string) => void;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);
    const [busy, setBusy] = useState(0);
    const accept = kind === 'any' ? `${ACCEPT.image},${ACCEPT.video},${ACCEPT.font}` : ACCEPT[kind];

    const handle = async (files: FileList | null) => {
        if (!files?.length) return;
        const list = Array.from(files).slice(0, multiple ? 20 : 1);
        setBusy(b => b + list.length);
        for (const file of list) {
            try {
                onUploaded(await uploadFile(file));
            } catch (e) {
                onError(`${file.name}: ${(e as Error).message}`);
            } finally {
                setBusy(b => b - 1);
            }
        }
    };

    return (
        <div
            className={`cms-drop${over ? ' is-over' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => input.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}
        >
            {busy > 0 ? <span className="cms-spinner" aria-hidden="true" /> : <UploadCloud size={26} aria-hidden="true" />}
            <strong>{busy > 0 ? `Uploading ${busy} file${busy === 1 ? '' : 's'}…` : `Drop ${multiple ? 'files' : 'a file'} here, or click to choose`}</strong>
            <span style={{ fontSize: 12 }}>
                {kind === 'image' && 'JPG, PNG, WebP, GIF or AVIF. Large photos are resized automatically.'}
                {kind === 'video' && 'MP4 or WebM, up to 50 MB. Keep background videos short and under ~5 MB if you can.'}
                {kind === 'font' && 'WOFF2 (best), WOFF, TTF or OTF.'}
                {kind === 'any' && 'Images, videos (MP4/WebM) and fonts.'}
            </span>
            <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { handle(e.target.files); e.target.value = ''; }} />
        </div>
    );
}

interface Bundled { src: string; kind: 'image' | 'video' }

export function MediaPicker({ kind, onSelect, onClose }: {
    kind: PickKind;
    onSelect: (picked: Picked) => void;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<'uploads' | 'builtin' | 'url'>('uploads');
    const [uploads, setUploads] = useState<MediaItem[] | null>(null);
    const [bundled, setBundled] = useState<Bundled[] | null>(null);
    const [search, setSearch] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [setupRequired, setSetupRequired] = useState(false);

    useEffect(() => {
        api<{ items: MediaItem[]; setupRequired?: boolean }>(`/api/admin/media?kind=${kind}`)
            .then(r => { setUploads(r.items); setSetupRequired(!!r.setupRequired); })
            .catch(e => { setUploads([]); setError(e.message); });
        if (kind !== 'font') {
            api<{ items: Bundled[] }>('/api/admin/assets').then(r => setBundled(r.items.filter(i => i.kind === kind))).catch(() => setBundled([]));
        }
    }, [kind]);

    const filteredBundled = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (bundled ?? []).filter(b => !q || b.src.toLowerCase().includes(q));
    }, [bundled, search]);

    const pick = (picked: Picked) => { onSelect(picked); onClose(); };
    const urlOk = /^https?:\/\//i.test(url.trim()) && isSafeSrc(url.trim());
    const title = kind === 'image' ? 'Choose an image' : kind === 'video' ? 'Choose a video' : 'Choose a font file';

    return (
        <Modal title={title} onClose={onClose}>
            <div className="cms-tabs" role="tablist">
                <button type="button" role="tab" className="cms-tab" aria-selected={tab === 'uploads'} onClick={() => setTab('uploads')}>Uploaded files</button>
                {kind !== 'font' && <button type="button" role="tab" className="cms-tab" aria-selected={tab === 'builtin'} onClick={() => setTab('builtin')}>Built into the site</button>}
                {kind !== 'font' && <button type="button" role="tab" className="cms-tab" aria-selected={tab === 'url'} onClick={() => setTab('url')}>Web address</button>}
            </div>
            <div className="cms-modal-body">
                {error && <div className="cms-alert cms-alert--err" role="alert">{error}</div>}

                {tab === 'uploads' && (
                    <>
                        {setupRequired ? (
                            <div className="cms-alert cms-alert--warn">Uploads need the CMS database set up first - see the Dashboard.</div>
                        ) : (
                            <UploadDrop
                                kind={kind}
                                onUploaded={(item) => { setUploads(u => [item, ...(u ?? [])]); pick({ src: item.url, alt: item.alt }); }}
                                onError={setError}
                            />
                        )}
                        {uploads === null ? <div className="cms-empty"><span className="cms-spinner" /></div>
                            : uploads.length === 0 ? <p className="cms-empty">Nothing uploaded yet.</p>
                            : (
                                <div className="cms-media-grid">
                                    {uploads.map(item => (
                                        <button key={item.id} type="button" className="cms-media-tile" onClick={() => pick({ src: item.url, alt: item.alt })}>
                                            <MediaPreview src={item.url} kind={item.kind} />
                                            <span title={item.name}>{item.name || item.path}</span>
                                            <span>{formatBytes(item.size)}{item.width ? ` · ${item.width}×${item.height}` : ''}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                    </>
                )}

                {tab === 'builtin' && (
                    <>
                        <input className="cms-input" placeholder="Search by folder or file name, e.g. lotus, Desserts, gulshan" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 14 }} />
                        {bundled === null ? <div className="cms-empty"><span className="cms-spinner" /></div> : (
                            <div className="cms-media-grid">
                                {filteredBundled.map(item => (
                                    <button key={item.src} type="button" className="cms-media-tile" onClick={() => pick({ src: item.src })}>
                                        {item.kind === 'video'
                                            ? <div className="cms-media-preview"><Film size={22} aria-hidden="true" /></div>
                                            : <MediaPreview src={item.src} kind="image" />}
                                        <span title={item.src}>{item.src.split('/').pop()}</span>
                                        <span title={item.src}>{item.src.split('/').slice(2, -1).join(' / ')}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {tab === 'url' && (
                    <div className="cms-field">
                        <label className="cms-label" htmlFor="cms-media-url">Address of the {kind}</label>
                        <div className="cms-row">
                            <input id="cms-media-url" className="cms-input" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} aria-invalid={url !== '' && !urlOk} />
                            <button type="button" className="cms-btn cms-btn--primary" disabled={!urlOk} onClick={() => pick({ src: url.trim() })}>Use this</button>
                        </div>
                        <p className="cms-help">Uploading is better: files on other websites can disappear or change without warning.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
