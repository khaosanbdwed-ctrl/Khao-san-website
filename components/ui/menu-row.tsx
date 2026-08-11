import React from 'react';
import Image from 'next/image';
import { Flame, BookOpen, Camera, Sparkles } from 'lucide-react';

export type MenuBadge = 'spicy' | 'special' | 'featured' | 'new';

/* Prices are deliberately absent. The `price` / `group_price` columns still
   exist in Supabase and are still editable in admin - the client asked for
   prices off the site, not out of the data. */
export interface MenuRowProps {
    title: string;
    imageSrc: string;
    portionNote?: string;
    description: string;
    badges?: MenuBadge[];
    addOnNote?: string;
}

export const BADGE_META: Record<MenuBadge, { label: string; icon: React.ReactNode }> = {
    spicy: { label: 'Spicy', icon: <Flame size={13} strokeWidth={2.25} aria-hidden="true" /> },
    special: { label: 'Special', icon: <BookOpen size={13} strokeWidth={2.25} aria-hidden="true" /> },
    featured: { label: 'Featured', icon: <Camera size={13} strokeWidth={2.25} aria-hidden="true" /> },
    new: { label: 'New', icon: <Sparkles size={13} strokeWidth={2.25} aria-hidden="true" /> },
};

/**
 * One dish, as a line in a menu.
 *
 * Not a card. The page previously set every dish in an identical bordered box
 * with corner brackets, which is the arrangement Impeccable's craft floor
 * names outright ("cards are the lazy container") and which reads as a product
 * grid rather than a menu. The brand's own printed menu - the scans in
 * `_masters/Brand_Asset` - is a two-column typographic list, so that is the
 * format this follows: a photograph, a name, a description, and a hairline.
 * No box, no shadow, no bracket.
 *
 * The photograph is a plated composite (see platedSrc in app/menu/page.tsx),
 * not the transparent cut-out, so nothing floats.
 */
export default function MenuRow({
    title,
    imageSrc,
    portionNote,
    description,
    badges = [],
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
                    sizes="(max-width: 760px) 92vw, 46vw"
                    loading="lazy"
                />
            </div>

            <div className="menu-row-body">
                <h3 className="menu-row-title">
                    {title}
                    {portionNote && <span className="menu-row-portion">{portionNote}</span>}
                </h3>

                {/* Tags sit above the description, not below it. They qualify the
                    dish - how hot, whether it is a house special - so they are
                    read before the prose, not discovered after it. */}
                {badges.length > 0 && (
                    <p className="menu-row-tags">
                        {badges.map((b) => (
                            <span className="menu-tag" key={b}>
                                {BADGE_META[b].icon}
                                {BADGE_META[b].label}
                            </span>
                        ))}
                    </p>
                )}

                {description && <p className="menu-row-desc">{description}</p>}

                {addOnNote && <p className="menu-row-addon">{addOnNote}</p>}
            </div>
        </li>
    );
}
