import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

/**
 * Renamed from `middleware.ts` — Next.js 16 deprecated the `middleware` file
 * convention in favour of `proxy`. Same behaviour, same matcher.
 *
 * Guards every dashboard page and admin API:
 *  - the session cookie must carry a valid signature and be unexpired
 *    (lib/auth/session.ts) - it used to be the forgeable string
 *    "authenticated";
 *  - writes must come from this site. The cookie is SameSite=Lax, which
 *    already keeps it off cross-site POSTs; checking Origin as well closes
 *    the gap for older browsers and for same-site-but-other-subdomain pages.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow access to login page
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    const isAdminApi = pathname.startsWith('/api/admin');
    const valid = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!valid) {
        if (isAdminApi) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Redirect to login if not authenticated
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (isAdminApi && !['GET', 'HEAD'].includes(request.method)) {
        const origin = request.headers.get('origin');
        if (origin && origin !== request.nextUrl.origin) {
            return NextResponse.json({ error: 'Cross-site request refused.' }, { status: 403 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
