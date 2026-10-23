"use client";

import { useState, useEffect, useRef } from 'react';
import { DishPhotoError, prepareDishPhoto } from '@/components/admin/plate-dish';
import { putSigned, readApi, type Signed } from '@/components/admin/cms/media-library';

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
    add_on_note: string | null;
    badges: string[] | null;
    /** Kept in the database but not shown on the public menu. */
    hidden?: boolean;
};

type Category = { id: string; name: string };

type FormState = {
    title: string;
    category_id: string;
    price: string;
    description: string;
    image_src: string;
    portion_note: string;
    add_on_note: string;
    badges: string[];
};

const EMPTY_FORM: FormState = { title: '', category_id: '', price: '', description: '', image_src: '', portion_note: '', add_on_note: '', badges: [] };

/** The marks the menu draws, with the labels it shows (components/ui/dish-tags.tsx). */
const BADGES: { value: string; label: string }[] = [
    { value: 'spicy', label: 'Spicy' },
    { value: 'featured', label: 'Signature' },
    { value: 'special', label: "Chef's Special" },
    { value: 'new', label: 'New' },
];
const BADGE_VALUES = BADGES.map(b => b.value);

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px', backgroundColor: 'rgba(22,22,22,0.05)',
    border: '1px solid rgba(22,22,22,0.12)', borderRadius: '8px',
    color: 'var(--color-text-primary)', fontFamily: 'inherit', fontSize: '0.95rem',
};
const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
};
const hintStyle: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 };

