import type { MetadataRoute } from 'next';
import { SITE_URL as SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
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
