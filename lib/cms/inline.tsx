import React from 'react';
import Link from 'next/link';
import { isSafeHref } from './safe';

/**
 * Tiny, safe inline formatting for CMS text:
 *
 *   *italic*   **bold**   [link text](/path or https://...)
 *
 * Deliberately not Markdown and deliberately not HTML. Text is turned into
 * React nodes, never into an HTML string, so nothing an editor types can
 * inject markup or script. Line breaks become <br>.
 */
const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\))/g;

export function renderInline(text: string): React.ReactNode {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, li) => (
        <React.Fragment key={li}>
            {li > 0 && <br />}
            {line.split(TOKEN).map((part, i) => renderToken(part, i))}
        </React.Fragment>
    ));
}

function renderToken(part: string, key: number): React.ReactNode {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
        const [, label, href] = link;
        if (!isSafeHref(href)) return label;
        if (href.startsWith('/') || href.startsWith('#')) {
            return <Link key={key} href={href} style={{ color: 'var(--color-primary)' }}>{label}</Link>;
        }
        return (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                {label}
            </a>
        );
    }
    return part;
}

/** The same text with the formatting marks removed - for titles and alt text. */
export function plainText(text: string): string {
    return text
        .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1');
}
