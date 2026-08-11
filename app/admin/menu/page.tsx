"use client";

import { useState, useEffect, useRef } from 'react';

/**
 * Shape returned by /api/admin/menu — these are the real `menu_items` columns.
 * The previous version of this file declared `{ name, category, image }`, which
 * matched nothing in the database, so every row rendered a blank dish name and
 * a blank category pill while the data itself was arriving perfectly intact.
 */
type MenuItem = {
    id: string;
    category_id: string;
    item_number: number;
    title: string;
    price: string;
    description: string | null;
    image_src: string | null;
    portion_note: string | null;
};

type Category = { id: string; name: string };

type FormState = {
    title: string;
    category_id: string;
    price: string;
    description: string;
    image_src: string;
};

const EMPTY_FORM: FormState = { title: '', category_id: '', price: '', description: '', image_src: '' };

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px', backgroundColor: 'rgba(22,22,22,0.05)',
    border: '1px solid rgba(22,22,22,0.12)', borderRadius: '8px',
    color: 'var(--color-text-primary)', fontFamily: 'inherit', fontSize: '0.95rem',
};
const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
};

export default function AdminMenu() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/admin/menu');
                const json = await res.json();
                if (cancelled) return;
                if (!res.ok) throw new Error(json.error || 'Could not load the menu.');
                setItems(json.data ?? []);
                setCategories(json.categories ?? []);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the menu.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? '' });
        setError(null);
        setIsModalOpen(true);
    };

    const openEdit = (item: MenuItem) => {
        setEditingId(item.id);
        setForm({
            title: item.title,
            category_id: item.category_id,
            price: item.price,
            description: item.description ?? '',
            image_src: item.image_src ?? '',
        });
        setError(null);
        setIsModalOpen(true);
    };

    /** PNG only: dish photos are background-removed, and only PNG carries the
     *  alpha channel the floating-dish treatment on the public menu needs. */
    const handleFile = async (file: File) => {
        setError(null);
        if (file.type !== 'image/png' || !file.name.toLowerCase().endsWith('.png')) {
            setError('Dish photos must be PNG files with the background removed.');
            if (fileRef.current) fileRef.current.value = '';
            return;
        }
        setIsUploading(true);
        try {
            const body = new FormData();
            body.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Upload failed.');
            setForm(f => ({ ...f, image_src: json.url }));
            setNotice('Photo uploaded.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed.');
        } finally {
            setIsUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/menu', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Save failed.');

            setItems(prev => editingId
                ? prev.map(i => (i.id === editingId ? json.data : i))
                : [...prev, json.data]);
            setIsModalOpen(false);
            setForm(EMPTY_FORM);
            setEditingId(null);
            setNotice(editingId ? 'Dish updated. The public menu will refresh.' : 'Dish added. The public menu will refresh.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (item: MenuItem) => {
        if (!window.confirm(`Delete "${item.title}"? This removes it from the public menu.`)) return;
        setError(null);
        try {
            const res = await fetch(`/api/admin/menu?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Delete failed.');
            setItems(prev => prev.filter(i => i.id !== item.id));
            setNotice(`"${item.title}" deleted.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                    <h1 className="display-3" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Menu Control</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {isLoading ? 'Loading…' : `${items.length} dishes across ${categories.length} categories.`}
                    </p>
                </div>
                <button onClick={openCreate} className="btn btn-primary" disabled={isLoading}>+ Add New Dish</button>
            </div>

            {error && (
                <div role="alert" style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '8px', backgroundColor: 'rgba(141,54,31,0.10)', border: '1px solid rgba(141,54,31,0.35)', color: '#8D361F' }}>
                    {error}
                </div>
            )}
            {notice && !error && (
                <div role="status" style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '8px', backgroundColor: 'rgba(30,65,123,0.08)', border: '1px solid rgba(30,65,123,0.28)', color: '#16233d' }}>
                    {notice}
                </div>
            )}

            <div style={{ backgroundColor: 'var(--color-surface-base)', borderRadius: '12px', border: '1px solid var(--color-border)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(22,22,22,0.03)', color: 'var(--color-text-secondary)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            <th scope="col" style={{ padding: '20px 24px', fontWeight: 500 }}>Dish Name</th>
                            <th scope="col" style={{ padding: '20px 24px', fontWeight: 500 }}>Category</th>
                            <th scope="col" style={{ padding: '20px 24px', fontWeight: 500 }}>Price</th>
                            <th scope="col" style={{ padding: '20px 24px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading menu…</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No dishes yet.</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                        {item.title}
                                        {item.portion_note && (
                                            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '6px' }}>{item.portion_note}</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.description}
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <span style={{ padding: '4px 12px', backgroundColor: 'var(--color-border)', borderRadius: '16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        {categoryName(item.category_id)}
                                    </span>
                                </td>
                                <td style={{ padding: '20px 24px', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>{item.price}</td>
                                <td style={{ padding: '20px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <button onClick={() => openEdit(item)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline', marginRight: '14px', font: 'inherit' }}>Edit</button>
                                    <button onClick={() => handleDelete(item)} style={{ background: 'transparent', border: 'none', color: '#8D361F', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,22,22,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
                    <div style={{ backgroundColor: 'var(--color-surface-elevated)', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '540px', border: '1px solid rgba(22,22,22,0.12)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '24px' }}>
                            {editingId ? 'Edit Dish' : 'Add New Dish'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-title" style={labelStyle}>Dish Name</label>
                                <input id="dish-title" type="text" required value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
                            </div>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 200px' }}>
                                    <label htmlFor="dish-category" style={labelStyle}>Category</label>
                                    <select id="dish-category" required value={form.category_id}
                                        onChange={e => setForm({ ...form, category_id: e.target.value })} style={inputStyle}>
                                        <option value="" disabled>Choose a category…</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 160px' }}>
                                    <label htmlFor="dish-price" style={labelStyle}>Price (e.g. 850)</label>
                                    <input id="dish-price" type="text" required value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-desc" style={labelStyle}>Description</label>
                                <textarea id="dish-desc" rows={3} value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-photo" style={labelStyle}>Photo — PNG only, background removed</label>
                                <input
                                    id="dish-photo"
                                    ref={fileRef}
                                    type="file"
                                    accept="image/png,.png"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                    disabled={isUploading}
                                    style={{ ...inputStyle, padding: '10px', cursor: isUploading ? 'wait' : 'pointer' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                                    The menu shows dishes floating on the background, so the photo must be a
                                    transparent PNG. Max 5&nbsp;MB.
                                </p>

                                {isUploading && <p style={{ fontSize: '0.85rem', margin: 0 }}>Uploading…</p>}

                                {form.image_src && !isUploading && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                        {/* Plain <img>: the source is a runtime Supabase URL and this is a
                                            40px admin thumbnail, so next/image optimisation buys nothing. */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={form.image_src} alt="" width={44} height={44}
                                            style={{ objectFit: 'contain', borderRadius: '6px', background: 'rgba(22,22,22,0.05)' }} />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                            {form.image_src.split('/').pop()}
                                        </span>
                                        <button type="button" onClick={() => setForm({ ...form, image_src: '' })}
                                            style={{ background: 'transparent', border: 'none', color: '#8D361F', cursor: 'pointer', textDecoration: 'underline', font: 'inherit', fontSize: '0.8rem' }}>
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p role="alert" style={{ margin: 0, color: '#8D361F', fontSize: '0.9rem' }}>{error}</p>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => { setIsModalOpen(false); setError(null); }}
                                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(22,22,22,0.12)', color: 'var(--color-text-primary)', borderRadius: '8px', cursor: 'pointer', font: 'inherit' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting || isUploading} className="btn btn-primary" style={{ flex: 1 }}>
                                    {isSubmitting ? 'Saving…' : editingId ? 'Save Changes' : 'Save Dish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
