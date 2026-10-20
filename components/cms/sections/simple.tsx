"use client";

import BrushTransition from '@/components/ui/brush-transition';
import RoomGallery from '@/components/ui/room-gallery';
import FeatureDish from '@/components/ui/feature-dish';
import type { MenuBadge } from '@/components/ui/dish-tags';
import { CmsButton } from '@/components/cms/cms-ui';
import { renderInline } from '@/lib/cms/inline';
import { BACKGROUND_CLASS } from './craft';
import { rootAttrs, type SectionProps } from './types';

/** The seam between chapters is a mark, not a cut. */
export function BrushSection({ data, anchor, cmsId }: SectionProps<'brush'>) {
    return <BrushTransition color={data.color} attrs={rootAttrs(anchor, cmsId)} />;
}

/* The three section types below exist so the client can ADD sections, not
   just edit the original chapters. They are built from the same parts and
   classes as the chapters (display-2, the field backgrounds, RoomGallery,
   FeatureDish), so anything added sits in the site's own visual language. */

export function TextSection({ data, anchor, cmsId }: SectionProps<'text'>) {
    return (
        <section className={`cms-section ${BACKGROUND_CLASS[data.background]}`} {...rootAttrs(anchor, cmsId)}>
            <div className={`container cms-text reveal-hidden cms-text--${data.align}`}>
                {data.heading && <h2 className="display-2">{renderInline(data.heading)}</h2>}
                {data.body && <p className="cms-text-body">{renderInline(data.body)}</p>}
                {data.button.label && (
                    <div className="cms-text-actions">
                        <CmsButton cta={data.button} />
                    </div>
                )}
            </div>
        </section>
    );
}

export function GallerySection({ data, anchor, cmsId }: SectionProps<'gallery'>) {
    return (
        <section className={`cms-section heritage ${BACKGROUND_CLASS[data.background]}`} {...rootAttrs(anchor, cmsId)}>
            <div className="heritage-inner reveal-hidden">
                {data.heading && (
                    <div className="heritage-head">
                        <h2 className="heritage-quote">{renderInline(data.heading)}</h2>
                    </div>
                )}
                <RoomGallery shots={data.photos.map(p => ({ src: p.image.src, alt: p.image.alt }))} ariaLabel={data.label} />
            </div>
        </section>
    );
}

export function DishesSection({ data, anchor, cmsId }: SectionProps<'dishes'>) {
    return (
        <section className="cms-section heritage bg-orange-field" {...rootAttrs(anchor, cmsId)}>
            {data.heading && (
                <div className="signature-row-head">
                    <h2 className="display-2">{data.heading}</h2>
                </div>
            )}
            <FeatureDish
                linkLabel={data.linkLabel}
                dishes={data.dishes.map(d => ({ src: d.image.src, name: d.name, blurb: d.blurb, href: d.href, badges: d.badges as MenuBadge[] }))}
            />
        </section>
    );
}
