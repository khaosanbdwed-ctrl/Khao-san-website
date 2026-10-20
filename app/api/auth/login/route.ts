import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readJson, removeFiles, writeJson } from '@/lib/cms/bucket';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from '@/lib/auth/session';

/**
 * One shared dashboard login, hardened:
 *  - credentials compared in constant time (hashed first, so the comparison
 *    does not leak length either);
 *  - failed attempts counted per IP and refused after MAX_FAILURES within
 *    WINDOW_MIN - this route has to sit outside the proxy's protection, so it
 *    is the one place a password can be guessed. The counter is a small file
 *    in the private CMS bucket (lib/cms/bucket.ts), keyed by a hash of the IP;
 *  - success issues a signed, expiring session (lib/auth/session.ts).
 *
 * If storage is unreachable the limiter is skipped with a warning rather than
 * locking everyone out of the dashboard.
 */
const MAX_FAILURES = 8;
const WINDOW_MIN = 15;

const digest = (s: string) => createHash('sha256').update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

function clientIp(request: Request) {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

export async function POST(request: Request) {
    let body: { username?: unknown; password?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;
    if (!expectedUser || !expectedPass) {
        return NextResponse.json({ error: 'Admin login is not configured on this server.' }, { status: 500 });
    }

    const counterPath = `security/login/${createHash('sha256').update(clientIp(request)).digest('hex').slice(0, 32)}.json`;
    const since = Date.now() - WINDOW_MIN * 60_000;
    let failures: number[] = [];
    let limiterOn = true;
    try {
        const stored = await readJson<{ failures?: unknown }>(counterPath);
        failures = Array.isArray(stored?.failures)
            ? stored.failures.filter((t): t is number => typeof t === 'number' && t > since)
            : [];
    } catch (e) {
        limiterOn = false;
        console.warn('[auth] login rate limit unavailable:', (e as Error).message);
    }

    if (limiterOn && failures.length >= MAX_FAILURES) {
        return NextResponse.json(
            { error: `Too many failed attempts. Try again in ${WINDOW_MIN} minutes.` },
            { status: 429 },
        );
    }

    const username = typeof body.username === 'string' ? body.username : '';
    const password = typeof body.password === 'string' ? body.password : '';
    // Both compared every time - no early exit on a wrong username.
    const userOk = same(username, expectedUser);
    const passOk = same(password, expectedPass);
    const ok = userOk && passOk;

    if (!ok) {
        if (limiterOn) await writeJson(counterPath, { failures: [...failures, Date.now()] }).catch(() => {});
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createSessionToken();
    if (!token) {
        return NextResponse.json({ error: 'Admin login is not configured on this server.' }, { status: 500 });
    }
    if (limiterOn && failures.length) await removeFiles([counterPath]).catch(() => {});

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set({
        name: SESSION_COOKIE,
        value: token,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MAX_AGE,
    });
    return response;
}
