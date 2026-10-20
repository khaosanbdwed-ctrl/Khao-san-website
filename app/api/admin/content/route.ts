import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/cms/api';
import { listDocStatus } from '@/lib/cms/admin-store';

export const GET = adminRoute(async () => NextResponse.json({ docs: await listDocStatus() }));
