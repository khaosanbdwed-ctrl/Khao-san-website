"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { clock, dayRanges, mapLink, type Location } from '@/lib/locations';
import type { FooterContent } from '@/lib/cms/docs/chrome';
import { BackgroundLayers, CmsButton, sectionBackground } from '@/components/cms/cms-ui';

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
 * whose entire point is that the three ADDRESSES differ. They are generated
 * from the first outlet's structured hours - the same data the JSON-LD below
 * emits - so the visible line and Google's copy can no longer drift apart (it
 * used to be typed into this file by hand). If one outlet ever diverges, move
 * hours into the outlet block; every outlet carries its own.
 *
 * Everything here is CMS content: the footer's own text, links, social
 * accounts and background (Footer in the dashboard), and the outlets
 * (Locations & hours). Do not inline an address or a phone number here.
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
            <path d="M14 3c.4 2.6 2.3 4.6 5 5" />
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

function WhatsAppMark() {
    return (
        <svg
            viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
            <path d="M3 21l1.65-3.8A9 9 0 1 1 8.4 20.1z" />
            <path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2.1-1-1 1a4 4 0 0 1-2.3-2.3l1-1-1-2.1z" />
        </svg>
    );
}

const SOCIAL_MARKS: Record<string, { label: string; Mark: () => React.JSX.Element }> = {
    instagram: { label: 'Instagram', Mark: InstagramMark },
    facebook: { label: 'Facebook', Mark: FacebookMark },
    tiktok: { label: 'TikTok', Mark: TikTokMark },
    youtube: { label: 'YouTube', Mark: YouTubeMark },
    whatsapp: { label: 'WhatsApp', Mark: WhatsAppMark },
};

/**
 * One Restaurant node per outlet, each with a stable `@id` so the three are
 * distinct entities rather than three descriptions of one. Emitted from the
 * footer because the footer is the thing that appears on every page - the
 * markup and the visible NAP above it are then guaranteed to agree, which is
 * the requirement that actually matters.
 */
function outletSchema(locations: Location[]) {
    return {
        '@context': 'https://schema.org',
        '@graph': locations.map((loc) => ({
            '@type': 'Restaurant',
            '@id': `https://khaosan.com.bd/#${loc.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: `Khao San ${loc.name}`,
            servesCuisine: 'Thai',
            url: 'https://khaosan.com.bd',
            telephone: loc.tel,
            image: loc.imageSrc.startsWith('/') ? `https://khaosan.com.bd${loc.imageSrc}` : loc.imageSrc,
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
            hasMenu: 'https://khaosan.com.bd/menu',
        })),
    };
}

/** "Sat–Thu · 12pm–11pm", with the am/pm set small (.footer-hours-mer). */
function CompactHours({ hours }: { hours: Location['openingHours'] }) {
    return (
        <>
            {hours.map((h, i) => {
                const o = clock(h.opens, true), c = clock(h.closes, true);
                return (
                    <span key={i}>
                        {dayRanges(h.days).join(', ')} &middot; {o.time}<span className="footer-hours-mer">{o.mer}</span>&ndash;{c.time}<span className="footer-hours-mer">{c.mer}</span>
                    </span>
                );
            })}
        </>
    );
}

type Props = { content: FooterContent; locations: Location[]; whatsapp: string };

export default function Footer({ content, locations, whatsapp }: Props) {
    const [activeLocationIndex, setActiveLocationIndex] = useState<number | null>(null);
    const activeLocation = activeLocationIndex === null ? null : locations[activeLocationIndex];
    const { brand } = content;
    const bgProps = sectionBackground(content.style.background, undefined, 'site-footer');

    return (
        <footer {...bgProps}>
            <BackgroundLayers bg={content.style.background} />
            <script
                type="application/ld+json"
                // Built from CMS text, so `<` is escaped: an address
                // containing "</script>" must not be able to close this tag.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(outletSchema(locations)).replace(/</g, '\\u003c') }}
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
                        {brand.logo && (
                            <Image
                                className={`footer-logo${brand.logoWhite ? '' : ' footer-logo--original'}`}
                                src={brand.logo}
                                alt={brand.logoAlt}
                                width={200}
                                height={174}
                                loading="eager"
                                unoptimized
                            />
                        )}
                        {brand.tagline && <p className="footer-tagline">{brand.tagline}</p>}
                        {brand.showHours && locations[0]?.openingHours.length > 0 && (
                            <p className="footer-hours">
                                <CompactHours hours={locations[0].openingHours} />
                            </p>
                        )}
                        {brand.showButton && (
                            <CmsButton link={brand.button} whatsapp={whatsapp} className="btn btn-primary footer-cta" />
                        )}
                    </div>

                    {/* Desktop retains the three complete outlet blocks. The
                        phone selector below is a separate compact treatment,
                        so the desktop NAP layout does not need to compromise. */}
                    {locations.map((loc, i) => (
                        <div className="footer-outlet footer-outlet--desktop" key={`${loc.name}-${i}`}>
                            <h3 className="footer-outlet-name">{loc.name}</h3>
                            {/* <address> is the correct element and it italicises
                                by default in every browser - reset in the CSS. */}
                            <address className="footer-outlet-address">{loc.address}</address>
                            {loc.tel && <a className="footer-outlet-tel" href={`tel:${loc.tel}`}>{loc.phoneDisplay}</a>}
                            <a
                                className="footer-outlet-map"
                                href={mapLink(loc.mapQuery)}
                                target="_blank"
                                rel="noreferrer"
                            >Directions</a>
                        </div>
                    ))}

                    {/* Phone-only: names stay horizontal and compact; the
                        selected branch supplies the useful NAP details. */}
                    <section className="footer-location-picker" aria-label="Khao San locations">
                        <div className="footer-location-tabs">
                            {locations.map((loc, index) => {
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
                                    Directions
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
                        {content.links.items.map((item, i) => (
                            <li key={`${item.href}-${i}`}>
                                <Link href={item.href} className="footer-link">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                    <ul className="footer-nav-list footer-nav-list--social">
                        {content.social.items.filter(s => s.url.startsWith('https://') && SOCIAL_MARKS[s.platform]).map(({ platform, url }) => {
                            const { label, Mark } = SOCIAL_MARKS[platform];
                            return (
                            <li key={url}>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social"
                                    aria-label={label}
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
                    <p>{content.bottom.copyright.replaceAll('{year}', String(new Date().getFullYear()))}</p>
                    <div className="footer-legal">
                        {content.bottom.legal.map((l, i) => (
                            <Link key={`${l.href}-${i}`} href={l.href}>{l.label}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
