"use client";

import React from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import BrushTransition from '@/components/ui/brush-transition';
import InteriorDrift from '@/components/ui/interior-drift';
import type { InteriorShot } from '@/components/ui/interior-drift';

/* The hero poster is what the visitor actually sees first — the video behind it
   is ~1.2 MB and cannot paint for a while, so this still is the LCP element.
   Browsers do not give a <video poster> any loading priority, so it was being
   fetched after the scripts. Preloading it here (homepage only — putting it in
   layout.tsx would pull it on /menu too, where it never renders) moves the
   first meaningful paint forward by roughly a round trip. */
const HERO_POSTER =
    '/assets/posters/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.webp';

/* No `type` or `tagline` fields: the Flagship / Original / Sanctuary
   descriptors were removed at the client's request, and with them the reason
   for one card to be structured differently from the other two. Every location
   now renders the same block. */
const LOCATIONS = [
    {
        name: 'Gulshan 1',
        address: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka 1212',
        whatsapp: '8801600068193',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        imageSrc: '/assets/Location_Image_1_1/Gulshan_Outlet_2.webp',
        mapQuery: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka',
    },
    {
        name: 'Dhanmondi',
        address: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
        whatsapp: '8801603523731',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        imageSrc: '/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp',
        mapQuery: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
    },
    {
        name: 'Uttara',
        address: 'House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka',
        whatsapp: '8801627167758',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        imageSrc: '/assets/Location_Image_1_1/Uttara_Outlet_3.webp',
        mapQuery: 'House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka',
    },
];

/* Art details, not rooms. These are tight crops of the hand-painted and neon
   work - the signs, the mural, the street scene - cut from the outlet
   photography into their own assets under /assets/Heritage. The wide
   dining-room shots they came from belong to the Havens section further down
   and are used only there. */
/* The interior gallery's content.
 *
 * ⚠ This list is deliberately short and the gallery knows it. Khao San's
 * interior photography has not been delivered yet - the only room imagery in
 * the repo is these three wall-art crops plus the three outlet shots the
 * Locations cards use, and everything in `_masters/Brand_Asset/` is menu pages
 * and food (checked, not assumed). Under InteriorDrift's `driftThreshold` the
 * component renders a static masonry; once there are 8+ entries here it starts
 * drifting on its own. Adding photography is a change to this array only.
 *
 * Per entry:
 *   location - the outlet, rendered as the plate's caption. This is how the
 *              gallery says "three locations" without a filter UI.
 *   ratio    - each plate declares its own shape. Mixed tall (2/3, 4/5),
 *              square and landscape (3/2) is what stops the columns settling
 *              into rows; uniform ratios collapse the effect.
 */
/* Order matters: InteriorDrift deals round-robin, so consecutive entries land
   in different columns. Grouped by outlet, the top row came out all-Gulshan.
   Interleaved Gulshan / Dhanmondi / Uttara instead, so every column carries all
   three outlets and the wall reads as the whole brand rather than one room. */
