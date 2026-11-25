"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import { isOptimizable } from '@/lib/media';
import type { WallCard } from '@/lib/cms/docs/home';

/**
 * The homepage room wall: a masonry of rounded cards in three columns (two on
 * tablets, one on phones). A card with a video plays it muted on a loop; a
 * photo card cross-fades through its photos on its own clock.
 *
 * - Cards flow down the columns in order (CSS `columns`), so the CMS order
 *   decides which column a card lands in.
 * - Each photo card starts its clock at a different offset, so the wall never
 *   changes all at once.
 * - Nothing changes while the wall is off screen, and with
 *   `prefers-reduced-motion` the first photo simply stays (the video is held
 *   on its poster by BackgroundVideo).
 */
const INTERVAL_MS = 4500;
const STAGGER_MS = 1100;

function usePlayable(ref: React.RefObject<HTMLElement | null>) {
    const [inView, setInView] = useState(false);
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
        io.observe(el);
        return () => io.disconnect();
    }, [ref]);
    return inView && !reduced;
}

function PhotoCard({ card, order }: { card: WallCard; order: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const playing = usePlayable(ref);
    const [active, setActive] = useState(0);
    const count = card.photos.length;

    useEffect(() => {
        if (!playing || count < 2) return;
        let interval: ReturnType<typeof setInterval> | undefined;
        const start = setTimeout(() => {
            setActive(a => (a + 1) % count);
            interval = setInterval(() => setActive(a => (a + 1) % count), INTERVAL_MS);
        }, INTERVAL_MS / 2 + order * STAGGER_MS);
        return () => {
            clearTimeout(start);
            if (interval) clearInterval(interval);
        };
    }, [playing, count, order]);

    return (
        <div ref={ref} className="room-wall__media">
            {card.photos.map((photo, i) => (
                <Image
                    key={`${photo.src}-${i}`}
                    src={photo.src}
                    alt={i === active ? photo.alt : ''}
                    aria-hidden={i === active ? undefined : true}
                    fill
                    sizes="(max-width: 1100px) 48vw, 30vw"
                    className={`room-wall__photo${i === active ? ' is-active' : ''}`}
                    unoptimized={!isOptimizable(photo.src)}
                />
            ))}
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
                        <div className="room-wall__media">
                            <BackgroundVideo
                                src={card.video}
                                poster={card.poster || undefined}
                                className="room-wall__video"
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
