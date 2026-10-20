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
 *   site-media   (public)   images/*, videos/*      uploaded photos and films
 *   dish-images  (public)   menu dish photos (Menu Control)
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
    [DISH_BUCKET]: { public: true, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: ['image/png'] },
};

export const isNotFound = (e: { message?: string; statusCode?: string; status?: number } | null | undefined) =>
    Boolean(e && (/not.?found/i.test(e.message ?? '') || e.statusCode === '404' || e.status === 404));

const ensured = new Set<string>();

/** Create the bucket if it does not exist yet. Cheap after the first call. */
export async function ensureBucket(name: string) {
    if (ensured.has(name)) return;
    const storage = createAdminClient().storage;
    const { error } = await storage.getBucket(name);
    if (error) {
        if (!isNotFound(error)) throw new Error(`Storage is unavailable: ${error.message}`);
        const { error: createError } = await storage.createBucket(name, BUCKETS[name]);
        if (createError && !/already exists/i.test(createError.message)) {
            throw new Error(`Could not create the "${name}" storage bucket: ${createError.message}`);
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
    await ensureBucket(CONTENT_BUCKET);
    const { error } = await createAdminClient().storage
        .from(CONTENT_BUCKET)
        .upload(path, JSON.stringify(value), { contentType: 'application/json', upsert: true, cacheControl: '0' });
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
