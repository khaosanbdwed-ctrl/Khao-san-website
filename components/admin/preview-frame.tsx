"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from 'lucide-react';
import type { DocKey } from '@/lib/cms/schema';

export interface PreviewHandle {
    focus: (sectionId: string) => void;
    reload: () => void;
}

const DEVICES = {
    desktop: { width: 1440, label: 'Desktop', Icon: Monitor },
    tablet: { width: 820, label: 'Tablet', Icon: Tablet },
    phone: { width: 390, label: 'Phone', Icon: Smartphone },
} as const;
type Device = keyof typeof DEVICES;

const MSG = 'ks-cms';

function post(frame: HTMLIFrameElement | null, message: Record<string, unknown>) {
    frame?.contentWindow?.postMessage(message, window.location.origin);
}

/**
 * The real website, with drafts switched on, in an iframe - scaled down to
 * fit at a true device width, so "Desktop" really is 1440px wide.
 *
 * Unsaved edits are posted in with postMessage on every change and applied
 * instantly by the ContentProvider inside the frame (see
 * components/cms/content-context.tsx); nothing has to be saved to be seen.
 */
export default function PreviewFrame({ path, docKey, data, ref }: {
    path: string;
    docKey: DocKey;
    data: unknown;
    ref?: React.Ref<PreviewHandle>;
}) {
    const iframe = useRef<HTMLIFrameElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const [device, setDevice] = useState<Device>('desktop');
    const [size, setSize] = useState({ w: 0, h: 0 });
    const latest = useRef({ docKey, data });
    const src = `/api/admin/preview?path=${encodeURIComponent(path)}`;

    useEffect(() => {
        latest.current = { docKey, data };
        post(iframe.current, { type: `${MSG}:content`, key: docKey, data });
    }, [docKey, data]);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            if (e.origin !== window.location.origin || e.source !== iframe.current?.contentWindow) return;
            if (e.data?.type === `${MSG}:ready`) {
                post(iframe.current, { type: `${MSG}:content`, key: latest.current.docKey, data: latest.current.data });
            }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    useEffect(() => {
        const el = stage.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useImperativeHandle(ref, () => ({
        focus: (id: string) => post(iframe.current, { type: `${MSG}:focus`, id }),
        reload: () => iframe.current?.contentWindow?.location.reload(),
    }), []);

    const width = DEVICES[device].width;
    const scale = size.w > 0 ? Math.min(1, size.w / width) : 1;
    const frameHeight = Math.max(200, size.h);

    return (
        <div className="cms-preview">
            <div className="cms-preview-bar">
                <strong style={{ fontSize: 13 }}>Live preview</strong>
                <span className="cms-help">Shows your changes as you type. Visitors see them after you publish.</span>
                <span className="cms-spacer" style={{ flex: 1 }} />
                {(Object.keys(DEVICES) as Device[]).map(d => {
                    const { Icon, label } = DEVICES[d];
                    return (
                        <button key={d} type="button" className="cms-icon-btn" aria-pressed={device === d} title={label} aria-label={`Preview at ${label} size`}
                            style={device === d ? { background: '#fff', borderColor: 'var(--a-border)', color: 'var(--a-blue)' } : undefined}
                            onClick={() => setDevice(d)}>
                            <Icon size={16} />
                        </button>
                    );
                })}
                <button type="button" className="cms-icon-btn" title="Reload preview" aria-label="Reload preview" onClick={() => iframe.current?.contentWindow?.location.reload()}><RefreshCw size={15} /></button>
                <a className="cms-icon-btn" href={src} target="_blank" rel="noopener" title="Open the preview in a new tab" aria-label="Open the preview in a new tab"><ExternalLink size={15} /></a>
            </div>
            <div className="cms-preview-stage" ref={stage}>
                <div className="cms-preview-frame-wrap" style={{ width: width * scale, height: frameHeight }}>
                    <iframe
                        ref={iframe}
                        src={src}
                        title="Website preview"
                        style={{ width, height: frameHeight / scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                    />
                </div>
            </div>
        </div>
    );
}
