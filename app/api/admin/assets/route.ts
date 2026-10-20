import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/cms/api';
import assets from '@/lib/cms/bundled-assets.json';

/** Images and videos that ship with the site (see scripts/gen-asset-manifest.mjs). */
export const GET = adminRoute(async () => NextResponse.json({ items: assets }));
