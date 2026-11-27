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

function PhotoCard({ card, order }: { card: WallCard; order: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const [near, visible] = useNearAndVisible(ref);
    const [active, setActive] = useState(0);
    const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
    const loadedRef = useRef(loaded);
    useEffect(() => { loadedRef.current = loaded; }, [loaded]);
    const count = card.photos.length;
    // The rest of the photos join once the first has arrived and the card is
    // near the screen (never with reduced motion - they would never be shown).
    const armed = near && loaded.has(0) && !reduced;
    const playing = visible && armed && count > 1;

    const markLoaded = useCallback((i: number) => {
        setLoaded(prev => (prev.has(i) ? prev : new Set(prev).add(i)));
    }, []);

    useEffect(() => {
        if (!playing) return;
        // Move on only to a photo that has finished loading; otherwise try
        // again on the next tick rather than fading into a blank frame.
        const step = () => setActive(a => {
            const next = (a + 1) % count;
            return loadedRef.current.has(next) ? next : a;
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

    return (
        <div ref={ref} className={`room-wall__media${loaded.has(0) ? ' is-ready' : ''}`}>
            {card.photos.map((photo, i) => {
                if (i > 0 && !armed) return null;
                const isActive = i === active;
                return (
                    <Image
                        key={`${photo.src}-${i}`}
                        src={photo.src}
                        alt={isActive ? photo.alt : ''}
                        aria-hidden={isActive ? undefined : true}
                        fill
                        sizes="(max-width: 1100px) 48vw, 30vw"
                        loading={i === 0 ? 'lazy' : 'eager'}
                        onLoad={() => markLoaded(i)}
                        className={`room-wall__photo${isActive ? ' is-active' : ''}${loaded.has(i) ? ' is-loaded' : ''}`}
                        unoptimized={!isOptimizable(photo.src)}
                    />
                );
            })}
            {count > 1 && (
                <div className="room-wall__dots" aria-hidden="true">
                    {card.photos.map((photo, i) => (
                        <span key={`${photo.src}-dot-${i}`} className={i === active ? 'is-active' : undefined} />
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
