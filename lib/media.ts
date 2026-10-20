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