const INTERIORS: InteriorShot[] = [
    {
        src: '/assets/interiors/gulshan/tuktuk-booth.webp',
        alt: 'The blue tuk-tuk booth under caged pendant lamps, beside patterned banquette seating',
        location: 'Gulshan 1',
        ratio: '2 / 3',
    },
    {
        src: '/assets/interiors/dhanmondi/tables-palm.webp',
        alt: 'Timber tables with orange and grey chairs, set against dense planting',
        location: 'Dhanmondi',
        ratio: '3 / 2',
    },
    {
        src: '/assets/Heritage/neon-market.webp',
        alt: 'Hand-bent neon signs - Night Market, Khao San, Tom Yum, Tuk Tuk - above the tuk-tuk booth',
        location: 'Uttara',
        ratio: '3 / 4',
    },
    {
        src: '/assets/Heritage/rocco-street.webp',
        alt: 'A painted Bangkok street scene with the Rocco sign glowing over the shopfronts',
        location: 'Gulshan 1',
        ratio: '3 / 4',
    },
    {
        src: '/assets/interiors/dhanmondi/mural-glass.webp',
        alt: 'Tropical mural painted across the glass partition, with the dining room beyond',
        location: 'Dhanmondi',
        ratio: '3 / 4',
    },
    {
        src: '/assets/interiors/uttara/dining-floor.webp',
        alt: 'Orange chairs and timber tables on the oak floor, framed by potted greenery',
        location: 'Uttara',
        ratio: '4 / 3',
    },
    {
        src: '/assets/interiors/gulshan/banquette.webp',
        alt: 'Solid timber tables and grey banquette seating, set with daisies',
        location: 'Gulshan 1',
        ratio: '3 / 2',
    },
    {
        src: '/assets/Heritage/elephant-mark.webp',
        alt: 'The painted elephant, our mark, on the jungle mural wall',
        location: 'Uttara',
        ratio: '3 / 4',
    },
    {
        src: '/assets/interiors/uttara/pendants.webp',
        alt: 'The neon signage wall and jungle mural seen past the pendant lighting rig',
        location: 'Uttara',
        ratio: '5 / 4',
    },
];

