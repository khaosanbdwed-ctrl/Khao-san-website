/**
 * Document-level normalization and versioning. Isomorphic: runs on the server
 * when pages render and in the browser for the editor and the live preview.
 */
import { normalizeFields } from './fields';
import { DOC_FIELDS, DOC_KEYS, type DocKey, type SiteContent } from './schema';

/**
 * Bump this, and add an entry to MIGRATIONS, only when a field is RENAMED or
 * its meaning changes. Adding or removing fields needs no migration - see the
 * header of lib/cms/fields.ts.
 */
export const CONTENT_VERSION = 1;

type Doc = Record<string, unknown>;

/** MIGRATIONS[n] upgrades a document stored at version n to version n + 1. */
const MIGRATIONS: Record<number, (key: DocKey, data: Doc) => Doc> = {
    // Example for the future:
    // 1: (key, data) => key === 'site' ? { ...data, phone: data.whatsapp } : data,
};

function migrate(key: DocKey, data: unknown): unknown {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return data;
    let doc = data as Doc;
    let version = typeof doc._v === 'number' ? doc._v : 1;
    while (version < CONTENT_VERSION) {
        const step = MIGRATIONS[version];
        if (step) doc = step(key, doc);
        version++;
    }
    return doc;
}

export function normalizeDoc<K extends DocKey>(key: K, data: unknown): SiteContent[K] {
    return normalizeFields(DOC_FIELDS[key], migrate(key, data)) as SiteContent[K];
}

/** What is written to the database: normalized, stamped with its version. */
export function serializeDoc<K extends DocKey>(key: K, data: unknown): Doc {
    return { _v: CONTENT_VERSION, ...normalizeDoc(key, data) };
}

export function normalizeAll(stored: Partial<Record<string, unknown>>): SiteContent {
    const out = {} as Record<DocKey, unknown>;
    for (const key of DOC_KEYS) out[key] = normalizeDoc(key, stored[key]);
    return out as SiteContent;
}

export function defaultContent(): SiteContent {
    return normalizeAll({});
}
