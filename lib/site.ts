/**
 * The site's public address - the ONE place it is written.
 *
 * Google's data about the outlets (JSON-LD), the sitemap, robots.txt, share
 * previews and canonical URLs are all built from this. It used to be typed out
 * in five files, and two of them disagreed with the Privacy Policy about what
 * the domain even was.
 *
 * Set NEXT_PUBLIC_SITE_URL on the host to change it (no trailing slash), e.g.
 * when moving domains or for a staging copy that must not claim the real one.
 */
const FALLBACK = 'https://khaosan.bd';

function normalise(raw: string | undefined): string {
    if (!raw) return FALLBACK;
    try {
        const u = new URL(raw.trim());
        if (u.protocol !== 'https:' && u.protocol !== 'http:') return FALLBACK;
        return u.origin;
    } catch {
        return FALLBACK;
    }
}

export const SITE_URL = normalise(process.env.NEXT_PUBLIC_SITE_URL);

/** A path that may or may not already be percent-encoded, encoded once. */
export function encodePath(path: string): string {
    try {
        return encodeURI(decodeURI(path));
    } catch {
        return encodeURI(path);
    }
}

/** Absolute URL for a site path; leaves full addresses alone. */
export const absoluteUrl = (path: string) =>
    /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${encodePath(path)}`;
