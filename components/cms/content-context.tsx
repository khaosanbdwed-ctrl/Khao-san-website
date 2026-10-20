"use client";

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import type { SiteContent } from '@/lib/cms/schema';

/**
 * Site content for every client component, plus the live-preview bridge.
 *
 * The server loads and normalizes content once per page (app/layout.tsx) and
 * hands it down here. Components read it with `useContent()`.
 *
 * In the editor's preview iframe (`preview` true and framed), the editor posts
 * each unsaved change in with postMessage and it is swapped in immediately -
 * that is what makes the preview update as you type. The normalizer is loaded
 * lazily for that, so public visitors never download the schema.
 */
interface Ctx {
    content: SiteContent;
    themeCss: { css: string; stylesheets: string[] };
    preview: boolean;
}

const ContentContext = createContext<Ctx | null>(null);

export const PREVIEW_ORIGIN_MESSAGE = 'ks-cms';

export function ContentProvider({
    initial,
    themeCss,
    preview,
    children,
}: {
    initial: SiteContent;
    themeCss: Ctx['themeCss'];
    preview: boolean;
    children: React.ReactNode;
}) {
    const [state, setState] = useState<Ctx>({ content: initial, themeCss, preview });
    // When the server sends new content (router.refresh, entering or leaving
    // preview), adopt it. Done during render, React's documented pattern for
    // resetting state from a changed prop.
    const [prevInitial, setPrevInitial] = useState(initial);
    if (initial !== prevInitial) {
        setPrevInitial(initial);
        setState({ content: initial, themeCss, preview });
    }

    useEffect(() => {
        if (!preview || window.parent === window) return;
        const onMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const msg = event.data as { type?: string; key?: string; data?: unknown; id?: string };
            if (msg?.type === `${PREVIEW_ORIGIN_MESSAGE}:content` && typeof msg.key === 'string') {
                const [{ normalizeDoc }, { isDocKey }, { themeToCss }] = await Promise.all([
                    import('@/lib/cms/content'),
                    import('@/lib/cms/schema'),
                    import('@/lib/cms/theme'),
                ]);
                const key = msg.key;
                if (!isDocKey(key)) return;
                const doc = normalizeDoc(key, msg.data);
                setState(prev => ({
                    ...prev,
                    content: { ...prev.content, [key]: doc },
                    themeCss: key === 'theme' ? themeToCss(doc as SiteContent['theme']) : prev.themeCss,
                }));
            }
            if (msg?.type === `${PREVIEW_ORIGIN_MESSAGE}:focus` && typeof msg.id === 'string') {
                const el = document.querySelector(`[data-cms-section="${CSS.escape(msg.id)}"]`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        window.addEventListener('message', onMessage);
        window.parent.postMessage({ type: `${PREVIEW_ORIGIN_MESSAGE}:ready` }, window.location.origin);
        return () => window.removeEventListener('message', onMessage);
    }, [preview]);

    return (
        <ContentContext.Provider value={state}>
            <ThemeStyle />
            {children}
            {preview && <PreviewBanner />}
        </ContentContext.Provider>
    );
}

function useCtx(): Ctx {
    const ctx = useContext(ContentContext);
    if (!ctx) throw new Error('useContent() must be used inside <ContentProvider>.');
    return ctx;
}

export const useContent = (): SiteContent => useCtx().content;
export const useCmsPreview = (): boolean => useCtx().preview;

/** Theme overrides. Renders nothing at all for an untouched theme. */
function ThemeStyle() {
    const { themeCss } = useCtx();
    return (
        <>
            {themeCss.stylesheets.map(href => (
                <link key={href} rel="stylesheet" href={href} precedence="default" />
            ))}
            {themeCss.css && <style data-cms-theme="" dangerouslySetInnerHTML={{ __html: themeCss.css }} />}
        </>
    );
}

const noopSubscribe = () => () => {};

/**
 * Shown when an editor browses the real site with drafts switched on (outside
 * the editor's own preview frame), so unpublished content is never mistaken
 * for the live site.
 */
function PreviewBanner() {
    const isTopWindow = useSyncExternalStore(noopSubscribe, () => window.top === window, () => false);
    const pathname = usePathname();
    if (!isTopWindow || pathname?.startsWith('/admin')) return null;
    return (
        <div className="cms-preview-banner" role="status">
            <span>You are viewing <strong>unpublished drafts</strong>. Visitors still see the published site.</span>
            <a href="/admin">Back to editor</a>
            <form method="post" action="/api/preview/exit">
                <button type="submit">Exit preview</button>
            </form>
        </div>
    );
}
