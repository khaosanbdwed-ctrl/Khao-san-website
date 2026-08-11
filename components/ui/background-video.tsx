"use client";

import React, { useEffect, useRef, useState } from 'react';

export interface BackgroundVideoProps {
    src: string;
    style?: React.CSSProperties;
    className?: string;
    poster?: string;
    /**
     * Set on the one video that is above the fold. Everything else waits until
     * it is nearly on screen before it fetches anything.
     */
    priority?: boolean;
    /**
     * Provide only when the footage conveys meaning. Omit for purely
     * decorative ambiance - the video is then hidden from assistive tech.
     */
    label?: string;
}

/**
 * Decorative, muted, looping background video that respects the user's
 * motion preferences. When `prefers-reduced-motion: reduce` is set, the
 * video does not autoplay and is held on its poster frame (WCAG 2.2.2 / 2.3.3).
 *
 * Loading behaviour: all three of these clips used to begin downloading on
 * page load, which put ~4.8 MB of video in front of the first paint before the
 * visitor had scrolled anywhere near two of them. Now only the hero clip is
 * fetched eagerly; the rest mount their <source> only once an
 * IntersectionObserver says they are within 300px of the viewport. Until then
 * the element renders its poster, so the section never looks empty.
 */
export default function BackgroundVideo({
    src, style, className, poster, priority = false, label,
}: BackgroundVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(priority);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (shouldLoad) return;
        const el = videoRef.current;
        if (!el) return;

        // No IntersectionObserver (very old browser): load rather than never
        // showing the footage at all. Deferred by a tick so this is not a
        // synchronous setState inside an effect.
        if (typeof IntersectionObserver === 'undefined') {
            const t = setTimeout(() => setShouldLoad(true), 0);
            return () => clearTimeout(t);
        }

        let io: IntersectionObserver | undefined;

        // The 300px prefetch margin is generous on purpose - it means the clip
        // is decoded and ready before the reader arrives, with no poster-to-
        // video pop. But Chapter II sits close enough to the fold that the
        // margin caught it immediately, so a ~0.9 MB video was competing with
        // the hero for bandwidth during first paint.
        //
        // Waiting for `load` keeps the generous margin and still gives the
        // hero the whole initial budget: below-fold footage now streams in
        // during idle time after the page is interactive.
        const arm = () => {
            io = new IntersectionObserver(
                (entries) => {
                    if (entries.some(e => e.isIntersecting)) {
                        setShouldLoad(true);
                        io?.disconnect();
                    }
                },
                { rootMargin: '300px' },
            );
            io.observe(el);
        };

        // Hydration usually happens after `load`, so keying off readyState
        // armed instantly and changed nothing. requestIdleCallback is the
        // signal that actually holds: the observer is only created once the
        // browser has finished the urgent work, by which point the hero has
        // had the network to itself. The timeout is the backstop for a page
        // that never goes idle.
        // Safari only shipped requestIdleCallback in 18.4, so the timeout
        // fallback is a live path, not defensive padding. ('in window' rather
        // than a truthiness check because the DOM lib types it non-optional.)
        const hasIdle = 'requestIdleCallback' in window;
        const handle = hasIdle
            ? window.requestIdleCallback(arm, { timeout: 2500 })
            : window.setTimeout(arm, 1200);

        return () => {
            if (hasIdle) window.cancelIdleCallback(handle);
            else window.clearTimeout(handle);
            io?.disconnect();
        };
    }, [shouldLoad]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldLoad) return;
        if (reducedMotion) {
            video.pause();
            return;
        }
        // The <source> is added after mount, so the element needs to be told to
        // pick it up before play() has anything to play.
        video.load();
        const playback = video.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(() => { /* autoplay can be blocked; ignore */ });
        }
    }, [reducedMotion, shouldLoad]);

    return (
        <video
            ref={videoRef}
            autoPlay={!reducedMotion}
            loop
            muted
            playsInline
            poster={poster}
            preload={priority ? 'auto' : 'none'}
            aria-hidden={label ? undefined : true}
            aria-label={label}
            className={className}
            style={style}
        >
            {shouldLoad && !reducedMotion && <source src={src} type="video/mp4" />}
        </video>
    );
}
