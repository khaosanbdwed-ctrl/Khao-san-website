import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function POST() {
    // Leave preview too, so this browser goes back to seeing the live site.
    (await draftMode()).disable();
    const response = NextResponse.json({ success: true });
    response.cookies.set({
        name: SESSION_COOKIE,
        value: '',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
    });
    return response;
}
