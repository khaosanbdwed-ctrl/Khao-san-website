import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

/** Turn Draft Mode off. Public on purpose: leaving a preview needs no rights. */
export async function POST(request: Request) {
    (await draftMode()).disable();
    return NextResponse.redirect(new URL('/', request.url), 303);
}
