"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/components/admin/api';
import { MediaPicker, MediaPreview, Modal } from '@/components/admin/media-picker';
import { SortableList, arrayMove } from '@/components/admin/sortable';

/**
 * Menu dishes and categories, straight from the Supabase menu tables.
 *
 * Unlike the other content areas there is no draft step here: the menu was
 * already live-on-save before the CMS existed, and the client's workflow
 * (fix a description, swap a photo) is the kind of change that should simply
 * happen. Every save revalidates /menu immediately.
 */

type Badge = 'spicy' | 'special' | 'featured' | 'new';
interface Dish {
    id: string;
    category_id: string;
    item_number: number;
    title: string;
    price: string;
    group_price: string | null;
    portion_note: string | null;
    description: string | null;
    image_src: string | null;
    badges: Badge[] | null;
    add_on_note: string | null;
    sort_order: number;
}
interface Category { id: string; name: string; sort_order: number }
interface AddOn { title: string; price: string }

const BADGES: { value: Badge; label: string }[] = [
    { value: 'spicy', label: 'Spicy' },
    { value: 'special', label: "Chef's Special" },
    { value: 'featured', label: 'Signature' },
    { value: 'new', label: 'New' },
];

/** Same rewrite the public menu applies: originals are cut-outs, the site shows plated versions. */
const thumb = (src: string | null) => (src ?? '').replace('/assets/Menu/KS Menu Webp/', '/assets/menu-plated/');

type DishForm = Omit<Dish, 'id' | 'item_number' | 'sort_order'> & { id?: string };

const emptyDish = (categoryId: string): DishForm => ({
    category_id: categoryId, title: '', price: '', group_price: '', portion_note: '', description: '',
    image_src: '', badges: [], add_on_note: '',
});

