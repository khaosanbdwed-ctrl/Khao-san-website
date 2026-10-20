"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, History, RotateCcw, Send, X } from 'lucide-react';
import { normalizeDoc } from '@/lib/cms/content';
import { DOC_FIELDS, DOC_META, type DocKey, type SiteContent } from '@/lib/cms/schema';
import { themeContrastChecks } from '@/lib/cms/theme';
import { api, ApiError } from './api';
import { EditorContext, FieldsEditor, type EditorCtx } from './fields';
import { MediaPicker, type PickKind, type Picked } from './media-picker';
import PreviewFrame, { type PreviewHandle } from './preview-frame';

type Obj = Record<string, unknown>;
type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface DocResponse {
    draft: unknown | null;
    draftUpdatedAt: string | null;
    published: unknown | null;
    publishedAt: string | null;
    revision: number | null;
}

/** How long typing has to pause before the draft auto-saves. */
const AUTOSAVE_MS = 900;

/**
 * One content area (Homepage, Theme, ...): the form on the left, the live
 * site on the right.
 *
 * Edits auto-save as a DRAFT - nothing reaches visitors until Publish.
 * Publishing records a version in History, from which any earlier version
 * can be restored (as a draft, so it can be checked before going live).
 */
export default function DocEditor({ docKey }: { docKey: DocKey }) {
    const meta = DOC_META[docKey];
    const fields = DOC_FIELDS[docKey];

    const [data, setData] = useState<Obj | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [hasDraft, setHasDraft] = useState(false);
    const [publishedAt, setPublishedAt] = useState<string | null>(null);
    const [save, setSave] = useState<SaveState>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [conflict, setConflict] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [toast, setToast] = useState<{ text: string; err?: boolean } | null>(null);
    const [picker, setPicker] = useState<{ kind: PickKind; onPick: (p: Picked) => void } | null>(null);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [pane, setPane] = useState<'edit' | 'preview'>('edit');
    const [historyOpen, setHistoryOpen] = useState(false);

    const preview = useRef<PreviewHandle>(null);
    const latest = useRef<Obj | null>(null);
    const draftUpdatedAt = useRef<string | null>(null);
    const dirty = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const chain = useRef<Promise<void>>(Promise.resolve());
    const blocked = useRef(false);

    const showToast = useCallback((text: string, err = false) => {
        setToast({ text, err });
        setTimeout(() => setToast(t => (t?.text === text ? null : t)), err ? 7000 : 3500);
    }, []);

    const applyDoc = useCallback((r: DocResponse) => {
        const value = normalizeDoc(docKey, r.draft ?? r.published ?? undefined) as Obj;
        latest.current = value;
        draftUpdatedAt.current = r.draftUpdatedAt;
        dirty.current = false;
        blocked.current = false;
        setLoadError(null);
        setConflict(false);
        setHasDraft(!!r.draft);
        setPublishedAt(r.publishedAt);
        setSave('idle');
        setData(value);
    }, [docKey]);

    const load = useCallback(
        () => api<DocResponse>(`/api/admin/content/${docKey}`).then(applyDoc).catch(e => setLoadError((e as Error).message)),
        [docKey, applyDoc],
    );

    useEffect(() => {
        let cancelled = false;
        api<DocResponse>(`/api/admin/content/${docKey}`)
            .then(r => { if (!cancelled) applyDoc(r); })
            .catch(e => { if (!cancelled) setLoadError((e as Error).message); });
        return () => { cancelled = true; };
    }, [docKey, applyDoc]);

    useEffect(() => {
        if (docKey !== 'menu') return;
        api<{ categories: { id: string; name: string }[] }>('/api/admin/menu').then(r => setCategories(r.categories)).catch(() => {});
    }, [docKey]);

    const doSave = useCallback(async () => {
        if (!dirty.current || blocked.current || !latest.current) return;
        dirty.current = false;
        setSave('saving');
        try {
            const r = await api<{ updatedAt: string }>(`/api/admin/content/${docKey}`, {
                method: 'PUT',
                body: { data: latest.current, expectedUpdatedAt: draftUpdatedAt.current },
            });
            draftUpdatedAt.current = r.updatedAt;
            setHasDraft(true);
            setSaveError(null);
            setSave(dirty.current ? 'pending' : 'saved');
        } catch (e) {
            dirty.current = true;
            if (e instanceof ApiError && e.status === 409) {
                blocked.current = true;
                setConflict(true);
            }
            setSaveError((e as Error).message);
            setSave('error');
        }
    }, [docKey]);

    const flush = useCallback(() => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null; }
        chain.current = chain.current.then(doSave);
        return chain.current;
    }, [doSave]);

    const onChange = useCallback((value: Obj) => {
        latest.current = value;
        dirty.current = true;
        setData(value);
        setSave('pending');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(flush, AUTOSAVE_MS);
    }, [flush]);

    // Don't let the tab close with an edit still on its way to the server.
    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (dirty.current || timer.current) { flush(); e.preventDefault(); }
        };
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); flush(); }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            window.removeEventListener('keydown', onKey);
            if (timer.current) { clearTimeout(timer.current); doSave(); }
        };
    }, [flush, doSave]);

    const contrast = useMemo(
        () => (docKey === 'theme' && data ? themeContrastChecks(normalizeDoc('theme', data) as SiteContent['theme']) : []),
        [docKey, data],
    );
    const contrastFailing = contrast.filter(c => c.ratio < c.min);

    const publish = async () => {
        if (contrastFailing.length) {
            showToast('Fix the colour warnings first - some text would be unreadable.', true);
            return;
        }
        setPublishing(true);
        try {
            await flush();
            if (blocked.current || dirty.current) throw new Error(saveError ?? 'Your latest changes could not be saved, so nothing was published.');
            await api(`/api/admin/content/${docKey}/publish`, { method: 'POST' });
            setHasDraft(false);
            draftUpdatedAt.current = null;
            setPublishedAt(new Date().toISOString());
            setSave('idle');
            showToast('Published. The live site is updated.');
        } catch (e) {
            showToast((e as Error).message, true);
        } finally {
            setPublishing(false);
        }
    };

    const discard = async () => {
        if (!confirm('Throw away all unpublished changes here and go back to what is live on the site?')) return;
        if (timer.current) { clearTimeout(timer.current); timer.current = null; }
        dirty.current = false;
        try {
            await chain.current;
            await api(`/api/admin/content/${docKey}`, { method: 'DELETE' });
            await load();
            preview.current?.reload();
            showToast('Changes discarded.');
        } catch (e) {
            showToast((e as Error).message, true);
        }
    };

    const ctx = useMemo<EditorCtx>(() => ({
        pickMedia: (kind, onPick) => setPicker({ kind, onPick }),
        menuCategories: categories,
        focusSection: (id) => preview.current?.focus(id),
    }), [categories]);

    const status = (() => {
        if (conflict) return <span className="cms-pill cms-pill--err">Edited elsewhere - reload</span>;
        if (save === 'saving') return <span className="cms-pill"><span className="cms-spinner" style={{ width: 11, height: 11 }} /> Saving draft…</span>;
        if (save === 'pending') return <span className="cms-pill">Editing…</span>;
        if (save === 'error') return <span className="cms-pill cms-pill--err" title={saveError ?? ''}>Not saved</span>;
        if (hasDraft) return <span className="cms-pill cms-pill--draft">Draft saved · not published</span>;
        if (publishedAt) return <span className="cms-pill cms-pill--ok">Published · {new Date(publishedAt).toLocaleString()}</span>;
        return <span className="cms-pill">Original content</span>;
    })();

    if (loadError) {
        return (
            <div className="cms-page">
                <div className="cms-alert cms-alert--err"><h3>Could not open {meta.title}</h3><p>{loadError}</p></div>
                <button type="button" className="cms-btn" onClick={load}>Try again</button>
            </div>
        );
    }

    return (
        <EditorContext.Provider value={ctx}>
            <div className="cms-editor">
                <div className="cms-editor-bar">
                    <Link href="/admin" className="cms-icon-btn" aria-label="Back to dashboard" title="Back to dashboard"><ArrowLeft size={17} /></Link>
                    <h1>{meta.title}</h1>
                    {status}
                    <span className="cms-spacer" />
                    <div className="cms-mobile-tabs" role="tablist" style={{ gap: 4 }}>
                        <button type="button" role="tab" className="cms-btn cms-btn--sm" aria-selected={pane === 'edit'} onClick={() => setPane('edit')}>Edit</button>
                        <button type="button" role="tab" className="cms-btn cms-btn--sm" aria-selected={pane === 'preview'} onClick={() => setPane('preview')}>Preview</button>
                    </div>
                    <button type="button" className="cms-btn cms-btn--sm" onClick={() => setHistoryOpen(true)}><History size={14} /> History</button>
                    {hasDraft && <button type="button" className="cms-btn cms-btn--sm cms-btn--danger" onClick={discard}><RotateCcw size={14} /> Discard changes</button>}
                    <a className="cms-btn cms-btn--sm" href={meta.previewPath} target="_blank" rel="noopener"><ExternalLink size={14} /> Live page</a>
                    <button type="button" className="cms-btn cms-btn--publish" disabled={publishing || conflict || (!hasDraft && save !== 'pending' && save !== 'saving')} onClick={publish}>
                        {publishing ? <span className="cms-spinner" /> : <Send size={15} />} Publish
                    </button>
                </div>

                <div className="cms-editor-split" data-pane={pane}>
                    <div className="cms-editor-form">
                        {conflict && (
                            <div className="cms-alert cms-alert--err">
                                <h3>Changed somewhere else</h3>
                                <p>{saveError}</p>
                                <button type="button" className="cms-btn cms-btn--sm" onClick={() => { load(); preview.current?.reload(); }}>Reload the latest version</button>
                            </div>
                        )}
                        {save === 'error' && !conflict && (
                            <div className="cms-alert cms-alert--err">
                                <p>{saveError}</p>
                                <button type="button" className="cms-btn cms-btn--sm" onClick={() => { dirty.current = true; flush(); }}>Try saving again</button>
                            </div>
                        )}
                        <p className="cms-help">{meta.description}</p>
                        {contrast.length > 0 && <ContrastPanel checks={contrast} />}
                        {data ? (
                            <FieldsEditor fields={fields} value={data} onChange={onChange} />
                        ) : (
                            <div className="cms-empty"><span className="cms-spinner" /></div>
                        )}
                    </div>
                    {data && <PreviewFrame ref={preview} path={meta.previewPath} docKey={docKey} data={data} />}
                </div>
            </div>

            {picker && <MediaPicker kind={picker.kind} onSelect={picker.onPick} onClose={() => setPicker(null)} />}
            {historyOpen && (
                <HistoryDrawer
                    docKey={docKey}
                    onClose={() => setHistoryOpen(false)}
                    onReset={() => {
                        onChange(normalizeDoc(docKey, undefined) as Obj);
                        setHistoryOpen(false);
                        showToast('Original content loaded as your draft. Check the preview, then Publish.');
                    }}
                    onRestored={(value, updatedAt) => {
                        if (timer.current) { clearTimeout(timer.current); timer.current = null; }
                        dirty.current = false;
                        latest.current = value;
                        draftUpdatedAt.current = updatedAt;
                        setHasDraft(true);
                        setSave('saved');
                        setData(value);
                        setHistoryOpen(false);
                        showToast('That version is now your draft. Check the preview, then Publish.');
                    }}
                />
            )}
            {toast && <div className={`cms-toast${toast.err ? ' cms-toast--err' : ''}`} role="status">{toast.text}</div>}
        </EditorContext.Provider>
    );
}

