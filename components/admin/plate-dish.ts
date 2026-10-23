/**
 * Dish photos, prepared in the browser before they are uploaded.
 *
 * The client supplies each dish as a background-removed cut-out (transparent
 * PNG or WebP). The menu never shows a cut-out floating on the page - that
 * treatment was rejected - so every dish is "plated": composited onto the warm
 * studio ground with a soft contact shadow, at a consistent size, into the
 * square the menu frames it in.
 *
 * This is scripts/plate-dishes.py, which plated the original 75 dishes, moved
 * into the dashboard so a dish added or re-photographed later matches them
 * without a developer. The constants below are that script's; if the look is
 * ever changed, change both together (or retire the script).
 */

export const PLATE = {
    size: 1000,                       // square, matching .menu-row-photo
    fill: 0.82,                       // share of the frame the dish may occupy
    groundCentre: [232, 226, 216],
    groundEdge: [203, 194, 180],
    shadow: [74, 66, 58],             // warm charcoal, never black
    shadowDrop: 0.022,                // contact shadow offset, share of height
    shadowSigma: 1000 / 40,           // Gaussian blur, px (PIL radius = sigma)
    shadowStrength: 0.5,
} as const;

/** Longest side kept for the transparent original. */
const ORIGINAL_MAX_EDGE = 1600;

/** Below this share of see-through pixels the photo still has its background. */
const MIN_TRANSPARENT_SHARE = 0.01;

export class DishPhotoError extends Error {}

export interface PreparedDish {
    /** What the menu shows: opaque, square, plated. */
    plated: Blob;
    /** The cut-out as supplied (scaled down if huge), kept for re-plating. */
    original: Blob;
}

function canvas(w: number, h: number) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new DishPhotoError('This browser cannot prepare photos. Try a current Chrome, Edge or Safari.');
    return { c, ctx };
}

function toBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
    return new Promise(resolve => c.toBlob(b => resolve(b), type, quality));
}

/** WebP where the browser can encode it (Chrome, Edge, Firefox); otherwise
 *  the fallback type (Safari). */
async function encode(c: HTMLCanvasElement, quality: number, fallback: 'image/jpeg' | 'image/png'): Promise<Blob> {
    const webp = await toBlob(c, 'image/webp', quality);
    if (webp && webp.type === 'image/webp') return webp;
    const other = await toBlob(c, fallback, fallback === 'image/jpeg' ? 0.86 : undefined);
    if (!other) throw new DishPhotoError('Could not encode the photo.');
    return other;
}

/** Three box blurs approximate a Gaussian (W. Jarosz). In place, on a
 *  single-channel float image. */
function gaussianBlur(src: Float32Array, w: number, h: number, sigma: number) {
    const n = 3;
    const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
    let wl = Math.floor(wIdeal);
    if (wl % 2 === 0) wl--;
    const wu = wl + 2;
    const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
    const sizes = Array.from({ length: n }, (_, i) => (i < m ? wl : wu));
    const tmp = new Float32Array(src.length);
    for (const size of sizes) {
        const r = (size - 1) / 2;
        boxH(src, tmp, w, h, r);
        boxV(tmp, src, w, h, r);
    }
}

function boxH(src: Float32Array, dst: Float32Array, w: number, h: number, r: number) {
    const iarr = 1 / (r + r + 1);
    for (let y = 0; y < h; y++) {
        const row = y * w;
        let acc = 0;
        for (let x = -r - 1; x < r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) {
            acc += src[row + Math.min(w - 1, x + r)] - src[row + Math.max(0, x - r - 1)];
            dst[row + x] = acc * iarr;
        }
    }
}

function boxV(src: Float32Array, dst: Float32Array, w: number, h: number, r: number) {
    const iarr = 1 / (r + r + 1);
    for (let x = 0; x < w; x++) {
        let acc = 0;
        for (let y = -r - 1; y < r; y++) acc += src[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) {
            acc += src[Math.min(h - 1, y + r) * w + x] - src[Math.max(0, y - r - 1) * w + x];
            dst[y * w + x] = acc * iarr;
        }
    }
}

