/**
 * Naming rule for videos the dashboard has optimised (components/admin/cms/
 * optimize-media.ts). One upload becomes three files side by side:
 *
 *   videos/<stem>.web.mp4      720p H.264, for computers and tablets
 *   videos/<stem>.web-sm.mp4   480p H.264, for phones
 *   videos/<stem>.web.webp     still frame, shown while the film loads
 *
 * Only the first is stored in the content; the other two are derived from it
 * here, so a video field stays a single value wherever it appears. A video
 * that does not follow the rule (the site's built-in clips, a pasted link, an
 * upload from a browser that could not optimise it) is played as it is.
 */
const OPTIMISED = /^(.*)\.web\.mp4$/;

export function videoSources(src: string): { src: string; small?: string; poster?: string } {
    const m = src.match(OPTIMISED);
    return m ? { src, small: `${m[1]}.web-sm.mp4`, poster: `${m[1]}.web.webp` } : { src };
}

/** Width at or below which the phone version plays. */
export const SMALL_VIDEO_QUERY = '(max-width: 768px)';

/** Supabase projects whose public buckets next.config.ts allowlists for the
 *  image optimiser: this deployment's own, plus the original project. */
const OPTIMIZABLE_PREFIXES = [process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://breqqsquwkxgjzrxbxso.supabase.co']
    .filter((u): u is string => Boolean(u))
    .map(u => `${u.replace(/\/+$/, '')}/storage/v1/object/public/`);

/** Remote images (anything not under /public or an allowlisted Supabase
 *  bucket) skip the optimiser, which would otherwise refuse the host and
 *  render a broken image. A pasted link from anywhere else still shows. */
export function isOptimizable(src: string) {
    if (src.startsWith('/') && !src.startsWith('//')) return true;
    return OPTIMIZABLE_PREFIXES.some(p => src.startsWith(p));
}
