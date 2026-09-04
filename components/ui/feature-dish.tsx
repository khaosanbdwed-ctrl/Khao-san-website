import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import DishTags, { type MenuBadge } from '@/components/ui/dish-tags';

export interface FeatureDishItem {
    src: string;
    name: string;
    blurb: string;
    href: string;
    /** Marks from the shared vocabulary - see components/ui/dish-tags.tsx. */
    badges?: MenuBadge[];
}

export interface FeatureDishProps {
    dishes: FeatureDishItem[];
}

/**
 * The homepage's dish chapter: alternating split rows, ruled like a page.
 *
 * Modelled on the client's reference (lotusofsiamlv.com): each row is two
 * equal boxes separated and bracketed by hairline rules, one holding a
 * photograph and the other the copy, with alternate rows swapping sides. No
 * card, no shadow, no fill, no button.
 *
 * ⚠ Two things were copied from the reference that did not survive looking at
 * the result:
 *
 *  - **Centred copy.** The reference centres it, and in the reference it
 *    works because the type is large and the box is tight around it. Here the
 *    copy sat as a small centred island in a 520px-tall box with ~150px of
 *    dead space above and below - the client's note was exactly this, that
 *    middle alignment "doesn't look good". It is left-aligned now, on the
 *    same axis as the photograph's edge, so the two halves of the row share
 *    one line instead of floating independently.
 *  - **The ornament.** Three lotus glyphs at 13px rendered as illegible
 *    smudges - dirt on the screen, not ornament. Replaced by a numeral, which
 *    is legible at any size and does the same job of separating the name from
 *    the prose without drawing a rule.
 *
 * The rules are the only structure in it, which is why they are the one thing
 * this page is allowed to draw as a straight line: they are a frame around
 * content, running with the reading direction, not a divider stacked between
 * two sections. The client's "no straight lines" note was about section seams,
 * and this is the opposite case - a ledger rule, the way a printed menu is set.
 *
 * Replaced the signature carousel, which moved to the menu page's hero where a
 * kinetic row belongs. The homepage wanted the quiet version.
 */
export default function FeatureDish({ dishes }: FeatureDishProps) {
    return (
        <div className="feature-grid">
            {dishes.map((dish, i) => (
                <div
                    key={dish.src}
                    /* Odd rows put the photograph on the right. `is-inverse`
                       reverses the flex direction rather than reordering the
                       DOM, so the reading order stays photo-then-copy for
                       assistive tech on every row. */
                    className={`feature-row${i % 2 === 1 ? ' is-inverse' : ''}`}
                >
                    <div className="feature-box">
                        <div className="feature-photo">
                            <Image
                                src={dish.src}
                                alt={dish.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 900px) 92vw, 42vw"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    <div className="feature-box">
                        <div className="feature-copy">
                            {/* Was `.feature-index` - a ghosted "01 / 02 / 03"
                                above each name. It was introduced as a legible
                                stand-in for the reference's illegible lotus
                                glyphs, and it did separate the name from the
                                prose, but a numeral is an index: it implied a
                                ranking of three dishes that are not ranked, and
                                the client asked for it out.

                                The marks replace it and do the same separating
                                job while carrying actual information - what the
                                dish IS. Same slot, same rhythm, no ordinal. */}
                            <DishTags badges={dish.badges} className="feature-tags" />
                            <h3 className="feature-name">{dish.name}</h3>
                            <p className="feature-blurb">{dish.blurb}</p>
                            <Link href={dish.href} className="feature-link">
                                View Menu
                                <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
