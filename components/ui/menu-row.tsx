import React from 'react';
import Image from 'next/image';
import DishTags, { type MenuBadge } from '@/components/ui/dish-tags';

export type { MenuBadge };

/* Prices are deliberately absent. The `price` / `group_price` columns still
   exist in Supabase and are still editable in admin - the client asked for
   prices off the site, not out of the data.

   ROUND 9: `description`, `badges` and `portionNote` are BACK. Round 8 cut
   this row to a photograph and a name, on a reference showing exactly that.
   The client's note this round is the other side of it: "the pictures are
   okay, but the pictures is lacking description, taglines, and the tags like
   spicy". Seventy-five unlabelled photographs is a gallery, not a menu - you
   cannot tell what is in a dish, whether it is spicy, or how much of it you
   get.

   This is the second time this copy has been hidden and restored, which is
   why the props were never removed and the columns were never dropped. If it
   is ever hidden again, hide it the same way: stop rendering it, keep the
   data. */
export interface MenuRowProps {
    title: string;
    imageSrc: string;
    description?: string;
    badges?: MenuBadge[];
    portionNote?: string;
    addOnNote?: string;
}

/**
 * One dish: a square photograph, its marks, its name, its description.
 *
 * The page has arrived here by elimination. It was a bordered card grid with
 * corner brackets (rejected - "cards are the lazy container"), then a dense
 * two-column typographic list (rejected - read as a price list), then large
 * stacked blocks carrying tags and a description, then that same block with
 * everything but the photograph and the name stripped out.
 *
 * This is the fourth state and it is the third one again, which is worth being
 * honest about: the block WAS right, and Round 8 over-corrected. What changed
 * on the way back is the typographic weight, not the content - the name is a
 * caption rather than a headline (see `.menu-row-title`), the marks are
 * unboxed, and the description is set small and quiet. That is what stops 75
 * of these reading as noise, and it is the thing Round 8 actually fixed.
 *
 * ⚠ There was briefly a category caption under each photograph, copied from
 * the client's reference. It was wrong HERE and the screenshot made it
 * obvious: the reference is a mixed "recommended" grid where every dish comes
 * from a different category, so the label carries information. This page is
 * grouped BY category under a large heading, so the caption printed the word
 * "Appetizers" nine times directly beneath a heading that already said
 * "Appetizers". Removed, and it should stay removed.
 *
 * The photograph is a plated composite (see platedSrc in app/menu/page.tsx),
 * not the transparent cut-out, so nothing floats.
 */
export default function MenuRow({
    title,
    imageSrc,
    description,
    badges,
    portionNote,
    addOnNote,
}: MenuRowProps) {
    return (
        <li className="menu-row reveal-hidden">
            <div className="menu-row-photo">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 900px) 92vw, 31vw"
                    loading="lazy"
                />
            </div>

            {/* reserveSpace: the marks sit above the name, and roughly a third
                of the 75 dishes carry none - without the held line, names in
                the same grid row start at different heights. */}
            <DishTags badges={badges} className="menu-row-tags" reserveSpace />

            <h3 className="menu-row-title">
                {title}
                {portionNote && <span className="menu-row-portion"> {portionNote}</span>}
            </h3>

            {description && <p className="menu-row-desc">{description}</p>}
            {addOnNote && <p className="menu-row-addon">{addOnNote}</p>}
        </li>
    );
}
