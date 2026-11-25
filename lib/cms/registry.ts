import { sanitizeDoc, type DocDef } from './fields';
import { homeDoc, homeDefaults, type HomeContent } from './docs/home';
import { menuPageDoc, menuPageDefaults, type MenuPageContent } from './docs/menu-page';
import { headerDoc, headerDefaults, footerDoc, footerDefaults, type HeaderContent, type FooterContent } from './docs/chrome';
import { locationsDoc, locationsDefaults, type LocationsContent } from './docs/locations';
import { legalDoc, legalDefaults, type LegalContent } from './docs/legal';
import { siteDoc, siteDefaults, type SiteSettingsContent } from './docs/site';

export interface SiteContent {
    home: HomeContent;
    menu: MenuPageContent;
    header: HeaderContent;
    footer: FooterContent;
    locations: LocationsContent;
    legal: LegalContent;
    site: SiteSettingsContent;
}

export type DocKey = keyof SiteContent;

/** Dashboard order. */
export const DOC_KEYS: DocKey[] = ['home', 'menu', 'header', 'footer', 'locations', 'legal', 'site'];

export const DOCS: { [K in DocKey]: { def: DocDef; defaults: SiteContent[K] } } = {
    home: { def: homeDoc, defaults: homeDefaults },
    menu: { def: menuPageDoc, defaults: menuPageDefaults },
    header: { def: headerDoc, defaults: headerDefaults },
    footer: { def: footerDoc, defaults: footerDefaults },
    locations: { def: locationsDoc, defaults: locationsDefaults },
    legal: { def: legalDoc, defaults: legalDefaults },
    site: { def: siteDoc, defaults: siteDefaults },
};

export const isDocKey = (k: unknown): k is DocKey => typeof k === 'string' && (DOC_KEYS as string[]).includes(k);

export function normalizeDoc<K extends DocKey>(key: K, input: unknown): SiteContent[K] {
    const { def, defaults } = DOCS[key];
    const doc = sanitizeDoc(def, key === 'home' ? migrateGallery(input) : input, defaults);
    if (key === 'locations') renameOutlets(doc as LocationsContent);
    return doc;
}

/**
 * Content migration (2026-11-25): the homepage room gallery (`story.gallery`,
 * a flat list of photos) became the room wall (`story.wall`, cards of photos
 * or a video). A stored version saved before that still has only `gallery`;
 * its photos are dealt into the default wall's photo cards, in order, so any
 * photos the client chose are kept. Video cards stay as the defaults.
 */
function migrateGallery(input: unknown): unknown {
    if (!input || typeof input !== 'object') return input;
    const doc = input as { story?: Record<string, unknown> };
    const story = doc.story;
    if (!story || typeof story !== 'object' || Array.isArray(story.wall) || !Array.isArray(story.gallery)) return input;
    const photos = (story.gallery as unknown[]).filter(
        (p): p is { src: string; alt?: string } => !!p && typeof p === 'object' && typeof (p as { src?: unknown }).src === 'string' && !!(p as { src: string }).src,
    );
    if (!photos.length) return input;
    const wall = structuredClone(homeDefaults.story.wall);
    const photoCards = wall.filter(c => !c.video);
    photoCards.forEach(c => { c.photos = []; });
    photos.forEach((p, i) => photoCards[i % photoCards.length].photos.push({ src: p.src, alt: p.alt ?? '' }));
    return { ...doc, story: { ...story, wall: wall.filter(c => c.video || c.photos.length) } };
}

/**
 * One-off content correction (2026-10-25): the client renamed the outlet
 * "Gulshan 1" to plain "Gulshan" - the area is in the address directly
 * beneath it. The code default already says "Gulshan", but a Locations &
 * hours version published before that still stores the old name, and the
 * live site shows what was published. Applied on every read (site AND
 * editor), so the dashboard shows "Gulshan" and the next publish stores it.
 * Only the exact old name is touched; anything the client types is kept.
 */
const OUTLET_RENAMES: Record<string, string> = { 'Gulshan 1': 'Gulshan' };
function renameOutlets(doc: LocationsContent) {
    for (const outlet of doc.outlets.items) {
        const renamed = OUTLET_RENAMES[outlet.name.trim()];
        if (renamed) outlet.name = renamed;
    }
}
