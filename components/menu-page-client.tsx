"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import BackgroundVideo from '@/components/ui/background-video';
import MenuRow, { MenuBadge } from '@/components/ui/menu-row';
import MenuShowcase, { type ShowcaseStep } from '@/components/ui/menu-showcase';

/* The five categories the pinned showcase steps through, in order, each with
 * the one plate that represents it.
 *
 * Chosen by the client: soup, wok, bowl, showpiece, dessert - a meal in five
 * beats rather than the first five categories in sort order (which would be
 * Appetizers, Soups, Dumplings, Salads, Kids Menu).
 *
 * ⚠ Referenced BY ID, never by array position, and the dish is looked up by
 * title inside its category with a fallback. The menu is Supabase-backed and
 * editable in admin: a renamed dish, a reordered category or a deleted row
 * must degrade to a different plate, never to a crash or an empty stage. See
 * buildShowcase below.
 *
 * The showcase is a way IN to the menu, not a replacement for it - all
 * fourteen categories and every dish are on the page directly beneath it. */
const SHOWCASE_PICKS: { categoryId: string; dishTitle: string }[] = [
    { categoryId: 'b-soups', dishTitle: 'Tom Yum Goong' },
    { categoryId: 'e-noodles', dishTitle: 'Pad Thai' },
    { categoryId: 'k-rice-bowls', dishTitle: 'Thai Seafood Bowl' },
    { categoryId: 'i-seafood', dishTitle: 'Fried Whole Fish in Spicy Hot Sauce' },
    { categoryId: 'l-desserts', dishTitle: 'Mango Sticky Rice' },
];

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

/**
 * Resolve the five picks against whatever the database actually holds.
 *
 * Every lookup degrades rather than failing: a missing category is skipped, a
 * renamed dish falls back to the category's first `featured` item and then to
 * its first item at all. A category that exists but is empty is skipped too -
 * `app/menu/page.tsx` already filters those out, but this must not depend on
 * that staying true.
 */
function buildShowcase(categories: MenuCategory[]): ShowcaseStep[] {
    const byId = new Map(categories.map((c) => [c.id, c]));

    return SHOWCASE_PICKS.flatMap(({ categoryId, dishTitle }) => {
        const category = byId.get(categoryId);
        if (!category || category.items.length === 0) return [];

        const item =
            category.items.find((i) => i.title === dishTitle) ??
            category.items.find((i) => i.badges?.includes('featured')) ??
            category.items[0];

        return [{
            categoryId: category.id,
            categoryName: category.name,
            dishTitle: item.title,
            imageSrc: item.imageSrc,
            description: item.description,
            badges: item.badges,
            portionNote: item.portionNote,
        }];
    });
}

