"use client";

import { useEffect, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { api } from '@/components/admin/api';
import { MediaPreview, UploadDrop } from '@/components/admin/media-picker';
import { formatBytes, type MediaItem } from '@/components/admin/upload';

type Filter = 'all' | 'image' | 'video' | 'font';

export default function MediaLibraryPage() {
    const [items, setItems] = useState<MediaItem[] | null>(null);
    const [setupRequired, setSetupRequired] = useState(false);
    const [filter, setFilter] = useState<Filter>('all');
    const [message, setMessage] = useState<{ text: string; err?: boolean } | null>(null);

    useEffect(() => {
        api<{ items: MediaItem[]; setupRequired?: boolean }>('/api/admin/media')
            .then(r => { setItems(r.items); setSetupRequired(!!r.setupRequired); })
            .catch(e => { setItems([]); setMessage({ text: e.message, err: true }); });
    }, []);

    const visible = (items ?? []).filter(i => filter === 'all' || i.kind === filter);

    const patch = async (item: MediaItem, change: Partial<Pick<MediaItem, 'name' | 'alt'>>) => {
        try {
            const r = await api<{ item: MediaItem }>('/api/admin/media', { method: 'PATCH', body: { id: item.id, ...change } });
            setItems(list => list?.map(i => (i.id === item.id ? r.item : i)) ?? null);
        } catch (e) {
            setMessage({ text: (e as Error).message, err: true });
        }
    };

    const remove = async (item: MediaItem) => {
        if (!confirm(`Delete "${item.name || item.path}"? This cannot be undone.`)) return;
        try {
            await api(`/api/admin/media?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
            setItems(list => list?.filter(i => i.id !== item.id) ?? null);
            setMessage({ text: 'Deleted.' });
        } catch (e) {
            setMessage({ text: (e as Error).message, err: true });
        }
    };

    return (
        <div className="cms-page">
            <div className="cms-page-head">
                <div>
                    <h1>Media library</h1>
                    <p>Photos, videos and fonts uploaded for the website. You can also upload straight from any image field while editing.</p>
                </div>
            </div>

            {message && <div className={`cms-alert ${message.err ? 'cms-alert--err' : 'cms-alert--info'}`} role="status">{message.text}</div>}
            {setupRequired ? (
                <div className="cms-alert cms-alert--warn">Uploads need the one-time CMS database setup - see the Dashboard.</div>
            ) : (
                <UploadDrop
                    kind="any"
                    multiple
                    onUploaded={(item) => setItems(list => [item, ...(list ?? [])])}
                    onError={(text) => setMessage({ text, err: true })}
                />
            )}

            <div className="cms-chips" style={{ marginBottom: 16 }} role="group" aria-label="Show">
                {(['all', 'image', 'video', 'font'] as Filter[]).map(f => (
                    <button key={f} type="button" className="cms-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'Everything' : f === 'image' ? 'Images' : f === 'video' ? 'Videos' : 'Fonts'}
                    </button>
                ))}
            </div>

            {items === null ? <div className="cms-empty"><span className="cms-spinner" /></div>
                : visible.length === 0 ? <p className="cms-empty">Nothing here yet.</p>
                : (
                    <div className="cms-grid">
                        {visible.map(item => (
                            <div key={item.id} className="cms-card cms-card-pad" style={{ display: 'grid', gap: 10 }}>
                                <div className="cms-media-card"><MediaPreview src={item.url} kind={item.kind} /></div>
                                <input className="cms-input" aria-label="File name" defaultValue={item.name} onBlur={e => e.target.value !== item.name && patch(item, { name: e.target.value })} />
                                {item.kind === 'image' && (
                                    <input className="cms-input" aria-label="Description" placeholder="Default description (alt text)" defaultValue={item.alt} onBlur={e => e.target.value !== item.alt && patch(item, { alt: e.target.value })} />
                                )}
                                <span className="cms-help">
                                    {item.kind} · {formatBytes(item.size)}{item.width ? ` · ${item.width}×${item.height}` : ''} · {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                <div className="cms-row">
                                    <button type="button" className="cms-btn cms-btn--sm" onClick={() => { navigator.clipboard?.writeText(item.url); setMessage({ text: 'Link copied.' }); }}><Copy size={13} /> Copy link</button>
                                    <span style={{ flex: 1 }} />
                                    <button type="button" className="cms-icon-btn cms-icon-btn--danger" aria-label={`Delete ${item.name}`} onClick={() => remove(item)}><Trash2 size={15} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
