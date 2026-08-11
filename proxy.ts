import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Renamed from `middleware.ts` — Next.js 16 deprecated the `middleware` file
 * convention in favour of `proxy`. Same behaviour, same matcher.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin pages and /api/admin endpoints
    const isAdminPage = pathname.startsWith('/admin');
    const isAdminApi = pathname.startsWith('/api/admin');

    if (isAdminPage || isAdminApi) {
        // Allow access to login page
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for session cookie
        const session = request.cookies.get('khao_san_admin_session');

        if (!session || session.value !== 'authenticated') {
            if (isAdminApi) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // Redirect to login if not authenticated
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
