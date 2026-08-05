"use client";

import React, { useEffect, useRef, useState } from 'react';

export interface BrushTransitionProps {
    color?: 'saffron' | 'terracotta';
}

/**
 * Marks a chapter boundary the way Khao San would mark it: not a cut, but a
 * stroke. Uses the brand's own (previously unused for this purpose)
 * hand-painted brush asset, swept once across the seam as the next chapter
 * nears the center of the viewport - like a line being laid down between
 * one scene and the next, not a section simply ending.
 *
 * Fires once per page view. Skipped entirely under reduced motion (this is
 * pure ornament; hiding it loses no information).
 */
export default function BrushTransition({ color = 'saffron' }: BrushTransitionProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [sweep, setSweep] = useState<{ top: number } | null>(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSweep({ top: entry.boundingClientRect.top });
                    observer.disconnect();
                }
            },
            { rootMargin: '-40% 0px -40% 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={sentinelRef} aria-hidden="true" style={{ position: 'relative', height: 0 }}>
            {sweep && (
                <div
                    className="brush-sweep"
                    style={{ position: 'fixed', top: sweep.top - 160, left: 0, width: '100%', height: '320px' }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element -- decorative, viewport-fixed, not part of document flow/LCP */}
                    <img src={`/assets/brush-strokes/${color}.png`} alt="" className="brush-sweep-img" />
                </div>
            )}
        </div>
    );
}
