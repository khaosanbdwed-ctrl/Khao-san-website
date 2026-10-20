/**
 * Draft / publish / history operations for the admin API. Server only, and
 * always through the service-role client - never import from a component.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { serializeDoc } from './content';
import { DOC_KEYS, type DocKey } from './schema';
import { isMissingTable } from './store';

export class CmsError extends Error {
    constructor(message: string, public status = 500) { super(message); }
}

const SETUP_MESSAGE =
    'The CMS database tables are not set up yet. Run supabase/migrations/20261020000000_cms.sql in the Supabase SQL Editor (see CMS.md).';

function fail(error: { code?: string; message: string } | null): never {
    if (isMissingTable(error)) throw new CmsError(SETUP_MESSAGE, 503);
    throw new CmsError(error?.message ?? 'Database error');
}

/** JSON documents are small; anything this large is a bug or abuse. */
const MAX_DOC_BYTES = 1_000_000;

export interface DocState {
    key: DocKey;
    draft: unknown | null;
    draftUpdatedAt: string | null;
    published: unknown | null;
    publishedAt: string | null;
    revision: number | null;
}

export async function getDocState(key: DocKey): Promise<DocState> {
    const db = createAdminClient();
    const [draft, published] = await Promise.all([
        db.from('cms_drafts').select('data, updated_at').eq('key', key).maybeSingle(),
        db.from('cms_published').select('data, published_at, revision').eq('key', key).maybeSingle(),
    ]);
    if (draft.error) fail(draft.error);
    if (published.error) fail(published.error);
    return {
        key,
        draft: draft.data?.data ?? null,
        draftUpdatedAt: draft.data?.updated_at ?? null,
        published: published.data?.data ?? null,
        publishedAt: published.data?.published_at ?? null,
        revision: published.data?.revision ?? null,
    };
}

export async function listDocStatus() {
    const db = createAdminClient();
    const [drafts, published] = await Promise.all([
        db.from('cms_drafts').select('key, updated_at'),
        db.from('cms_published').select('key, published_at, revision'),
    ]);
    if (drafts.error) fail(drafts.error);
    if (published.error) fail(published.error);
    return DOC_KEYS.map(key => {
        const d = drafts.data?.find(r => r.key === key);
        const p = published.data?.find(r => r.key === key);
        return {
            key,
            hasDraft: !!d,
            draftUpdatedAt: d?.updated_at ?? null,
            publishedAt: p?.published_at ?? null,
            revision: p?.revision ?? null,
        };
    });
}

/**
 * Save a draft. `expectedUpdatedAt` guards against two open editor tabs
 * silently overwriting each other: if the stored draft changed since this
 * editor loaded it, the save is refused and the editor asks to reload.
 */
export async function saveDraft(key: DocKey, data: unknown, expectedUpdatedAt: string | null | undefined) {
    const doc = serializeDoc(key, data);
    if (JSON.stringify(doc).length > MAX_DOC_BYTES) throw new CmsError('This content is too large to save.', 413);

    const db = createAdminClient();
    if (expectedUpdatedAt !== undefined) {
        const { data: current, error } = await db.from('cms_drafts').select('updated_at').eq('key', key).maybeSingle();
        if (error) fail(error);
        const currentAt = current?.updated_at ?? null;
        if (currentAt !== expectedUpdatedAt && !(currentAt && expectedUpdatedAt && Date.parse(currentAt) === Date.parse(expectedUpdatedAt))) {
            throw new CmsError('These changes were edited somewhere else (another tab or device). Reload to see the latest version.', 409);
        }
    }

    const { data: row, error } = await db
        .from('cms_drafts')
        .upsert({ key, data: doc, updated_at: new Date().toISOString() })
        .select('updated_at')
        .single();
    if (error) fail(error);
    return { data: doc, updatedAt: row.updated_at as string };
}

export async function discardDraft(key: DocKey) {
    const { error } = await createAdminClient().from('cms_drafts').delete().eq('key', key);
    if (error) fail(error);
}

export async function publishDoc(key: DocKey, note?: string): Promise<number> {
    const { data, error } = await createAdminClient().rpc('cms_publish', { p_key: key, p_note: note ?? null });
    if (error) {
        if (error.code === 'P0002') throw new CmsError(error.message, 409);
        fail(error);
    }
    return data as number;
}

export async function listRevisions(key: DocKey) {
    const { data, error } = await createAdminClient()
        .from('cms_revisions')
        .select('id, revision, note, created_at')
        .eq('key', key)
        .order('revision', { ascending: false })
        .limit(100);
    if (error) fail(error);
    return data ?? [];
}

/** Copy an old version into the draft, for review before re-publishing. */
export async function restoreRevision(key: DocKey, id: number) {
    const db = createAdminClient();
    const { data, error } = await db.from('cms_revisions').select('data').eq('key', key).eq('id', id).maybeSingle();
    if (error) fail(error);
    if (!data) throw new CmsError('That version no longer exists.', 404);
    return saveDraft(key, data.data, undefined);
}