export default function Home() {
    ReactDOM.preload(HERO_POSTER, { as: 'image', fetchPriority: 'high' });

    return (
        <>
        {/* CHAPTER I: THE THRESHOLD (Hero) */}
        <section className="hero" style={{position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--color-surface-base)'}}>
            {/* Plays at full strength. It was held at 0.62 over the cream page
                surface, which washed the room out to near-white before the
                lighting layer even landed on top of it. */}
            <BackgroundVideo
                src="/assets/video-web/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.mp4"
                poster="/assets/posters/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.webp"
                priority
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0}}
                className="hero-ken-burns"
            />
            <div className="hero-cinematic-light" aria-hidden="true"></div>

            <div className="container" style={{position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', padding: '0 24px'}}>
                {/* Hero order, top to bottom: mark, tagline, description, actions.
                    The mark is centred on its own line above the wordmark.
                    "The Thai Way" is set in Good Brush - the hand-painted brush
                    face the brand uses for this phrase - not the display serif. */}
                <div className="hero-lockup ignition-reveal ignition-reveal-1">
                    {/* unoptimized is REQUIRED, not an optimisation opt-out: the
                        image pipeline re-encodes this transparent WebP to a format
                        with no alpha channel, flattening the transparent ground to
                        black. The `brightness(0) invert(1)` knock-out below can only
                        work on a mark that still HAS alpha - without it the filter
                        has no silhouette to preserve and the logo disappears
                        entirely, which is what was happening here. The source file
                        is a few KB of already-compressed WebP, so nothing is lost. */}
                    <Image
                        src="/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp"
                        alt="Khao San"
                        width={232}
                        height={196}
                        priority
                        unoptimized
                        className="hero-mark"
                    />
                    <div className="hero-lockup-text">
                        <span className="hero-eyebrow hero-text-shadow">Reinventing</span>
                        <h1 className="hero-title hero-text-shadow">The Thai Way</h1>
                    </div>
                </div>
                <p className="body-large ignition-reveal ignition-reveal-3 hero-text-shadow" style={{color: 'var(--color-text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: 1.6}}>
                    Stepping inside is stepping into Bangkok. Dimly lit intimacy, authentic spice, and street craft elevated.
                </p>
                <div className="ignition-reveal ignition-reveal-4" style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <a
                        href={`https://wa.me/8801600068193?text=${encodeURIComponent("Hi, I'd like to reserve a table at Khao San.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >Book A Table</a>
                    <Link href="/menu" className="btn btn-secondary">Explore Menu</Link>
                </div>
            </div>
                    </section>

        {/* The seam between chapters is a mark, not a cut */}
        <BrushTransition color="saffron" />

        {/* CHAPTER II: THE FLAME (Energy & Craft - Split Editorial)
            Blue-field, deliberately - it's process/craft storytelling (the
            wok, the kitchen), sitting between the hero and the orange
            Heritage chapter so the homepage reads orange->blue->orange
            instead of orange the whole way down. */}
        <section className="bg-blue-field section-blend overflow-hidden" style={{position: 'relative'}}>
            {/* Still the original split - footage one side, copy the other -
                just with the film given considerably more of it. The frame was
                briefly rebuilt as a full-bleed, near-viewport-height stage;
                that was a hero treatment and overshot the brief, which was
                only that the frame was too small. The video column now leads
                the split (see .craft-split in 09-home-sections.css) instead of
                sharing it evenly with the text. */}
            {/* Not .container: this chapter is the one place the composition is
                allowed past the page's 1280 measure - see .craft-split. */}
            <div style={{position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)'}}>
                <div className="craft-split">
                    <div className="reveal-hidden craft-stage">
                        <BackgroundVideo
                            src="/assets/video-web/theatre-craft.mp4"
                            poster="/assets/posters/theatre-craft.webp"
                            className="media-feather"
                            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                        />
                    </div>

                    <div className="craft-copy">
                        <h2 className="display-2" style={{marginBottom: '28px', fontSize: 'clamp(2rem, 3vw, 3rem)', lineHeight: 1.0, color: '#ffffff'}}>The Theatre of Fire.</h2>
                        <p className="body-large" style={{color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '36px'}}>
                            Our woks are fueled by raw heat and culinary discipline. By tossing fresh ingredients at extreme temperatures, we achieve a charred, complex caramelization that defines the soul of authentic street craft.
                        </p>
                        <Link href="/menu" className="btn btn-primary">See the Menu</Link>
                    </div>
                </div>
            </div>
        </section>

        {/* CHAPTERS III + IV: THE STORY and THE EXHIBITION.

            One <section>, not two. They were two adjacent .bg-orange-field
            sections, and each one paints its own copy of the lotus artwork at
            `background-size: cover` - so the art restarted at the join and drew
            a visible horizontal line straight across the page, even though both
            sections were the same colour. No amount of padding or seam work
            fixes that; the art has to be one continuous field, which means one
            element. Merging them is also the most literal reading of "section
            divisions should be removed": there is now genuinely no division. */}
        <section id="heritage" className="heritage bg-orange-field section-blend">
            <div className="heritage-inner reveal-hidden">
                <div className="heritage-head">
                    <blockquote className="heritage-quote">
                        Bangkok&rsquo;s fiercest street corners, <em>quietly elevated.</em>
                    </blockquote>
                </div>

                {/* The rooms themselves - the murals, the neon, the tuk-tuk. The
                    dish photography carries the Exhibition chapter immediately
                    below; running plates here too made the two chapters read as
                    one continuous food grid with a heading in the middle.

                    Columns of room photography drifting slowly upward inside a
                    feathered frame - see InteriorDrift for why the columns
                    translate rather than the frame scrolling. It shows a lot of
                    rooms at once, which is the job: three outlets with a great
                    deal of interior to show. */}
                <InteriorDrift shots={INTERIORS} />

                <div className="heritage-note">
                    <p>
                        Khao San is a bridge. We preserve the raw techniques and heat of
                        legendary Thai street stalls, then set them in a room built for
                        sharing. No shortcuts &mdash; just authentic craft.
                    </p>
                    <Link href="/menu" className="btn btn-secondary">Explore the Menu</Link>
                </div>
            </div>

            {/* THE EXHIBITION (Food Spotlight) - continues inside the same
                orange field rather than opening a new one. No heading label and
                no divider mark: the change of content is the only transition. */}
            <div className="container" style={{position: 'relative', zIndex: 2, paddingTop: 'clamp(64px, 8vw, 120px)'}}>
                <div style={{textAlign: 'left', marginBottom: '80px', maxWidth: '1000px', margin: '0 auto 80px'}}>
                    <h2 className="display-2">Signature Spreads</h2>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: 'clamp(80px, 12vw, 160px)', maxWidth: '1120px', margin: '0 auto'}}>
                    {/* 01 - Pad Thai: large plate left, copy set into the right column */}
                    <div className="spread">
                    <div className="spread-media reveal-toss">
                        <div className="dish dish--angled" style={{ position: 'relative', aspectRatio: '1/1' }}>
                            <Image className="dish-img img-feather" src="/assets/Menu/KS Menu Webp/E. Noodles/Pad Thai.webp" alt="Pad Thai" fill sizes="(max-width: 820px) 90vw, 52vw" />
                        </div>
                    </div>
                        <div className="spread-copy">
                            <h3 className="display-2" style={{marginBottom: '18px'}}>Pad Thai Goong</h3>
                            <p className="body-large text-pretty" style={{color: 'var(--color-text-secondary)', marginBottom: '28px', lineHeight: 1.8, fontSize: '1.1rem'}}>
                                Rice noodles flash-tossed in high wok fire with river prawns, baked tofu, peanuts and our house tamarind reduction &mdash; the rhythm of the wok in a single plate.
                            </p>
                            <Link href="/menu#e-noodles" className="btn btn-secondary">View Noodles</Link>
                        </div>
                    </div>

                    {/* 02 - Tom Yum: copy left, large plate bleeding into the right */}
                    <div className="spread spread--reverse">
                        <div className="spread-copy">
                            <h3 className="display-2" style={{marginBottom: '18px'}}>Tom Yum Goong</h3>
                            <p className="body-large text-pretty" style={{color: 'var(--color-text-secondary)', marginBottom: '28px', lineHeight: 1.8, fontSize: '1.1rem', marginLeft: 'auto'}}>
                                A piping-hot, sour-spicy river-prawn soup infused with hand-crushed aromatics &mdash; an uncompromising standard of true Bangkok street balance.
                            </p>
                            <Link href="/menu#b-soups" className="btn btn-secondary">View Soups</Link>
                        </div>
                        <div className="spread-media reveal-toss">
                            <div className="dish" style={{ position: 'relative', aspectRatio: '1/1' }}>
                                <Image className="dish-img img-feather" src="/assets/Menu/KS Menu Webp/B. Soups/Tom Yum Goong.webp" alt="Tom Yum Goong" fill sizes="(max-width: 820px) 90vw, 52vw" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* CHAPTER V: THE HAVENS (Locations - compact card grid, one section) */}
        <section id="locations" className="bg-blue-field section-blend" style={{ padding: 'var(--space-macro) 0', position: 'relative', overflow: 'hidden' }}>
            <div className="container" style={{position: 'relative', zIndex: 1}}>
                <div className="reveal-hidden" style={{textAlign: 'center', marginBottom: '56px'}}>
                    <h2 className="display-2" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-text-primary)'}}>Our Locations.</h2>
                    <p style={{color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '24px auto 0', fontSize: '1.1rem'}}>Three deeply atmospheric dining rooms across Dhaka. Find your nearest.</p>
                </div>

                {/* Every card is the flagship block now - the first location's
                    structure, applied across all three. */}
                <div className="havens-grid">
                    {LOCATIONS.map((loc) => (
                        <div key={loc.name} className="reveal-hidden haven-card">
                            <div className="haven-card-image">
                                <Image src={loc.imageSrc} alt={`Khao San ${loc.name} dining room`} fill style={{objectFit: 'cover'}} sizes="(max-width: 900px) 100vw, 560px" />
                            </div>
                            <div className="haven-card-body">
                                <h3>{loc.name}</h3>
                                <div className="haven-card-meta">
                                    <p className="haven-card-address">{loc.address}</p>
                                    <p className="haven-card-hours">{loc.hours.join(' · ')}</p>
                                </div>
                                <div className="haven-card-actions">
                                    <a
                                        href={`https://wa.me/${loc.whatsapp}?text=${encodeURIComponent(`Hi, I'd like to get in touch with Khao San ${loc.name}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >Contact Us</a>
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(loc.mapQuery)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-secondary btn-directions"
                                    >Directions</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        {/* CHAPTER VI: THE GIFT - dark, with a single restrained saffron brush
            accent and a warm glow. overflow:hidden keeps the tilted cards from
            spilling into the Reserve section below. */}
        {/* .gift-field: cream ground carrying a single large lotus bloom - see
            globals.css for why this section is pale rather than orange (the
            saffron brush and the dark cards both need a light surface) and why
            it uses a different lotus from the menu page. */}
        <section
            id="gift"
            className="reveal-hidden section-blend gift-field"
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            <div aria-hidden="true" style={{ position: 'absolute', top: '50%', right: '8%', transform: 'translateY(-50%)', width: 'min(760px, 60vw)', height: '460px', background: 'radial-gradient(ellipse at center, rgba(240, 139, 67, 0.10) 0%, rgba(240, 139, 67, 0) 66%)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div className="container" style={{position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)'}}>
                <div className="landing-gift-grid">

                    {/* Header - desktop: col 1 row 1. Mobile: first (order -2). */}
                    <h2 className="reveal-stagger landing-gift-head" style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                        lineHeight: 1.1,
                        color: 'var(--color-text-primary)',
                        fontWeight: 600
                    }}>
                        An evening, <span style={{color: 'var(--color-primary)', fontStyle: 'italic'}}>Gifted.</span>
                    </h2>

                    {/* Body - desktop: col 1 row 2. Mobile: last (order 0). */}
                    <div className="reveal-stagger landing-gift-body">
                        <p style={{
                            color: 'var(--color-text-primary)',
                            fontSize: '1.05rem',
                            marginBottom: '32px',
                            lineHeight: 1.6,
                            opacity: 0.9
                        }}>
                            The perfect present for special occasions, a Khao San gift card unlocks the full menu across all three outlets. Delivered digitally, redeemable instantly.
                        </p>

                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 40px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            color: 'var(--color-text-primary)',
                            fontSize: '0.95rem'
                        }}>
                            <li style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block'}}></span>
                                Redeemable at Dhanmondi, Gulshan &amp; Uttara
                            </li>
                            <li style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block'}}></span>
                                Personalised note with each digital card
                            </li>
                            <li style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block'}}></span>
                                No expiry, No hidden fees
                            </li>
                        </ul>

                        <a
                            href={`https://wa.me/8801600068193?text=${encodeURIComponent("Hi, I'd like to purchase a Khao San gift card.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            Contact Us &rarr;
                        </a>
                    </div>

                    {/* Cards - desktop: col 2 rows 1-2. Mobile: second (order -1). */}
                    <div className="reveal-hidden landing-gift-cards" style={{position: 'relative', minHeight: '460px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>

                        {/* One brush sweep, not three. Three near-opaque copies of the
                            same stroke stacked at different angles stopped reading as
                            brushwork and became an undifferentiated orange mass behind
                            the cards - the crudest element on the page, and it fought
                            the cards it was supposed to support. One confident diagonal
                            matches how the brush asset is used elsewhere on the site
                            (one deliberate mark - see BrushTransition).

                            Opacity is near-full. It was cut to 0.45 while three strokes
                            were stacked AND while the section was orange - both reasons
                            are gone. On the cream field a single stroke at that value
                            just read as a washed-out smudge rather than paint; the
                            asset is a real saffron brush and should look like one. */}
                        {/* The wrapper is centred on the card area, but the painted
                            mass inside saffron.png is not centred in its own frame —
                            the dense body sits low-left with the splatter trailing
                            up-right — and rotating it -38deg swings that mass further
                            down-left again. Centring the BOX therefore left the cards
                            sitting above and right of the stroke rather than within it.
                            Measured from the render: the brush centroid was 134px left
                            and 74px below the card centroid on a ~800px-wide container,
                            hence the +17% / -9% correction below, which keeps the cards
                            in the middle of the paint at any width. A first pass at
                            +17%/-9% overshot to (-39, +32); +13%/-6.3% lands it. */}
                        <div aria-hidden="true" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(calc(-50% + 13%), calc(-50% - 6.3%)) rotate(-38deg) scale(1.42)', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'}}>
                            <Image src="/assets/brush-strokes/saffron.png" alt="" fill style={{ objectFit: 'contain', opacity: 0.95 }} sizes="(max-width: 768px) 100vw, 800px" />
                        </div>

                        {/* Gift Cards Container */}
                        <div style={{position: 'relative', width: '100%', maxWidth: '760px', aspectRatio: '16/11', zIndex: 1}}>

                            {/* 1500Tk Card (Bottom layer, rotated right).
                                The pair sits tighter and further right than before:
                                closing the diagonal spread makes them read as one
                                stacked object rather than two drifting apart, and
                                shifting right opens cream to the left of the brush
                                so the stroke is actually visible. The overlap is
                                still only a corner touch - at the original
                                66%/8%/9% the front card covered this one's
                                "The Thai Way" wordmark and cut it mid-phrase. */}
                            <div style={{
                                position: 'absolute',
                                bottom: '6%',
                                right: '0%',
                                width: '58%',
                                transform: 'rotate(6deg)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: '0 32px 64px rgba(141, 54, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                                zIndex: 1,
                                overflow: 'hidden'
                            }}>
                                <Image
                                    src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/1500Tk Front.webp"
                                    alt="1500 BDT Gift Card"
                                    width={1523}
                                    height={871}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    sizes="(max-width: 768px) 80vw, 600px"
                                />
                            </div>

                            {/* 3000Tk Card (Top layer, rotated left) - see the note
                                on the card below re: the tightened stack. */}
                            <div style={{
                                position: 'absolute',
                                top: '6%',
                                left: '10%',
                                width: '58%',
                                transform: 'rotate(-5deg)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: '0 48px 100px rgba(141, 54, 31, 0.8), 0 0 0 1px rgba(255,255,255,0.1)',
                                zIndex: 2,
                                overflow: 'hidden'
                            }}>
                                <Image
                                    src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/3000Tk Front.webp"
                                    alt="3000 BDT Gift Card"
                                    width={1524}
                                    height={871}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    sizes="(max-width: 768px) 80vw, 600px"
                                />
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>

        {/* CHAPTER VII: THE INVITATION */}
        <section className="section-reservation section-blend">
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0}}>
                <Image src="/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp" alt="" fill className="img-feather" style={{objectFit: 'cover'}} />
            </div>
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(30, 41, 59, 0.8)', zIndex: 1}}></div>
            
            <BackgroundVideo
                src="/assets/video-web/closing-table.mp4"
                poster="/assets/posters/closing-table.webp"
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, opacity: 0.75}}
            />
            <div className="invitation-light" aria-hidden="true"></div>

            <div className="container reveal-hidden" style={{position: 'relative', zIndex: 2, maxWidth: '700px', textAlign: 'center'}}>
                {/* Set in the brand's own brush hand - see .display-brush. This is
                    the closing bookend to the hero's "The Thai Way": the site opens
                    and closes in the same lettering, and those are now the only two
                    places on the site that use the brush face.
                    hero-text-shadow: this copy sits directly on bright footage, the
                    case that class exists for. See .section-reservation in
                    globals.css for the measured reasoning. */}
                <h2 className="display-2 display-brush hero-text-shadow" style={{marginBottom: '32px'}}>Taste the fire.</h2>
                <p className="body-large hero-text-shadow" style={{color: 'var(--color-text-secondary)', marginBottom: '48px', fontSize: '1.2rem'}}>We recommend getting in touch in advance. Claim your seat in one of our Dhaka sanctuaries.</p>
                <a
                    href={`https://wa.me/8801600068193?text=${encodeURIComponent("Hi, I'd like to get in touch with Khao San.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >Contact Us &rarr;</a>
            </div>
        </section>
        </>
    );
}