export default function AdminMenu() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStage, setUploadStage] = useState<string | null>(null);
    /** Shown in the form when an uploaded cut-out is too small to look sharp. */
    const [photoWarning, setPhotoWarning] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const isUploading = uploadStage !== null;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const json = await readApi<{ data: MenuItem[]; categories: Category[] }>(await fetch('/api/admin/menu'), 'Could not load the menu.');
                if (cancelled) return;
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

    // Escape closes the dish form (not while a photo is uploading or saving).
    useEffect(() => {
        if (!isModalOpen || isUploading || isSubmitting) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setIsModalOpen(false); setError(null); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isModalOpen, isUploading, isSubmitting]);

    const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, category_id: categoryFilter || categories[0]?.id || '' });
        setError(null);
        setPhotoWarning(null);
        setIsModalOpen(true);
    };

    const openEdit = (item: MenuItem) => {
        setEditingId(item.id);
        setPhotoWarning(null);
        setForm({
            title: item.title,
            category_id: item.category_id,
            price: item.price,
            description: item.description ?? '',
            image_src: item.image_src ?? '',
            portion_note: item.portion_note ?? '',
            add_on_note: item.add_on_note ?? '',
            badges: (item.badges ?? []).filter(b => BADGE_VALUES.includes(b)),
        });
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setError(null); setPhotoWarning(null); };

    /** The client supplies each dish background-removed. The browser plates
     *  it (studio ground, contact shadow, consistent framing) so it matches
     *  every other dish on the menu, then uploads it straight to storage. */
    const handleFile = async (file: File) => {
        setError(null);
        setPhotoWarning(null);
        setUploadStage('Preparing photo…');
        try {
            const { plated, original, tooSmall } = await prepareDishPhoto(file);
            setUploadStage('Uploading…');
            const target = await readApi<{ plated: Signed; original: Signed; url: string }>(await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: file.name,
                    plated: { type: plated.type, size: plated.size },
                    original: { type: original.type, size: original.size },
                }),
            }), 'Upload failed.');
            await Promise.all([
                putSigned('dish-images', target.plated, plated, plated.type),
                putSigned('dish-images', target.original, original, original.type),
            ]);
            setForm(f => ({ ...f, image_src: target.url }));
            setPhotoWarning(tooSmall
                ? `This photo is small: the dish is ${tooSmall.have} px wide, and the menu shows it at up to ${tooSmall.need} px, so it will look soft on sharp screens. A larger photo (at least 2000 px wide) will look better. You can still save it.`
                : null);
            setNotice('Photo ready. Press Save to put it on the menu.');
        } catch (err) {
            setError(err instanceof DishPhotoError || err instanceof Error ? err.message : 'Upload failed.');
        } finally {
            setUploadStage(null);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const json = await readApi<{ data: MenuItem }>(await fetch('/api/admin/menu', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
            }), 'Save failed.');

            setItems(prev => editingId
                ? prev.map(i => (i.id === editingId ? { ...json.data, hidden: i.hidden } : i))
                : [...prev, json.data]);
            setIsModalOpen(false);
            setForm(EMPTY_FORM);
            setEditingId(null);
            setNotice(editingId ? 'Dish updated. The public menu shows it now.' : 'Dish added. The public menu shows it now.');
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
            await readApi(await fetch(`/api/admin/menu?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' }), 'Delete failed.');
            setItems(prev => prev.filter(i => i.id !== item.id));
            setNotice(`"${item.title}" deleted.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed.');
        }
    };

    const handleToggleHidden = async (item: MenuItem) => {
        const hidden = !item.hidden;
        setError(null);
        try {
            await readApi(await fetch('/api/admin/menu', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.id, hidden }),
            }), 'Could not change whether the dish is shown.');
            setItems(prev => prev.map(i => (i.id === item.id ? { ...i, hidden } : i)));
            setNotice(hidden
                ? `"${item.title}" is hidden from the public menu. It is still saved here — press Show to bring it back.`
                : `"${item.title}" is back on the public menu.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not change whether the dish is shown.');
        }
    };

    const hiddenCount = items.filter(i => i.hidden).length;
    const q = query.trim().toLowerCase();
    const shown = items.filter(i =>
        (!categoryFilter || i.category_id === categoryFilter) &&
        (!q || i.title.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)),
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                    <h1 className="display-2" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Menu Control</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {isLoading ? 'Loading…' : `${items.length - hiddenCount} dishes on the public menu${hiddenCount ? `, ${hiddenCount} hidden` : ''}.`}
                    </p>
                </div>
                <button onClick={openCreate} className="btn btn-primary" disabled={isLoading}>+ Add New Dish</button>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input
                    type="search"
                    placeholder="Search dishes…"
                    aria-label="Search dishes"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 240px', width: 'auto' }}
                />
                <select
                    aria-label="Show category"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{ ...inputStyle, flex: '0 1 240px', width: 'auto' }}
                >
                    <option value="">All categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {error && !isModalOpen && (
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
                        ) : shown.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{items.length ? 'No dishes match.' : 'No dishes yet.'}</td></tr>
                        ) : shown.map((item) => (
                            <tr key={item.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                        {item.image_src
                                            // eslint-disable-next-line @next/next/no-img-element
                                            ? <img src={item.image_src.startsWith('/assets/Menu/KS Menu Webp/') ? item.image_src.replace('/assets/Menu/KS Menu Webp/', '/assets/menu-plated/') : item.image_src} alt="" width={48} height={48} loading="lazy" style={{ objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                            : <span title="No photo" style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, border: '1px dashed rgba(22,22,22,0.25)', display: 'grid', placeItems: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>No photo</span>}
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                                {item.title}
                                                {item.portion_note && (
                                                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '6px' }}>{item.portion_note}</span>
                                                )}
                                                {item.hidden && (
                                                    <span title="Saved here but not shown on the public menu" style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Hidden from website</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {(item.badges ?? []).filter(b => BADGE_VALUES.includes(b)).map(b => BADGES.find(x => x.value === b)!.label).join(' · ')}
                                                {(item.badges ?? []).length > 0 && item.description ? ' — ' : ''}
                                                {item.description}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ padding: '4px 12px', backgroundColor: 'var(--color-border)', borderRadius: '16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        {categoryName(item.category_id)}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>{item.price}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <button onClick={() => openEdit(item)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline', marginRight: '14px', font: 'inherit', minHeight: 32 }}>Edit</button>
                                    <button onClick={() => handleToggleHidden(item)} aria-label={`${item.hidden ? 'Show' : 'Hide'} ${item.title}`} title={item.hidden ? 'Put this dish back on the public menu' : 'Take this dish off the public menu without deleting it'} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline', marginRight: '14px', font: 'inherit', minHeight: 32 }}>{item.hidden ? 'Show' : 'Hide'}</button>
                                    <button onClick={() => handleDelete(item)} style={{ background: 'transparent', border: 'none', color: '#8D361F', cursor: 'pointer', textDecoration: 'underline', font: 'inherit', minHeight: 32 }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,22,22,0.35)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}
                    onMouseDown={e => { if (e.target === e.currentTarget && !isUploading && !isSubmitting) closeModal(); }}
                >
                    <div role="dialog" aria-modal="true" aria-labelledby="dish-form-title" style={{ backgroundColor: 'var(--color-surface-elevated)', padding: 'clamp(24px, 5vw, 40px)', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid rgba(22,22,22,0.12)', margin: 'auto 0' }}>
                        <h2 id="dish-form-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '24px' }}>
                            {editingId ? 'Edit Dish' : 'Add New Dish'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-title" style={labelStyle}>Dish Name</label>
                                <input id="dish-title" type="text" required maxLength={200} value={form.title}
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
                                    <input id="dish-price" type="text" required maxLength={40} value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-portion" style={labelStyle}>Portion note (optional)</label>
                                <input id="dish-portion" type="text" maxLength={80} placeholder="(6pcs)" value={form.portion_note}
                                    onChange={e => setForm({ ...form, portion_note: e.target.value })} style={inputStyle} />
                                <p style={hintStyle}>Shown small after the dish name, e.g. (4pcs).</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-desc" style={labelStyle}>Description</label>
                                <textarea id="dish-desc" rows={3} maxLength={1000} value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>

                            <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <legend style={{ ...labelStyle, marginBottom: '8px' }}>Badges</legend>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
                                    {BADGES.map(b => (
                                        <label key={b.value} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: 32 }}>
                                            <input
                                                type="checkbox"
                                                checked={form.badges.includes(b.value)}
                                                onChange={e => setForm({ ...form, badges: e.target.checked ? [...form.badges, b.value] : form.badges.filter(x => x !== b.value) })}
                                            />
                                            {b.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-addon" style={labelStyle}>Extra note under the description (optional)</label>
                                <input id="dish-addon" type="text" maxLength={300} value={form.add_on_note}
                                    onChange={e => setForm({ ...form, add_on_note: e.target.value })} style={inputStyle} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="dish-photo" style={labelStyle}>Photo — background removed (PNG or WebP)</label>
                                <input
                                    id="dish-photo"
                                    ref={fileRef}
                                    type="file"
                                    accept="image/png,image/webp,.png,.webp"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                    disabled={isUploading}
                                    style={{ ...inputStyle, padding: '10px', cursor: isUploading ? 'wait' : 'pointer' }}
                                />
                                <p style={hintStyle}>
                                    Upload the dish cut out on a see-through background. It is placed on the menu&apos;s
                                    studio backdrop automatically, at the same size as every other dish. Best results:
                                    at least 2000&nbsp;px wide, the whole plate in view, up to 15&nbsp;MB.
                                </p>

                                {isUploading && <p role="status" style={{ fontSize: '0.85rem', margin: 0 }}>{uploadStage}</p>}

                                {form.image_src && !isUploading && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={form.image_src.startsWith('/assets/Menu/KS Menu Webp/') ? form.image_src.replace('/assets/Menu/KS Menu Webp/', '/assets/menu-plated/') : form.image_src} alt="How the dish will look on the menu" width={96} height={96}
                                            style={{ objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                            {decodeURIComponent(form.image_src.split('/').pop() || '')}
                                        </span>
                                        <button type="button" onClick={() => { setForm({ ...form, image_src: '' }); setPhotoWarning(null); }}
                                            style={{ background: 'transparent', border: 'none', color: '#8D361F', cursor: 'pointer', textDecoration: 'underline', font: 'inherit', fontSize: '0.8rem', minHeight: 32 }}>
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {photoWarning && form.image_src && !isUploading && (
                                <p role="status" style={{ margin: 0, padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(141,54,31,0.08)', color: '#8D361F', fontSize: '0.85rem', lineHeight: 1.5 }}>{photoWarning}</p>
                            )}

                            {error && (
                                <p role="alert" style={{ margin: 0, color: '#8D361F', fontSize: '0.9rem' }}>{error}</p>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={closeModal} disabled={isUploading || isSubmitting}
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
