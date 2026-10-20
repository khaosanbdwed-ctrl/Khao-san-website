import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/auth/guard';

/** Pages the preview may open. A fixed list, so this can never be used as an open redirect. */
const ALLOWED = new Set(['/', '/menu', '/legal/privacy', '/legal/terms']);

/** Turn on Draft Mode for this (signed-in) browser and open a page. */
export async function GET(request: Request) {
    const denied = guardAdmin(request);
    if (denied) return denied;
    const url = new URL(request.url);
    const requested = url.searchParams.get('path') ?? '/';
    const [path, hash] = requested.split('#');
    const target = ALLOWED.has(path) ? path : '/';
    (await draftMode()).enable();
    const safeHash = hash && /^[a-z][a-z0-9-]*$/.test(hash) ? `#${hash}` : '';
    return NextResponse.redirect(new URL(`${target}${safeHash}`, url.origin));
}
