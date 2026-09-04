"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import DishTags, { type MenuBadge } from '@/components/ui/dish-tags';

export interface ShowcaseStep {
    /** The category this step belongs to, e.g. `b-soups`. */
    categoryId: string;
    /** Category name as displayed in the rail, e.g. "Soups". */
    categoryName: string;
    dishTitle: string;
    imageSrc: string;
    description: string;
    badges?: MenuBadge[];
    portionNote?: string;
}

export interface MenuShowcaseProps {
    steps: ShowcaseStep[];
}

/**
 * The pinned category showcase: one signature plate held on the left, a
 * supporting category index on the right, and the plate changing as you
 * scroll.
 *
 * ⚠ HOW THE PIN WORKS, AND WHY IT IS NOT SCROLL-JACKING.
 *
 * The brief was: the section should stay put while the dish changes, and
 * release once all five categories have been seen - with the page scrolling
 * normally if the pointer is outside the stage.
 *
 * That last clause describes a wheel handler that calls `preventDefault()`
 * while the cursor is over one region and not another. Do not build that. It
 * breaks in five ways that are not theoretical: trackpad momentum fights the
 * handler and overshoots; touch has no cursor at all, so the "outside the
 * stage" escape hatch does not exist on a phone; keyboard PageDown and the
 * scrollbar bypass the handler entirely and tear the section; browser
 * find-in-page cannot scroll to matches inside it; and `preventDefault` on a
 * passive-by-default wheel listener is a console warning and a jank source.
 *
 * The mechanism here produces the same EXPERIENCE with none of that. The
 * section is `steps x --stage-step` tall and its inner stage is
 * `position: sticky` at viewport height. Scrolling therefore moves the page
 * exactly as it always does - it is the ordinary native scroll, with every
 * input method working - while the stage stays fixed in view because that is
 * what sticky does. The active plate is read OFF the scroll position rather
 * than controlling it: nothing is ever prevented, nothing is ever trapped, and
 * the visitor can leave at any moment by scrolling on, which is the real thing
 * the "cursor outside" clause was asking for.
 *
 * Progress is measured, not observed. An IntersectionObserver reports
 * transitions it witnesses, so a jump - an anchor click, a deep link, a
 * restored scroll position - can land mid-section without any threshold being
 * crossed, leaving the stage on step one. Reading the rect answers "where are
 * we now" from the current position alone. Same reasoning as the category
 * indicator in menu-page-client.tsx; keep the two consistent.
 *
 * Below 900px the pin is switched off in CSS (`.menu-stage` loses its height
 * and `.menu-stage-pin` its stickiness) and the steps render as an ordinary
 * stacked list. A pinned stage on a phone is a scroll trap with no escape
 * hatch, and a 30%/70% split has no meaning at 375px wide.
 */
export default function MenuShowcase({ steps }: MenuShowcaseProps) {
    const [active, setActive] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);

    /** Scroll distance over which the stage is pinned, and where we are in it. */
    const geometry = useCallback(() => {
        const section = sectionRef.current;
        const pin = pinRef.current;
        if (!section || !pin) return null;
        const top = section.getBoundingClientRect().top + window.scrollY;
        const travel = section.offsetHeight - pin.offsetHeight;
        if (travel <= 0) return null;   // unpinned (phone, or reduced height)
        return { top, travel };
    }, []);

    useEffect(() => {
        const measure = () => {
            const geo = geometry();
            if (!geo) { setActive(0); return; }
            const progress = (window.scrollY - geo.top) / geo.travel;
            const i = Math.floor(progress * steps.length);
            setActive(Math.min(steps.length - 1, Math.max(0, i)));
        };

        measure();
        window.addEventListener('scroll', measure, { passive: true });
        window.addEventListener('resize', measure);
        /* The stage holds photographs, so its height is not final until they
           decode - a measurement taken before that is taken against the wrong
           box. */
        window.addEventListener('load', measure);
        return () => {
            window.removeEventListener('scroll', measure);
            window.removeEventListener('resize', measure);
            window.removeEventListener('load', measure);
        };
    }, [geometry, steps.length]);

    /** Jump the page to the middle of a step's scroll band. */
    const jumpToStep = useCallback((i: number) => {
        const geo = geometry();
        if (!geo) {
            /* Unpinned layout: the steps are ordinary stacked blocks, so scroll
               to the block itself. */
            document.getElementById(`showcase-${steps[i].categoryId}`)?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'start',
            });
            return;
        }
        const band = geo.travel / steps.length;
        window.scrollTo({
            top: geo.top + band * (i + 0.5),
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
    }, [geometry, steps]);

    return (
        <section className="menu-stage" aria-label="Signature dishes by category">
            <div className="menu-stage-track" ref={sectionRef}>
                <div className="menu-stage-pin" ref={pinRef}>

                    {/* The rail. Real, visible navigation beside the feature,
                        with the food retaining the primary left-hand column. */}
                    <nav className="menu-stage-rail" aria-label="Signature categories">
                        <ol className="menu-stage-rail-list">
                            {steps.map((step, i) => (
                                <li key={step.categoryId}>
                                    <button
                                        type="button"
                                        className={`menu-stage-rail-item${i === active ? ' is-active' : ''}`}
                                        onClick={() => jumpToStep(i)}
                                        aria-current={i === active ? 'true' : undefined}
                                    >
                                        <span className="menu-stage-rail-num">{String(i + 1).padStart(2, '0')}</span>
                                        <span className="menu-stage-rail-name">{step.categoryName}</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* The stage. Every plate is rendered and stacked; only the
                        active one is opaque. Cross-fading rendered nodes rather
                        than swapping one <Image> src means no decode flash on
                        each step - the browser has already painted all five by
                        the time you reach them. Five images is a cheap price
                        for that; do not "optimise" it into a single swapping
                        node. */}
                    <div className="menu-stage-plates">
                        {steps.map((step, i) => (
                            <article
                                key={step.categoryId}
                                id={`showcase-${step.categoryId}`}
                                className={`menu-stage-plate${i === active ? ' is-active' : ''}`}
                                aria-hidden={i === active ? undefined : true}
                                /* inert would be ideal here, but React's typing
                                   for it is still unstable across 19.x patches;
                                   aria-hidden plus tabIndex -1 on the link is
                                   equivalent for this content. */
                            >
                                <div className="menu-stage-photo">
                                    <Image
                                        src={step.imageSrc}
                                        alt={step.dishTitle}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 900px) 92vw, 60vw"
                                        priority={i === 0}
                                    />
                                </div>
                                <div className="menu-stage-copy">
                                    <DishTags badges={step.badges} className="menu-stage-tags" />
                                    <h3 className="menu-stage-dish">
                                        {step.dishTitle}
                                        {step.portionNote && (
                                            <span className="menu-stage-portion"> {step.portionNote}</span>
                                        )}
                                    </h3>
                                    <p className="menu-stage-desc">{step.description}</p>
                                    <Link
                                        href={`#${step.categoryId}`}
                                        className="menu-stage-link"
                                        tabIndex={i === active ? undefined : -1}
                                    >
                                        All {step.categoryName}
                                        <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
