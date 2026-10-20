import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

/**
 * Gate for /admin pages and /api/admin endpoints.
 *
 * ⚠ This used to accept any request whose session cookie held the literal
 * text "authenticated" - a value anyone could set in their own browser. The
 * cookie is now a signed, expiring token (lib/auth/session.ts). Every admin
 * route handler re-checks it as well (lib/auth/guard.ts), so this is not the
 * only line of defence.
 *
 * (Next.js 16 renamed `middleware.ts` to `proxy.ts`; it runs on Node.js.)
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (pathname === '/admin/login') return NextResponse.next();

    if (!verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
        if (pathname.startsWith('/api/admin')) {
            return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
        }
        const loginUrl = new URL('/admin/login', request.url);
        if (pathname !== '/admin') loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
