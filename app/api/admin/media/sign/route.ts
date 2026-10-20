import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { adminRoute, readJson } from '@/lib/cms/api';
import { CmsError } from '@/lib/cms/admin-store';
import { MEDIA_BUCKET, MEDIA_TYPES, extensionOf } from '@/lib/cms/media';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingTable } from '@/lib/cms/store';

/**
 * Step 1 of an upload: issue a one-time signed URL. The browser then sends
 * the file straight to Supabase Storage - not through this server, whose
 * hosting platform caps request bodies at a few MB (too small for video).
 */
export const POST = adminRoute(async (req: Request) => {
    const { filename, size } = await readJson(req);
    if (typeof filename !== 'string' || typeof size !== 'number') throw new CmsError('Missing file details.', 400);

    const ext = extensionOf(filename);
    const type = MEDIA_TYPES[ext];
    if (!type) {
        throw new CmsError('That file type is not supported. Use JPG, PNG, WebP, GIF or AVIF for images, MP4 or WebM for video, and WOFF2, WOFF, TTF or OTF for fonts.', 415);
    }
    if (size <= 0) throw new CmsError('That file is empty.', 400);
    if (size > type.maxBytes) {
        throw new CmsError(`That file is ${(size / 1048576).toFixed(1)} MB. The limit for ${type.kind}s is ${type.maxBytes / 1048576} MB.`, 413);
    }

    const base = filename.replace(/\.[^.]*$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || type.kind;
    const path = `${type.kind}s/${new Date().getUTCFullYear()}/${base}-${randomBytes(5).toString('hex')}.${ext}`;

    const { data, error } = await createAdminClient().storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
        if (isMissingTable(error) || /bucket not found/i.test(error?.message ?? '')) {
            throw new CmsError('The "site-media" storage bucket does not exist yet. Run the CMS migration in Supabase (see CMS.md).', 503);
        }
        throw new CmsError(error?.message ?? 'Could not start the upload.');
    }
    return NextResponse.json({ bucket: MEDIA_BUCKET, path, token: data.token, mime: type.mime });
});
