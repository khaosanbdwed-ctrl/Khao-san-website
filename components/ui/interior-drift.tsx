"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

export interface InteriorShot {
    src: string;
    alt: string;
    /** Outlet the room belongs to. Rendered as the plate's caption. */
    location: string;
    /** CSS aspect-ratio, e.g. '4 / 5'. Mixed ratios are what make the drift read. */
    ratio: string;
}

export interface InteriorDriftProps {
    shots: InteriorShot[];
    /** Number of drifting columns at desktop width. */
    columns?: number;
    /**
     * Minimum plates per column. When there are fewer shots than this, the
     * list is cycled to fill - see `dealt`.
     */
    minPerColumn?: number;
}

/**
 * The interior gallery: columns of room photography drifting slowly upward
 * inside a feathered frame.
 *
 * Why columns that translate rather than a scroll container: the obvious build
 * for "a Pinterest grid that scrolls vertically in a box" is an
 * `overflow-y: auto` element, and that is a vertical scroll container nested
 * inside a vertically scrolling page. The wheel gets captured, mobile touch
 * becomes ambiguous, and the visitor ends up fighting it. Translating the
 * columns keeps the look and removes the conflict - there is no scrollable
 * region here at all, so the page scroll is never intercepted.
 *
 * Motion rules this component has to satisfy:
 *  - `prefers-reduced-motion: reduce` turns the drift off entirely and renders
 *    the static masonry instead. Not slowed down - off.
 *  - WCAG 2.2.2: motion that runs longer than 5s needs a mechanism to pause it.
 *    Hover-pause alone does not satisfy that for keyboard users, so there is a
 *    real button as well as pause on hover and on focus-within.
 *  - The loop stops when the section is off screen (IntersectionObserver), so
 *    it is not burning CPU on a page the visitor has scrolled past.
 */
