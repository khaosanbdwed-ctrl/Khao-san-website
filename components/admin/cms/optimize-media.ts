"use client";

import {
    ALL_FORMATS, BlobSource, BufferTarget, CanvasSink, Conversion, Input, Mp4OutputFormat, Output, canEncodeVideo,
} from 'mediabunny';

/**
 * Prepares uploads for the web, in the browser, before they are sent.
 *
 * A photo or video can be any size a phone or camera produces. The site's own
 * clips were hand-compressed to ~1-2 MB at 720p; an unprocessed 40 MB phone
 * recording would be downloaded in full by every visitor on mobile data. So:
 *
 *  VIDEO -> two H.264 MP4s and a still, all from one upload:
 *           computers  longest side 1920 px (1080p), ~4 Mbit/s
 *           phones     longest side 1280 px (720p), ~1.8 Mbit/s
 *           (~10 MB / ~4.5 MB at 20 s). Was 720p at 1.2 Mbit/s and 480p at
 *           0.6 - the weight of the site's own hand-compressed clips, but
 *           visibly soft as a full-screen background on a laptop or a
 *           high-density phone; the client's note was that uploads lost
 *           too much quality. A browser that cannot encode the larger size
 *           falls back to the next one down rather than giving up.
 *           still      a frame from the start, shown while the film loads
 *           Sound is removed (background videos always play muted) and the
 *           clip is trimmed to MAX_SECONDS - it loops, so a long file only
 *           costs download time. The site plays the phone file on small
 *           screens (lib/media.ts, components/ui/background-video.tsx).
 *
 *  PHOTO -> scaled down to at most MAX_PHOTO_EDGE on the longest side and
 *           re-saved as WebP at PHOTO_QUALITY. That is the master, stored
 *           once; the site's image pipeline (next/image, `qualities` in
 *           next.config.ts) then serves each screen its own smaller size.
 *           ⚠ Every photo is compressed twice - here, and again per screen
 *           size when it is served - so this pass is kept near-lossless.
 *           Measured on a 5 MP photo, as visitors see it at 1920 px: the old
 *           0.86 here + 75 there scored 33.1 dB PSNR (soft, the client's
 *           complaint); 0.92 + 85 scores 36.1 dB for ~480 KB served.
 *
 * Shape is never changed: footage and photos keep their aspect ratio, and the
 * site crops them to fill whatever frame they are placed in (object-fit:
 * cover), on any screen. Nothing is stretched or letterboxed.
 *
 * Encoding uses WebCodecs - built into current Chrome, Edge, Safari and
 * Firefox, no plug-in or server. If a browser cannot do it, the caller falls
 * back to uploading the original file and says so.
 */

export const MAX_SECONDS = 20;
/** Covers a full-width photo on a 1440px-wide retina screen (2880px). */
const MAX_PHOTO_EDGE = 3200;
const PHOTO_QUALITY = 0.92;

/** Each rendition is tried at its sizes in order, largest first. */
const RENDITIONS = [
    { key: 'large', sizes: [{ longEdge: 1920, bitrate: 4_000_000 }, { longEdge: 1280, bitrate: 2_500_000 }] },
    { key: 'small', sizes: [{ longEdge: 1280, bitrate: 1_800_000 }, { longEdge: 854, bitrate: 900_000 }] },
] as const;

export class OptimizeUnsupported extends Error {}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

function fit(w: number, h: number, longEdge: number) {
    const scale = Math.min(1, longEdge / Math.max(w, h));
    return { width: even(w * scale), height: even(h * scale) };
}

