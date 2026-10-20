"use client";
import Image from 'next/image';
import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useContent } from '@/components/cms/content-context';
import { CmsButton, CmsLink, mapLink } from '@/components/cms/cms-ui';
import type { SiteContent } from '@/lib/cms/schema';

/**
 * The footer, rebuilt around what a restaurant footer is actually FOR.
 *
 * What it was: a mark, a tagline, a "Contact Us" link, and three short link
 * columns - Explore, Connect, and a "Visit" column carrying one set of hours
 * and ONE phone number. For a three-outlet restaurant that last part is the
 * defect, not a detail. A visitor who reaches the bottom of the page is
 * looking for where to go and how to get there, and the footer answered with
 * a bare list of three neighbourhood names and a number that reaches only
 * Gulshan.
 *
 * What the research says (multi-location restaurant footers, 2026):
 *
 *  - Full NAP - name, address, phone - per location, in the footer, on every
 *    page, matching the Google Business Profile character for character. This
 *    is the single highest-value thing a restaurant footer can carry and it is
 *    also a local-search ranking signal.
 *  - Hours and directions visible without navigating anywhere.
 *  - One Restaurant/LocalBusiness JSON-LD block per outlet, each with its own
 *    @id, using `openingHoursSpecification` rather than the flat
 *    `openingHours` string so day-by-day times are unambiguous.
 *  - Navigation grouped into a few scannable columns matched to intent, not
 *    one long list.
 *  - A clear signal that the page has ended. This footer's dark navy over the
 *    elephant landscape already does that, so the surface is unchanged.
 *
 * ⚠ The first attempt at this got the CONTENT right and the form badly wrong,
 * and the failure is worth recording because it is easy to repeat. It stacked
 * four full-width bands - brand / outlets / links / legal - each opened by its
 * own hairline, each running its own column count (3, then 3-with-vertical-
 * rules, then 3 again). Measured: 804px tall on an 805px viewport, of which
 * 278px was three columns of four links each, because `.footer-link` carries a
 * 44px minimum touch target and in a VERTICAL list that becomes 44px of mostly
 * empty row per link. A footer the height of the screen, ruled like a
 * spreadsheet.
 *
 * The shape below is one grid and two lines:
 *
 *   ZONE 1  a single four-column grid - brand, then the three outlets. No
 *           internal rules; the columns are separated by space, which is what
 *           a grid is for.
 *   ZONE 2  one hairline, then ONE row: navigation inline on the left, social
 *           as icon buttons on the right. Inline is the fix for the 278px
 *           band - the same 44px targets sit side by side instead of
 *           stacking - and the marks replace the words "Instagram" and
 *           "Facebook", which were 152px of text saying what two universally
 *           known glyphs say in 96px.
 *   ZONE 3  copyright and legal on one line.
 *
 * Hours live in the brand column, not repeated per outlet: all three branches
 * keep the same times, and printing them three times would be noise in a band
 * whose entire point is that the three ADDRESSES differ. If one outlet ever
 * diverges, move hours into the outlet block - lib/locations.ts already
 * carries them per-location.
 *
 * NAP comes from the CMS Locations document, shared with the Locations
 * chapter on the homepage. Do not inline an address or a phone number here.
 */

/* ⚠ THE BRAND MARKS ARE AUTHORED HERE, NOT IMPORTED, AND THAT IS NOT A
   SHORTCUT. lucide-react ships 5,978 icons and none of them are Facebook or
   Instagram - the brand set was removed over trademark concerns - and a
   generic "share" or "link" glyph is not a substitute for the mark a visitor
   is actually scanning for. These are drawn on the same 24px grid at the same
   1.75 stroke as every lucide icon on the site, so the footer's icons and the
   menu's arrows read as one set rather than two.

   The label survives as `aria-label` on the link. Dropping the visible word
   must not drop the accessible name: the SVG is `aria-hidden` and the link
   carries the name, so a screen reader still hears "Instagram", not
   "link". */
