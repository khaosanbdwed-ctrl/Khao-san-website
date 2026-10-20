import { cache } from 'react';
import { draftMode } from 'next/headers';
import { readJson } from './bucket';
import { DOC_KEYS, normalizeDoc, type SiteContent } from './registry';

/**
 * What the public site renders, read once per request.
 *
 * Normally that is each area's published.json. In Draft Mode - reachable only
 * through the dashboard's Preview button, behind the admin login - the draft
 * is read instead, so the editor sees exactly what Publish would put live.
 * Both live in the private `site-content` bucket and are read server-side
 * with the service key (lib/cms/bucket.ts); nothing here reaches the browser
 * except the rendered page.
 *
 * Failure policy, because the two kinds of failure want opposite answers:
 *  - A file (or the bucket) does not exist yet - the CMS has never been used,
 *    or an area was never published: render the built-in content, which IS
 *    the site as designed.
 *  - Anything else (Supabase unreachable, a bad key) at RUNTIME: throw. The
 *    pages are ISR, and a render that throws keeps the last good page in the
 *    cache. Falling back to the built-in content here would silently replace
 *    published content after a network blip.
 *  - The same error during `next build` falls back with a warning, so a build
 *    machine without database access still produces a site.
 */

type Stored = { data: unknown };

async function read(path: string): Promise<Stored | null> {
    try {
        return await readJson<Stored>(path);
    } catch (e) {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            console.warn(`[cms] ${(e as Error).message}; building with the built-in content.`);
            return null;
        }
        throw e;
    }
}

export const getSiteContent = cache(async (): Promise<SiteContent & { isPreview: boolean }> => {
    const { isEnabled } = await draftMode();

    const entries = await Promise.all(DOC_KEYS.map(async key => {
        const doc = isEnabled
            ? (await read(`${key}/draft.json`)) ?? (await read(`${key}/published.json`))
            : await read(`${key}/published.json`);
        return [key, normalizeDoc(key, doc?.data ?? null)] as const;
    }));

    return { ...(Object.fromEntries(entries) as unknown as SiteContent), isPreview: isEnabled };
});