function ContrastPanel({ checks }: { checks: ReturnType<typeof themeContrastChecks> }) {
    return (
        <div className="cms-card cms-card-pad cms-contrast" style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 13 }}>Readability check</strong>
            {checks.map(c => {
                const level = c.ratio < c.min ? 'cms-pill--err' : c.ratio < 4.5 ? 'cms-pill--draft' : 'cms-pill--ok';
                const word = c.ratio < c.min ? 'Unreadable - fix before publishing' : c.ratio < 4.5 ? 'OK for large text only' : 'Good';
                return (
                    <div className="cms-contrast-row" key={c.label}>
                        <span className="cms-contrast-swatch" style={{ background: c.bg, color: c.fg }}>Aa</span>
                        <span style={{ flex: 1 }}>{c.label}</span>
                        <span className={`cms-pill ${level}`} title={word}>{c.ratio.toFixed(1)}:1</span>
                    </div>
                );
            })}
            <p className="cms-help">Higher is easier to read. 4.5:1 or more is ideal for normal text.</p>
        </div>
    );
}

function HistoryDrawer({ docKey, onClose, onRestored, onReset }: {
    docKey: DocKey;
    onClose: () => void;
    onReset: () => void;
    onRestored: (value: Obj, updatedAt: string) => void;
}) {
    const [items, setItems] = useState<{ id: number; revision: number; created_at: string }[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<number | null>(null);

    useEffect(() => {
        api<{ revisions: { id: number; revision: number; created_at: string }[] }>(`/api/admin/content/${docKey}/revisions`)
            .then(r => setItems(r.revisions))
            .catch(e => { setItems([]); setError(e.message); });
    }, [docKey]);

    const restore = async (id: number, revision: number) => {
        if (!confirm(`Load version ${revision} as your draft? Your current unpublished changes will be replaced.`)) return;
        setBusy(id);
        try {
            const r = await api<{ data: unknown; updatedAt: string }>(`/api/admin/content/${docKey}/revisions`, { method: 'POST', body: { id } });
            onRestored(normalizeDoc(docKey, r.data) as Obj, r.updatedAt);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="cms-drawer" role="dialog" aria-label="Version history">
            <div className="cms-modal-head">
                <h2>Version history</h2>
                <button type="button" className="cms-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
            </div>
            <div className="cms-modal-body">
                <p className="cms-help" style={{ marginBottom: 12 }}>Every time you publish, a version is kept here. Restoring loads it as a draft so you can check it before publishing again.</p>
                {error && <div className="cms-alert cms-alert--err">{error}</div>}
                {items === null ? <div className="cms-empty"><span className="cms-spinner" /></div>
                    : items.length === 0 ? <p className="cms-empty">Nothing published yet - the site is showing its original content.</p>
                    : items.map((item, i) => (
                        <div className="cms-history-item" key={item.id}>
                            <div>
                                <strong>Version {item.revision}{i === 0 ? ' · live now' : ''}</strong>
                                <small>{new Date(item.created_at).toLocaleString()}</small>
                            </div>
                            <button type="button" className="cms-btn cms-btn--sm" disabled={busy !== null} onClick={() => restore(item.id, item.revision)}>
                                {busy === item.id ? <span className="cms-spinner" /> : 'Restore'}
                            </button>
                        </div>
                    ))}
                <div className="cms-history-item">
                    <div>
                        <strong>Original website content</strong>
                        <small>The content the site was built with, before any edits.</small>
                    </div>
                    <button type="button" className="cms-btn cms-btn--sm" onClick={() => { if (confirm('Load the original content as your draft? Your current unpublished changes will be replaced.')) onReset(); }}>Restore</button>
                </div>
            </div>
        </div>
    );
}
