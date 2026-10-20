"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DOCS, type DocKey } from '@/lib/cms/registry';
import { EditorContext, Fields, Chevron } from './field-editors';

type Version = { id: string; publishedAt: string | null };
type State = {
    content: Record<string, unknown>;
    hasDraft: boolean;
    neverPublished: boolean;
    updatedAt: string | null;
    publishedAt: string | null;
    versions: Version[];
};

const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

/**
 * The editor for one area of the site. Changes stay in this tab until "Save
 * draft"; Preview and Publish save first, so what is previewed or published is
 * always exactly what is on screen.
 */
export default function DocEditor({ docKey }: { docKey: DocKey }) {
    const { def, defaults } = DOCS[docKey];
    const [state, setState] = useState<State | null>(null);
    const [content, setContent] = useState<Record<string, unknown> | null>(null);
    const [saved, setSaved] = useState<string>('');
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [open, setOpen] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const dirty = content !== null && JSON.stringify(content) !== saved;

    const apply = useCallback((s: State) => {
        setState(s);
        setContent(s.content);
        setSaved(JSON.stringify(s.content));
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/admin/content/${docKey}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Could not load.');
                apply(json);
            } catch (e) {
                setError((e as Error).message);
            }
        })();
        // The dish showcase picks a menu category by id.
        if (docKey === 'menu') {
            fetch('/api/admin/menu').then(r => r.json()).then(j => setCategories(j.categories ?? [])).catch(() => {});
        }
    }, [docKey, apply]);

    useEffect(() => {
        const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(n => (n === msg ? null : n)), 4000); };

    const save = useCallback(async (): Promise<boolean> => {
        if (!content) return false;
        setError(null);
        const res = await fetch(`/api/admin/content/${docKey}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.error || 'Could not save.'); return false; }
        setState(s => (s ? { ...s, ...json } : json));
        setContent(json.content);
        setSaved(JSON.stringify(json.content));
        return true;
    }, [docKey, content]);

    const run = async (label: string, fn: () => Promise<void>) => {
        setBusy(label);
        try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
    };

    const action = async (body: Record<string, unknown>) => {
        const res = await fetch(`/api/admin/content/${docKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Something went wrong.');
        apply(json);
    };

    const onSave = () => run('save', async () => { if (await save()) flash('Draft saved. The live site has not changed.'); });

    const onPreview = () => {
        // Open the tab synchronously (pop-up blockers allow that), then point
        // it at the preview once the draft is saved.
        const tab = window.open('about:blank', '_blank');
        run('preview', async () => {
            const ok = dirty ? await save() : true;
            if (!ok) { tab?.close(); return; }
            const url = `/api/admin/preview?path=${encodeURIComponent(def.previewPath)}`;
            if (tab) tab.location.href = url; else window.location.href = url;
        });
    };

    const onPublish = () => {
        if (!confirm(`Publish ${def.title} to the live website?\n\nVisitors will see these changes straight away. The current version is kept in History.`)) return;
        run('publish', async () => {
            if (dirty && !(await save())) return;
            await action({ action: 'publish' });
            flash('Published. The live site now shows these changes.');
        });
    };

    const onDiscard = () => {
        if (!confirm('Throw away all unpublished changes and go back to what is live?')) return;
        run('discard', async () => { await action({ action: 'discard' }); flash('Unpublished changes discarded.'); });
    };

    const onRestore = (v: Version) => {
        if (dirty && !confirm('You have unsaved changes. Restoring will replace them. Continue?')) return;
        run('restore', async () => {
            await action({ action: 'restore', versionId: v.id });
            flash(`Version from ${when(v.publishedAt)} restored as a draft. Preview it, then Publish to make it live.`);
            setShowHistory(false);
        });
    };

    const onResetAll = () => {
        if (!confirm(`Put everything in ${def.title} back to the original website content?\n\nThis only changes the editor; nothing goes live until you Publish.`)) return;
        setContent(structuredClone(defaults) as unknown as Record<string, unknown>);
    };

    // Ctrl/Cmd+S saves.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (dirty && !busy) onSave(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const order = useMemo(() => {
        const keys = def.sections.map(s => s.key);
        if (!def.orderable || !content) return keys;
        return (content.sectionOrder as string[]) ?? keys;
    }, [def, content]);

    if (error && !content) {
        return <div className="cms-admin"><div className="cms-banner cms-banner--error">{error}</div></div>;
    }
    if (!content || !state) return <div className="cms-admin"><p className="cms-muted">Loading…</p></div>;

    const sectionDefaults = defaults as unknown as Record<string, Record<string, unknown>>;
    const setSection = (key: string, v: Record<string, unknown>) => setContent(c => ({ ...c!, [key]: v }));
    const move = (key: string, d: number) => {
        const next = [...order];
        const i = next.indexOf(key);
        [next[i], next[i + d]] = [next[i + d], next[i]];
        setContent(c => ({ ...c!, sectionOrder: next }));
    };

    const status = dirty
        ? <span className="cms-pill cms-pill--draft">Unsaved changes</span>
        : state.hasDraft
            ? <span className="cms-pill cms-pill--draft">Draft saved, not published</span>
            : state.neverPublished
                ? <span className="cms-pill cms-pill--default">Showing the original website content</span>
                : <span className="cms-pill cms-pill--live">Live</span>;

    return (
        <EditorContext.Provider value={{ categories }}>
            <div className="cms-admin">
                <Link href="/admin/content" className="cms-btn cms-btn--link cms-small" style={{ marginBottom: 12 }}>← All website content</Link>
                <div className="cms-editor-head">
                    <div style={{ maxWidth: '70ch' }}>
                        <h1>{def.title}</h1>
                        <p className="cms-muted">{def.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {status}
                        {state.publishedAt && <p className="cms-small cms-muted" style={{ marginTop: 6 }}>Last published {when(state.publishedAt)}</p>}
                    </div>
                </div>

                <div className="cms-toolbar">
                    <button type="button" className="cms-btn cms-btn--primary" disabled={!dirty || !!busy} onClick={onSave}>
                        {busy === 'save' ? 'Saving…' : 'Save draft'}
                    </button>
                    <button type="button" className="cms-btn" disabled={!!busy} onClick={onPreview}>
                        {busy === 'preview' ? 'Opening…' : 'Preview ↗'}
                    </button>
                    <button type="button" className="cms-btn cms-btn--publish" disabled={!!busy || (!dirty && !state.hasDraft && !state.neverPublished)} onClick={onPublish}>
                        {busy === 'publish' ? 'Publishing…' : 'Publish'}
                    </button>
                    <span className="cms-toolbar__spacer" />
                    {state.hasDraft && <button type="button" className="cms-btn cms-btn--danger cms-btn--small" disabled={!!busy} onClick={onDiscard}>Discard draft</button>}
                    <button type="button" className="cms-btn cms-btn--small" onClick={() => setShowHistory(v => !v)}>History ({state.versions.length})</button>
                    <button type="button" className="cms-btn cms-btn--small" onClick={onResetAll}>Reset all to original</button>
                </div>

                {error && <div className="cms-banner cms-banner--error">{error}</div>}
                {notice && <div className="cms-banner cms-banner--ok">{notice}</div>}

                {showHistory && (
                    <div className="cms-section is-open" style={{ padding: '6px 16px 12px' }}>
                        <h2 style={{ fontSize: '1rem', margin: '10px 0 4px' }}>Published versions</h2>
                        <p className="cms-small cms-muted">Restoring copies an old version into your draft. Nothing changes on the live site until you Publish.</p>
                        <div className="cms-history">
                            {state.versions.length === 0 && <p className="cms-muted" style={{ padding: '10px 0' }}>Nothing published yet.</p>}
                            {state.versions.map((v, i) => (
                                <div key={v.id} className="cms-history__row">
                                    <span>{when(v.publishedAt) || v.id}{i === 0 && !state.neverPublished ? ' (live now)' : ''}</span>
                                    <button type="button" className="cms-btn cms-btn--small" disabled={!!busy} onClick={() => onRestore(v)}>Restore</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {order.map((key, i) => {
                    const section = def.sections.find(s => s.key === key);
                    if (!section) return null;
                    const value = content[key] as Record<string, unknown>;
                    const hidden = section.hideable && value.visible === false;
                    const isOpen = open === key;
                    return (
                        <div key={key} className={`cms-section${isOpen ? ' is-open' : ''}${hidden ? ' is-hidden' : ''}`}>
                            <div className="cms-section__head">
                                <button type="button" className="cms-section__toggle" onClick={() => setOpen(isOpen ? null : key)} aria-expanded={isOpen}>
                                    <Chevron open={isOpen} />
                                    <span className="cms-section__title">{section.title}</span>
                                    {hidden && <span className="cms-pill cms-pill--hidden">Hidden</span>}
                                </button>
                                {section.hideable && (
                                    <label className="cms-switch cms-small" title="Show this section on the website">
                                        <input type="checkbox" checked={!hidden} onChange={e => setSection(key, { ...value, visible: e.target.checked })} />
                                        <span>{hidden ? 'Hidden' : 'Shown'}</span>
                                    </label>
                                )}
                                {def.orderable && (
                                    <>
                                        <button type="button" className="cms-icon-btn" disabled={i === 0} onClick={() => move(key, -1)} aria-label={`Move ${section.title} up`}>↑</button>
                                        <button type="button" className="cms-icon-btn" disabled={i === order.length - 1} onClick={() => move(key, 1)} aria-label={`Move ${section.title} down`}>↓</button>
                                    </>
                                )}
                            </div>
                            {isOpen && (
                                <div className="cms-section__body">
                                    {section.description && <p className="cms-section__desc">{section.description}</p>}
                                    <Fields
                                        fields={section.fields}
                                        value={value}
                                        defaults={sectionDefaults[key]}
                                        onChange={v => setSection(key, v)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                {def.orderable && <p className="cms-small cms-muted" style={{ marginTop: 8 }}>Use ↑ ↓ to change the order the sections appear on the page.</p>}
            </div>
        </EditorContext.Provider>
    );
}
