import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MEDIA_BUCKET as BUCKET, ensureBucket } from '@/lib/cms/bucket';
import { requireAdmin } from '@/lib/auth/require-admin';

/**
 * The website media library - photos and videos for every CMS section, in the
 * public `site-media` Storage bucket (created on first use - see
 * lib/cms/bucket.ts).
 *
 *   GET                         list uploaded files, newest first
 *   POST { name, type, size }   get a signed upload URL for one file
 *   POST { set: 'video', name, sizes: { large, small, poster } }
 *                               signed URLs for an optimised video's three
 *                               files (lib/media.ts has the naming rule)
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

function safeStem(original: string) {
    const base = original.replace(/\.[^.]*$/, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'file';
    // Never trust the uploaded name to be unique: a collision would silently
    // replace a photo that another section is still using.
    return `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const safeName = (original: string, ext: string) => `${safeStem(original)}.${ext}`;

/** The two companions of an optimised video, hidden from the library list
 *  and deleted with it. */
const COMPANION = /\.(web-sm\.mp4|web\.webp)$/;

export async function GET(request: Request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;
    try {
        await ensureBucket(BUCKET);
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
    const supabase = createAdminClient();
    const storage = supabase.storage.from(BUCKET);
    const lists = await Promise.all((['images', 'videos'] as const).map(async kind => {
        // Paged, so the library still lists everything after years of uploads
        // (a single list call returns at most 1000 entries).
        const data: Awaited<ReturnType<typeof storage.list>>['data'] = [];
        for (let offset = 0; offset < 20000; offset += 1000) {
            const { data: page, error } = await storage.list(kind, { limit: 1000, offset, sortBy: { column: 'created_at', order: 'desc' } });
            if (error) throw new Error(error.message);
            data!.push(...(page ?? []));
            if (!page || page.length < 1000) break;
        }
        return (data ?? [])
            .filter(f => f.id && !f.name.startsWith('.') && !COMPANION.test(f.name))
            .map(f => {
                const path = `${kind}/${f.name}`;
                const optimised = f.name.endsWith('.web.mp4');
                return {
                    path,
                    kind: kind === 'images' ? 'image' : 'video',
                    name: f.name,
                    size: (f.metadata as { size?: number } | null)?.size ?? null,
                    createdAt: f.created_at,
                    url: storage.getPublicUrl(path).data.publicUrl,
                    optimised,
                    poster: optimised ? storage.getPublicUrl(path.replace(/\.web\.mp4$/, '.web.webp')).data.publicUrl : null,
                };
            });
    })).catch((e: Error) => e);

    if (lists instanceof Error) {
        return NextResponse.json({ error: lists.message }, { status: 500 });
    }
    const files = lists.flat().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    return NextResponse.json({ files });
}

async function sign(path: string) {
    const storage = createAdminClient().storage.from(BUCKET);
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) throw new Error(error?.message || 'Could not start the upload.');
    return { path, token: data.token, publicUrl: storage.getPublicUrl(path).data.publicUrl };
}

async function signVideoSet(name: string, sizes: unknown) {
    const s = (typeof sizes === 'object' && sizes ? sizes : {}) as Record<string, unknown>;
    const limits = { large: TYPES['video/mp4'].max, small: TYPES['video/mp4'].max, poster: TYPES['image/webp'].max };
    for (const [k, max] of Object.entries(limits)) {
        const n = s[k];
        if (typeof n !== 'number' || !(n > 0)) return NextResponse.json({ error: 'The optimised video is empty.' }, { status: 400 });
        if (n > max) return NextResponse.json({ error: `The optimised video is still ${mb(n)} - try a shorter clip.` }, { status: 413 });
    }
    const stem = `videos/${safeStem(name)}`;
    try {
        await ensureBucket(BUCKET);
        const [large, small, poster] = await Promise.all([
            sign(`${stem}.web.mp4`), sign(`${stem}.web-sm.mp4`), sign(`${stem}.web.webp`),
        ]);
        return NextResponse.json({ large, small, poster, publicUrl: large.publicUrl });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;
    let body: { name?: unknown; type?: unknown; size?: unknown; set?: unknown; sizes?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    if (body.set === 'video') {
        return signVideoSet(typeof body.name === 'string' ? body.name : 'video', body.sizes);
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
        return NextResponse.json(await sign(path));
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;
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
    const paths = path.endsWith('.web.mp4')
        ? [path, path.replace(/\.web\.mp4$/, '.web-sm.mp4'), path.replace(/\.web\.mp4$/, '.web.webp')]
        : [path];
    const { error } = await createAdminClient().storage.from(BUCKET).remove(paths);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
