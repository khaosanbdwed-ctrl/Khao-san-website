import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Supabase Storage, used as the CMS's database.
 *
 * Why Storage and not tables: tables need SQL run by hand in the Supabase
 * dashboard before anything works, and Supabase's API cannot create them.
 * Buckets it CAN create, with the service key the site already has - so the
 * CMS sets itself up on first use and needs nothing beyond the environment
 * variables the menu already uses. A handful of small JSON documents is
 * exactly what object storage is good at.
 *
 *   site-content (PRIVATE)  <area>/published.json   what the public sees
 *                           <area>/draft.json       unpublished edits
 *                           <area>/versions/*.json  every past publish
 *                           security/login/*.json   failed sign-in counters
 *                           menu-visibility/hidden.json  dishes hidden from /menu
 *                           dish-photos/sweep.json  unused-photo sweep (lib/dish-photo-sweep.ts)
 *   site-media   (public)   images/*, videos/*      uploaded photos and films
 *   dish-images  (public)   dishes/*     plated dish photos the menu shows
 *                           originals/*  the background-removed cut-outs
 *                           (Menu Control - see app/api/admin/upload)
 *
 * site-content is private, so drafts and the login counters can only be read
 * with the service key - never from the browser.
 */

export const CONTENT_BUCKET = 'site-content';
export const MEDIA_BUCKET = 'site-media';
export const DISH_BUCKET = 'dish-images';

const BUCKETS: Record<string, { public: boolean; fileSizeLimit: number; allowedMimeTypes: string[] }> = {
    [CONTENT_BUCKET]: { public: false, fileSizeLimit: 2 * 1024 * 1024, allowedMimeTypes: ['application/json'] },
    [MEDIA_BUCKET]: {
        public: true,
        // 50 MB is the Supabase free-plan ceiling per file.
        fileSizeLimit: 50 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm'],
    },
    [DISH_BUCKET]: { public: true, fileSizeLimit: 15 * 1024 * 1024, allowedMimeTypes: ['image/png', 'image/webp', 'image/jpeg'] },
};

const sameList = (a: string[] | null | undefined, b: string[]) =>
    Boolean(a) && a!.length === b.length && b.every(x => a!.includes(x));

export const isNotFound = (e: { message?: string; statusCode?: string; status?: number } | null | undefined) =>
    Boolean(e && (/not.?found/i.test(e.message ?? '') || e.statusCode === '404' || e.status === 404));

const ensured = new Set<string>();

/**
 * Create the bucket if it does not exist yet, and bring an existing one back
 * to the settings above if they have drifted - most importantly, a
 * `site-content` bucket switched to public in the Supabase dashboard (which
 * would publish every draft) is made private again. Cheap after the first call.
 */
export async function ensureBucket(name: string) {
    if (ensured.has(name)) return;
    const want = BUCKETS[name];
    const storage = createAdminClient().storage;
    const { data, error } = await storage.getBucket(name);
    if (error) {
        if (!isNotFound(error)) throw new Error(`Storage is unavailable: ${error.message}`);
        const { error: createError } = await storage.createBucket(name, want);
        if (createError && !/already exists/i.test(createError.message)) {
            throw new Error(`Could not create the "${name}" storage bucket: ${createError.message}`);
        }
    } else if (
        data.public !== want.public ||
        (data.file_size_limit ?? null) !== want.fileSizeLimit ||
        !sameList(data.allowed_mime_types, want.allowedMimeTypes)
    ) {
        const { error: updateError } = await storage.updateBucket(name, want);
        if (updateError) {
            // A private bucket that cannot be made private must not be used.
            if (!want.public && data.public) throw new Error(`The "${name}" storage bucket is public and could not be made private: ${updateError.message}`);
            console.warn(`[cms] could not update the "${name}" bucket settings: ${updateError.message}`);
        }
    }
    ensured.add(name);
}

/** null when the file (or the whole bucket) does not exist yet. */
export async function readJson<T = unknown>(path: string): Promise<T | null> {
    const { data, error } = await createAdminClient().storage
        .from(CONTENT_BUCKET)
        // A fresh nonce per read: these documents change, and nothing between
        // here and Supabase may serve a stale copy.
        .download(path, { cacheNonce: String(Date.now()) });
    if (error) {
        if (isNotFound(error as never)) return null;
        throw new Error(`Could not read ${path}: ${error.message}`);
    }
    return JSON.parse(await data.text()) as T;
}

export async function writeJson(path: string, value: unknown) {
    const upload = async () => {
        await ensureBucket(CONTENT_BUCKET);
        return createAdminClient().storage
            .from(CONTENT_BUCKET)
            .upload(path, JSON.stringify(value), { contentType: 'application/json', upsert: true, cacheControl: '0' });
    };
    let { error } = await upload();
    // The bucket was deleted while this server was running (ensureBucket
    // remembers it as present): forget that and create it again, once.
    if (error && /bucket not found/i.test(error.message)) {
        ensured.delete(CONTENT_BUCKET);
        ({ error } = await upload());
    }
    if (error) throw new Error(`Could not save ${path}: ${error.message}`);
}

export async function removeFiles(paths: string[]) {
    if (!paths.length) return;
    const { error } = await createAdminClient().storage.from(CONTENT_BUCKET).remove(paths);
    if (error && !isNotFound(error as never)) throw new Error(error.message);
}

/** File names in one folder, newest first by name. */
export async function listNames(folder: string): Promise<string[]> {
    const { data, error } = await createAdminClient().storage
        .from(CONTENT_BUCKET)
        .list(folder, { limit: 1000, sortBy: { column: 'name', order: 'desc' } });
    if (error) {
        if (isNotFound(error as never)) return [];
        throw new Error(error.message);
    }
    return (data ?? []).filter(f => f.id && f.name.endsWith('.json')).map(f => f.name);
}
