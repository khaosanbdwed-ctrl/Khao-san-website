"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import MenuRow, { BADGE_META, MenuBadge } from '@/components/ui/menu-row';

export interface RawMenuItem {
    number: number;
    title: string;
    imageSrc: string;
    price: string;
    groupPrice?: string;
    portionNote?: string;
    description: string;
    badges?: MenuBadge[];
    addOnNote?: string;
    angled?: boolean;
}

export interface AddOn {
    title: string;
    price: string;
}

export interface MenuCategory {
    id: string;
    name: string;
    addOns?: AddOn[];
    items: RawMenuItem[];
}

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MenuPageClient({ categories }: { categories: MenuCategory[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [railVisible, setRailVisible] = useState(false);
    useEffect(() => {
        const hero = document.querySelector('.menu-hero');
        if (!hero) return;
        const observer = new IntersectionObserver(
            ([entry]) => setRailVisible(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(hero);
        return () => observer.disconnect();
    }, []);
    const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    /* The sliding-pill indicator and the auto-scroll that kept the active pill
       centred are both gone with the horizontal bar. The vertical index shows
       every category at once, so there is nothing to scroll into view and no
       travelling highlight to position - the active item just marks itself. */

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        categories.forEach((category, index) => {
            const el = document.getElementById(category.id);
            if (el) {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            setActiveIndex(index);
                        }
                    },
                    { rootMargin: '-20% 0px -75% 0px' }
                );
                observer.observe(el);
                observers.push(observer);
            }
        });

        return () => {
            observers.forEach(obs => obs.disconnect());
        };
    }, [categories]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, id: string) => {
        e.preventDefault();
        setActiveIndex(index);
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
    };

    const railPressed = useRef(false);
    const railRef = useRef<HTMLElement>(null);

    const focusFromPoint = useCallback((clientX: number, clientY: number) => {
        const items = railRef.current?.querySelectorAll('[data-index]');
        if (!items) return;
        let closest: Element | null = null;
        let closestDist = Infinity;
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const cy = rect.top + rect.height / 2;
            const dist = Math.abs(clientY - cy);
            if (dist < closestDist) { closestDist = dist; closest = item; }
        });
        if (closest) {
            const idx = parseInt((closest as HTMLElement).getAttribute('data-index') || '', 10);
            if (!isNaN(idx)) setFocusedIndex(idx);
        }
    }, []);

    const jumpTo = useCallback((index: number) => {
        const category = categories[index];
        const el = document.getElementById(category.id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            setActiveIndex(index);
        }
    }, [categories]);

    const handleRailStart = useCallback((clientX: number, clientY: number) => {
        railPressed.current = true;
        setMobileMenuOpen(true);
        focusFromPoint(clientX, clientY);
    }, [focusFromPoint]);

    const handleRailMove = useCallback((clientY: number) => {
        if (!railPressed.current) return;
        focusFromPoint(0, clientY);
    }, [focusFromPoint]);

    const handleRailEnd = useCallback(() => {
        if (railPressed.current && focusedIndex !== null) {
            jumpTo(focusedIndex);
        }
        railPressed.current = false;
        setMobileMenuOpen(false);
        setFocusedIndex(null);
    }, [focusedIndex, jumpTo]);

    return (
        <>
        {/* Menu hero.

            The previous hero was a cluster of three transparent cut-outs
            suspended at different scales with drop-shadows under them - the
            floating-dish treatment, which is exactly what the client rejected,
            still sitting at the top of the page after the dishes below it had
            been rebuilt as photographs.

            Now: the title centred on the field, and beneath it a full-bleed
            band of three plated photographs that runs edge to edge and
            dissolves into the menu below. Nothing floats, nothing is masked
            into a silhouette, and the band is the transition into the list
            rather than a divider before it. */}
        <section className="menu-hero bg-orange-field">
            <div className="menu-hero-copy reveal-hidden">
                <h1 className="menu-hero-title">A journey through fire.</h1>
                <p className="menu-hero-lede">
                    From fiery street-stall classics to whole-fish showpieces &mdash; every plate carries the char, spice and balance of Bangkok.
                </p>
                <p className="menu-hero-count">
                    {categories.reduce((sum, c) => sum + c.items.length, 0)} dishes across {categories.length} chapters
                </p>
            </div>

            <div className="menu-hero-band" aria-hidden="true">
                {[
                    '/assets/menu-plated/B. Soups/Tom Yum Goong.webp',
                    '/assets/menu-plated/E. Noodles/Pad Thai.webp',
                    '/assets/menu-plated/D. Salads/Som Tam (Thai Papaya Salad).webp',
                ].map((src, i) => (
                    <div className="menu-hero-plate" key={src}>
                        <Image
                            src={src}
                            alt=""
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="34vw"
                            priority={i === 0}
                        />
                    </div>
                ))}
            </div>
        </section>

        {railVisible && createPortal(
        <>
        <div
            aria-hidden="true"
            className={`menu-rail-backdrop ${mobileMenuOpen ? 'menu-rail-backdrop--active' : ''}`}
        />
        <nav
            ref={railRef}
            className={`menu-rail ${mobileMenuOpen ? 'menu-rail--active' : ''}`}
            aria-label="Menu sections"
            onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; handleRailStart(t.clientX, t.clientY); }}
            onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; handleRailMove(t.clientY); }}
            onTouchEnd={() => handleRailEnd()}
            onTouchCancel={() => handleRailEnd()}
            onPointerDown={(e) => { if (e.pointerType === 'mouse') handleRailStart(e.clientX, e.clientY); }}
            onPointerMove={(e) => { if (e.pointerType === 'mouse') handleRailMove(e.clientY); }}
            onPointerUp={(e) => { if (e.pointerType === 'mouse') handleRailEnd(); }}
        >
            {categories.map((category, index) => {
                const refIndex = focusedIndex !== null ? focusedIndex : activeIndex;
                const isActive = index === activeIndex;
                const isRef = index === refIndex;
                const distance = Math.abs(index - refIndex);
                const showName = mobileMenuOpen;
                const dashW = distance === 0 ? 30 : distance === 1 ? 18 : distance === 2 ? 11 : 6;
                const nameScale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.82;
                const nameOpacity = distance === 0 ? 1 : distance === 1 ? 0.72 : distance === 2 ? 0.45 : 0.28;
                const dashOpacity = isActive ? 1 : 0.25 + (1 - Math.min(distance, 3) / 3) * 0.55;
                return (
                    <button
                        key={category.id}
                        type="button"
                        data-index={index}
                        aria-current={isActive ? 'true' : undefined}
                        className="menu-rail-item"
                        onClick={() => jumpTo(index)}
                    >
                        <span
                            className="menu-rail-name"
                            data-index={index}
                            style={{
                                opacity: showName ? nameOpacity : 0,
                                transform: `translateY(-50%) translateX(${showName ? 0 : 12}px) scale(${nameScale})`,
                                color: isRef ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            }}
                        >
                            {category.name}
                        </span>
                        <span
                            className="menu-rail-dash"
                            data-index={index}
                            style={{
                                width: `${dashW}px`,
                                backgroundColor: isActive ? 'var(--color-primary)' : '#fff',
                                opacity: dashOpacity,
                                boxShadow: isActive ? '0 0 10px var(--color-primary)' : 'none',
                            }}
                        />
                    </button>
                );
            })}
        </nav>,
        </>,
        document.body)}

        {/* Index and menu share one field, side by side, so the index can
            stay sticky beside the dishes rather than floating over them. */}
        <div className="menu-layout bg-orange-field--quiet">
        {/* Desktop category index.

            Replaces a sticky horizontal pill bar. With 13 categories the bar
            was always wider than its container, so most categories were
            off-screen behind an internal horizontal scroll - the visitor had
            to scroll inside the nav to discover that more of the menu existed,
            which is the one thing a menu index must never do. A vertical
            column shows all thirteen at once, permanently, and doubles as a
            position indicator while you read.

            Desktop only. The phone rail below is untouched. */}
        <nav className="menu-index" aria-label="Menu categories">
            <div className="menu-index-panel">
            <span className="menu-index-title">Contents</span>
            <ol className="menu-index-list">
                {categories.map((category, index) => (
                    <li key={category.id}>
                        <a
                            href={`#${category.id}`}
                            ref={el => { navRefs.current[index] = el; }}
                            onClick={(e) => handleClick(e, index, category.id)}
                            className={`menu-index-link${activeIndex === index ? ' is-active' : ''}`}
                            aria-current={activeIndex === index ? 'true' : undefined}
                        >
                            <span className="menu-index-mark" aria-hidden="true" />
                            {category.name}
                        </a>
                    </li>
                ))}
            </ol>
            </div>
        </nav>

        <div className="menu-sections">
            {categories.map((category) => (
                <section key={category.id} id={category.id} className="menu-category">
                    <div className="container">
                        {/* The category name IS the divider. No rule, no band, no
                            eyebrow - the client asked for one continuous menu
                            rather than a stack of separated sections, so the
                            only thing marking a new category is the change in
                            typographic scale. */}
                        <h2 className="menu-category-title">{category.name}</h2>

                        <ul className="menu-list">
                            {category.items.map((item) => (
                                <MenuRow
                                    key={item.number}
                                    title={item.title}
                                    imageSrc={item.imageSrc}
                                    portionNote={item.portionNote}
                                    description={item.description}
                                    badges={item.badges}
                                    addOnNote={item.addOnNote}
                                />
                            ))}
                        </ul>

                        {category.addOns && category.addOns.length > 0 && (
                            <p className="menu-addons">
                                <span className="menu-addons-label">Add ons</span>
                                {/* Add-on prices dropped with the rest of the pricing. */}
                                {category.addOns.map((addOn) => (
                                    <span className="menu-addons-item" key={addOn.title}>{addOn.title}</span>
                                ))}
                            </p>
                        )}
                    </div>
                </section>
            ))}
        </div>
        </div>

        <section style={{ backgroundColor: 'var(--color-surface-elevated)', padding: '56px 0', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <div className="container">
                {/* Drawn icons, not emoji - and the same ones the rows use, so
                    the legend actually explains the marks on the page. Emoji
                    render differently on every platform and were a different
                    set from the lucide icons on the dishes themselves. */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
                    {(Object.keys(BADGE_META) as MenuBadge[]).map((b) => (
                        <span className="menu-tag" key={b}>
                            {BADGE_META[b].icon}
                            {BADGE_META[b].label}
                        </span>
                    ))}
                </div>
                {/* The two BDT/pricing lines are gone with the prices themselves -
                    a note about what prices include reads oddly on a menu that
                    no longer shows any. VAT and service charge still apply, so
                    they are stated without referring to listed prices. */}
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 2, maxWidth: '640px' }}>
                    <li>5% VAT and applicable SD are included.</li>
                    <li>A 5% service charge is applied on the final bill.</li>
                    <li>All meat served is 100% halal.</li>
                    <li>Please alert your server if you&rsquo;re allergic to any ingredients.</li>
                </ul>
            </div>
        </section>
        </>
    );
}
