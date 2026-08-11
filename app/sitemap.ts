import type { MetadataRoute } from 'next';

const SITE = 'https://khaosan.com.bd';

/**
 * The public surface is small and stable: a homepage whose chapters are
 * anchors rather than routes, the menu, and two legal pages. Anchors are
 * deliberately not listed — they are not separate documents and listing them
 * would just dilute the homepage.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        { url: `${SITE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
        { url: `${SITE}/menu`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${SITE}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
        { url: `${SITE}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    ];
}
