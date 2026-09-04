"use client";
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { LOCATIONS, waLink, mapLink } from '@/lib/locations';

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
 * NAP comes from lib/locations.ts, shared with the Locations chapter on the
 * homepage. Do not inline an address or a phone number here.
 */

const EXPLORE = [
    { href: '/menu', label: 'Menu' },
    { href: '/#locations', label: 'Locations' },
    { href: '/#heritage', label: 'Our Story' },
    { href: '/#gift', label: 'Gift Cards' },
];

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

const SOCIAL = [
    { href: 'https://www.instagram.com/khaosandhaka/', label: 'Instagram', Mark: InstagramMark },
    { href: 'https://www.facebook.com/KhaoSanDhaka', label: 'Facebook', Mark: FacebookMark },
];

/**
 * One Restaurant node per outlet, each with a stable `@id` so the three are
 * distinct entities rather than three descriptions of one. Emitted from the
 * footer because the footer is the thing that appears on every page - the
 * markup and the visible NAP above it are then guaranteed to agree, which is
 * the requirement that actually matters.
 */
function outletSchema() {
    return {
        '@context': 'https://schema.org',
        '@graph': LOCATIONS.map((loc) => ({
            '@type': 'Restaurant',
            '@id': `https://khaosan.com.bd/#${loc.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: `Khao San ${loc.name}`,
            servesCuisine: 'Thai',
            url: 'https://khaosan.com.bd',
            telephone: loc.tel,
            image: `https://khaosan.com.bd${loc.imageSrc}`,
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

export default function Footer() {
    return (
        <footer className="site-footer">
            <script
                type="application/ld+json"
                // The payload is built from a typed local constant, never from
                // user input, so there is nothing here to escape.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(outletSchema()) }}
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
                        <Image
                            className="footer-logo"
                            src="/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp"
                            alt="Khao San"
                            width={200}
                            height={174}
                            loading="eager"
                            unoptimized
                        />
                        <p className="footer-tagline">
                            Bangkok street craft, quietly elevated.
                        </p>
                        <p className="footer-hours">
                            <span>Sat&ndash;Thu &middot; 12<span className="footer-hours-mer">pm</span>&ndash;11<span className="footer-hours-mer">pm</span></span>
                            <span>Friday &middot; 2<span className="footer-hours-mer">pm</span>&ndash;11<span className="footer-hours-mer">pm</span></span>
                        </p>
                        <a
                            href={waLink("Hi, I'd like to reserve a table at Khao San.")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary footer-cta"
                        >Reserve a Table</a>
                    </div>

                    {LOCATIONS.map((loc) => (
                        <div className="footer-outlet" key={loc.name}>
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
                            >Directions</a>
                        </div>
                    ))}
                </div>

                {/* ZONE 2 - one row. Inline, not columns: these are six short
                    links and they were occupying 278px as three vertical lists. */}
                <nav className="footer-nav" aria-label="Footer">
                    <ul className="footer-nav-list">
                        {EXPLORE.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className="footer-link">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                    <ul className="footer-nav-list footer-nav-list--social">
                        {SOCIAL.map(({ href, label, Mark }) => (
                            <li key={href}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social"
                                    aria-label={label}
                                >
                                    <Mark />
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* ZONE 3 - one line. */}
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Khao San Dhaka. All rights reserved.</p>
                    <div className="footer-legal">
                        <Link href="/legal/privacy">Privacy Policy</Link>
                        <Link href="/legal/terms">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
