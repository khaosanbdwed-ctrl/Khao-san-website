import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function POST() {
    // Signing out also leaves any preview, so a shared computer does not keep
    // showing unpublished changes.
    (await draftMode()).disable();

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set({
        name: SESSION_COOKIE,
        value: '',
        httpOnly: true,
        path: '/',
        expires: new Date(0),
    });
    return response;
}
