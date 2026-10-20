"use client";

import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import { CmsButton, isOptimizable } from '@/components/cms/cms-ui';
import { renderInline } from '@/lib/cms/inline';
import { rootAttrs, type SectionProps } from './types';

export const BACKGROUND_CLASS = {
    blue: 'bg-blue-field',
    white: 'bg-warm-white',
    tint: 'cms-bg-tint',
} as const;

/**
 * CHAPTER II: THE FLAME - footage one side, copy the other.
 *
 * A 57/43 grid inside the page's own 1280 measure with a 3:2 frame; see
 * .craft-split / .craft-stage in 09-home-sections.css for why the earlier
 * full-bleed and breakout versions must not come back.
 *
 * On the blue field the copy is white exactly as originally built. On a light
 * background it takes the light-surface ink instead, so it stays readable.
 */
export default function CraftSection({ data, anchor, cmsId }: SectionProps<'craft'>) {
    const onBlue = data.background === 'blue';
    const headingColor = onBlue ? '#ffffff' : 'var(--color-primary)';
    const bodyColor = onBlue ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)';

    return (
        <section className={`craft-chapter ${BACKGROUND_CLASS[data.background]} overflow-hidden`} {...rootAttrs(anchor, cmsId)} style={{position: 'relative'}}>
            <div className="craft-inner">
                <div className="craft-split">
                    <div className="reveal-hidden craft-stage" style={data.video.src ? undefined : { position: 'relative' }}>
                        {data.video.src ? (
                            <BackgroundVideo
                                src={data.video.src}
                                poster={data.video.poster}
                                style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                            />
                        ) : data.image.src ? (
                            <Image
                                src={data.image.src}
                                alt={data.image.alt}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 900px) 92vw, 57vw"
                                unoptimized={!isOptimizable(data.image.src)}
                            />
                        ) : null}
                    </div>

                    <div className="craft-copy">
                        {data.heading && <h2 className="display-2" style={{marginBottom: '28px', fontSize: 'clamp(2rem, 3vw, 3rem)', lineHeight: 1.0, color: headingColor}}>{data.heading}</h2>}
                        {data.body && (
                            <p className="body-large" style={{color: bodyColor, lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '36px'}}>
                                {renderInline(data.body)}
                            </p>
                        )}
                        <CmsButton cta={data.button} />
                    </div>
                </div>
            </div>
        </section>
    );
}
