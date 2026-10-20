"use client";

import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import { CmsButton, isOptimizable } from '@/components/cms/cms-ui';
import { rootAttrs, type SectionProps } from './types';

/**
 * CHAPTER VII: THE INVITATION - the closing bookend. With the brush lettering
 * on, the site opens ("The Thai Way") and closes in the brand's own hand.
 * hero-text-shadow: this copy sits directly on bright footage, the case that
 * class exists for (see .section-reservation in the stylesheet).
 */
export default function InvitationSection({ data, anchor, cmsId }: SectionProps<'invitation'>) {
    return (
        <section className="section-reservation" {...rootAttrs(anchor, cmsId)}>
            {data.background.src && (
                <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0}}>
                    <Image src={data.background.src} alt="" fill className="img-feather" style={{objectFit: 'cover'}} unoptimized={!isOptimizable(data.background.src)} />
                </div>
            )}
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(30, 41, 59, 0.8)', zIndex: 1}}></div>

            {(data.video.src || data.video.poster) && (
                <BackgroundVideo
                    src={data.video.src}
                    poster={data.video.poster}
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, opacity: 0.75}}
                />
            )}
            <div className="invitation-light" aria-hidden="true"></div>

            <div className="container reveal-hidden" style={{position: 'relative', zIndex: 2, maxWidth: '700px', textAlign: 'center'}}>
                {data.heading && (
                    <h2 className={`display-2 ${data.brushFont ? 'display-brush ' : ''}hero-text-shadow`} style={{marginBottom: '44px'}}>{data.heading}</h2>
                )}
                <CmsButton cta={data.button} />
            </div>
        </section>
    );
}
