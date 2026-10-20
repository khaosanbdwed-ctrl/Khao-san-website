import { NextResponse } from 'next/server';
import { isDocKey } from '@/lib/cms/registry';
import { discardDraft, getDocState, listVersions, publish, restoreVersion, saveDraft } from '@/lib/cms/store';

/**
 * One editable area of the site.
 *   GET                     draft (or live) content, status, version history
 *   PUT  { content }        save as draft
 *   POST { action }         'publish' | 'discard' | 'restore' (+ versionId)
 *
 * Bodies are normalised against the area's schema before they are stored
 * (lib/cms/fields.ts), so nothing but the documented shape can be saved.
 * Storage is created on first use (lib/cms/bucket.ts) - no setup step.
 */

type Ctx = { params: Promise<{ doc: string }> };

/** Generous for text; media is stored as URLs, never inline. */
const MAX_BODY = 1024 * 1024;

function fail(e: unknown) {
    return NextResponse.json({ error: (e as Error).message || 'Something went wrong.' }, { status: 500 });
}

async function readJson(request: Request): Promise<Record<string, unknown> | NextResponse> {
    if (!request.headers.get('content-type')?.includes('application/json')) {
        return NextResponse.json({ error: 'Expected JSON.' }, { status: 415 });
    }
    const text = await request.text();
    if (text.length > MAX_BODY) {
        return NextResponse.json({ error: 'This change is too large to save.' }, { status: 413 });
    }
    try {
        const v = JSON.parse(text);
        return typeof v === 'object' && v ? v : {};
    } catch {
        return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
    }
}

export async function GET(_request: Request, { params }: Ctx) {
    const { doc } = await params;
    if (!isDocKey(doc)) return NextResponse.json({ error: 'Unknown page area.' }, { status: 404 });
    try {
        const [state, versions] = await Promise.all([getDocState(doc), listVersions(doc)]);
        return NextResponse.json({ ...state, versions });
    } catch (e) {
        return fail(e);
    }
}

export async function PUT(request: Request, { params }: Ctx) {
    const { doc } = await params;
    if (!isDocKey(doc)) return NextResponse.json({ error: 'Unknown page area.' }, { status: 404 });
    const body = await readJson(request);
    if (body instanceof NextResponse) return body;
    try {
        await saveDraft(doc, body.content);
        return NextResponse.json(await getDocState(doc));
    } catch (e) {
        return fail(e);
    }
}

export async function POST(request: Request, { params }: Ctx) {
    const { doc } = await params;
    if (!isDocKey(doc)) return NextResponse.json({ error: 'Unknown page area.' }, { status: 404 });
    const body = await readJson(request);
    if (body instanceof NextResponse) return body;
    try {
        switch (body.action) {
            case 'publish':
                await publish(doc);
                break;
            case 'discard':
                await discardDraft(doc);
                break;
            case 'restore': {
                if (typeof body.versionId !== 'string') return NextResponse.json({ error: 'Missing version.' }, { status: 400 });
                await restoreVersion(doc, body.versionId);
                break;
            }
            default:
                return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
        }
        const [state, versions] = await Promise.all([getDocState(doc), listVersions(doc)]);
        return NextResponse.json({ ...state, versions });
    } catch (e) {
        return fail(e);
    }
}
