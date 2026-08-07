"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { usePathname } from 'next/navigation';

const WHATSAPP_NUMBER = '8801600068193';
const waLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export default function Header() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [inHero, setInHero] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* Hide header while either hero section is in view.
       .hero = top hero (homepage), .menu-hero = top hero (menu page). */
    useEffect(() => {
        let io: IntersectionObserver | null = null;
        
        // Wait briefly for Next.js to finish painting the new page's DOM
        const timeoutId = setTimeout(() => {
            const els = document.querySelectorAll('.hero, .menu-hero');
            if (!els.length) { setInHero(false); return; }
            
            io = new IntersectionObserver(
                (entries) => {
                    const any = entries.some(e => e.isIntersecting);
                    // ponytail: only flip state when needed — avoids re-renders
                    setInHero(prev => any || document.querySelectorAll('.hero, .menu-hero')
                        .length === entries.filter(e => !e.isIntersecting).length ? any : prev);
                },
                { threshold: 0.1 }
            );
            els.forEach(el => io?.observe(el));
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            if (io) io.disconnect();
        };
    }, [pathname]);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
        <style dangerouslySetInnerHTML={{__html: `
            .header-container {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                align-items: center;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 100;
                transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            }
            /* Invisible while hero is in view */
            .header-container.in-hero {
                opacity: 0 !important;
                pointer-events: none;
            }
            /* Resting height is 14 + 50 + 14 = 78px, down from 120px. At the old
               size the bar covered the top eighth of the hero with a milky
               blurred slab. It stays translucent rather than going fully
               transparent because the nav links are near-black and have to
               stay legible over two very different heroes - dark video on the
               homepage, orange field on the menu. Keep --header-h in
               globals.css in step with this. */
            .header-container.top {
                padding: 14px clamp(20px, 4vw, 56px);
                background-color: rgba(255, 248, 236, 0.55);
                backdrop-filter: blur(16px);
            }
            .header-container.scrolled {
                padding: 10px clamp(20px, 4vw, 56px);
                background-color: rgba(255, 248, 236, 0.94);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid var(--color-border);
            }
            /* The room arrives once the ember at the logo has bloomed - see
               .ignition-ember in globals.css, which the logo's glow answers. */
            html[data-ignition="igniting"] .header-container {
                opacity: 0;
                animation: khaosanHeaderArrive 0.7s cubic-bezier(0.22, 1, 0.36, 1) 1.05s forwards;
            }
            @keyframes khaosanHeaderArrive {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
            }`
            + `
            /* The site-wide .btn padding (16px/36px) made this 57px tall - taller
               than the 50px logo - so the CTA, not the mark, was setting the
               bar's height. Compact here so the logo governs and the header
               actually measures the --header-h the layout is built around. */
            .header-right .btn {
                padding: 12px 24px;
                font-size: 0.75rem;
            }
            .header-left {
                /* Takes up 1fr space to balance the grid */
            }
            .header-center {
                display: flex;
                align-items: center;
                gap: 40px;
            }
            .header-right {
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }
            .nav-link {
                font-size: 0.8rem;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: var(--color-text-primary);
                text-decoration: none;
                font-weight: 600;
                transition: color 0.3s ease;
            }
            .nav-link:hover {
                color: var(--color-primary);
            }
            .mobile-menu-btn {
                display: none;
                background: none;
                border: none;
                cursor: pointer;
                z-index: 101;
                /* 44x44 hit area (WCAG 2.5.5) with the icon optically centered */
                width: 44px;
                height: 44px;
                padding: 10px;
                align-items: center;
                justify-content: center;
                border-radius: var(--radius-pill);
                transition: background-color 0.2s ease;
            }
            .mobile-menu-btn:hover,
            .mobile-menu-btn:focus-visible {
                background-color: rgba(255, 150, 63, 0.12);
            }
            @media (max-width: 1024px) {
                .desktop-only {
                    display: none !important;
                }
                .mobile-menu-btn {
                    display: flex;
                }
                /* The 3-column 1fr/auto/1fr grid is tuned for desktop's
                   symmetric nav-links-either-side-of-logo layout - once the
                   side columns collapse to empty/hamburger-only, the 1fr
                   track math doesn't reliably size .header-right to the
                   full available width. Flex + space-between sidesteps that
                   entirely: logo and hamburger position predictably at every
                   width instead of depending on grid column sizing. */
                .header-container {
                    display: flex;
                    justify-content: space-between;
                }
                .header-left {
                    display: none;
                }
            }
        `}} />

        <header className={`header-container ${scrolled ? 'scrolled' : 'top'}${inHero && !menuOpen ? ' in-hero' : ''}`}>
            
            {/* Left Column - Empty to balance CSS Grid */}
            <div className="header-left"></div>

            {/* Center Column - Nav Links + Logo perfectly centered */}
            <nav className="header-center">
                <Link href={pathname === '/menu' ? "/" : "/menu"} className="nav-link desktop-only">
                    {pathname === '/menu' ? "Home" : "Menu"}
                </Link>
                <Link href="/#havens" className="nav-link desktop-only">Locations</Link>

                {/* Logo */}
                <Link href="/" onClick={closeMenu} style={{ display: 'inline-block', position: 'relative', height: scrolled ? '42px' : '50px', width: scrolled ? '42px' : '50px', transition: 'all 0.4s ease' }}>
                    {/* unoptimized for the same reason as the hero and footer marks:
                        this logo depends on its alpha channel (it sits on a
                        translucent bar over video). The optimiser flattens that
                        alpha to a black ground. This placement happens to render
                        today, but it is the same asset through the same pipeline -
                        pinning it to the original file keeps all three logo
                        placements consistent and immune to that re-encode. */}
                    <Image
                        src="/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp"
                        alt="Khao San Logo"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="100px"
                        priority
                        unoptimized
                    />
                </Link>

                <Link href="/#heritage" className="nav-link desktop-only">Our Story</Link>
                <Link href="/#gift" className="nav-link desktop-only">Gift Cards</Link>
            </nav>

            {/* Right Column - Reserve Button & Mobile Hamburger */}
            <div className="header-right">
                <a href={waLink("Hi, I'd like to reserve a table at Khao San.")} target="_blank" rel="noopener noreferrer" className="btn btn-primary desktop-only">Reserve</a>
                
                {/* Mobile Hamburger */}
                <button 
                    className={`mobile-menu-btn ${menuOpen ? 'active' : ''}`} 
                    aria-label="Toggle mobile menu"
                    aria-expanded={menuOpen}
                    aria-controls="mobile-nav-menu"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span className="hamburger" style={{
                        display: 'block',
                        width: '24px',
                        height: '2px',
                        backgroundColor: menuOpen ? 'transparent' : 'var(--color-text-primary)',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                    }}>
                        {/* left:0 is load-bearing. These bars are absolutely
                            positioned but only set top/bottom, so their horizontal
                            placement fell back to the CSS "static position" - which
                            the inherited centre text-alignment resolved to the middle
                            of the 24px track, offsetting both outer bars 12px right
                            of the middle bar. The icon rendered as a zigzag rather
                            than three stacked rules. */}
                        <span style={{
                            position: 'absolute',
                            left: 0,
                            width: '24px',
                            height: '2px',
                            backgroundColor: 'var(--color-text-primary)',
                            top: menuOpen ? '0' : '-8px',
                            transform: menuOpen ? 'rotate(45deg)' : 'none',
                            transition: 'all 0.3s ease'
                        }}></span>
                        <span style={{
                            position: 'absolute',
                            left: 0,
                            width: '24px',
                            height: '2px',
                            backgroundColor: 'var(--color-text-primary)',
                            bottom: menuOpen ? '0' : '-8px',
                            transform: menuOpen ? 'rotate(-45deg)' : 'none',
                            transition: 'all 0.3s ease'
                        }}></span>
                    </span>
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            <nav
                id="mobile-nav-menu"
                className={`mobile-nav-overlay ${menuOpen ? 'active' : ''}`}
                aria-hidden={!menuOpen}
                inert={!menuOpen}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'rgba(255, 248, 236, 0.98)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '40px',
                    // Slide via transform (not `right`) so the panel is never
                    // positioned off-screen in layout - avoids inflating the
                    // containing block and reliably animates in/out.
                    transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    zIndex: 99
                }}
            >
                <Link href={pathname === '/menu' ? "/" : "/menu"} style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>
                    {pathname === '/menu' ? "Home" : "Menu"}
                </Link>
                <Link href="/#havens" style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>Locations</Link>
                <Link href="/#heritage" style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>Our Story</Link>
                <Link href="/#gift" style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>Gift Cards</Link>
                <a href={waLink("Hi, I'd like to reserve a table at Khao San.")} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="btn btn-primary" style={{marginTop: '24px'}}>Reserve a Table</a>
            </nav>
        </header>
        </>
    );
}
