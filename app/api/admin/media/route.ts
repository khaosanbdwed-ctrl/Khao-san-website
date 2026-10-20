import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MEDIA_BUCKET as BUCKET, ensureBucket } from '@/lib/cms/bucket';

/**
 * The website media library - photos and videos for every CMS section, in the
 * public `site-media` Storage bucket (created on first use - see
 * lib/cms/bucket.ts).
 *
 *   GET                         list uploaded files, newest first
 *   POST { name, type, size }   get a signed upload URL for one file
 *   DELETE { path }             remove a file
 *
 * ⚠ UPLOADS DO NOT PASS THROUGH THIS SERVER. A serverless function on Vercel
 * accepts request bodies up to ~4.5 MB, and a background video is tens of MB.
 * So this route only checks the file's declared type and size and hands back
 * a short-lived signed URL; the browser then sends the bytes straight to
 * Supabase. The bucket's own allowed types and size limit (set when
 * it is created) enforce the same rules on the Supabase side.
 */

const TYPES: Record<string, { ext: string; kind: 'images' | 'videos'; max: number }> = {
    'image/jpeg': { ext: 'jpg', kind: 'images', max: 10 * 1024 * 1024 },
    'image/png': { ext: 'png', kind: 'images', max: 10 * 1024 * 1024 },
    'image/webp': { ext: 'webp', kind: 'images', max: 10 * 1024 * 1024 },
    'image/avif': { ext: 'avif', kind: 'images', max: 10 * 1024 * 1024 },
    'image/gif': { ext: 'gif', kind: 'images', max: 10 * 1024 * 1024 },
    'video/mp4': { ext: 'mp4', kind: 'videos', max: 50 * 1024 * 1024 },
    'video/webm': { ext: 'webm', kind: 'videos', max: 50 * 1024 * 1024 },
};

const mb = (n: number) => `${Math.round(n / 1048576)} MB`;

function safeName(original: string, ext: string) {
    const base = original.replace(/\.[^.]*$/, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'file';
    // Never trust the uploaded name to be unique: a collision would silently
    // replace a photo that another section is still using.
    return `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${ext}`;
}

export async function GET() {
    try {
        await ensureBucket(BUCKET);
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
    const supabase = createAdminClient();
    const storage = supabase.storage.from(BUCKET);
    const lists = await Promise.all((['images', 'videos'] as const).map(async kind => {
        const { data, error } = await storage.list(kind, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });
        if (error) throw new Error(error.message);
        return (data ?? [])
            .filter(f => f.id && !f.name.startsWith('.'))
            .map(f => {
                const path = `${kind}/${f.name}`;
                return {
                    path,
                    kind: kind === 'images' ? 'image' : 'video',
                    name: f.name,
                    size: (f.metadata as { size?: number } | null)?.size ?? null,
                    createdAt: f.created_at,
                    url: storage.getPublicUrl(path).data.publicUrl,
                };
            });
    })).catch((e: Error) => e);

    if (lists instanceof Error) {
        return NextResponse.json({ error: lists.message }, { status: 500 });
    }
    const files = lists.flat().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    return NextResponse.json({ files });
}

export async function POST(request: Request) {
    let body: { name?: unknown; type?: unknown; size?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    const type = typeof body.type === 'string' ? body.type : '';
    const size = typeof body.size === 'number' ? body.size : NaN;
    const rule = TYPES[type];
    if (!rule) {
        return NextResponse.json(
            { error: 'That file type is not supported. Use JPG, PNG, WebP, AVIF or GIF for photos, and MP4 or WebM for videos.' },
            { status: 415 },
        );
    }
    if (!Number.isFinite(size) || size <= 0) {
        return NextResponse.json({ error: 'The file is empty.' }, { status: 400 });
    }
    if (size > rule.max) {
        return NextResponse.json(
            { error: `This file is ${mb(size)}. The limit is ${mb(rule.max)} for ${rule.kind === 'videos' ? 'videos' : 'photos'}${rule.kind === 'videos' ? ' - export a shorter or lower-resolution version (720p is plenty for a background)' : ''}.` },
            { status: 413 },
        );
    }

    const path = `${rule.kind}/${safeName(typeof body.name === 'string' ? body.name : 'file', rule.ext)}`;
    try {
        await ensureBucket(BUCKET);
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
    const storage = createAdminClient().storage.from(BUCKET);
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) {
        return NextResponse.json({ error: error?.message || 'Could not start the upload.' }, { status: 500 });
    }
    return NextResponse.json({
        path,
        token: data.token,
        publicUrl: storage.getPublicUrl(path).data.publicUrl,
    });
}

export async function DELETE(request: Request) {
    let body: { path?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    const path = typeof body.path === 'string' ? body.path : '';
    if (!/^(images|videos)\/[a-z0-9.-]+$/.test(path)) {
        return NextResponse.json({ error: 'Invalid file.' }, { status: 400 });
    }
    const { error } = await createAdminClient().storage.from(BUCKET).remove([path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