export default function MenuPageClient({ categories }: { categories: MenuCategory[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [indexOpen, setIndexOpen] = useState(false);
    const [railVisible, setRailVisible] = useState(false);
    const [categoryCueVisible, setCategoryCueVisible] = useState(false);

    const showcase = useMemo(() => buildShowcase(categories), [categories]);
    const dishCount = useMemo(
        () => categories.reduce((sum, c) => sum + c.items.length, 0),
        [categories],
    );

    /* The index appears when the full category menu is reached.
     *
     * Measured on scroll rather than observed, for the same reason as the
     * category indicator below: an IntersectionObserver reports transitions it
     * witnesses, so a jump straight past the hero - an anchor click, a
     * `/menu#e-noodles` deep link, a restored scroll position - could leave
     * the index unmounted on a page it should be navigating. Reading the
     * layout's rect answers "is it behind us" from the current position
     * alone. */
    useEffect(() => {
        const measure = () => {
            const menu = document.querySelector('.menu-layout');
            if (!menu) return;
            const rect = menu.getBoundingClientRect();
            setRailVisible(rect.top <= window.innerHeight * 0.55 && rect.bottom > 0);
        };
        measure();
        window.addEventListener('scroll', measure, { passive: true });
        window.addEventListener('resize', measure);
        /* The preceding showcase holds media, so its height is not final until
           those images decode. */
        window.addEventListener('load', measure);
        return () => {
            window.removeEventListener('scroll', measure);
            window.removeEventListener('resize', measure);
            window.removeEventListener('load', measure);
        };
    }, []);

    const navRef = useRef<HTMLElement>(null);
    const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const indexListRef = useRef<HTMLOListElement>(null);
    const categoryCueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastAnnouncedIndex = useRef<number | null>(null);
    const layoutWasVisible = useRef(false);
    const lastIndexPointerType = useRef<string | null>(null);

    /* ⚠ THE CUE IS WHAT MAKES THE GLYPH LEGIBLE AS NAVIGATION.

       Four lines drawn quietly at the right edge are a mark, not a label, and
       a mark that has never done anything is furniture - the visitor has no
       reason to think it is the category index rather than a decoration. So
       on entering a category the name of that category appears beside it for
       a couple of seconds and then withdraws. The mark moves and names
       something; that is the whole lesson, and it teaches itself once per
       section change without ever needing to be clicked.

       This was cut for one round on the reasoning that the cue was redundant
       against the 40px category headings already on the page. The headings do
       say where you are - but they say nothing about what the mark at the
       right edge is FOR, which is the job the cue was actually doing. */
    const flashCategoryCue = useCallback(() => {
        if (categoryCueTimer.current) clearTimeout(categoryCueTimer.current);
        setCategoryCueVisible(true);
        categoryCueTimer.current = setTimeout(() => {
            setCategoryCueVisible(false);
            categoryCueTimer.current = null;
        }, 2200);
    }, []);

    useEffect(() => () => {
        if (categoryCueTimer.current) clearTimeout(categoryCueTimer.current);
    }, []);

    /* Which category is being read.
     *
     * Was fourteen IntersectionObservers with `rootMargin: -20% 0px -75% 0px`,
     * i.e. each section marked itself active on crossing a band 20-25% down
     * the viewport. On a continuous scroll that is fine. On a JUMP it is not:
     * the band is only ~45px tall at 900px, so an anchor click, a deep link
     * with a hash, or a restored scroll position lands past it without any
     * section ever crossing it, and the index keeps pointing at whatever was
     * active before - which for a first load means category one, forever.
     *
     * Measuring instead of observing removes the failure mode entirely: on
     * every scroll, take the last section whose top has passed the reading
     * line. It is correct after a jump because it does not depend on having
     * seen the journey, only on where we are now.
     */
    useEffect(() => {
        const measure = () => {
            /* A third down the viewport: high enough that the category you are
               reading has claimed the index before its heading leaves the top,
               low enough that it does not switch while the previous category's
               last row still fills the screen. */
            const line = window.innerHeight * 0.33;
            let current = 0;
            for (let i = 0; i < categories.length; i++) {
                const el = document.getElementById(categories[i].id);
                if (!el) continue;
                if (el.getBoundingClientRect().top <= line) current = i;
                else break;
            }

            /* Only inside the full menu. Above it the mark is not mounted, so
               a cue there would be a label with nothing to label; the two
               conditions are read from the same rect on the same frame so
               they cannot disagree. */
            const layout = document.querySelector<HTMLElement>('.menu-layout');
            const layoutRect = layout?.getBoundingClientRect();
            const inFullMenu = Boolean(
                layoutRect && layoutRect.top <= line && layoutRect.bottom > line,
            );

            if (
                inFullMenu &&
                (!layoutWasVisible.current || lastAnnouncedIndex.current !== current)
            ) {
                lastAnnouncedIndex.current = current;
                flashCategoryCue();
            }

            layoutWasVisible.current = inFullMenu;
            setActiveIndex(current);
        };

        measure();
        window.addEventListener('scroll', measure, { passive: true });
        window.addEventListener('resize', measure);
        window.addEventListener('load', measure);
        return () => {
            window.removeEventListener('scroll', measure);
            window.removeEventListener('resize', measure);
            window.removeEventListener('load', measure);
        };
    }, [categories, flashCategoryCue]);

    /* Escape closes, and so does a press anywhere outside. The second one is
       what makes the panel usable on touch, where there is no pointer to
       leave with. */
    useEffect(() => {
        if (!indexOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIndexOpen(false);
        };
        const onPointerDown = (e: PointerEvent) => {
            if (!navRef.current?.contains(e.target as Node)) setIndexOpen(false);
        };
        window.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [indexOpen]);

    /* Keep the selected row visible inside the five-row window. This scrolls
       only the window, never the page. */
    useEffect(() => {
        if (!indexOpen) return;
        const list = indexListRef.current;
        const active = navRefs.current[activeIndex];
        if (!list || !active) return;

        const frame = window.requestAnimationFrame(() => {
            list.scrollTo({
                top: Math.max(0, active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2),
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [activeIndex, indexOpen]);

    /* The landing offset is `.menu-category`'s own `scroll-margin-top`, so the
       header clearance is stated once in CSS rather than as a number here that
       drifts away from it. */
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (!el) return;
        setActiveIndex(index);
        setIndexOpen(false);
        flashCategoryCue();
        el.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
        });
    };

    return (
        <>
        {/* Menu hero.

            ROUND 9: it has a picture in it.

            The hero was a title, a lede and a dish count centred on plain
            white, with a draggable carousel underneath. Two client notes, and
            they are the same note twice: the hero "doesn't have any visuals",
            and the carousel "has a white space on the left, and it starts from
            the middle". The second is literally true and it is by design -
            `.dish-carousel-track` carried `padding-inline: 21.5%` so the first
            slide would centre with its neighbours peeking, which means the row
            opens with a fifth of the page empty on the left and the plate off
            the page's own axis. On a page whose next section is a full stage of
            dish photography, that row was doing a job that no longer needed
            doing at all.

            So: the wok footage, full-bleed, with the title over it. The
            carousel is gone (components/ui/dish-carousel.tsx deleted - the
            showcase below supersedes it) and with it the empty left margin.

            The footage is the Chapter II clip from the homepage, reused
            deliberately: it is the only moving asset that is ABOUT cooking
            rather than about a room, which is what a menu page's hero should
            open on. */}
        <section className="menu-hero">
            <BackgroundVideo
                src="/assets/video-web/theatre-craft.mp4"
                poster="/assets/posters/theatre-craft.webp"
                priority
                className="menu-hero-media"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
            />
            {/* A pool of shade behind the copy rather than a blanket wash over
                the frame - the same principle as the homepage hero's lighting,
                composed separately so the two are not identical. The footage
                is a bright orange sauce pour, so the copy needs real shade
                under it, not a tint. */}
            <div className="menu-hero-light" aria-hidden="true"></div>

            <div className="menu-hero-copy">
                <h1 className="menu-hero-title">A journey through fire.</h1>
                <p className="menu-hero-lede">
                    From fiery street-stall classics to whole-fish showpieces &mdash; every plate carries the char, spice and balance of Bangkok.
                </p>
                {/* "across 14 chapters" removed at the client's request. The
                    dish count is the part that sells; the category count read
                    as an index rather than an invitation. */}
                <p className="menu-hero-count">{dishCount} dishes</p>
            </div>
        </section>

        {/* The pinned showcase - five categories, one signature plate each.
            See components/ui/menu-showcase.tsx for how the pin works and, more
            importantly, why it is sticky rather than a wheel handler. */}
        {showcase.length > 0 && <MenuShowcase steps={showcase} />}

        {/* The full menu. The dishes get the whole measure - the category
            index rides the right edge over it rather than taking a column
            from it. */}
        <div className="menu-layout">


        {/* The category index. ONE control for every screen size: there were
            two - an in-grid sticky one above 1024px and a portalled fixed one
            below - with identical inner markup and two sets of refs, handlers
            and open state to keep in step. They have converged on the same
            design, so they are one component now.

            It stays here in the document, first inside the layout, so a
            screen reader and a tab sequence meet the table of contents before
            seventy-five dishes. It is sticky rather than fixed because fixed
            does not work inside `.page-transition` - see 08-menu.css. */}
        {railVisible && (
            <nav
                ref={navRef}
                className={`menu-index${indexOpen ? ' is-open' : ''}`}
                aria-label="Menu categories"
                /* Ask the pointer that actually entered the control, rather
                   than the browser's primary-input media query. On hybrid
                   laptops that query can report touch even while a mouse is
                   being used, which made this desktop control click-only. */
                onPointerEnter={(event) => {
                    if (event.pointerType !== 'touch') setIndexOpen(true);
                }}
                onPointerLeave={(event) => {
                    if (event.pointerType !== 'touch') setIndexOpen(false);
                }}
                onFocus={() => setIndexOpen(true)}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setIndexOpen(false);
                    }
                }}
            >
                <button
                    type="button"
                    className="menu-index-trigger"
                    aria-expanded={indexOpen}
                    aria-controls="menu-category-window"
                    aria-label={`Browse menu categories. Current section: ${categories[activeIndex]?.name ?? ''}`}
                    onPointerDown={(event) => {
                        lastIndexPointerType.current = event.pointerType;
                    }}
                    onClick={(event) => {
                        /* Mouse/pen already opened the panel on hover. Tap
                           remains the phone interaction; detail 0 preserves
                           keyboard and assistive-technology activation. */
                        if (lastIndexPointerType.current === 'touch' || event.detail === 0) {
                            setIndexOpen((open) => !open);
                        }
                    }}
                >
                    <span
                        className={`menu-index-current${categoryCueVisible ? ' is-visible' : ''}`}
                        aria-live="polite"
                    >
                        {categories[activeIndex]?.name}
                    </span>
                    {/* Four lines, the last one short: a list of things, not a
                        hamburger. Bare - the box it used to sit in is what the
                        client was seeing and did not want to. */}
                    <span className="menu-index-glyph" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                    </span>
                </button>

                <div
                    id="menu-category-window"
                    className="menu-index-window"
                    aria-hidden={!indexOpen}
                >
                    <ol className="menu-index-list" ref={indexListRef}>
                        {categories.map((category, index) => (
                            <li key={category.id}>
                                <a
                                    href={`#${category.id}`}
                                    ref={el => { navRefs.current[index] = el; }}
                                    onClick={(e) => handleClick(e, index, category.id)}
                                    className={`menu-index-link${activeIndex === index ? ' is-active' : ''}`}
                                    aria-current={activeIndex === index ? 'true' : undefined}
                                    tabIndex={indexOpen ? undefined : -1}
                                    title={category.name}
                                >
                                    <span className="menu-index-name">{category.name}</span>
                                    <span className="menu-index-count" aria-hidden="true">{category.items.length}</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>
            </nav>
        )}

        <div className="menu-sections">
            {categories.map((category) => (
                <section key={category.id} id={category.id} className="menu-category">
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
                                description={item.description}
                                badges={item.badges}
                                portionNote={item.portionNote}
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
                </section>
            ))}
        </div>
        </div>

        <section className="menu-legal">
            <div className="container">
                {/* The badge legend is back with the badges - a legend has to
                    explain something that is on the page, and as of this round
                    the marks are on the page again. */}
                <ul className="menu-legal-terms">
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
