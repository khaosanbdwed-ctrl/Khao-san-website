"use client";

import RoomGallery from '@/components/ui/room-gallery';
import FeatureDish from '@/components/ui/feature-dish';
import type { MenuBadge } from '@/components/ui/dish-tags';
import { CmsButton } from '@/components/cms/cms-ui';
import { renderInline } from '@/lib/cms/inline';
import { rootAttrs, type SectionProps } from './types';

/**
 * CHAPTERS III + IV: THE STORY and THE EXHIBITION.
 *
 * ⚠ ONE <section>, NOT TWO, AND IT MUST STAY ONE. Two adjacent sections each
 * paint their own copy of the background art at `background-size: cover`, so
 * the art restarts at the join and draws a visible line across the page.
 * That is why the gallery and the signature dishes are parts of one section
 * type here rather than two section types.
 */
export default function HeritageSection({ data, anchor, cmsId }: SectionProps<'heritage'>) {
    return (
        <section className="heritage bg-orange-field" {...rootAttrs(anchor, cmsId)}>
            <div className="heritage-inner reveal-hidden">
                {data.quote && (
                    <div className="heritage-head">
                        <blockquote className="heritage-quote">
                            {renderInline(data.quote)}
                        </blockquote>
                    </div>
                )}

                {data.showGallery && (
                    <RoomGallery
                        shots={data.gallery.map(g => ({ src: g.image.src, alt: g.image.alt }))}
                        ariaLabel={data.galleryLabel}
                    />
                )}

                {data.button.label && (
                    <div className="heritage-note">
                        <CmsButton cta={data.button} />
                    </div>
                )}
            </div>

            {data.showDishes && (
                <>
                    {data.dishesHeading && (
                        <div className="signature-row-head">
                            <h2 className="display-2">{data.dishesHeading}</h2>
                        </div>
                    )}
                    <FeatureDish
                        linkLabel={data.dishLinkLabel}
                        dishes={data.dishes.map(d => ({
                            src: d.image.src,
                            name: d.name,
                            blurb: d.blurb,
                            href: d.href,
                            badges: d.badges as MenuBadge[],
                        }))}
                    />
                </>
            )}
        </section>
    );
}
