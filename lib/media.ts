/**
 * Naming rule for videos the dashboard optimised before uploads were kept as
 * they are (videos uploaded since are played as uploaded). One upload became
 * three files side by side:
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

/** Supabase projects next.config.ts allowlists: this deployment's own, plus
 *  the original project. */
const SUPABASE_PUBLIC = [process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://breqqsquwkxgjzrxbxso.supabase.co']
    .filter((u): u is string => Boolean(u))
    .map(u => `${u.replace(/\/+$/, '')}/storage/v1/object/public/`);

/**
 * Whether an image goes through next/image's optimiser (resized per screen
 * and re-encoded) or is shown exactly as it is.
 *
 *  - built-in files under /public: optimised;
 *  - plated dish photos (`dish-images`): optimised. The dashboard generates
 *    them losslessly at 1600px, and the menu shows ~70 at once, so each
 *    screen is sent a copy sized for it;
 *  - ⚠ everything uploaded to the media library (`site-media`) and any
 *    pasted link: NOT optimised - shown byte for byte as uploaded. The
 *    client's designers prepare those files for the web, and re-encoding
 *    them was a second lossy pass over finished work (client: "don't
 *    compress it at all ... it is losing the quality of the design").
 */
export function isOptimizable(src: string) {
    if (src.startsWith('/') && !src.startsWith('//')) return true;
    return SUPABASE_PUBLIC.some(p => src.startsWith(`${p}dish-images/`));
}
