"use client";

/**
 * The one picture the dashboard still converts: the link-preview (share)
 * image, when it is uploaded as something other than JPEG or PNG. It is read
 * by other apps - WhatsApp, Facebook, iMessage - not by this site, and not
 * all of them accept WebP. Everything else is uploaded exactly as chosen
 * (see uploadMedia in media-library.tsx).
 *
 * JPEG, at most 1600 px wide: link previews are shown small, and WhatsApp
 * drops previews whose image is too heavy.
 */
const SHARE_MAX_EDGE = 1600;
const SHARE_QUALITY = 0.9;

export async function toShareJpeg(file: File): Promise<File> {
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file;
    }
    const scale = Math.min(1, SHARE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale), height = Math.round(bitmap.height * scale);
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
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', SHARE_QUALITY));
    if (!blob || blob.type !== 'image/jpeg') return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}
