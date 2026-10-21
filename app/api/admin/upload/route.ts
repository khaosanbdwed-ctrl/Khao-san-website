import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DISH_BUCKET as BUCKET, ensureBucket } from '@/lib/cms/bucket';
import { requireAdmin } from '@/lib/auth/require-admin';

/**
 * Dish photos for Menu Control.
 *
 * The client uploads each dish as a background-removed cut-out. The dashboard
 * plates it in the browser (components/admin/plate-dish.ts) - the same warm
 * ground, contact shadow and framing as the original 75 dishes - and sends two
 * files: the plated square the menu shows, and the cut-out itself, kept so the
 * dish can be re-plated if the look ever changes.
 *
 *   POST { name, plated: { type, size }, original: { type, size } }
 *     -> short-lived signed upload URLs for both, and the plated file's
 *        public URL (what goes into `menu_items.image_src`).
 *
 * ⚠ THE BYTES DO NOT PASS THROUGH THIS SERVER. A Vercel function accepts at
 * most ~4.5 MB per request, and a full-resolution cut-out is often more. This
 * route checks the declared types and sizes and signs the two paths; the
 * bucket's own allowed types and size limit (lib/cms/bucket.ts) enforce the
 * same rules on Supabase's side.
 */

const PLATED_TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg' };
const ORIGINAL_TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png' };
const MAX_BYTES = 15 * 1024 * 1024;

function safeStem(original: string): string {
    const base = original.replace(/\.[^.]*$/, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'dish';
    // Collisions would silently overwrite another dish's photo, so the stored
    // name is always unique rather than trusting the uploaded filename.
    return `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function declared(v: unknown, types: Record<string, string>): { type: string; ext: string; size: number } | null {
    if (typeof v !== 'object' || !v) return null;
    const { type, size } = v as { type?: unknown; size?: unknown };
    if (typeof type !== 'string' || !types[type]) return null;
    if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0 || size > MAX_BYTES) return null;
    return { type, ext: types[type], size };
}

export async function POST(request: Request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    let body: { name?: unknown; plated?: unknown; original?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const plated = declared(body.plated, PLATED_TYPES);
    const original = declared(body.original, ORIGINAL_TYPES);
    if (!plated || !original) {
        return NextResponse.json(
            { error: 'The photo could not be prepared. Upload a PNG or WebP with the background removed, under 15 MB.' },
            { status: 400 },
        );
    }

    const stem = safeStem(typeof body.name === 'string' ? body.name : 'dish');
    try {
        await ensureBucket(BUCKET);
        const storage = createAdminClient().storage.from(BUCKET);
        const sign = async (path: string) => {
            const { data, error } = await storage.createSignedUploadUrl(path);
            if (error || !data) throw new Error(error?.message || 'Could not start the upload.');
            return { path, token: data.token, publicUrl: storage.getPublicUrl(path).data.publicUrl };
        };
        const [p, o] = await Promise.all([
            sign(`dishes/${stem}.${plated.ext}`),
            sign(`originals/${stem}.${original.ext}`),
        ]);
        return NextResponse.json({ plated: p, original: o, url: p.publicUrl });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message || 'Upload failed.' }, { status: 500 });
    }
}
