/**
 * What the media library accepts. The file EXTENSION decides the type, and
 * the file's leading bytes must then agree with it - the browser-reported
 * MIME type is never trusted.
 */
export const MEDIA_BUCKET = 'site-media';

export type MediaKind = 'image' | 'video' | 'font';

export const MEDIA_TYPES: Record<string, { mime: string; kind: MediaKind; maxBytes: number }> = {
    jpg:   { mime: 'image/jpeg', kind: 'image', maxBytes: 15 * 1024 * 1024 },
    jpeg:  { mime: 'image/jpeg', kind: 'image', maxBytes: 15 * 1024 * 1024 },
    png:   { mime: 'image/png',  kind: 'image', maxBytes: 15 * 1024 * 1024 },
    webp:  { mime: 'image/webp', kind: 'image', maxBytes: 15 * 1024 * 1024 },
    gif:   { mime: 'image/gif',  kind: 'image', maxBytes: 15 * 1024 * 1024 },
    avif:  { mime: 'image/avif', kind: 'image', maxBytes: 15 * 1024 * 1024 },
    mp4:   { mime: 'video/mp4',  kind: 'video', maxBytes: 50 * 1024 * 1024 },
    webm:  { mime: 'video/webm', kind: 'video', maxBytes: 50 * 1024 * 1024 },
    woff2: { mime: 'font/woff2', kind: 'font',  maxBytes: 5 * 1024 * 1024 },
    woff:  { mime: 'font/woff',  kind: 'font',  maxBytes: 5 * 1024 * 1024 },
    ttf:   { mime: 'font/ttf',   kind: 'font',  maxBytes: 5 * 1024 * 1024 },
    otf:   { mime: 'font/otf',   kind: 'font',  maxBytes: 5 * 1024 * 1024 },
};

export const extensionOf = (name: string) => (name.match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toLowerCase();

const ascii = (b: Uint8Array, start: number, len: number) => String.fromCharCode(...b.slice(start, start + len));

/** Does the start of the file look like what its extension claims? */
export function matchesSignature(ext: string, b: Uint8Array): boolean {
    switch (ext) {
        case 'jpg': case 'jpeg': return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
        case 'png': return b[0] === 0x89 && ascii(b, 1, 3) === 'PNG';
        case 'gif': return ascii(b, 0, 4) === 'GIF8';
        case 'webp': return ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP';
        case 'avif': return ascii(b, 4, 4) === 'ftyp' && /^avi[fs]$/.test(ascii(b, 8, 4));
        case 'mp4': return ascii(b, 4, 4) === 'ftyp';
        case 'webm': return b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
        case 'woff2': return ascii(b, 0, 4) === 'wOF2';
        case 'woff': return ascii(b, 0, 4) === 'wOFF';
        case 'ttf': return (b[0] === 0 && b[1] === 1 && b[2] === 0 && b[3] === 0) || ascii(b, 0, 4) === 'true';
        case 'otf': return ascii(b, 0, 4) === 'OTTO';
        default: return false;
    }
}

/** Paths are always generated server-side in exactly this shape. */
export const MEDIA_PATH = /^(image|video|font)s\/\d{4}\/[a-z0-9-]{1,60}-[a-z0-9]{6,16}\.[a-z0-9]{2,5}$/;
