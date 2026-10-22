import { createAdminClient } from '@/lib/supabase/admin';
import { DISH_BUCKET, listNames, readJson, writeJson } from '@/lib/cms/bucket';
import { DOC_KEYS } from '@/lib/cms/registry';

/**
 * Removes dish photos nobody uses any more from the `dish-images` bucket.
 *
 * Every dish upload stores two files under one stem (app/api/admin/upload):
 * `dishes/<stem>.webp`, the plated photo the menu shows, and
 * `originals/<stem>.png|webp`, the background-removed cut-out. Replacing a
 * dish's photo, deleting a dish, or uploading in the form and then cancelling
 * leaves both behind, and the cut-outs are large (up to 15 MB).
 *
 * ⚠ THIS IS A SWEEP WITH A GRACE PERIOD, NOT "DELETE THE OLD PHOTO ON SAVE".
 * Deleting at the moment of the edit was rejected because:
 *   - the same URL can be in use elsewhere - another dish, or pasted into a
 *     Website Content field (any https URL is accepted there), including a
 *     draft or a saved version that can still be restored;
 *   - cached pages keep pointing at the old photo until they are refreshed;
 *   - a mistaken replacement could not be undone, and the cut-out is the part
 *     that is costly to redo;
 *   - it never catches uploads abandoned in the form.
 * So, at most once a day and after a menu write has already been answered:
 *   1. list every file in the bucket;
 *   2. collect every reference - all `menu_items.image_src`, and the text of
 *      every Website Content draft, published document and saved version;
 *   3. a file no reference mentions is noted with the time it was first seen
 *      unused; once it has stayed unused for the whole grace period (14 days)
 *      it is deleted, with its twin. Used again in the meantime -> forgotten.
 * Safety valves: any read that fails aborts the run without deleting
 * anything (deciding on partial knowledge is how a sweep deletes live
 * photos), and a run that would delete more than half the bucket is refused
 * as a probable bug and logged instead.
 *
 * Built-in photos under /public are never touched: they are not in the
 * bucket, they live in git.
 *
 * State, in the private site-content bucket (lib/cms/bucket.ts):
 *   dish-photos/sweep.json   { lastRunAt, unusedSince: { <path>: iso } }
 */

const STATE_FILE = 'dish-photos/sweep.json';
const HOUR = 60 * 60 * 1000;
/** Overridable so the QA suite can run a sweep without waiting two weeks. */
const GRACE_MS = hours(process.env.DISH_PHOTO_GRACE_HOURS, 14 * 24) * HOUR;
const INTERVAL_MS = hours(process.env.DISH_PHOTO_SWEEP_INTERVAL_HOURS, 24) * HOUR;
const FOLDERS = ['dishes', 'originals'] as const;

type State = { lastRunAt: string | null; unusedSince: Record<string, string> };
type StoredFile = { path: string; createdAt: number };

function hours(v: string | undefined, fallback: number) {
    const n = Number(v);
    return v !== undefined && v !== '' && Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** `dishes/pad-thai-abc.webp` -> `pad-thai-abc` */
const stemOf = (path: string) => path.slice(path.indexOf('/') + 1).replace(/\.[^.]*$/, '');

async function listFolder(folder: string): Promise<StoredFile[]> {
    const storage = createAdminClient().storage.from(DISH_BUCKET);
    const out: StoredFile[] = [];
    for (let offset = 0; ; offset += 1000) {
        const { data, error } = await storage.list(folder, { limit: 1000, offset });
        if (error) {
            if (/not.?found/i.test(error.message)) return out; // no uploads yet
            throw new Error(`Could not list ${folder}: ${error.message}`);
        }
        for (const f of data ?? []) {
            if (!f.id) continue; // a sub-folder
            out.push({ path: `${folder}/${f.name}`, createdAt: Date.parse(f.created_at ?? '') || Date.now() });
        }
        if ((data ?? []).length < 1000) return out;
    }
}

/** Everything that can point at a dish photo, as one searchable string. */
async function collectReferences(): Promise<string> {
    const { data: items, error } = await createAdminClient().from('menu_items').select('image_src');
    if (error) throw new Error(`Could not read the menu: ${error.message}`);
    // An empty result is far more likely a misconfiguration than a menu with
    // no dishes; sweeping on it would delete every photo.
    if (!items?.length) throw new Error('The menu came back empty.');

    const docPaths = (await Promise.all(DOC_KEYS.map(async key => [
        `${key}/draft.json`,
        `${key}/published.json`,
        ...(await listNames(`${key}/versions`)).map(name => `${key}/versions/${name}`),
    ]))).flat();
    const docs = await Promise.all(docPaths.map(path => readJson(path)));

    return [...items.map(i => i.image_src ?? ''), ...docs.map(d => (d ? JSON.stringify(d) : ''))].join('\n');
}

export async function sweepDishPhotos(now = Date.now()) {
    try {
        const state: State = (await readJson<State>(STATE_FILE)) ?? { lastRunAt: null, unusedSince: {} };
        if (state.lastRunAt && now - Date.parse(state.lastRunAt) < INTERVAL_MS) return;
        // Claim the run first, so saves arriving together do not all sweep.
        await writeJson(STATE_FILE, { ...state, lastRunAt: new Date(now).toISOString() });

        const files = (await Promise.all(FOLDERS.map(listFolder))).flat();
        if (!files.length) return;
        const refs = await collectReferences();

        // A plated photo and its cut-out are kept or removed together: the
        // pair is in use when either file is mentioned anywhere.
        const usedStems = new Set(files.filter(f => refs.includes(`${DISH_BUCKET}/${f.path}`)).map(f => stemOf(f.path)));

        const unusedSince: Record<string, string> = {};
        const expired: string[] = [];
        for (const f of files) {
            if (usedStems.has(stemOf(f.path))) continue;
            // Too new to judge - most likely a dish still being filled in.
            if (now - f.createdAt < GRACE_MS) continue;
            const since = state.unusedSince[f.path] ?? new Date(now).toISOString();
            if (now - Date.parse(since) >= GRACE_MS) expired.push(f.path);
            else unusedSince[f.path] = since;
        }

        if (expired.length > Math.max(10, files.length / 2)) {
            console.warn(`[dish-photos] refusing to delete ${expired.length} of ${files.length} files in one run; check the references.`);
            await writeJson(STATE_FILE, { lastRunAt: new Date(now).toISOString(), unusedSince: { ...unusedSince, ...state.unusedSince } });
            return;
        }

        const storage = createAdminClient().storage.from(DISH_BUCKET);
        for (let i = 0; i < expired.length; i += 100) {
            const batch = expired.slice(i, i + 100);
            const { error } = await storage.remove(batch);
            // Not removed -> keep their dates, so the next run retries.
            if (error) {
                console.warn(`[dish-photos] could not delete ${batch.length} files: ${error.message}`);
                for (const p of batch) unusedSince[p] = state.unusedSince[p] ?? new Date(now).toISOString();
            }
        }
        if (expired.length) console.info(`[dish-photos] removed ${expired.length} unused files: ${expired.join(', ')}`);

        await writeJson(STATE_FILE, { lastRunAt: new Date(now).toISOString(), unusedSince } satisfies State);
    } catch (e) {
        // Housekeeping only: never surface to the person saving a dish.
        console.warn(`[dish-photos] sweep skipped: ${(e as Error).message}`);
    }
}
