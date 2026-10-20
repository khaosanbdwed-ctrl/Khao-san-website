"use client";

import { createClient } from '@supabase/supabase-js';
import { api } from './api';

export interface MediaItem {
    id: string;
    url: string;
    path: string;
    bucket: string;
    kind: 'image' | 'video' | 'font';
    mime: string;
    size: number;
    width: number | null;
    height: number | null;
    name: string;
    alt: string;
    created_at: string;
}

/** Long edge photos are scaled down to before upload. Plenty for a full-width hero. */
const MAX_EDGE = 2400;

/**
 * Upload one file to the media library.
 *
 * Large photos are resized and re-encoded to WebP in the browser first, so a
 * 12 MB phone photo becomes a few hundred KB without the client having to
 * think about it. GIFs (animation) and AVIFs are left alone, as are images
 * already small enough.
 *
 * The file goes straight to Supabase Storage via a signed URL - see
 * app/api/admin/media/sign/route.ts for why it does not pass through the
 * site's own server.
 */
export async function uploadFile(original: File): Promise<MediaItem> {
    let file = original;
    let width: number | undefined;
    let height: number | undefined;

    if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
        try {
            const bitmap = await createImageBitmap(file);
            width = bitmap.width;
            height = bitmap.height;
            const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
            if (scale < 1 || file.size > 1.5 * 1024 * 1024) {
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(width * scale);
                canvas.height = Math.round(height * scale);
                canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp', 0.86));
                // Some browsers cannot encode WebP and silently hand back a
                // PNG; only use the result if it really is WebP and smaller.
                if (blob && blob.type === 'image/webp' && blob.size < file.size) {
                    file = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
                    width = canvas.width;
                    height = canvas.height;
                }
            }
            bitmap.close();
        } catch {
            // Undecodable here - upload the original and let the server judge it.
        }
    }

    const signed = await api<{ bucket: string; path: string; token: string; mime: string }>('/api/admin/media/sign', {
        method: 'POST',
        body: { filename: file.name, size: file.size },
    });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Uploads need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to be set.');
    const storage = createClient(url, key, { auth: { persistSession: false } }).storage;

    // Re-wrap with the server-decided MIME type: browsers report fonts as ""
    // or vendor types, which the bucket's type allow-list would reject.
    const typed = new File([file], file.name, { type: signed.mime });
    const { error } = await storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, typed);
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { item } = await api<{ item: MediaItem }>('/api/admin/media/complete', {
        method: 'POST',
        body: { path: signed.path, name: original.name, width, height },
    });
    return item;
}

export const ACCEPT = {
    image: '.jpg,.jpeg,.png,.webp,.gif,.avif',
    video: '.mp4,.webm',
    font: '.woff2,.woff,.ttf,.otf',
} as const;

export function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / 1048576).toFixed(1)} MB`;
}
