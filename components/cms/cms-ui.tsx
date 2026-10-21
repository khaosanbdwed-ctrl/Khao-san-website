"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import { safeHref, type Background, type CmsLink } from '@/lib/cms/fields';
import { waLink } from '@/lib/locations';
import { isOptimizable } from '@/lib/media';

/**
 * The small set of pieces every CMS-driven section is built from: a button
 * that can point at a page / WhatsApp / a phone, a line of text with *italic*
 * emphasis, and the background stack (colour, photo, video, wash).
 */

export function resolveLink(link: CmsLink, whatsapp: string): { href: string; external: boolean } | null {
    if (link.type === 'whatsapp') {
        return whatsapp ? { href: waLink(link.message, whatsapp), external: true } : null;
    }
    if (link.type === 'phone') {
        const d = link.url.replace(/\D/g, '');
        return d ? { href: `tel:+${d}`, external: false } : null;
    }
    const href = safeHref(link.url);
    return href ? { href, external: /^https?:/i.test(href) } : null;
}

/** Renders nothing when the link has no label or nowhere to go, so clearing a
 *  button's text in the dashboard removes the button. */
export function CmsButton({
    link, whatsapp, className, style, onClick,
}: {
    link: CmsLink;
    whatsapp: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}) {
    const target = resolveLink(link, whatsapp);
    if (!target || !link.label.trim()) return null;
    if (target.external || target.href.startsWith('tel:') || target.href.startsWith('mailto:')) {
        return (
            <a
                href={target.href}
                className={className}
                style={style}
                onClick={onClick}
                {...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >{link.label}</a>
        );
    }
    return <Link href={target.href} className={className} style={style} onClick={onClick}>{link.label}</Link>;
}

/** Inline formatting an editor can type, and nothing else: `*words*` become
 *  <em> (the brand's italic accent - "quietly elevated.", "Gifted.") and
 *  `[label](https://...)` becomes a link. No markup typed into the dashboard
 *  can reach the page as HTML, and link targets go through safeHref. */
function Inline({ text, linkStyle }: { text: string; linkStyle?: React.CSSProperties }) {
    return (
        <>
            {text.split(/(\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
                if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
                const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
                if (link) {
                    const href = safeHref(link[2]);
                    if (!href) return <React.Fragment key={i}>{link[1]}</React.Fragment>;
                    const external = /^https?:/i.test(href);
                    return (
                        <a key={i} href={href} style={linkStyle} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link[1]}</a>
                    );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </>
    );
}

/** One line (or a few, kept with <br>) of inline-formatted text. */
export function RichText({ text, linkStyle }: { text: string; linkStyle?: React.CSSProperties }) {
    return (
        <>
            {text.split('\n').map((line, li) => (
                <React.Fragment key={li}>
                    {li > 0 && <br />}
                    <Inline text={line} linkStyle={linkStyle} />
                </React.Fragment>
            ))}
        </>
    );
}

/** Longer text: blank lines separate paragraphs, lines starting "- " form a
 *  bulleted list. Used by the legal pages. */
export function RichBlocks({ text, listStyle, linkStyle }: { text: string; listStyle?: React.CSSProperties; linkStyle?: React.CSSProperties }) {
    const chunks = text.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);
    return (
        <>
            {chunks.map((chunk, i) => {
                const lines = chunk.split('\n');
                if (lines.every(l => /^\s*-\s+/.test(l))) {
                    return (
                        <ul key={i} style={listStyle}>
                            {lines.map((l, j) => <li key={j}><Inline text={l.replace(/^\s*-\s+/, '')} linkStyle={linkStyle} /></li>)}
                        </ul>
                    );
                }
                return <p key={i}><RichText text={chunk} linkStyle={linkStyle} /></p>;
            })}
        </>
    );
}

/**
 * Props to spread onto a section that takes a CMS background.
 *
 * A colour goes on the section itself, replacing the class's designed
 * background (an empty background changes nothing - the section keeps its
 * CSS). Photo, video and the wash are layers from <BackgroundLayers>, at
 * z-index -1 inside an isolated stacking context: under every child of the
 * section, including un-positioned ones, but above the section's own paint.
 *
 * The photo is a layer rather than a CSS background-image so that it goes
 * through next/image: each screen downloads a version sized for it, in WebP
 * or AVIF, instead of every phone fetching the full upload. Like the video,
 * it is cropped to fill the section at any shape (object-fit: cover).
 */
export function sectionBackground(bg: Background, base?: React.CSSProperties, className = '') {
    const style: React.CSSProperties = { ...base };
    if (bg.color) {
        style.backgroundColor = bg.color;
        style.backgroundImage = 'none';
    }
    if (bg.image) style.backgroundImage = 'none';
    if (bg.image || bg.video || bg.overlayOpacity > 0) {
        style.isolation = 'isolate';
        if (!style.position) style.position = 'relative';
    }
    const tone = bg.textTone === 'light' ? ' cms-tone-light' : bg.textTone === 'dark' ? ' cms-tone-dark' : '';
    return { className: `${className}${tone}`.trim(), style };
}

/** `auto` sets nothing, so a design rule (e.g. the hero's phone framing in
 *  05-motion.css) still applies. */
export const FOCUS_POSITION: Record<Background['focus'], string | undefined> = {
    auto: undefined, center: '50% 50%', top: '50% 0%', bottom: '50% 100%', left: '0% 50%', right: '100% 50%',
};

export function BackgroundLayers({
    bg, priority = false, videoClassName,
}: { bg: Background; priority?: boolean; videoClassName?: string }) {
    const layer: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' };
    const position = FOCUS_POSITION[bg.focus];
    return (
        <>
            {bg.image && (
                <div aria-hidden="true" style={{ ...layer, overflow: 'hidden' }}>
                    <Image
                        src={bg.image}
                        alt=""
                        fill
                        sizes="100vw"
                        priority={priority}
                        unoptimized={!isOptimizable(bg.image)}
                        style={{ objectFit: 'cover', objectPosition: position }}
                    />
                </div>
            )}
            {bg.video && (
                <BackgroundVideo
                    key={bg.video}
                    src={bg.video}
                    poster={bg.poster || undefined}
                    priority={priority}
                    className={videoClassName}
                    style={{ ...layer, objectFit: 'cover', objectPosition: position, opacity: bg.videoOpacity / 100 }}
                />
            )}
            {bg.overlayOpacity > 0 && (
                <div aria-hidden="true" style={{ ...layer, backgroundColor: bg.overlayColor, opacity: bg.overlayOpacity / 100 }} />
            )}
        </>
    );
}

export { isOptimizable };