function InstagramMark() {
    return (
        <svg
            viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
            <path d="M17.5 6.5h.01" />
        </svg>
    );
}

function FacebookMark() {
    return (
        <svg
            viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

function TikTokMark() {
    return (
        <svg
            viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
            <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
            <path d="M14 3c.5 3 2.5 5 5.5 5" />
        </svg>
    );
}

function YouTubeMark() {
    return (
        <svg
            viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
            <rect x="2" y="5" width="20" height="14" rx="4" />
            <path d="m10 9 5 3-5 3z" />
        </svg>
    );
}

function OtherMark() {
    return <Globe size={20} strokeWidth={1.75} aria-hidden="true" />;
}

const SOCIAL_MARKS: Record<string, () => React.ReactElement> = {
    instagram: InstagramMark,
    facebook: FacebookMark,
    tiktok: TikTokMark,
    youtube: YouTubeMark,
    other: OtherMark,
};

/** "12pm" -> 12<span>pm</span>, so the meridiem can be set small. */
function renderHours(line: string) {
    return line.split(/(?<=\d)(am|pm)/i).map((part, i) =>
        i % 2 === 1 ? <span className="footer-hours-mer" key={i}>{part}</span> : part
    );
}

/**
 * One Restaurant node per outlet, each with a stable `@id` so the three are
 * distinct entities rather than three descriptions of one. Emitted from the
 * footer because the footer is the thing that appears on every page - the
 * markup and the visible NAP above it are then guaranteed to agree, which is
 * the requirement that actually matters.
 */
function outletSchema(content: SiteContent) {
    const siteUrl = content.site.siteUrl.replace(/\/$/, '');
    return {
        '@context': 'https://schema.org',
        '@graph': content.locations.outlets.map((loc) => ({
            '@type': 'Restaurant',
            '@id': `${siteUrl}/#${loc.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: `${content.site.siteName} ${loc.name}`,
            servesCuisine: 'Thai',
            url: siteUrl,
            telephone: loc.tel,
            image: loc.image.src.startsWith('/') ? `${siteUrl}${loc.image.src}` : loc.image.src,
            address: {
                '@type': 'PostalAddress',
                streetAddress: loc.address,
                addressLocality: 'Dhaka',
                addressCountry: 'BD',
            },
            openingHoursSpecification: loc.openingHours.map((h) => ({
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: h.days,
                opens: h.opens,
                closes: h.closes,
            })),
            hasMenu: `${siteUrl}/menu`,
        })),
    };
}

export default function Footer() {
    const content = useContent();
    const { site, navigation } = content;
    const footer = navigation.footer;
    const LOCATIONS = content.locations.outlets;
    const [activeLocationIndex, setActiveLocationIndex] = useState<number | null>(null);
    const activeLocation = activeLocationIndex === null ? null : LOCATIONS[activeLocationIndex] ?? null;

    return (
        <footer className="site-footer">
            <script
                type="application/ld+json"
                // Built from CMS content, so `<` is escaped: a "</script>"
                // typed into an address must not be able to end this element.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(outletSchema(content)).replace(/</g, '\\u003c') }}
            />
            <div className="container site-footer__inner">

                {/* ZONE 1 - one grid. Brand, then the three rooms. */}
                <div className="footer-grid">

                    <div className="footer-brand">
                        {/* unoptimized: the optimiser strips this WebP's alpha
                            channel, which silently defeats the cream knock-out
                            filter and renders the mark invisible on the dark
                            footer. Alpha must survive for the knock-out to work -
                            see .footer-logo in 12-footer.css, which is paired with
                            this surface being dark. */}
                        {site.logo.src && (
                            <Image
                                className="footer-logo"
                                src={site.logo.src}
                                alt={site.logo.alt || site.siteName}
                                width={200}
                                height={174}
                                loading="eager"
                                unoptimized
                            />
                        )}
                        {footer.tagline && (
                            <p className="footer-tagline">
                                {footer.tagline}
                            </p>
                        )}
                        {footer.hours.length > 0 && (
                            <p className="footer-hours">
                                {footer.hours.map((line, i) => <span key={i}>{renderHours(line)}</span>)}
                            </p>
                        )}
                        <CmsButton cta={footer.button} className="footer-cta" />
                    </div>

                    {/* Desktop retains the three complete outlet blocks. The
                        phone selector below is a separate compact treatment,
                        so the desktop NAP layout does not need to compromise. */}
                    {LOCATIONS.map((loc, i) => (
                        <div className="footer-outlet footer-outlet--desktop" key={`${loc.name}-${i}`}>
                            <h3 className="footer-outlet-name">{loc.name}</h3>
                            {/* <address> is the correct element and it italicises
                                by default in every browser - reset in the CSS. */}
                            <address className="footer-outlet-address">{loc.address}</address>
                            <a className="footer-outlet-tel" href={`tel:${loc.tel}`}>{loc.phoneDisplay}</a>
                            <a
                                className="footer-outlet-map"
                                href={mapLink(loc.mapQuery)}
                                target="_blank"
                                rel="noreferrer"
                            >{footer.directionsLabel}</a>
                        </div>
                    ))}

                    {/* Phone-only: names stay horizontal and compact; the
                        selected branch supplies the useful NAP details. */}
                    <section className="footer-location-picker" aria-label="Khao San locations">
                        <div className="footer-location-tabs">
                            {LOCATIONS.map((loc, index) => {
                                const isActive = activeLocationIndex === index;

                                return (
                                    <button
                                        key={`${loc.name}-${index}`}
                                        type="button"
                                        className={`footer-location-tab${isActive ? ' is-active' : ''}`}
                                        aria-expanded={isActive}
                                        onClick={() => setActiveLocationIndex(current => current === index ? null : index)}
                                    >
                                        {loc.name}
                                    </button>
                                );
                            })}
                        </div>

                        {activeLocation && (
                            <div className="footer-location-panel">
                                <h3 className="footer-location-panel-name">{activeLocation.name}</h3>
                                <address className="footer-location-panel-address">{activeLocation.address}</address>
                                <a
                                    className="footer-location-panel-tel"
                                    href={`tel:${activeLocation.tel}`}
                                >
                                    {activeLocation.phoneDisplay}
                                </a>
                                <a
                                    className="footer-location-panel-map"
                                    href={mapLink(activeLocation.mapQuery)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {footer.directionsLabel}
                                </a>
                                <p className="footer-location-panel-hours">
                                    {activeLocation.hours.map((hours) => (
                                        <span key={hours}>{hours}</span>
                                    ))}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* ZONE 2 - one row. Inline, not columns: these are six short
                    links and they were occupying 278px as three vertical lists. */}
                <nav className="footer-nav" aria-label="Footer">
                    <ul className="footer-nav-list">
                        {footer.links.map((item, i) => (
                            <li key={`${item.href}-${i}`}>
                                <CmsLink href={item.href} className="footer-link">{item.label}</CmsLink>
                            </li>
                        ))}
                    </ul>
                    <ul className="footer-nav-list footer-nav-list--social">
                        {footer.social.filter(item => item.href).map(({ href, label, platform }, i) => {
                            const Mark = SOCIAL_MARKS[platform] ?? OtherMark;
                            return (
                                <li key={`${href}-${i}`}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-social"
                                        aria-label={label || platform}
                                    >
                                        <Mark />
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* ZONE 3 - one line. */}
                <div className="footer-bottom">
                    <p>{footer.copyright.replace(/\{year\}/g, String(new Date().getFullYear()))}</p>
                    <div className="footer-legal">
                        {footer.legal.map((item, i) => (
                            <CmsLink key={`${item.href}-${i}`} href={item.href}>{item.label}</CmsLink>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
