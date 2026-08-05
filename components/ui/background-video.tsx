"use client";

import React, { useEffect, useRef, useState } from 'react';

export interface BackgroundVideoProps {
    src: string;
    style?: React.CSSProperties;
    className?: string;
    poster?: string;
    /**
     * Provide only when the footage conveys meaning. Omit for purely
     * decorative ambiance - the video is then hidden from assistive tech.
     */
    label?: string;
}

/**
 * Decorative, muted, looping background video that respects the user's
 * motion preferences. When `prefers-reduced-motion: reduce` is set, the
 * video does not autoplay and is held on its first frame (WCAG 2.2.2 / 2.3.3).
 */
export default function BackgroundVideo({ src, style, className, poster, label }: BackgroundVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (reducedMotion) {
            video.pause();
        } else {
            const playback = video.play();
            if (playback && typeof playback.catch === 'function') {
                playback.catch(() => { /* autoplay can be blocked; ignore */ });
            }
        }
    }, [reducedMotion]);

    return (
        <video
            ref={videoRef}
            autoPlay={!reducedMotion}
            loop
            muted
            playsInline
            poster={poster}
            aria-hidden={label ? undefined : true}
            aria-label={label}
            className={className}
            style={style}
        >
            <source src={src} type="video/mp4" />
        </video>
    );
}
