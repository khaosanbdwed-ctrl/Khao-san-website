import { NextResponse } from 'next/server';
import { DOC_KEYS, DOCS } from '@/lib/cms/registry';
import { listStatus } from '@/lib/cms/store';

/** The dashboard's list of editable areas, with which ones have unpublished
 *  changes. */
export async function GET() {
    try {
        const status = await listStatus();
        const byKey = new Map(status.map(s => [s.key, s]));
        return NextResponse.json({
            docs: DOC_KEYS.map(key => ({
                key,
                title: DOCS[key].def.title,
                description: DOCS[key].def.description,
                hasDraft: byKey.get(key)?.hasDraft ?? false,
                publishedAt: byKey.get(key)?.publishedAt ?? null,
                updatedAt: byKey.get(key)?.updatedAt ?? null,
            })),
        });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
