"use client";

import { useState, useEffect } from 'react';

type Reservation = {
    id: number;
    name: string;
    phone: string;
    location: string;
    date: string;
    time: string;
    guests: number;
    status: 'Pending' | 'Confirmed' | 'Declined';
};

export default function AdminReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const res = await fetch('/api/admin/reservations');
            const json = await res.json();
            if (json.data) setReservations(json.data);
        } catch (err) {
            console.error('Failed to fetch reservations');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        // Optimistic update
        setReservations(reservations.map(r => r.id === id ? { ...r, status: status as any } : r));
        
        try {
            await fetch('/api/admin/reservations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
        } catch (err) {
            // Revert on fail
            fetchReservations();
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <h1 className="display-3" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Reservations</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Manage your incoming bookings.</p>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface-base)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--color-text-secondary)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '20px 24px', fontWeight: 500 }}>Guest</th>
                            <th style={{ padding: '20px 24px', fontWeight: 500 }}>Details</th>
                            <th style={{ padding: '20px 24px', fontWeight: 500 }}>Location</th>
                            <th style={{ padding: '20px 24px', fontWeight: 500 }}>Status</th>
                            <th style={{ padding: '20px 24px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading reservations...</td>
                            </tr>
                        ) : reservations.map((res) => (
                            <tr key={res.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{res.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{res.phone}</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{res.date} at {res.time}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{res.guests} Guests</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <span style={{ padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '0.85rem' }}>{res.location}</span>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        backgroundColor: res.status === 'Confirmed' ? 'rgba(34, 197, 94, 0.1)' : res.status === 'Declined' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: res.status === 'Confirmed' ? '#4ade80' : res.status === 'Declined' ? '#f87171' : '#fbbf24',
                                        borderRadius: '16px', fontSize: '0.85rem' 
                                    }}>
                                        {res.status}
                                    </span>
                                </td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    {res.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => updateStatus(res.id, 'Confirmed')} style={{ padding: '6px 12px', backgroundColor: '#4ade80', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Confirm</button>
                                            <button onClick={() => updateStatus(res.id, 'Declined')} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Decline</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
