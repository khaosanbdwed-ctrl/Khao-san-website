"use client";

import React, { useEffect, useRef } from 'react';

export interface ScrollParallaxProps {
    children: React.ReactNode;
    /**
     * How much taller than its frame the image is rendered, as a percentage.
     * That excess height is the entire travel budget: the image moves through
     * it as the frame crosses the viewport and never runs out, so no edge is
     * ever exposed.
     *
     * The reference (kiintoronto.com) varies this per block - measured at 22,
     * 38, 45 and 47 on four consecutive bands. The variation is the point:
     * a uniform shift across every image reads as the whole page sliding,
     * while mixed rates read as depth. Vary it when placing several.
     */
    shift?: number;
    className?: string;
}

/**
 * A photographic frame whose image drifts against the scroll.
 *
 * The mechanism, lifted from the reference the client gave and verified in the
 * page rather than guessed: the frame is `overflow: hidden` at its natural
 * height, the image inside is rendered `shift`% TALLER than the frame, and
 * that excess is traversed by `translate3d` as the frame travels through the
 * viewport. Because the image always overhangs, there is no point in the
 * travel where a gap can appear - which is what separates this from the usual
 * `background-attachment: fixed` approximation.
 *
 * Progress is measured from the frame's own position, 0 as its top edge enters
 * at the bottom of the viewport and 1 as its bottom edge leaves at the top, so
 * the image is exactly centred when the frame is centred. Reads are done in a
 * rAF callback and the only write is a transform, so this stays off the layout
 * path entirely.
 *
 * Disabled outright under `prefers-reduced-motion` - the image simply sits
 * centred, cropped identically, and nothing else about the layout changes.
 */
export default function ScrollParallax({
    children,
    shift = 32,
    className = '',
}: ScrollParallaxProps) {
    const frameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const media = frame.firstElementChild as HTMLElement | null;
        if (!media) return;

        let ticking = false;
        let onScreen = false;

        const apply = () => {
            ticking = false;
            const rect = frame.getBoundingClientRect();
            const vh = window.innerHeight;
            // 0 when the frame's top edge is at the bottom of the viewport,
            // 1 when its bottom edge has passed the top.
            const span = vh + rect.height;
            const progress = span > 0 ? (vh - rect.top) / span : 0.5;
            const clamped = Math.min(1, Math.max(0, progress));
            // The image overhangs by `shift`% of the frame, half above and half
            // below, so travel runs from +excess/2 to -excess/2.
            const excess = (rect.height * shift) / 100;
            const y = (0.5 - clamped) * excess;
            media.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        };

        const request = () => {
            if (ticking || !onScreen) return;
            ticking = true;
            requestAnimationFrame(apply);
        };

        const io = new IntersectionObserver(
            ([entry]) => {
                onScreen = entry.isIntersecting;
                if (onScreen) request();
            },
            { rootMargin: '100px 0px' }
        );
        io.observe(frame);

        apply();
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        return () => {
            io.disconnect();
            window.removeEventListener('scroll', request);
            window.removeEventListener('resize', request);
        };
    }, [shift]);

    return (
        <div ref={frameRef} className={`parallax-frame ${className}`.trim()}>
            <div
                className="parallax-media"
                /* Height carries the shift so the CSS never has to know the
                   per-instance value, and `top` re-centres the overhang. */
                style={{ height: `${100 + shift}%`, top: `${-shift / 2}%` }}
            >
                {children}
            </div>
        </div>
    );
}
