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
    return sanitizeDoc(def, input, defaults);
}
