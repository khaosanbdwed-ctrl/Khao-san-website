"use client";

import './admin.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard, Home, UtensilsCrossed, BookOpen, PanelsTopLeft, MapPin, Palette,
    Settings, Shield, FileText, Images, ExternalLink, LogOut, Menu as MenuIcon,
} from 'lucide-react';
import type { DocKey } from '@/lib/cms/schema';

const NAV: { group: string; items: { href: string; label: string; icon: React.ComponentType<{ size?: number }>; doc?: DocKey }[] }[] = [
    { group: '', items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
    {
        group: 'Pages',
        items: [
            { href: '/admin/content/home', label: 'Homepage', icon: Home, doc: 'home' },
            { href: '/admin/menu', label: 'Menu dishes', icon: UtensilsCrossed },
            { href: '/admin/content/menu', label: 'Menu page', icon: BookOpen, doc: 'menu' },
            { href: '/admin/content/privacy', label: 'Privacy policy', icon: Shield, doc: 'privacy' },
            { href: '/admin/content/terms', label: 'Terms of service', icon: FileText, doc: 'terms' },
        ],
    },
    {
        group: 'Across the site',
        items: [
            { href: '/admin/content/navigation', label: 'Header & footer', icon: PanelsTopLeft, doc: 'navigation' },
            { href: '/admin/content/locations', label: 'Locations', icon: MapPin, doc: 'locations' },
            { href: '/admin/content/theme', label: 'Colours, fonts & backgrounds', icon: Palette, doc: 'theme' },
            { href: '/admin/content/site', label: 'Site settings & SEO', icon: Settings, doc: 'site' },
        ],
    },
    { group: 'Library', items: [{ href: '/admin/media', label: 'Media library', icon: Images }] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [drafts, setDrafts] = useState<Set<string>>(new Set());

    const isLogin = pathname === '/admin/login';

    // Orange dots on areas with unpublished changes.
    useEffect(() => {
        if (isLogin) return;
        let cancelled = false;
        fetch('/api/admin/content', { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : null))
            .then(r => { if (!cancelled && r?.docs) setDrafts(new Set(r.docs.filter((d: { hasDraft: boolean }) => d.hasDraft).map((d: { key: string }) => d.key))); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [pathname, isLogin]);

    if (isLogin) return <div className="cms-admin">{children}</div>;

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className="cms-admin">
            <div className="cms-topbar-mobile">
                <button type="button" className="cms-icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}><MenuIcon size={20} /></button>
                Khao San admin
            </div>
            <div className="cms-shell">
                {open && <div className="cms-scrim" onClick={() => setOpen(false)} />}
                <aside className={`cms-sidebar${open ? ' is-open' : ''}`}>
                    <Link href="/admin" className="cms-brand" onClick={() => setOpen(false)}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static mark */}
                        <img src="/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp" alt="" />
                        <div><strong>Khao San</strong><span>Website editor</span></div>
                    </Link>
                    <nav className="cms-nav" aria-label="Admin">
                        {NAV.map(group => (
                            <div className="cms-nav-group" key={group.group || 'top'}>
                                {group.group && <p>{group.group}</p>}
                                {group.items.map(({ href, label, icon: Icon, doc }) => (
                                    <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setOpen(false)}>
                                        <Icon size={17} />
                                        {label}
                                        {doc && drafts.has(doc) && <span className="cms-nav-dot" title="Unpublished changes" aria-label="Unpublished changes" />}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </nav>
                    <div className="cms-sidebar-foot">
                        <a className="cms-btn" href="/" target="_blank" rel="noopener"><ExternalLink size={14} /> View the website</a>
                        <button type="button" className="cms-btn cms-btn--ghost" onClick={logout}><LogOut size={14} /> Sign out</button>
                    </div>
                </aside>
                <main className="cms-main">{children}</main>
            </div>
        </div>
    );
}
