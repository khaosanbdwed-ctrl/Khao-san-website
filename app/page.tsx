"use client";

import React from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import BrushTransition from '@/components/ui/brush-transition';
import RoomGallery from '@/components/ui/room-gallery';
import type { RoomShot } from '@/components/ui/room-gallery';
import FeatureDish from '@/components/ui/feature-dish';
import type { FeatureDishItem } from '@/components/ui/feature-dish';
import ScrollParallax from '@/components/ui/scroll-parallax';
import { X } from 'lucide-react';
import { LOCATIONS, waLink, mapLink } from '@/lib/locations';

/* The homepage dish chapter.
 *
 * Has been, in order: two full-width editorial spreads (~2,000px of homepage
 * for two plates, for a kitchen with 75 dishes), then a drifting ten-dish
 * marquee, then a centred carousel. The carousel was good and it moved to the
 * menu page's hero, where a kinetic row earns its place. The homepage keeps
 * the quiet version: three ruled split rows, per the client's reference.
 *
 * Three, not ten. The reference sets three and it is the right number - this
 * chapter's job is to make the kitchen look worth visiting, not to be the
 * menu. The menu is one link away and every row points at it.
 *
 * Plated photographs (menu-plated/), never the transparent cut-outs. */
/* `badges` mirror what each dish carries in Supabase, so a plate marked
   Chef's Special here is marked Chef's Special on the menu page too - one
   vocabulary, defined once in components/ui/dish-tags.tsx. Tom Yum also takes
   `spicy`, which its own menu description ("sweet, sour and spicy broth") has
   always claimed and the badge column never recorded. */
const FEATURES: FeatureDishItem[] = [
    {
        src: '/assets/menu-plated/B. Soups/Tom Yum Goong.webp',
        name: 'Tom Yum Goong',
        blurb: 'River prawns in a clear, sour-hot broth of lemongrass, galangal and lime leaf - hand-crushed to order.',
        href: '/menu#b-soups',
        badges: ['spicy', 'featured'],
    },
    {
        src: '/assets/menu-plated/E. Noodles/Pad Thai.webp',
        name: 'Pad Thai',
        blurb: 'Rice noodles tossed in high wok fire with tamarind, peanut and baked tofu.',
        href: '/menu#e-noodles',
        badges: ['featured'],
    },
    {
        src: '/assets/menu-plated/G. Chicken/Chicken Penang Curry.webp',
        name: 'Chicken Penang Curry',
        blurb: 'A thick, fragrant curry of roasted peanut and coconut cream, finished with sweet basil.',
        href: '/menu#g-chicken',
        badges: ['special'],
    },
];

/* The hero poster is what the visitor actually sees first — the video behind it
   is ~1.2 MB and cannot paint for a while, so this still is the LCP element.
   Browsers do not give a <video poster> any loading priority, so it was being
   fetched after the scripts. Preloading it here (homepage only — putting it in
   layout.tsx would pull it on /menu too, where it never renders) moves the
   first meaningful paint forward by roughly a round trip. */
const HERO_POSTER =
    '/assets/posters/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.webp';

/* Locations come from lib/locations.ts, shared with the footer. They used to
   be declared here AND (partially, already drifted) in components/Footer.tsx;
   NAP that appears in two places eventually disagrees, and it had.

   No `type` or `tagline` fields: the Flagship / Original / Sanctuary
   descriptors were removed at the client's request, and with them the reason
   for one card to be structured differently from the other two. Every location
   now renders the same block. */

/* The room photography.
 *
 * ⚠ Deliberately short, and the gallery is built to survive that. Khao San's
 * interior photography has not been delivered yet - the only room imagery in
 * the repo is three wall-art crops plus the outlet shots the Locations cards
 * use, and everything in `_masters/Brand_Asset/` is menu pages and food
 * (checked, not assumed). Adding photography is a change to this array only.
 *
 * Order matters: RoomGallery groups these in threes - one wide frame, two
 * stacked - so entries 1/4/7 get the large frame. Interleaved by outlet so
 * every group carries more than one room, and the strip reads as the whole
 * brand rather than one location at a time.
 *
 * The `location` and `ratio` fields are gone with InteriorDrift. Ratios were
 * per-plate because the masonry needed uneven shapes to stagger; the frames
 * are uniform now, so `object-fit: cover` handles any source aspect. The
 * burnt-in location labels went because in one view "DHANMONDI" and "UTTARA"
 * each appeared twice, which is noise, not information.
 */
