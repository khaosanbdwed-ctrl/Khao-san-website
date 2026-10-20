import { NextResponse } from 'next/server';
import { adminRoute, readJson } from '@/lib/cms/api';
import { CmsError, discardDraft, getDocState, saveDraft } from '@/lib/cms/admin-store';
import { isDocKey, type DocKey } from '@/lib/cms/schema';

type Ctx = { params: Promise<{ key: string }> };

async function docKey(ctx: Ctx): Promise<DocKey> {
    const { key } = await ctx.params;
    if (!isDocKey(key)) throw new CmsError('Unknown content area.', 404);
    return key;
}

/** Draft and published copies, raw - the editor normalizes them itself. */
export const GET = adminRoute(async (_req: Request, ctx: Ctx) =>
    NextResponse.json(await getDocState(await docKey(ctx))));

/** Save the draft (auto-save). Body: { data, expectedUpdatedAt }. */
export const PUT = adminRoute(async (req: Request, ctx: Ctx) => {
    const key = await docKey(ctx);
    const body = await readJson(req);
    const expected = body.expectedUpdatedAt;
    const result = await saveDraft(key, body.data, typeof expected === 'string' || expected === null ? expected : undefined);
    return NextResponse.json(result);
});

/** Throw the draft away; the editor falls back to the published version. */
export const DELETE = adminRoute(async (_req: Request, ctx: Ctx) => {
    await discardDraft(await docKey(ctx));
    return NextResponse.json({ ok: true });
});
