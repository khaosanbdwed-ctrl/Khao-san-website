"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background-base)' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2, zIndex: 0 }}>
                <Image
                    src="/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp"
                    alt="Background"
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', padding: '48px', backgroundColor: 'var(--color-surface-base)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span className="overline" style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '16px' }}>Khao San Admin</span>
                    <h1 className="display-3" style={{ fontSize: '2.5rem' }}>Log In.</h1>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {error && (
                        <div style={{ padding: '12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#f87171', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                        {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
