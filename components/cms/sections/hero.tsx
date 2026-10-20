"use client";

import ReactDOM from 'react-dom';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import { CmsButton } from '@/components/cms/cms-ui';
import { rootAttrs, type SectionProps } from './types';

/**
 * CHAPTER I: THE THRESHOLD.
 *
 * Markup is the original homepage hero, unchanged; only the literals moved
 * into the CMS. Notes from the original that still govern it:
 *
 * - The poster is the LCP element, so it is preloaded at high priority -
 *   browsers give a <video poster> no loading priority of their own.
 * - ⚠ NOTHING SEPARATES THIS COPY FROM THE FOOTAGE, BY CLIENT REQUEST: no text
 *   shadow, no shade. If contrast ever has to be won back, bias the video's
 *   window with `object-position` before reaching for either.
 * - The logo is `unoptimized` because the image pipeline strips its alpha
 *   channel, which defeats the white knock-out filter and makes it vanish.
 */
export default function HeroSection({ data, anchor, cmsId }: SectionProps<'hero'>) {
    if (data.video.poster) {
        ReactDOM.preload(data.video.poster, { as: 'image', fetchPriority: 'high' });
    }

    return (
        <section className="hero" {...rootAttrs(anchor, cmsId)} style={{position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--color-surface-base)'}}>
            {(data.video.src || data.video.poster) && (
                <BackgroundVideo
                    src={data.video.src}
                    poster={data.video.poster}
                    priority
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0}}
                    className="hero-ken-burns"
                />
            )}
            <div className="hero-copy" style={{position: 'relative', zIndex: 2}}>
                <div className="hero-lockup ignition-reveal ignition-reveal-1">
                    {data.logo.src && (
                        <Image
                            src={data.logo.src}
                            alt={data.logo.alt}
                            width={232}
                            height={196}
                            priority
                            unoptimized
                            className="hero-mark"
                        />
                    )}
                    <div className="hero-lockup-text">
                        {data.eyebrow && <span className="hero-eyebrow">{data.eyebrow}</span>}
                        {data.title && <h1 className="hero-title">{data.title}</h1>}
                    </div>
                </div>
                <div className="hero-actions ignition-reveal ignition-reveal-2">
                    <CmsButton cta={data.primary} />
                    <CmsButton cta={data.secondary} />
                </div>
            </div>
        </section>
    );
}