/** Radial falloff, brightest slightly above centre - a soft key light. */
function paintGround(data: Uint8ClampedArray, w: number, h: number) {
    const cx = w / 2, cy = h * 0.46;
    const maxd = Math.hypot(w / 2, h / 2);
    const [c0, c1, c2] = PLATE.groundCentre;
    const [e0, e1, e2] = PLATE.groundEdge;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const t = Math.min(1, Math.pow(Math.hypot(x - cx, y - cy) / maxd, 1.35));
            const i = (y * w + x) * 4;
            data[i] = Math.trunc(c0 + (e0 - c0) * t);
            data[i + 1] = Math.trunc(c1 + (e1 - c1) * t);
            data[i + 2] = Math.trunc(c2 + (e2 - c2) * t);
            data[i + 3] = 255;
        }
    }
}

/** Plate a decoded cut-out. Exported for testing against the script's output. */
export function plateBitmap(bitmap: ImageBitmap | HTMLImageElement): HTMLCanvasElement {
    const sw = bitmap.width, sh = bitmap.height;
    const { c: srcC, ctx: srcX } = canvas(sw, sh);
    srcX.drawImage(bitmap, 0, 0);
    const src = srcX.getImageData(0, 0, sw, sh).data;

    // Bounding box of the dish (the visible pixels).
    let minX = sw, minY = sh, maxX = -1, maxY = -1, clear = 0;
    for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
            const a = src[(y * sw + x) * 4 + 3];
            if (a < 250) clear++;
            if (a > 10) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    if (maxX < 0) throw new DishPhotoError('That image is completely transparent.');
    if (clear / (sw * sh) < MIN_TRANSPARENT_SHARE) {
        throw new DishPhotoError(
            'This photo still has its background. Remove the background first (for example with Canva, remove.bg or Photoshop) and upload it as a PNG or WebP.',
        );
    }

    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const S = PLATE.size;
    const scale = Math.min((S * PLATE.fill) / bw, (S * PLATE.fill) / bh);
    const dw = Math.max(1, Math.floor(bw * scale)), dh = Math.max(1, Math.floor(bh * scale));
    const x0 = Math.floor((S - dw) / 2), y0 = Math.floor((S - dh) / 2);

    // The dish alone, at its final size and place.
    const { ctx: dishX } = canvas(S, S);
    dishX.imageSmoothingEnabled = true;
    dishX.imageSmoothingQuality = 'high';
    dishX.drawImage(srcC, minX, minY, bw, bh, x0, y0, dw, dh);
    const dish = dishX.getImageData(0, 0, S, S).data;

    // Contact shadow: the silhouette, dropped, blurred, at half strength.
    const drop = Math.trunc(S * PLATE.shadowDrop);
    const mask = new Float32Array(S * S);
    for (let y = 0; y + drop < S; y++) {
        for (let x = 0; x < S; x++) mask[(y + drop) * S + x] = dish[(y * S + x) * 4 + 3];
    }
    gaussianBlur(mask, S, S, PLATE.shadowSigma);

    const { c: out, ctx: outX } = canvas(S, S);
    const img = outX.createImageData(S, S);
    const o = img.data;
    paintGround(o, S, S);
    const [s0, s1, s2] = PLATE.shadow;
    for (let p = 0; p < S * S; p++) {
        const i = p * 4;
        const m = Math.min(255, mask[p] * PLATE.shadowStrength) / 255;
        let r = o[i] + (s0 - o[i]) * m;
        let g = o[i + 1] + (s1 - o[i + 1]) * m;
        let b = o[i + 2] + (s2 - o[i + 2]) * m;
        const a = dish[i + 3] / 255;
        r += (dish[i] - r) * a;
        g += (dish[i + 1] - g) * a;
        b += (dish[i + 2] - b) * a;
        o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255;
    }
    outX.putImageData(img, 0, 0);
    return out;
}

/** Validate, plate and shrink one uploaded cut-out. */
export async function prepareDishPhoto(file: File): Promise<PreparedDish> {
    if (!/^image\/(png|webp)$/.test(file.type) && !/\.(png|webp)$/i.test(file.name)) {
        throw new DishPhotoError('Upload the dish as a PNG or WebP with the background removed. JPG photos cannot be see-through.');
    }
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new DishPhotoError('That file could not be opened as an image.');
    }
    try {
        // 0.9, not 0.8: next/image re-compresses it once more when it is served.
        const plated = await encode(plateBitmap(bitmap), 0.9, 'image/jpeg');

        const k = Math.min(1, ORIGINAL_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
        const { c, ctx } = canvas(Math.round(bitmap.width * k), Math.round(bitmap.height * k));
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, c.width, c.height);
        const original = await encode(c, 0.9, 'image/png');
        return { plated, original };
    } finally {
        bitmap.close();
    }
}
