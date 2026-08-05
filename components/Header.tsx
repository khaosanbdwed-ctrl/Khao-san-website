"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReservation } from '@/components/ReservationContext';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { openDrawer } = useReservation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            .header-container.top {
                padding: 28px clamp(24px, 5vw, 64px);
                background-color: transparent;
                border-bottom: 1px solid transparent;
            }
            .header-container.scrolled {
                padding: 16px clamp(24px, 5vw, 64px);
                background-color: rgba(10, 10, 12, 0.85);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
                align-items: center;
                justify-content: center;
            }
            @media (max-width: 1024px) {
                .desktop-only {
                    display: none !important;
                }
                .mobile-menu-btn {
                    display: flex;
                }
            }
        `}} />

        <header className={`header-container ${scrolled ? 'scrolled' : 'top'}`}>
            
            {/* Left Column - Empty to balance CSS Grid */}
            <div className="header-left"></div>

            {/* Center Column - Nav Links + Logo perfectly centered */}
            <nav className="header-center">
                <Link href="/menu" className="nav-link desktop-only">Menu</Link>
                <Link href="/locations" className="nav-link desktop-only">Locations</Link>
                
                {/* Logo */}
                <Link href="/" onClick={closeMenu} style={{ display: 'inline-block', position: 'relative', height: scrolled ? '48px' : '64px', width: scrolled ? '48px' : '64px', transition: 'all 0.4s ease' }}>
                    <Image 
                        src="/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp" 
                        alt="Khao San Logo" 
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="100px"
                        priority
                    />
                </Link>

                <Link href="/about" className="nav-link desktop-only">Our Story</Link>
                <Link href="/giftcards" className="nav-link desktop-only">Gift Cards</Link>
            </nav>

            {/* Right Column - Reserve Button & Mobile Hamburger */}
            <div className="header-right">
                <button onClick={openDrawer} className="btn btn-primary desktop-only">Reserve</button>
                
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
                        backgroundColor: menuOpen ? 'transparent' : '#fdfbf7',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                    }}>
                        <span style={{
                            position: 'absolute',
                            width: '24px',
                            height: '2px',
                            backgroundColor: '#fdfbf7',
                            top: menuOpen ? '0' : '-8px',
                            transform: menuOpen ? 'rotate(45deg)' : 'none',
                            transition: 'all 0.3s ease'
                        }}></span>
                        <span style={{
                            position: 'absolute',
                            width: '24px',
                            height: '2px',
                            backgroundColor: '#fdfbf7',
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
                    backgroundColor: 'rgba(10, 10, 12, 0.98)',
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
                <Link href="/menu" style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fdfbf7', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>Menu</Link>
                <Link href="/locations" style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fdfbf7', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>Locations</Link>
                <Link href="/about" style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fdfbf7', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>Our Story</Link>
                <Link href="/giftcards" style={{fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fdfbf7', textDecoration: 'none', fontWeight: 600}} onClick={closeMenu}>Gift Cards</Link>
                <button onClick={() => { closeMenu(); openDrawer(); }} className="btn btn-primary" style={{marginTop: '24px'}}>Reserve Table</button>
            </nav>
        </header>
        </>
    );
}
