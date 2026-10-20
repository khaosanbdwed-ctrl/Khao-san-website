"use client";

import { MediaGrid } from '@/components/admin/cms/media-library';

export default function MediaLibraryPage() {
    return (
        <div className="cms-admin">
            <div style={{ marginBottom: 24 }}>
                <h1>Media library</h1>
                <p className="cms-muted" style={{ maxWidth: '68ch' }}>
                    Every photo and video uploaded for the website. Anything here can be chosen from any photo or
                    video field in Website content. The website&rsquo;s original photos and videos are built in and
                    are not listed here &mdash; use &ldquo;Reset&rdquo; on a field to bring one back.
                </p>
            </div>
            <MediaGrid />
        </div>
    );
}
