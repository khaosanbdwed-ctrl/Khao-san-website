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
    const doc = sanitizeDoc(def, input, defaults);
    if (key === 'locations') renameOutlets(doc as LocationsContent);
    return doc;
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