async function canvasToBlob(canvas: HTMLCanvasElement | OffscreenCanvas, type: string, quality: number): Promise<Blob> {
    if ('convertToBlob' in canvas) return canvas.convertToBlob({ type, quality });
    return new Promise((resolve, reject) =>
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not encode the image.'))), type, quality));
}

export interface OptimizedVideo {
    large: Blob;
    small: Blob;
    poster: Blob;
    trimmed: boolean;
    width: number;
    height: number;
}

export async function optimizeVideo(file: File, onProgress: (fraction: number) => void): Promise<OptimizedVideo> {
    if (typeof VideoEncoder === 'undefined') throw new OptimizeUnsupported('This browser cannot optimise video.');

    const probe = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const track = await probe.getPrimaryVideoTrack();
    if (!track) throw new Error('That file has no video in it.');
    const duration = await probe.computeDuration();
    const w = track.displayWidth, h = track.displayHeight;
    const end = Math.min(duration, MAX_SECONDS);

    const outputs: Blob[] = [];
    for (let i = 0; i < RENDITIONS.length; i++) {
        let r: { longEdge: number; bitrate: number } | null = null;
        for (const candidate of RENDITIONS[i].sizes) {
            if (await canEncodeVideo('avc', { ...fit(w, h, candidate.longEdge), bitrate: candidate.bitrate })) { r = candidate; break; }
        }
        if (!r) throw new OptimizeUnsupported('This browser cannot encode H.264 video.');
        const size = fit(w, h, r.longEdge);
        const target = new BufferTarget();
        const conversion = await Conversion.init({
            input: new Input({ source: new BlobSource(file), formats: ALL_FORMATS }),
            // `in-memory` fast start puts the index at the front of the file,
            // so playback begins before the whole clip has downloaded.
            output: new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target }),
            tracks: 'primary',
            video: { ...size, fit: 'contain', codec: 'avc', bitrate: r.bitrate, frameRate: 30, forceTranscode: true },
            audio: { discard: true },
            trim: { start: 0, end },
            showWarnings: false,
        });
        if (!conversion.isValid) throw new OptimizeUnsupported('This video format could not be read by the browser.');
        conversion.onProgress = p => onProgress((i + p) / (RENDITIONS.length + 0.2));
        await conversion.execute();
        if (!target.buffer) throw new Error('Video optimisation produced no output.');
        outputs.push(new Blob([target.buffer], { type: 'video/mp4' }));
    }

    const stillSize = fit(w, h, 1920);
    const sink = new CanvasSink(track, { ...stillSize, fit: 'contain' });
    const frame = await sink.getCanvas(Math.min(0.5, end / 2));
    if (!frame) throw new Error('Could not capture a still from the video.');
    const poster = await canvasToBlob(frame.canvas, 'image/webp', 0.88);
    onProgress(1);

    return {
        large: outputs[0],
        small: outputs[1],
        poster: poster.type === 'image/webp' ? poster : await canvasToBlob(frame.canvas, 'image/jpeg', 0.88),
        trimmed: duration > MAX_SECONDS + 0.05,
        ...stillSize,
    };
}

/**
 * Photo -> WebP no larger than MAX_PHOTO_EDGE. Returns the original when that
 * would not help: animated GIFs (a canvas keeps only the first frame), and
 * files the re-save would make bigger.
 *
 * Safari cannot encode WebP. There a JPEG or HEIC-converted photo is re-saved
 * as JPEG instead, so a 12 MB iPhone picture is still scaled down rather than
 * refused at the 10 MB limit. PNG/WebP sources may be see-through (logos,
 * the brush stroke), and JPEG has no transparency, so those are kept as they
 * are when WebP is unavailable.
 */
export async function optimizePhoto(file: File, opts: { jpeg?: boolean } = {}): Promise<File> {
    if (file.type === 'image/gif' || typeof createImageBitmap === 'undefined') return file;
    if (opts.jpeg) return toJpeg(file);
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file;
    }
    const original = { width: bitmap.width, height: bitmap.height };
    const { width, height } = fit(original.width, original.height, MAX_PHOTO_EDGE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, 'image/webp', PHOTO_QUALITY).catch(() => null);
    // A browser without WebP encoding hands back a PNG instead.
    if (!blob || blob.type !== 'image/webp') {
        if (file.type !== 'image/jpeg') return file;
        blob = await canvasToBlob(canvas, 'image/jpeg', PHOTO_QUALITY).catch(() => null);
        if (!blob || blob.type !== 'image/jpeg') return file;
    }
    const resized = width !== original.width || height !== original.height;
    if (!resized && blob.size >= file.size) return file;
    const ext = blob.type === 'image/webp' ? '.webp' : '.jpg';
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + ext, { type: blob.type });
}

/** For pictures other apps read (the link-preview image): JPEG, at most
 *  1600 px wide, whatever the browser. */
async function toJpeg(file: File): Promise<File> {
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file;
    }
    const { width, height } = fit(bitmap.width, bitmap.height, 1600);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close(); return file; }
    // JPEG has no transparency: a see-through PNG gets a white ground, not black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.86).catch(() => null);
    if (!blob || blob.type !== 'image/jpeg') return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}
