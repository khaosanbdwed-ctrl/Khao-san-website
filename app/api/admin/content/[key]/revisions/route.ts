import { NextResponse } from 'next/server';
import { adminRoute, readJson } from '@/lib/cms/api';
import { CmsError, listRevisions, restoreRevision } from '@/lib/cms/admin-store';
import { isDocKey } from '@/lib/cms/schema';

type Ctx = { params: Promise<{ key: string }> };

export const GET = adminRoute(async (_req: Request, ctx: Ctx) => {
    const { key } = await ctx.params;
    if (!isDocKey(key)) throw new CmsError('Unknown content area.', 404);
    return NextResponse.json({ revisions: await listRevisions(key) });
});

/** Restore: copies the chosen version into the draft. Body: { id }. */
export const POST = adminRoute(async (req: Request, ctx: Ctx) => {
    const { key } = await ctx.params;
    if (!isDocKey(key)) throw new CmsError('Unknown content area.', 404);
    const { id } = await readJson(req);
    if (typeof id !== 'number') throw new CmsError('Missing version id.', 400);
    return NextResponse.json(await restoreRevision(key, id));
});
