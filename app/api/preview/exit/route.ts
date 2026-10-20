import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

/** Leaves preview. Public on purpose: turning preview OFF needs no login. */
export async function POST() {
    (await draftMode()).disable();
    return NextResponse.json({ success: true });
}
