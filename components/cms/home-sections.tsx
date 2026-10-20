"use client";

import React from 'react';
import type { HomeSection } from '@/lib/cms/schema';
import { useCmsPreview, useContent } from './content-context';
import HeroSection from './sections/hero';
import CraftSection from './sections/craft';
import HeritageSection from './sections/heritage';
import LocationsSection from './sections/locations';
import GiftSection from './sections/gift';
import InvitationSection from './sections/invitation';
import { BrushSection, DishesSection, GallerySection, TextSection } from './sections/simple';

/**
 * Renders the homepage from its section list, in the client's order.
 *
 * ⚠ Sections render with NO wrapper element. The stylesheet relies on
 * adjacent-sibling selectors between sections (`.bg-blue-field +
 * .bg-blue-field`, the seam rules in 10-backgrounds.css), and a wrapper div
 * around each would silently break every one of them.
 */
const RENDERERS: { [T in HomeSection['type']]: React.ComponentType<{ data: Extract<HomeSection, { type: T }>['data']; anchor?: string; cmsId?: string }> } = {
    hero: HeroSection,
    brush: BrushSection,
    craft: CraftSection,
    heritage: HeritageSection,
    locations: LocationsSection,
    gift: GiftSection,
    invitation: InvitationSection,
    text: TextSection,
    gallery: GallerySection,
    dishes: DishesSection,
};

export default function HomeSections() {
    const { home } = useContent();
    const preview = useCmsPreview();

    return (
        <>
            {home.sections.filter(s => !s.hidden).map(section => {
                const Renderer = RENDERERS[section.type] as React.ComponentType<{ data: unknown; anchor?: string; cmsId?: string }>;
                return (
                    <Renderer
                        key={section.id}
                        data={section.data}
                        anchor={section.anchor || undefined}
                        cmsId={preview ? section.id : undefined}
                    />
                );
            })}
        </>
    );
}
