import React from 'react';
import { Flame, ChefHat, Star, Sparkles } from 'lucide-react';

/**
 * The dish mark vocabulary - one definition, used everywhere a dish appears.
 *
 * ⚠ The four keys are the values stored in Supabase's `menu_items.badges`
 * column and edited in the admin panel. Do NOT rename them to match a label;
 * the label is presentation and lives here, the key is data and lives in the
 * database. Adding a fifth mark means a migration, not just a line in this
 * file.
 *
 * `special` reads as "Chef's Special" rather than "Special", which is what the
 * mark has always meant on the printed menu and what the client asked for by
 * name. Its icon moved from BookOpen (which read as a menu, not a dish) to
 * ChefHat, and `featured` moved from Camera (which read as "photographed")
 * to Star.
 *
 * These marks were rendered, then removed in Round 8 when the menu row was cut
 * back to a photograph and a name, then asked for again in Round 9 - on the
 * homepage feature rows as well as on the menu. That history is why the data
 * and the labels are kept apart: the copy has survived two rounds of being
 * hidden, and hiding it again should never mean deleting it.
 */
export type MenuBadge = 'spicy' | 'special' | 'featured' | 'new';

export const BADGE_META: Record<MenuBadge, { label: string; icon: React.ReactNode }> = {
    spicy:    { label: 'Spicy',          icon: <Flame size={13} strokeWidth={2.25} aria-hidden="true" /> },
    special:  { label: "Chef's Special", icon: <ChefHat size={13} strokeWidth={2.25} aria-hidden="true" /> },
    featured: { label: 'Signature',      icon: <Star size={13} strokeWidth={2.25} aria-hidden="true" /> },
    new:      { label: 'New',            icon: <Sparkles size={13} strokeWidth={2.25} aria-hidden="true" /> },
};

export interface DishTagsProps {
    badges?: MenuBadge[] | null;
    /** Extra class on the wrapper, for per-context spacing. */
    className?: string;
    /**
     * Render an empty wrapper for an unmarked dish instead of nothing.
     *
     * Needed in a GRID, and only there. In the menu list the marks sit above
     * the dish name, so if a marked row renders the line and an unmarked one
     * beside it does not, the two names start at different heights and the
     * whole row of three goes ragged - about a third of the 75 dishes carry no
     * badge, so this is most rows, not an edge case. The wrapper's own
     * `min-height` holds the line.
     *
     * Off by default: in the showcase and the homepage feature rows each block
     * stands alone, and reserving a blank line there is just a gap.
     */
    reserveSpace?: boolean;
}

/**
 * No container, no pill, no outline - see `.menu-tag` in 08-menu.css for why
 * (75 outlined chips on one page make the chips the pattern). The mark is its
 * icon and its label set in the accent, separated by a hairline dot.
 */
export default function DishTags({ badges, className, reserveSpace = false }: DishTagsProps) {
    const marks = (badges ?? []).filter((b): b is MenuBadge => b in BADGE_META);
    if (marks.length === 0 && !reserveSpace) return null;

    return (
        <p
            className={className ? `dish-tags ${className}` : 'dish-tags'}
            aria-hidden={marks.length === 0 ? true : undefined}
        >
            {marks.map((b) => (
                <span className="menu-tag" key={b}>
                    {BADGE_META[b].icon}
                    {BADGE_META[b].label}
                </span>
            ))}
        </p>
    );
}
