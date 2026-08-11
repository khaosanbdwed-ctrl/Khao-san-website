import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'dish-images';
const MAX_BYTES = 5 * 1024 * 1024;

/** The 8-byte PNG signature (ISO 15948). */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * Dish photography is uploaded background-removed, so PNG is not a preference
 * here - it is the only format that carries the alpha channel the floating-dish
 * treatment depends on. A JPEG would render with an opaque box behind it.
 *
 * Format is therefore checked three times, because the first two are trivially
 * forgeable by anyone posting directly to this route:
 *   1. the file picker's `accept` (a hint to the OS dialog, nothing more)
 *   2. the browser-reported MIME type (attacker-controlled)
 *   3. the actual leading bytes of the file  <- the only real check
 * Supabase's own `allowedMimeTypes` on the bucket is a fourth backstop.
 */
function isRealPng(bytes: Uint8Array): boolean {
    if (bytes.length < PNG_MAGIC.length) return false;
    return PNG_MAGIC.every((b, i) => bytes[i] === b);
}

function safeName(original: string): string {
    const base = original.replace(/\.[^.]*$/, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'dish';
    // Collisions would silently overwrite another dish's photo, so the stored
    // name is always unique rather than trusting the uploaded filename.
    return `${base}-${Date.now().toString(36)}.png`;
}

export async function POST(request: Request) {
    try {
        const form = await request.formData();
        const file = form.get('file');

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }
        if (file.size === 0) {
            return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: `Image is ${(file.size / 1048576).toFixed(1)} MB. Maximum is 5 MB.` },
                { status: 413 },
            );
        }

        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!isRealPng(bytes)) {
            return NextResponse.json(
                { error: 'That file is not a PNG. Dish photos must be background-removed PNGs.' },
                { status: 415 },
            );
        }

        const supabase = createAdminClient();
        const path = safeName(file.name || 'dish');

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, bytes, { contentType: 'image/png', upsert: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return NextResponse.json({ success: true, url: data.publicUrl });
    } catch {
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
