import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './session';

/**
 * Authorisation inside each admin route handler and admin page, in addition
 * to proxy.ts.
 *
 * The proxy is the front door, but it must not be the only lock: a framework
 * bug that skips it has happened before (the Next.js "middleware bypass"
 * advisories of 2025 and 2026 both did exactly that), and Next's own guidance
 * is to authorise where the data is touched. Every handler that reads or
 * writes with the service key calls this first, so a request that somehow
 * slips past the proxy still meets the same signature and origin checks.
 */

/** `null` when the request may proceed, otherwise the response to return. */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!(await verifySessionToken(token))) {
        return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 });
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const site = request.headers.get('sec-fetch-site');
        if ((origin && origin !== new URL(request.url).origin) || site === 'cross-site') {
            return NextResponse.json({ error: 'Cross-site request refused.' }, { status: 403 });
        }
    }
    return null;
}

/** For server-rendered admin pages: true when the visitor is signed in. */
export async function isAdmin(): Promise<boolean> {
    return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
