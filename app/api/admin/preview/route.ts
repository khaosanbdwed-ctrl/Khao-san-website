import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Turns on Draft Mode for this browser and opens a page, so the editor sees
 * the site with their unpublished changes. Behind the admin login (proxy.ts
 * covers /api/admin), which is what stands in for the shared secret Next's
 * draft-mode guide uses for external CMSs.
 *
 * `path` is checked to be a path on THIS site - a bare `//evil.example`
 * would otherwise be an open redirect.
 */
export async function GET(request: Request) {
    const raw = new URL(request.url).searchParams.get('path') || '/';
    const path = raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\') ? raw : '/';
    (await draftMode()).enable();
    redirect(path);
}
