"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import { isOptimizable } from '@/lib/media';
import type { WallCard } from '@/lib/cms/docs/home';

/**
 * The homepage room wall: a masonry of rounded cards in three columns (two on
 * tablets and phones). A card with a video plays it muted on a loop; a photo
 * card cross-fades through its photos on its own clock.
 *
 * - Cards flow down the columns in order (CSS `columns`), so the CMS order
 *   decides which column a card lands in.
 * - Each photo card starts its clock at a different offset, so the wall never
 *   changes all at once.
 * - Nothing changes while the wall is off screen, and with
 *   `prefers-reduced-motion` the first photo simply stays (the video is held
 *   on its poster by BackgroundVideo).
 *
 * LOADING (2026-11-27, client: "it loads slow"). The files are small; the
 * order was the problem.
 * - Only each card's FIRST photo is in the page at first. The rest join once
 *   that one has arrived and the card is near the screen, so they never
 *   compete with the photo the visitor is waiting to see.
 * - A photo fades in when it has loaded instead of painting in line by line,
 *   over a soft tinted ground, so an empty card reads as "arriving".
 * - A card only moves on to a photo that has finished loading - a fade into
 *   a half-downloaded image was the stutter.
 * - Videos start fetching well before they scroll in, and pause when they
 *   leave the screen so two clips are not decoding behind the rest of the page.
 */
const INTERVAL_MS = 4500;
const STAGGER_MS = 1100;
/** How far ahead of the screen a card starts fetching its other photos. */
const PREFETCH_MARGIN = '600px';

function useReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    return reduced;
}

/** [near: within PREFETCH_MARGIN of the screen, visible: actually on screen] */
function useNearAndVisible(ref: React.RefObject<HTMLElement | null>) {
    const [near, setNear] = useState(false);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            const t = setTimeout(() => { setNear(true); setVisible(true); }, 0);
            return () => clearTimeout(t);
        }
        const nearIo = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); nearIo.disconnect(); } }, { rootMargin: PREFETCH_MARGIN });
        const visibleIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
        nearIo.observe(el);
        visibleIo.observe(el);
        return () => { nearIo.disconnect(); visibleIo.disconnect(); };
    }, [ref]);
    return [near, visible] as const;
}

/** How long a card waits for its first photo before it also asks for the rest
 *  and shows whichever arrives first. */
const FIRST_PHOTO_PATIENCE_MS = 2500;

function PhotoCard({ card, order }: { card: WallCard; order: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const [near, visible] = useNearAndVisible(ref);
    const [active, setActive] = useState(0);
    const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
    /* Photos the resizer failed on, now asked for as the original file. */
    const [raw, setRaw] = useState<ReadonlySet<number>>(() => new Set());
    /* Photos that failed even as the original: skipped. */
    const [failed, setFailed] = useState<ReadonlySet<number>>(() => new Set());
    const [impatient, setImpatient] = useState(false);
    const loadedRef = useRef(loaded);
    useEffect(() => { loadedRef.current = loaded; }, [loaded]);
    const count = card.photos.length;

    /* RESILIENCE (2026-11-27, client: a card sat empty "for too long"). A card
       used to wait on its first photo forever - one broken, refused or very
       large file left it blank with only its dots showing. Now:
       - a photo the image resizer fails on is retried as the original file;
       - a photo that still fails is skipped;
       - after FIRST_PHOTO_PATIENCE_MS the card also asks for its other
         photos and shows whichever arrives first. */
    useEffect(() => {
        if (!near || loaded.has(0)) return;
        const t = setTimeout(() => setImpatient(true), FIRST_PHOTO_PATIENCE_MS);
        return () => clearTimeout(t);
    }, [near, loaded]);

    const firstSettled = loaded.has(0) || failed.has(0) || impatient;
    // The rest of the photos join once the first has arrived (or given up)
    // and the card is near the screen. With reduced motion they are only
    // fetched as stand-ins for a first photo that did not arrive.
    const armed = near && firstSettled && (!reduced || !loaded.has(0));
    // Showing nothing while another photo of this card is ready: show that
    // one instead (worked out here, not stored, so no extra render).
    const standIn = !loaded.has(active) && loaded.size > 0 && (active !== 0 || failed.has(0) || impatient);
    const current = standIn ? Math.min(...loaded) : active;
    const shown = loaded.has(current);
    const playing = visible && armed && !reduced && count > 1;

    const markLoaded = useCallback((i: number) => {
        setLoaded(prev => (prev.has(i) ? prev : new Set(prev).add(i)));
    }, []);
    const markError = useCallback((i: number, optimised: boolean) => {
        if (optimised) setRaw(prev => new Set(prev).add(i));
        else setFailed(prev => new Set(prev).add(i));
    }, []);

    useEffect(() => {
        if (!playing) return;
        // Move on only to a photo that has finished loading; otherwise try
        // again on the next tick rather than fading into a blank frame.
        const step = () => setActive(prev => {
            const a = loadedRef.current.has(prev) || loadedRef.current.size === 0 ? prev : Math.min(...loadedRef.current);
            for (let k = 1; k <= count; k++) {
                const next = (a + k) % count;
                if (loadedRef.current.has(next)) return next;
            }
            return a;
        });
        let interval: ReturnType<typeof setInterval> | undefined;
        const start = setTimeout(() => {
            step();
            interval = setInterval(step, INTERVAL_MS);
        }, INTERVAL_MS / 2 + order * STAGGER_MS);
        return () => {
            clearTimeout(start);
            if (interval) clearInterval(interval);
        };
    }, [playing, count, order]);

    const live = card.photos.map((_, i) => i).filter(i => !failed.has(i));

    return (
        <div ref={ref} className={`room-wall__media${shown ? ' is-ready' : ''}`}>
            {card.photos.map((photo, i) => {
                if ((i > 0 && !armed) || failed.has(i)) return null;
                const isActive = i === current;
                const optimised = isOptimizable(photo.src) && !raw.has(i);
                return (
                    <Image
                        key={`${photo.src}-${i}-${optimised ? 'o' : 'r'}`}
                        src={photo.src}
                        alt={isActive ? photo.alt : ''}
                        aria-hidden={isActive ? undefined : true}
                        fill
                        sizes="(max-width: 1100px) 48vw, 30vw"
                        loading={i === 0 ? 'lazy' : 'eager'}
                        onLoad={() => markLoaded(i)}
                        onError={() => markError(i, optimised)}
                        className={`room-wall__photo${isActive ? ' is-active' : ''}${loaded.has(i) ? ' is-loaded' : ''}`}
                        unoptimized={!optimised}
                    />
                );
            })}
            {live.length > 1 && (
                <div className="room-wall__dots" aria-hidden="true">
                    {live.map(i => (
                        <span key={`${card.photos[i].src}-dot-${i}`} className={i === current ? 'is-active' : undefined} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RoomWall({ cards, ariaLabel }: { cards: WallCard[]; ariaLabel?: string }) {
    let photoOrder = 0;
    return (
        <div className="room-wall" role="group" aria-label={ariaLabel}>
            {cards.map((card, i) => (
                <div key={i} className={`room-wall__card room-wall__card--${card.shape}${card.video ? ' room-wall__card--video' : ''}`}>
                    {card.video ? (
                        <div className="room-wall__media is-ready">
                            <BackgroundVideo
                                src={card.video}
                                poster={card.poster || undefined}
                                className="room-wall__video"
                                prefetchMargin={PREFETCH_MARGIN}
                                pauseOffscreen
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    ) : (
                        <PhotoCard card={card} order={photoOrder++} />
                    )}
                </div>
            ))}
        </div>
    );
}
