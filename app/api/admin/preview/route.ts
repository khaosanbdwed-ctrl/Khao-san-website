import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';

/**
 * Turns on Draft Mode for this browser and opens a page, so the editor sees
 * the site with their unpublished changes. Behind the admin login (proxy.ts
 * covers /api/admin), which is what stands in for the shared secret Next's
 * draft-mode guide uses for external CMSs.
 *
 * `path` is resolved against this site and only its path, query and hash are
 * kept, so no spelling of another host (`//evil.example`, `/\evil`, `/.//evil`, tabs or
 * newlines that browsers strip) can turn this into an open redirect.
 */
export async function GET(request: Request) {
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const here = new URL(request.url);
    const raw = here.searchParams.get('path') || '/';
    let path = '/';
    try {
        const target = new URL(raw, here.origin);
        // URL() normalises `/.//evil` to the pathname `//evil`, which a browser
        // would read as another host - so the normalised path is checked too.
        if (target.origin === here.origin && !/[\\\s]/.test(raw) && !target.pathname.startsWith('//')) {
            path = `${target.pathname}${target.search}${target.hash}`;
        }
    } catch { /* keep '/' */ }
    (await draftMode()).enable();
    redirect(path);
}
