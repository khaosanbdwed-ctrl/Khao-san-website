import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/auth/guard';
import { CmsError } from './admin-store';

/**
 * Wraps an admin route handler: checks the session (and same-origin for
 * writes), and turns thrown errors into a JSON message the editor can show.
 * Raw database errors are logged, not sent to the browser.
 */
export function adminRoute<A extends unknown[]>(
    handler: (request: Request, ...args: A) => Promise<Response>,
) {
    return async (request: Request, ...args: A): Promise<Response> => {
        const denied = guardAdmin(request);
        if (denied) return denied;
        try {
            return await handler(request, ...args);
        } catch (err) {
            if (err instanceof CmsError) {
                return NextResponse.json({ error: err.message }, { status: err.status });
            }
            console.error('[admin api]', err);
            return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
        }
    };
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
    try {
        const body = await request.json();
        if (typeof body !== 'object' || body === null || Array.isArray(body)) throw new Error();
        return body as Record<string, unknown>;
    } catch {
        throw new CmsError('The request was not valid JSON.', 400);
    }
}
