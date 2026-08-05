"use client";

import { useState, useEffect } from 'react';

type MenuItem = {
    id: number;
    name: string;
    category: string;
    price: string;
    description: string;
    image: string | null;
};

export default function AdminMenu() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ name: '', category: 'Starters', price: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await fetch('/api/admin/menu');
            const json = await res.json();
            if (json.data) setItems(json.data);
        } catch (err) {
            console.error('Failed to fetch menu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (json.success) {
                setItems([...items, json.data]);
                setIsModalOpen(false);
                setFormData({ name: '', category: 'Starters', price: '', description: '' });
            }
        } catch (err) {
            console.error('Failed to add item');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 className="display-3" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Menu Control</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Manage your dishes and prices in real-time.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    + Add New Dish
                </button>
            </div>

            {/* Menu Data Table */}
            <div style={{ backgroundColor: 'var(--color-surface-base)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--color-text-secondary)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '20px 24px', fontWeight: 500 }}>Dish Name</th>
                            <th style={{ padding: '20px 24px', fontWeight: 500 }}>Category</th>
                            <th style={{ padding: '20px 24px', fontWeight: 500 }}>Price</th>
                            <th style={{ padding: '20px 24px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading menu...</td>
                            </tr>
                        ) : items.map((item) => (
                            <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <span style={{ padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '0.85rem' }}>{item.category}</span>
                                </td>
                                <td style={{ padding: '20px 24px', color: 'var(--color-primary)' }}>{item.price}</td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'var(--color-surface-base)', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '24px' }}>Add New Dish</h2>
                        
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Dish Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Category</label>
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-text-primary)' }}>
                                        <option>Starters</option>
                                        <option>Soups</option>
                                        <option>Salads</option>
                                        <option>Curries</option>
                                        <option>Noodles</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Price (e.g. ৳ 850)</label>
                                    <input type="text" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Description</label>
                                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-text-primary)', resize: 'vertical' }} />
                            </div>

                            {/* Pseudo Image Upload */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Photo Upload (PNG only)</label>
                                <div style={{ width: '100%', padding: '24px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Click to upload a PNG file. (Supabase Storage placeholder)
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-primary)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>{isSubmitting ? 'Saving...' : 'Save Dish'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
