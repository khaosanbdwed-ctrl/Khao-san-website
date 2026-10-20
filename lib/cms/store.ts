import { revalidatePath } from 'next/cache';
import { listNames, readJson, removeFiles, writeJson } from './bucket';
import { DOC_KEYS, normalizeDoc, type DocKey, type SiteContent } from './registry';

/**
 * Dashboard-side reads and writes of site content (service key, server only).
 *
 * Lifecycle of one area - the files live in the private `site-content`
 * bucket, see lib/cms/bucket.ts:
 *   save     -> <area>/draft.json holds the full edited document. The public
 *               site is untouched; Preview shows it.
 *   publish  -> <area>/published.json = the draft, a copy goes into
 *               <area>/versions/, and the draft is removed.
 *   discard  -> the draft is removed; the editor shows what is live again.
 *   restore  -> an old version is copied into the draft. It still has to be
 *               published, so a restore can be previewed first.
 */

/** Versions kept per area. Older ones are deleted on publish. */
const KEEP_VERSIONS = 40;

type Stored = { data: unknown; savedAt: string };

const draftPath = (key: DocKey) => `${key}/draft.json`;
export const publishedPath = (key: DocKey) => `${key}/published.json`;
const versionsDir = (key: DocKey) => `${key}/versions`;

export interface DocState<K extends DocKey = DocKey> {
    key: K;
    /** What the editor should show: the draft if there is one, else live. */
    content: SiteContent[K];
    published: SiteContent[K];
    hasDraft: boolean;
    /** Never published - the site is showing the built-in content. */
    neverPublished: boolean;
    updatedAt: string | null;
    publishedAt: string | null;
}

export async function getDocState<K extends DocKey>(key: K): Promise<DocState<K>> {
    const [draft, live] = await Promise.all([readJson<Stored>(draftPath(key)), readJson<Stored>(publishedPath(key))]);
    const published = normalizeDoc(key, live?.data ?? null);
    return {
        key,
        content: draft ? normalizeDoc(key, draft.data) : published,
        published,
        hasDraft: Boolean(draft),
        neverPublished: !live,
        updatedAt: draft?.savedAt ?? live?.savedAt ?? null,
        publishedAt: live?.savedAt ?? null,
    };
}

export async function saveDraft(key: DocKey, input: unknown) {
    await writeJson(draftPath(key), { data: normalizeDoc(key, input), savedAt: new Date().toISOString() });
}

/** Every page reads every area (the header and footer are on all of them),
 *  so a publish refreshes the whole site. */
function refreshSite() {
    revalidatePath('/', 'layout');
}

/** Sortable and safe as a file name: 2026-10-20T18-42-25-978Z.json */
const versionName = (iso: string) => `${iso.replace(/[:.]/g, '-')}.json`;

export async function publish(key: DocKey) {
    const [draft, live] = await Promise.all([readJson<Stored>(draftPath(key)), readJson<Stored>(publishedPath(key))]);
    // Publishing with no draft re-publishes what is live - or, for an area
    // never saved, freezes the built-in content as version one.
    const data = normalizeDoc(key, draft?.data ?? live?.data ?? null);
    const savedAt = new Date().toISOString();
    const record = { data, savedAt };

    await writeJson(publishedPath(key), record);
    await writeJson(`${versionsDir(key)}/${versionName(savedAt)}`, record);
    await removeFiles([draftPath(key)]);

    const names = await listNames(versionsDir(key));
    await removeFiles(names.slice(KEEP_VERSIONS).map(n => `${versionsDir(key)}/${n}`));

    refreshSite();
}

export async function discardDraft(key: DocKey) {
    await removeFiles([draftPath(key)]);
}

/** `id` is the file name; its timestamp is recovered for display. */
export async function listVersions(key: DocKey) {
    const names = await listNames(versionsDir(key));
    return names.slice(0, KEEP_VERSIONS).map(id => {
        const m = id.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z\.json$/);
        return { id, publishedAt: m ? `${m[1]}T${m[2]}:${m[3]}:${m[4]}.${m[5]}Z` : null };
    });
}

export async function restoreVersion(key: DocKey, id: string) {
    if (!/^[\w-]+\.json$/.test(id)) throw new Error('Invalid version.');
    const version = await readJson<Stored>(`${versionsDir(key)}/${id}`);
    if (!version) throw new Error('That version no longer exists.');
    await saveDraft(key, version.data);
}

/** Dashboard overview: which areas have unpublished changes. */
export async function listStatus() {
    return Promise.all(DOC_KEYS.map(async key => {
        const [draft, live] = await Promise.all([readJson<Stored>(draftPath(key)), readJson<Stored>(publishedPath(key))]);
        return { key, hasDraft: Boolean(draft), publishedAt: live?.savedAt ?? null, updatedAt: draft?.savedAt ?? live?.savedAt ?? null };
    }));
}
