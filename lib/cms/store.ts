/**
 * Reading published (and, for the signed-in editor, draft) content.
 * Server only - imported by layouts, pages and route handlers.
 */
import { cache } from 'react';
import { cookies, draftMode } from 'next/headers';
import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';
import { normalizeAll } from './content';
import type { SiteContent } from './schema';

/**
 * Errors that mean "the CMS tables have not been created yet", as opposed to
 * "the database is unreachable".
 *
 * The first renders the built-in defaults, so the site keeps working on a
 * Supabase project where the migration has not been run.
 *
 * The second THROWS, deliberately. At build time that stops a deploy from
 * baking the defaults over the client's published content; at runtime Next
 * keeps serving the last good cached page when a revalidation throws, which
 * is exactly what should happen if Supabase blips.
 */
export function isMissingTable(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;
    return ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(error.code ?? '')
        || /does not exist|could not find the (table|function)/i.test(error.message ?? '');
}

type Rows = Record<string, unknown>;

async function readPublished(): Promise<Rows> {
    const { data, error } = await createPublicClient().from('cms_published').select('key, data');
    if (error) {
        if (isMissingTable(error)) {
            console.warn('[cms] cms_published table not found - rendering built-in content. Run supabase/migrations/*_cms.sql.');
            return {};
        }
        throw new Error(`[cms] Could not load site content: ${error.message}`);
    }
    return Object.fromEntries((data ?? []).map(r => [r.key, r.data]));
}

async function readDrafts(): Promise<Rows> {
    const { data, error } = await createAdminClient().from('cms_drafts').select('key, data');
    if (error) {
        if (isMissingTable(error)) return {};
        throw new Error(`[cms] Could not load drafts: ${error.message}`);
    }
    return Object.fromEntries((data ?? []).map(r => [r.key, r.data]));
}

/**
 * The content for this request. Drafts are layered over published content
 * only when Draft Mode is on AND the request carries a valid admin session -
 * the Draft Mode cookie alone is not enough, since it outlives a sign-out.
 *
 * `cookies()` is only touched inside the Draft Mode branch: calling it
 * unconditionally would make every public page dynamic.
 */
export const getSiteContent = cache(async (): Promise<{ content: SiteContent; preview: boolean }> => {
    const { isEnabled } = await draftMode();
    let preview = false;
    if (isEnabled) {
        const jar = await cookies();
        preview = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
    }
    const published = await readPublished();
    const drafts = preview ? await readDrafts() : {};
    return { content: normalizeAll({ ...published, ...drafts }), preview };
});

/** Published content only - for robots.txt and the sitemap. */
export async function getPublishedContent(): Promise<SiteContent> {
    return normalizeAll(await readPublished());
}
