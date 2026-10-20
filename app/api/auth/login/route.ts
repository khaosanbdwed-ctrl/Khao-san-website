import { NextResponse } from 'next/server';
import { checkCredentials, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth/session';

/** A wrong password costs the caller this long - cheap insurance against guessing. */
const FAILURE_DELAY_MS = 800;

export async function POST(request: Request) {
    let body: { username?: unknown; password?: unknown } = {};
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
        return NextResponse.json(
            { error: 'Admin sign-in is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in the hosting environment.' },
            { status: 503 },
        );
    }

    if (!checkCredentials(body.username, body.password)) {
        await new Promise(r => setTimeout(r, FAILURE_DELAY_MS));
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createSessionToken();
    if (!token) return NextResponse.json({ error: 'Sign-in is not configured.' }, { status: 503 });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
        name: SESSION_COOKIE,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MAX_AGE,
    });
    return response;
}
