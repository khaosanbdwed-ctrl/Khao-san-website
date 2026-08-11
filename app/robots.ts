import type { MetadataRoute } from 'next';

const SITE = 'https://khaosan.com.bd';

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
