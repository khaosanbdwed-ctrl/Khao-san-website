import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './session';

function readCookie(request: Request, name: string): string | undefined {
    const header = request.headers.get('cookie');
    if (!header) return undefined;
    for (const part of header.split(';')) {
        const [k, ...rest] = part.trim().split('=');
        if (k === name) return decodeURIComponent(rest.join('='));
    }
    return undefined;
}

export function isAdminRequest(request: Request): boolean {
    return verifySessionToken(readCookie(request, SESSION_COOKIE));
}

/**
 * Every admin route handler calls this first, even though proxy.ts already
 * gates /api/admin. Defence in depth: a proxy matcher is one regex away from
 * not matching, and this costs one HMAC.
 *
 * For writes it also rejects cross-site requests: a browser always sends
 * `Origin` on a cross-origin POST/PUT/DELETE, and it must be this site.
 */
export function guardAdmin(request: Request): NextResponse | null {
    if (!isAdminRequest(request)) {
        return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        const origin = request.headers.get('origin');
        if (origin) {
            const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
            try {
                if (new URL(origin).host !== host) {
                    return NextResponse.json({ error: 'Cross-site request blocked.' }, { status: 403 });
                }
            } catch {
                return NextResponse.json({ error: 'Cross-site request blocked.' }, { status: 403 });
            }
        }
    }
    return null;
}
