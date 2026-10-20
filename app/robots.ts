import type { MetadataRoute } from 'next';
import { getPublishedContent } from '@/lib/cms/store';

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
    // The domain is set in Admin -> Site settings & SEO.
    const SITE = (await getPublishedContent()).site.siteUrl.replace(/\/$/, '');
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // The admin panel and its API are behind a login and have no
            // business in a search index.
            disallow: ['/admin', '/admin/', '/api/'],
        },
        sitemap: `${SITE}/sitemap.xml`,
    };
}