export default function InteriorDrift({
    shots,
    columns = 3,
    minPerColumn = 3,
}: InteriorDriftProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [onScreen, setOnScreen] = useState(false);
    const [paused, setPaused] = useState(false);
    /* Phones get a different composition entirely - see the strip branch in
       the render. Starts false so the first client render matches the server
       and hydration is clean; the effect switches it after mount. */
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(max-width: 640px)');
        const update = () => setIsPhone(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const el = frameRef.current;
        if (!el) return;
        // No IntersectionObserver (very old browser): run the drift rather
        // than leave it frozen forever. Deferred by a tick so this is not a
        // synchronous setState inside an effect - same pattern as
        // BackgroundVideo's own fallback.
        if (typeof IntersectionObserver === 'undefined') {
            const t = setTimeout(() => setOnScreen(true), 0);
            return () => clearTimeout(t);
        }
        const io = new IntersectionObserver(
            ([entry]) => setOnScreen(entry.isIntersecting),
            { rootMargin: '200px 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
        // isPhone swaps the framed element for a different one, so the
        // observer has to be re-pointed at the new node.
    }, [isPhone]);

    const animate = !reducedMotion && onScreen && !paused;

    /* Fill each column by walking the list with a per-column phase offset.
     *
     * With plenty of photography this is just a round-robin deal, which keeps
     * orientations mixed instead of every portrait landing in one column.
     *
     * The offset is what makes a SHORT list work. Khao San's interior shoot has
     * not been delivered yet, so today there are three images. A plain deal
     * would give each column a single plate, and duplicating it for the loop
     * would show the same photograph twice in one column - obviously repeated.
     * Starting column i at index i instead means each column runs the full set
     * in a different order (col 0: a b c, col 1: b c a, col 2: c a b), so the
     * wall reads as varied at three images and as a straight deal at thirty.
     */
    const dealt = useMemo(() => {
        const n = shots.length;
        if (n === 0) return [];

        if (n >= columns * minPerColumn) {
            // Enough photography: straight round-robin, every shot used once.
            const cols: InteriorShot[][] = Array.from({ length: columns }, () => []);
            shots.forEach((shot, i) => cols[i % columns].push(shot));
            return cols;
        }

        // Short list: cycle with a phase offset of one per column. Stride has
        // to be 1 here, not `columns` - with 3 shots across 3 columns a stride
        // of 3 lands on the same index every row and each column becomes one
        // photograph repeated.
        return Array.from({ length: columns }, (_, col) =>
            Array.from({ length: minPerColumn }, (_, row) => shots[(col + row) % n])
        );
    }, [shots, columns, minPerColumn]);

    const togglePause = useCallback(() => setPaused(p => !p), []);

    if (shots.length === 0) return null;

    /* PHONE: a horizontal filmstrip, not the column grid.
     *
     * The vertical composition does not survive a narrow viewport. Three
     * columns collapse to one, the frame has to be short to fit a phone
     * screen, and what is left is a single tall image creeping through a
     * letterbox slot - it reads as a broken carousel rather than a gallery.
     *
     * Sideways is the right axis here for a second reason: horizontal motion
     * is orthogonal to the page scroll, so on a touch screen it can never
     * compete with the thumb. Plates share one height and take their width
     * from their own ratio, so the strip stays a clean band while the mix of
     * portrait and landscape still varies the rhythm.
     */
    if (isPhone) {
        const strip = dealt.flat();
        return (
            <div className="interior-drift-wrap">
                <div ref={frameRef} className="interior-strip">
                    <div
                        className="interior-strip-track"
                        style={{
                            animationDuration: `${Math.max(30, strip.length * 5)}s`,
                            animationPlayState: animate ? 'running' : 'paused',
                        }}
                    >
                        {[0, 1].map((copy) => (
                            <React.Fragment key={copy}>
                                {strip.map((shot, i) => (
                                    <Plate
                                        key={`${copy}-${i}-${shot.src}`}
                                        shot={shot}
                                        priority={false}
                                        ariaHidden={copy === 1}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                {!reducedMotion && (
                    <button
                        type="button"
                        className="interior-drift-toggle"
                        onClick={togglePause}
                        aria-pressed={paused}
                    >
                        {paused ? 'Resume gallery' : 'Pause gallery'}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="interior-drift-wrap">
            <div
                ref={frameRef}
                className="interior-drift"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {dealt.map((col, i) => (
                    <div className="interior-drift-col" key={i}>
                        {/* The track is rendered twice. The animation travels
                            exactly -50%, so the second copy is in the first
                            copy's starting position when the cycle restarts and
                            the loop has no visible seam. */}
                        <div
                            className="interior-drift-track"
                            style={{
                                // Alternating direction and staggered speed per
                                // column: identical speed in one direction reads
                                // as one sliding sheet rather than a wall of
                                // separate photographs.
                                animationDuration: `${52 + i * 11}s`,
                                animationDirection: i % 2 === 1 ? 'reverse' : 'normal',
                                animationPlayState: animate ? 'running' : 'paused',
                            }}
                        >
                            {[0, 1].map((copy) => (
                                <React.Fragment key={copy}>
                                    {col.map((shot, row) => (
                                        // Index-based key: a short list repeats
                                        // the same src within a column, so src
                                        // is not unique.
                                        <Plate
                                            key={`${copy}-${row}-${shot.src}`}
                                            shot={shot}
                                            priority={false}
                                            /* The duplicate is the same photo
                                               twice on one page; hide the copy
                                               so a screen reader reads the
                                               gallery once. */
                                            ariaHidden={copy === 1}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* WCAG 2.2.2. Rendered only when the drift is actually running -
                with the static fallback there is no motion to pause. */}
            {!reducedMotion && (
                <button
                    type="button"
                    className="interior-drift-toggle"
                    onClick={togglePause}
                    aria-pressed={paused}
                >
                    {paused ? 'Resume gallery' : 'Pause gallery'}
                </button>
            )}
        </div>
    );
}

function Plate({
    shot,
    priority,
    ariaHidden = false,
}: {
    shot: InteriorShot;
    priority: boolean;
    ariaHidden?: boolean;
}) {
    return (
        <figure className="hg interior-plate" aria-hidden={ariaHidden || undefined}>
            <div className="hg-card" style={{ aspectRatio: shot.ratio }}>
                <Image
                    src={shot.src}
                    alt={ariaHidden ? '' : shot.alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 560px) 90vw, (max-width: 900px) 46vw, 31vw"
                    priority={priority}
                />
                <div className="hg-scrim" aria-hidden="true"></div>
                <figcaption className="hg-cap">{shot.location}</figcaption>
            </div>
        </figure>
    );
}
