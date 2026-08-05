"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Do not show sidebar on the login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    const navItems = [
        { label: 'Overview', href: '/admin' },
        { label: 'Menu Control', href: '/admin/menu' },
        { label: 'Reservations', href: '/admin/reservations' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background-base)' }}>
            
            {/* Sidebar */}
            <aside style={{ width: '280px', backgroundColor: 'var(--color-surface-base)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Admin Portal</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginTop: '8px' }}>Khao San</h2>
                </div>

                <nav style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map((item) => (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                backgroundColor: pathname === item.href ? 'rgba(240, 139, 67, 0.1)' : 'transparent',
                                transition: 'all 0.2s',
                                fontWeight: pathname === item.href ? 500 : 400
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button 
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '48px', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>

        </div>
    );
}
