"use client";

import React from 'react';
import Link from 'next/link';
import type { CtaValue } from '@/lib/cms/schema';
import { isWhatsAppNumber } from '@/lib/cms/safe';
import { useContent } from './content-context';

export const waLink = (message: string, number: string) =>
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const mapLink = (query: string) =>
    `https://maps.google.com/?q=${encodeURIComponent(query)}`;

/** The site's main WhatsApp number from Site settings. */
export function usePrimaryWhatsApp(): string {
    const { site } = useContent();
    return isWhatsAppNumber(site.whatsapp) ? site.whatsapp : '8801600068193';
}

const SUPABASE_HOST = (() => {
    try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host; } catch { return ''; }
})();

/**
 * Whether next/image may optimise this source. Local files and Supabase
 * Storage are allowlisted in next.config.ts; anything else (an image URL
 * pasted from elsewhere) would make next/image throw and take the page down,
 * so it is passed through unoptimised instead.
 */
export function isOptimizable(src: string): boolean {
    if (src.startsWith('/')) return true;
    try {
        const u = new URL(src);
        return u.hostname.endsWith('.supabase.co') || (SUPABASE_HOST !== '' && u.host === SUPABASE_HOST);
    } catch {
        return false;
    }
}

const isInternal = (href: string) => href.startsWith('/') || href.startsWith('#');

/**
 * A CMS button. Renders nothing when its text is empty, which is how the
 * client hides a button without deleting its settings.
 */
export function CmsButton({
    cta,
    className,
    style,
    onClick,
}: {
    cta: CtaValue;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}) {
    const primary = usePrimaryWhatsApp();
    if (!cta.label.trim()) return null;
    const cls = `btn ${cta.style === 'secondary' ? 'btn-secondary' : 'btn-primary'}${className ? ` ${className}` : ''}`;

    if (cta.action === 'whatsapp') {
        const number = isWhatsAppNumber(cta.whatsapp) ? cta.whatsapp : primary;
        return (
            <a href={waLink(cta.message, number)} target="_blank" rel="noopener noreferrer" className={cls} style={style} onClick={onClick}>
                {cta.label}
            </a>
        );
    }
    const href = cta.href || '/';
    if (isInternal(href)) {
        return <Link href={href} className={cls} style={style} onClick={onClick}>{cta.label}</Link>;
    }
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style} onClick={onClick}>
            {cta.label}
        </a>
    );
}

/** A plain text link from a CMS link field. */
export function CmsLink({ href, className, style, children, onClick }: {
    href: string;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    const target = href || '/';
    if (isInternal(target)) return <Link href={target} className={className} style={style} onClick={onClick}>{children}</Link>;
    return <a href={target} target="_blank" rel="noopener noreferrer" className={className} style={style} onClick={onClick}>{children}</a>;
}