const INTERIORS: RoomShot[] = [
    {
        src: '/assets/interiors/gulshan/tuktuk-booth.webp',
        alt: 'The blue tuk-tuk booth under caged pendant lamps, beside patterned banquette seating',
    },
    {
        src: '/assets/interiors/dhanmondi/tables-palm.webp',
        alt: 'Timber tables with orange and grey chairs, set against dense planting',
    },
    {
        src: '/assets/Heritage/neon-market.webp',
        alt: 'Hand-bent neon signs - Night Market, Khao San, Tom Yum, Tuk Tuk - above the tuk-tuk booth',
    },
    {
        src: '/assets/Heritage/rocco-street.webp',
        alt: 'A painted Bangkok street scene with the Rocco sign glowing over the shopfronts',
    },
    {
        src: '/assets/interiors/dhanmondi/mural-glass.webp',
        alt: 'Tropical mural painted across the glass partition, with the dining room beyond',
    },
    {
        src: '/assets/interiors/uttara/dining-floor.webp',
        alt: 'Orange chairs and timber tables on the oak floor, framed by potted greenery',
    },
    {
        src: '/assets/interiors/gulshan/banquette.webp',
        alt: 'Solid timber tables and grey banquette seating, set with daisies',
    },
    {
        src: '/assets/Heritage/elephant-mark.webp',
        alt: 'The painted elephant, our mark, on the jungle mural wall',
    },
    {
        src: '/assets/interiors/uttara/pendants.webp',
        alt: 'The neon signage wall and jungle mural seen past the pendant lighting rig',
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
            <div className="hero-copy" style={{position: 'relative', zIndex: 2}}>
                {/* Hero order, top to bottom: mark, tagline, actions. Three beats,
                    not four - the descriptive paragraph ("Stepping inside is
                    stepping into Bangkok...") was removed at the client's
                    request. The mark is centred on its own line above the
                    wordmark. "The Thai Way" is set in Good Brush - the
                    hand-painted brush face the brand uses for this phrase - not
                    the display serif.

                    ⚠ NOTHING SEPARATES THIS COPY FROM THE FOOTAGE, BY REQUEST.
                    Two client notes, made separately, add up to that: the
                    shadow under the hero type had to go entirely (so no
                    `hero-text-shadow` here, though the class still exists and
                    the closing chapter still uses it), and then the shade
                    behind it had to go too (so `.hero-cinematic-light` is
                    deleted - see the note in 05-motion.css). White type now
                    sits straight on moving film. If contrast ever has to be
                    won back, bias the video's window with `object-position`
                    before reaching for either of the removed mechanisms. */}
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
                        <span className="hero-eyebrow">Reinventing</span>
                        <h1 className="hero-title">The Thai Way</h1>
                    </div>
                </div>
                {/* Straight from the lockup to the actions. Stepped to
                    `ignition-reveal-2` (was -4) so the ignition stagger stays
                    tight now that the paragraph between them is gone - at -4 the
                    buttons arrived 300ms after the wordmark with nothing in the
                    gap. */}
                <div className="hero-actions ignition-reveal ignition-reveal-2">
                    <a
                        href={waLink("Hi, I'd like to reserve a table at Khao San.")}
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
        <section className="craft-chapter bg-blue-field overflow-hidden" style={{position: 'relative'}}>
            {/* The original split - footage one side, copy the other - now
                balanced rather than weighted. It has been through three shapes:
                an even 16:9 two-up that read as an embedded clip, a full-bleed
                near-viewport-height stage (a hero treatment, and overshoot),
                and a 70/30 breakout to min(94vw, 1660px) that made the frame
                big by taking the row's width from the copy AND by running past
                the gutter every other section aligns to.

                It is a 57/43 grid inside the page's own 1280 measure now, with
                a 3:2 frame - see .craft-split / .craft-stage in
                09-home-sections.css for the measurements and for why the
                breakout must not come back. */}
            <div className="craft-inner">
                <div className="craft-split">
                    <div className="reveal-hidden craft-stage">
                        {/* No `media-feather` here any more - the frame is
                            `.craft-stage`'s own rounded crop. See the note on
                            it in 09-home-sections.css. */}
                        <BackgroundVideo
                            src="/assets/video-web/theatre-craft.mp4"
                            poster="/assets/posters/theatre-craft.webp"
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
        <section id="heritage" className="heritage bg-orange-field">
            <div className="heritage-inner reveal-hidden">
                <div className="heritage-head">
                    <blockquote className="heritage-quote">
                        Bangkok, <em>quietly elevated.</em>
                    </blockquote>
                </div>

                {/* The rooms themselves - the murals, the neon, the tuk-tuk. The
                    dish photography carries the Exhibition chapter immediately
                    below; running plates here too made the two chapters read as
                    one continuous food grid with a heading in the middle.

                A gallery you scroll sideways: one wide frame, two stacked
                beside it, repeating off the right edge. It replaced a drifting
                three-column masonry that was slicing its own images at the
                section edges and needed a pause button - see RoomGallery. */}
                <RoomGallery shots={INTERIORS} ariaLabel="Inside our rooms" />

                {/* The button and nothing else. The paragraph that used to sit
                    beside it ("Khao San is a bridge. We preserve the raw
                    techniques...") was removed at the client's request: the
                    quote above the gallery already states the chapter's
                    argument, and a second block of prose underneath asked the
                    visitor to read the same idea twice with nine photographs in
                    between. The note is a landing point after the strip now,
                    not a caption on it - see .heritage-note. */}
                <div className="heritage-note">
                    <Link href="/menu" className="btn btn-secondary">Explore the Menu</Link>
                </div>
            </div>

            {/* THE SIGNATURE ROW.

                Was two dishes as full-width editorial spreads - roughly 2,000px
                of homepage for two plates, which for a kitchen with 75 dishes
                across 14 categories undersold it badly.

                ROUND 8 made it a centred carousel; Round 9 took that back out
                and left the three ruled split rows below, because the carousel
                and the homepage's own feature rows were two answers to one
                question. The carousel component is deleted - see the
                HISTORICAL note in 09-home-sections.css for why its centring
                could never open flush left. */}
            {/* Heading only. A "see the full menu" button here sat directly
                under the Heritage note's own "Explore the Menu" button - two
                near-identical controls stacked. Every slide in the row already
                links into the menu at its category. */}
            <div className="signature-row-head">
                <h2 className="display-2">Signature Spreads.</h2>
            </div>

            <FeatureDish dishes={FEATURES} />
        </section>

        {/* CHAPTER V: THE HAVENS (Locations - compact card grid, one section) */}
        <section id="locations" className="bg-blue-field" style={{ padding: 'var(--space-macro) 0', position: 'relative', overflow: 'hidden' }}>
            <div className="container" style={{position: 'relative', zIndex: 1}}>
                <div className="reveal-hidden" style={{textAlign: 'center', marginBottom: '56px'}}>
                    <h2 className="display-2" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-text-primary)'}}>Our Locations.</h2>
                    <p style={{color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '24px auto 0', fontSize: '1.1rem'}}>Three deeply atmospheric dining rooms across Dhaka. Find your nearest.</p>
                </div>

                {/* Every card is the flagship block now - the first location's
                    structure, applied across all three. */}
                <div className="havens-grid">
                    {LOCATIONS.map((loc, i) => (
                        <div key={loc.name} className="reveal-hidden haven-card">
                            {/* The room drifts against the scroll inside its
                                frame. Restrained on purpose - these sit inside
                                cards rather than running full-bleed, so the
                                shifts are near the bottom of the reference's
                                measured range (22-47) and staggered per card so
                                the three do not move as one block. */}
                            <ScrollParallax className="haven-card-image" shift={[22, 30, 26][i] ?? 26}>
                                <Image src={loc.imageSrc} alt={`Khao San ${loc.name} dining room`} fill style={{objectFit: 'cover'}} sizes="(max-width: 900px) 100vw, 560px" />
                            </ScrollParallax>
                            <div className="haven-card-body">
                                <h3>{loc.name}</h3>
                                <div className="haven-card-meta">
                                    <p className="haven-card-address">{loc.address}</p>
                                    <p className="haven-card-hours">{loc.hours.join(' · ')}</p>
                                </div>
                                <div className="haven-card-actions">
                                    <a
                                        href={waLink(`Hi, I'd like to get in touch with Khao San ${loc.name}.`, loc.whatsapp)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >Contact Us</a>
                                    <a
                                        href={mapLink(loc.mapQuery)}
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
            className="reveal-hidden gift-field"
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            <div className="container" style={{position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)'}}>
                <div className="landing-gift-grid">

                    {/* Header - desktop: col 1 row 1. Mobile: first (order -2).
                        Styling moved out of the style prop and onto
                        `.landing-gift-head` so this heading sits on the same
                        scale as every other chapter heading instead of carrying
                        its own private clamp. */}
                    <h2 className="reveal-stagger landing-gift-head">
                        An evening, <em>Gifted.</em>
                    </h2>

                    {/* Body - desktop: col 1 row 2. Mobile: last (order 0).

                        ROUND 9: the three facts were a dot-bulleted list - a 6px
                        orange disc beside each line, the one piece of generic
                        UI-kit furniture left on the homepage, and the reason
                        this chapter read as less considered than the ones around
                        it. They are a ruled ledger now: a small-caps label
                        against its value on a hairline, which is the structural
                        language `.feature-row` already establishes on this page
                        and the way a printed card carries its terms.

                        The denominations row is new information, not a
                        restatement. The two cards in the artwork opposite ARE
                        1,500 and 3,000 BDT and the section never said so, which
                        left "unlocks the full menu" as the only concrete thing
                        on offer. Keep this row in step with the two card images
                        beside it if the denominations ever change. */}
                    <div className="reveal-stagger landing-gift-body">
                        <p className="gift-lede">
                            The perfect present for special occasions, a Khao San gift card unlocks the full menu across all three outlets. Delivered digitally, redeemable instantly.
                        </p>

                        {/* ⚠ THE LEDGER IS A NATIVE POPOVER, AND THAT IS A
                            DELIBERATE CHOICE OVER A REACT MODAL.

                            `popover` + `popoverTarget` need no state, no event
                            handlers, no portal and no focus-trap library, and
                            the browser gives us the four things a hand-rolled
                            panel usually gets wrong for free: top-layer
                            painting, Escape to dismiss, click-outside to
                            dismiss, and focus moved into the panel and
                            restored to the trigger on close.

                            Top-layer painting is not a nicety here. The
                            enclosing <section> carries `overflow: hidden` to
                            stop the tilted cards spilling into Reserve below,
                            so an absolutely-positioned panel would be CLIPPED
                            by it. A popover is not.

                            It degrades honestly too: a browser without popover
                            support ignores the attribute and renders the block
                            inline, which is exactly the ledger this section
                            shipped with. See the @supports guard in
                            11-layout.css - the Details button is hidden on
                            those browsers so nothing points at a panel that is
                            already on the page. That is why this sits BEFORE
                            the actions in the DOM: in the fallback the reading
                            order stays lede, ledger, buttons. */}
                        <div id="gift-details" popover="auto" className="gift-details">
                            <div className="gift-details-head">
                                <h3 className="gift-details-title">Gift card details</h3>
                                <button
                                    type="button"
                                    className="gift-details-close"
                                    popoverTarget="gift-details"
                                    popoverTargetAction="hide"
                                    aria-label="Close details"
                                >
                                    <X size={18} strokeWidth={2} aria-hidden="true" />
                                </button>
                            </div>

                            <dl className="gift-spec">
                                <div className="gift-spec-row">
                                    <dt>Denominations</dt>
                                    <dd>1,500 &amp; 3,000 BDT</dd>
                                </div>
                                <div className="gift-spec-row">
                                    <dt>Redeemable at</dt>
                                    <dd>Gulshan &middot; Dhanmondi &middot; Uttara</dd>
                                </div>
                                <div className="gift-spec-row">
                                    <dt>Delivery</dt>
                                    <dd>Digital, with a personalised note</dd>
                                </div>
                                <div className="gift-spec-row">
                                    <dt>Validity</dt>
                                    <dd>No expiry, no hidden fees</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="gift-actions">
                            <a
                                href={waLink("Hi, I'd like to purchase a Khao San gift card.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Buy a Gift Card &rarr;
                            </a>
                            <button
                                type="button"
                                className="btn btn-secondary gift-details-trigger"
                                popoverTarget="gift-details"
                            >
                                Details
                            </button>
                        </div>
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
        <section className="section-reservation">
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
                {/* Two beats: the line, then the action. The paragraph between
                    them ("Three deeply atmospheric rooms across Dhaka. Reach out
                    and we'll hold your table.") was removed at the client's
                    request - it restated the Locations chapter three sections
                    above, and a closing bookend set in the brand's own brush
                    hand is weakened by explaining itself. */}
                <h2 className="display-2 display-brush hero-text-shadow" style={{marginBottom: '44px'}}>Taste the fire.</h2>
                <a
                    href={waLink("Hi, I'd like to get in touch with Khao San.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >Contact Us &rarr;</a>
            </div>
        </section>
        </>
    );
}
