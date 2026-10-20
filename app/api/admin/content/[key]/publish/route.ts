import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminRoute } from '@/lib/cms/api';
import { CmsError, getDocState, publishDoc } from '@/lib/cms/admin-store';
import { normalizeDoc } from '@/lib/cms/content';
import { themeContrastChecks } from '@/lib/cms/theme';
import { isDocKey } from '@/lib/cms/schema';

type Ctx = { params: Promise<{ key: string }> };

export const POST = adminRoute(async (_req: Request, ctx: Ctx) => {
    const { key } = await ctx.params;
    if (!isDocKey(key)) throw new CmsError('Unknown content area.', 404);

    // The contrast guard is enforced here, not only in the editor, so an
    // unreadable colour combination cannot be published by any route.
    if (key === 'theme') {
        const state = await getDocState(key);
        if (state.draft) {
            const failing = themeContrastChecks(normalizeDoc('theme', state.draft)).filter(c => c.ratio < c.min);
            if (failing.length) {
                throw new CmsError(`These colours would make text unreadable: ${failing.map(c => c.label).join('; ')}. Adjust them before publishing.`, 422);
            }
        }
    }

    const revision = await publishDoc(key);
    // Every page shares the header, footer, theme and site settings, so
    // refresh the whole site rather than guessing which pages a change hits.
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, revision });
});
