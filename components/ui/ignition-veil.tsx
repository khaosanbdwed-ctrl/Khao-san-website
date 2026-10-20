"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { useContent } from '@/components/cms/content-context';
import { isOptimizable } from '@/components/cms/cms-ui';

/**
 * The opening ritual. On a visitor's first arrival at the homepage, the whole
 * page - header included - holds in near-darkness while a single ember
 * catches at the flagship's own mark and blooms outward, lighting the room
 * into view. Once per browser session; instantly skipped under reduced
 * motion or on any page but the homepage (see the inline script in
 * app/layout.tsx, which sets the `data-ignition` attribute before first
 * paint so this never flashes unstyled).
 *
 * This component renders identical markup regardless of state - only the
 * `data-ignition` attribute (set synchronously, pre-hydration) drives the
 * CSS. That keeps SSR/hydration mismatch-free; this effect's only job is to
 * mark the ritual as seen once the sequence finishes playing.
 */
export default function IgnitionVeil() {
    const { site } = useContent();
    useEffect(() => {
        if (document.documentElement.getAttribute('data-ignition') !== 'igniting') return;
        const timer = setTimeout(() => {
            sessionStorage.setItem('khaosan-ignited', '1');
            document.documentElement.setAttribute('data-ignition', 'lit');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="ignition-veil" aria-hidden="true">
            <div className="ignition-logo-container">
                {site.logo.src && (
                    <Image
                        src={site.logo.src}
                        width={180}
                        height={180}
                        alt={site.logo.alt || site.siteName}
                        className="ignition-logo-wipe"
                        priority
                        unoptimized={!isOptimizable(site.logo.src)}
                    />
                )}
            </div>
        </div>
    );
}