export default function MenuManager() {
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [addOns, setAddOns] = useState<Record<string, AddOn[]>>({});
    const [open, setOpen] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState<{ text: string; err?: boolean } | null>(null);
    const [editing, setEditing] = useState<DishForm | null>(null);
    const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string; addOns: AddOn[] } | null>(null);
    const orderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const notify = useCallback((text: string, err = false) => {
        setMessage({ text, err });
        if (!err) setTimeout(() => setMessage(m => (m?.text === text ? null : m)), 3000);
    }, []);

    useEffect(() => {
        let cancelled = false;
        api<{ data: Dish[]; categories: Category[]; addOns: (AddOn & { category_id: string })[] }>('/api/admin/menu')
            .then(r => {
                if (cancelled) return;
                setCategories(r.categories);
                setDishes(r.data);
                const grouped: Record<string, AddOn[]> = {};
                for (const a of r.addOns ?? []) (grouped[a.category_id] ??= []).push({ title: a.title, price: a.price });
                setAddOns(grouped);
            })
            .catch(e => {
                if (cancelled) return;
                setCategories([]);
                notify((e as Error).message, true);
            });
        return () => { cancelled = true; };
    }, [notify]);

    const dishesOf = (categoryId: string) =>
        dishes.filter(d => d.category_id === categoryId).sort((a, b) => a.sort_order - b.sort_order);

    /** Persist the whole order a moment after the last drag. */
    const saveOrder = (cats: Category[], all: Dish[]) => {
        if (orderTimer.current) clearTimeout(orderTimer.current);
        orderTimer.current = setTimeout(async () => {
            const items = cats.flatMap(c => all.filter(d => d.category_id === c.id).sort((a, b) => a.sort_order - b.sort_order).map(d => d.id));
            try {
                await api('/api/admin/menu/reorder', { method: 'POST', body: { categories: cats.map(c => c.id), items } });
                notify('New order saved - it is live on the menu.');
            } catch (e) {
                notify((e as Error).message, true);
            }
        }, 600);
    };

    const moveCategory = (from: number, to: number) => {
        if (!categories) return;
        const next = arrayMove(categories, from, to).map((c, i) => ({ ...c, sort_order: i }));
        setCategories(next);
        saveOrder(next, dishes);
    };

    const moveDish = (categoryId: string, from: number, to: number) => {
        const ordered = arrayMove(dishesOf(categoryId), from, to);
        const base = Math.min(...ordered.map(d => d.sort_order));
        const updated = new Map(ordered.map((d, i) => [d.id, base + i]));
        const next = dishes.map(d => (updated.has(d.id) ? { ...d, sort_order: updated.get(d.id)! } : d));
        setDishes(next);
        if (categories) saveOrder(categories, next);
    };

    const saveDish = async (form: DishForm) => {
        const body = {
            ...form,
            title: form.title.trim(),
            group_price: form.group_price || null,
            portion_note: form.portion_note || null,
            description: form.description || '',
            image_src: form.image_src || null,
            add_on_note: form.add_on_note || null,
            badges: form.badges ?? [],
        };
        if (!body.title) { notify('Give the dish a name.', true); return; }
        try {
            if (form.id) {
                const r = await api<{ data: Dish }>('/api/admin/menu', { method: 'PUT', body });
                setDishes(list => list.map(d => (d.id === r.data.id ? r.data : d)));
            } else {
                const r = await api<{ data: Dish }>('/api/admin/menu', { method: 'POST', body });
                setDishes(list => [...list, r.data]);
                setOpen(s => new Set(s).add(r.data.category_id));
            }
            setEditing(null);
            notify('Dish saved - it is live on the menu.');
        } catch (e) {
            notify((e as Error).message, true);
        }
    };

    const deleteDish = async (dish: Dish) => {
        if (!confirm(`Delete "${dish.title}" from the menu?`)) return;
        try {
            await api(`/api/admin/menu?id=${encodeURIComponent(dish.id)}`, { method: 'DELETE' });
            setDishes(list => list.filter(d => d.id !== dish.id));
            notify('Dish deleted.');
        } catch (e) {
            notify((e as Error).message, true);
        }
    };

    const saveCategory = async (form: { id?: string; name: string; addOns: AddOn[] }) => {
        try {
            if (form.id) {
                await api('/api/admin/menu/categories', { method: 'PUT', body: { id: form.id, name: form.name, addOns: form.addOns } });
                setCategories(list => list?.map(c => (c.id === form.id ? { ...c, name: form.name.trim() } : c)) ?? null);
                setAddOns(a => ({ ...a, [form.id!]: form.addOns.filter(x => x.title.trim()) }));
            } else {
                const r = await api<{ category: Category }>('/api/admin/menu/categories', { method: 'POST', body: { name: form.name } });
                if (form.addOns.some(a => a.title.trim())) {
                    await api('/api/admin/menu/categories', { method: 'PUT', body: { id: r.category.id, addOns: form.addOns } });
                }
                setCategories(list => [...(list ?? []), r.category]);
                setAddOns(a => ({ ...a, [r.category.id]: form.addOns.filter(x => x.title.trim()) }));
            }
            setEditingCategory(null);
            notify('Category saved.');
        } catch (e) {
            notify((e as Error).message, true);
        }
    };

    const deleteCategory = async (category: Category) => {
        if (!confirm(`Delete the empty category "${category.name}"?`)) return;
        try {
            await api(`/api/admin/menu/categories?id=${encodeURIComponent(category.id)}`, { method: 'DELETE' });
            setCategories(list => list?.filter(c => c.id !== category.id) ?? null);
            notify('Category deleted.');
        } catch (e) {
            notify((e as Error).message, true);
        }
    };

    const toggle = (id: string) => setOpen(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

    return (
        <div className="cms-page">
            <div className="cms-page-head">
                <div>
                    <h1>Menu dishes</h1>
                    <p>Drag categories and dishes into any order with the <strong>⋮⋮</strong> handle. Every change goes live on the menu page straight away.</p>
                </div>
                <div className="cms-row">
                    <a className="cms-btn" href="/menu" target="_blank" rel="noopener"><ExternalLink size={14} /> View menu</a>
                    <button type="button" className="cms-btn cms-btn--primary" onClick={() => setEditingCategory({ name: '', addOns: [] })}><Plus size={15} /> Add category</button>
                </div>
            </div>

            {message && <div className={`cms-alert ${message.err ? 'cms-alert--err' : 'cms-alert--info'}`} role="status">{message.text}</div>}

            {categories === null ? <div className="cms-empty"><span className="cms-spinner" /></div> : (
                <SortableList
                    items={categories}
                    keyOf={c => c.id}
                    onMove={moveCategory}
                    label="category"
                    render={(category, { handle, dragging }) => {
                        const list = dishesOf(category.id);
                        const isOpen = open.has(category.id);
                        return (
                            <div className={`cms-card cms-item${dragging ? ' is-dragging' : ''}`} data-sortable-item="">
                                <div className="cms-cat-head">
                                    {handle}
                                    <button type="button" className="cms-icon-btn" aria-expanded={isOpen} aria-label={isOpen ? `Collapse ${category.name}` : `Show dishes in ${category.name}`} onClick={() => toggle(category.id)}>
                                        {isOpen ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                                    </button>
                                    <h3>
                                        <button type="button" className="cms-item-title" style={{ fontSize: 15, padding: 0 }} onClick={() => toggle(category.id)}>
                                            {category.name} <span className="cms-cat-count">· {list.length} dish{list.length === 1 ? '' : 'es'}</span>
                                        </button>
                                    </h3>
                                    <button type="button" className="cms-btn cms-btn--sm" onClick={() => setEditing(emptyDish(category.id))}><Plus size={13} /> Dish</button>
                                    <button type="button" className="cms-icon-btn" aria-label={`Edit ${category.name}`} title="Rename / add-ons" onClick={() => setEditingCategory({ id: category.id, name: category.name, addOns: addOns[category.id] ?? [] })}><Pencil size={15} /></button>
                                    <button type="button" className="cms-icon-btn cms-icon-btn--danger" aria-label={`Delete ${category.name}`} title={list.length ? 'Move or delete its dishes first' : 'Delete category'} disabled={list.length > 0} onClick={() => deleteCategory(category)}><Trash2 size={15} /></button>
                                </div>
                                {isOpen && (
                                    <div className="cms-cat-body">
                                        {list.length === 0 ? <p className="cms-empty" style={{ padding: 16 }}>No dishes yet.</p> : (
                                            <SortableList
                                                items={list}
                                                keyOf={d => d.id}
                                                onMove={(from, to) => moveDish(category.id, from, to)}
                                                className=""
                                                label="dish"
                                                render={(dish, api2) => (
                                                    <div className={`cms-dish${api2.dragging ? ' is-dragging' : ''}`} data-sortable-item="">
                                                        {api2.handle}
                                                        {dish.image_src
                                                            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                                                            ? <img className="cms-thumb" src={thumb(dish.image_src)} alt="" loading="lazy" />
                                                            : <span className="cms-thumb" aria-hidden="true" />}
                                                        <button type="button" className="cms-item-title cms-dish-name" onClick={() => setEditing({ ...dish, badges: dish.badges ?? [] })}>
                                                            <strong>{dish.title} {dish.portion_note && <span>{dish.portion_note}</span>}</strong>
                                                            <span>{(dish.badges ?? []).map(b => BADGES.find(x => x.value === b)?.label).filter(Boolean).join(' · ') || ' '}</span>
                                                        </button>
                                                        <button type="button" className="cms-icon-btn" aria-label={`Edit ${dish.title}`} onClick={() => setEditing({ ...dish, badges: dish.badges ?? [] })}><Pencil size={15} /></button>
                                                        <button type="button" className="cms-icon-btn cms-icon-btn--danger" aria-label={`Delete ${dish.title}`} onClick={() => deleteDish(dish)}><Trash2 size={15} /></button>
                                                    </div>
                                                )}
                                            />
                                        )}
                                        {(addOns[category.id]?.length ?? 0) > 0 && (
                                            <p className="cms-help" style={{ padding: '8px 8px 0' }}>Add-ons: {addOns[category.id].map(a => a.title).join(', ')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
            )}

            {editing && categories && (
                <DishEditor dish={editing} categories={categories} onCancel={() => setEditing(null)} onSave={saveDish} />
            )}
            {editingCategory && (
                <CategoryEditor value={editingCategory} onCancel={() => setEditingCategory(null)} onSave={saveCategory} />
            )}
        </div>
    );
}

function DishEditor({ dish, categories, onCancel, onSave }: {
    dish: DishForm;
    categories: Category[];
    onCancel: () => void;
    onSave: (d: DishForm) => Promise<void>;
}) {
    const [form, setForm] = useState<DishForm>(dish);
    const [picking, setPicking] = useState(false);
    const [saving, setSaving] = useState(false);
    const set = <K extends keyof DishForm>(key: K, value: DishForm[K]) => setForm(f => ({ ...f, [key]: value }));

    const submit = async () => { setSaving(true); await onSave(form); setSaving(false); };

    return (
        <Modal
            title={dish.id ? `Edit ${dish.title}` : 'Add a dish'}
            onClose={onCancel}
            footer={<>
                <button type="button" className="cms-btn" onClick={onCancel}>Cancel</button>
                <button type="button" className="cms-btn cms-btn--primary" disabled={saving} onClick={submit}>{saving ? <span className="cms-spinner" /> : null} Save dish</button>
            </>}
        >
            <div className="cms-modal-body">
                <div className="cms-field">
                    <span className="cms-label">Photo</span>
                    <div className="cms-media">
                        <MediaPreview src={thumb(form.image_src)} kind="image" />
                        <div className="cms-media-meta">
                            <div className="cms-row">
                                <button type="button" className="cms-btn cms-btn--sm" onClick={() => setPicking(true)}>{form.image_src ? 'Replace photo' : 'Choose photo'}</button>
                                {form.image_src && <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={() => set('image_src', '')}>Remove</button>}
                            </div>
                            <span className="cms-help">A normal photo is fine (JPG, PNG or WebP). Square photos fit the menu grid best.</span>
                        </div>
                    </div>
                </div>
                <div className="cms-field">
                    <label className="cms-label" htmlFor="dish-title">Name</label>
                    <input id="dish-title" className="cms-input" value={form.title} onChange={e => set('title', e.target.value)} />
                </div>
                <div className="cms-field">
                    <label className="cms-label" htmlFor="dish-portion">Portion note</label>
                    <input id="dish-portion" className="cms-input" placeholder="(4pcs)" value={form.portion_note ?? ''} onChange={e => set('portion_note', e.target.value)} />
                </div>
                <div className="cms-field">
                    <label className="cms-label" htmlFor="dish-category">Category</label>
                    <select id="dish-category" className="cms-select" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="cms-field">
                    <span className="cms-label">Marks</span>
                    <div className="cms-chips">
                        {BADGES.map(b => {
                            const on = (form.badges ?? []).includes(b.value);
                            return <button key={b.value} type="button" className="cms-chip" aria-pressed={on} onClick={() => set('badges', on ? (form.badges ?? []).filter(x => x !== b.value) : [...(form.badges ?? []), b.value])}>{b.label}</button>;
                        })}
                    </div>
                </div>
                <div className="cms-field">
                    <label className="cms-label" htmlFor="dish-desc">Description</label>
                    <textarea id="dish-desc" className="cms-textarea" value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
                </div>
                <div className="cms-field">
                    <label className="cms-label" htmlFor="dish-addon">Add-on note</label>
                    <input id="dish-addon" className="cms-input" placeholder="Add coconut ice cream" value={form.add_on_note ?? ''} onChange={e => set('add_on_note', e.target.value)} />
                </div>
                <div className="cms-row" style={{ marginTop: 14, alignItems: 'flex-start' }}>
                    <div className="cms-field" style={{ flex: 1 }}>
                        <label className="cms-label" htmlFor="dish-price">Price</label>
                        <input id="dish-price" className="cms-input" value={form.price ?? ''} onChange={e => set('price', e.target.value)} />
                    </div>
                    <div className="cms-field" style={{ flex: 1, marginTop: 0 }}>
                        <label className="cms-label" htmlFor="dish-group">Sharing price</label>
                        <input id="dish-group" className="cms-input" value={form.group_price ?? ''} onChange={e => set('group_price', e.target.value)} />
                    </div>
                </div>
                <p className="cms-help">Prices are kept for your records but are not currently shown on the website.</p>
            </div>
            {picking && <MediaPicker kind="image" onClose={() => setPicking(false)} onSelect={p => set('image_src', p.src)} />}
        </Modal>
    );
}

function CategoryEditor({ value, onCancel, onSave }: {
    value: { id?: string; name: string; addOns: AddOn[] };
    onCancel: () => void;
    onSave: (v: { id?: string; name: string; addOns: AddOn[] }) => Promise<void>;
}) {
    const [form, setForm] = useState(value);
    const [saving, setSaving] = useState(false);
    const setAddOn = (i: number, patch: Partial<AddOn>) => setForm(f => ({ ...f, addOns: f.addOns.map((a, j) => (j === i ? { ...a, ...patch } : a)) }));
    return (
        <Modal
            narrow
            title={value.id ? `Edit ${value.name}` : 'Add a category'}
            onClose={onCancel}
            footer={<>
                <button type="button" className="cms-btn" onClick={onCancel}>Cancel</button>
                <button type="button" className="cms-btn cms-btn--primary" disabled={saving || !form.name.trim()} onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}>Save</button>
            </>}
        >
            <div className="cms-modal-body">
                <div className="cms-field">
                    <label className="cms-label" htmlFor="cat-name">Name</label>
                    <input id="cat-name" className="cms-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    {value.id && <p className="cms-help">Links to this category (/menu#{value.id}) keep working after a rename.</p>}
                </div>
                <div className="cms-field">
                    <span className="cms-label">Add-ons shown under this category</span>
                    {form.addOns.map((a, i) => (
                        <div className="cms-row" key={i}>
                            <input className="cms-input" aria-label={`Add-on ${i + 1}`} placeholder="Poached Egg" value={a.title} onChange={e => setAddOn(i, { title: e.target.value })} />
                            <input className="cms-input" aria-label={`Add-on ${i + 1} price`} placeholder="Price" style={{ maxWidth: 100, minWidth: 80 }} value={a.price} onChange={e => setAddOn(i, { price: e.target.value })} />
                            <button type="button" className="cms-icon-btn cms-icon-btn--danger" aria-label={`Remove add-on ${i + 1}`} onClick={() => setForm(f => ({ ...f, addOns: f.addOns.filter((_, j) => j !== i) }))}><Trash2 size={15} /></button>
                        </div>
                    ))}
                    <button type="button" className="cms-btn cms-add" onClick={() => setForm(f => ({ ...f, addOns: [...f.addOns, { title: '', price: '' }] }))}><Plus size={14} /> Add an add-on</button>
                </div>
            </div>
        </Modal>
    );
}
