"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import BrushTransition from '@/components/ui/brush-transition';

const LOCATIONS = [
    {
        type: 'Flagship',
        name: 'Gulshan 1',
        tagline: 'Where it all began - our original street-corner theatre, still the loudest room in Dhaka.',
        address: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka 1212',
        whatsapp: '8801600068193',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        imageSrc: '/assets/Location_Image_1_1/Gulshan_Outlet_2.webp',
        mapQuery: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka',
    },
    {
        type: 'Original',
        name: 'Dhanmondi',
        address: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
        whatsapp: '8801603523731',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        imageSrc: '/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp',
        mapQuery: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
    },
    {
        type: 'Sanctuary',
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
const HERITAGE_ROOMS = [
    {
        src: '/assets/Heritage/neon-market.webp',
        alt: 'Hand-bent neon signs - Night Market, Khao San, Tom Yum, Tuk Tuk - above the tuk-tuk booth',
        caption: 'The Thai Way',
    },
    {
        src: '/assets/Heritage/elephant-mark.webp',
        alt: 'The painted elephant, our mark, on the jungle mural wall',
        caption: 'The Mark',
    },
    {
        src: '/assets/Heritage/rocco-street.webp',
        alt: 'A painted Bangkok street scene with the Rocco sign glowing over the shopfronts',
        caption: 'Thailand, 0 KM',
    },
];

export default function Home() {
    return (
        <>
        {/* CHAPTER I: THE THRESHOLD (Hero) */}
        <section className="hero" style={{position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--color-surface-base)'}}>
            {/* Plays at full strength. It was held at 0.62 over the cream page
                surface, which washed the room out to near-white before the
                lighting layer even landed on top of it. */}
            <BackgroundVideo
                src="/assets/Brand_Asset/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.mp4"
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0}}
                className="hero-ken-burns"
            />
            <div className="hero-cinematic-light" aria-hidden="true"></div>

            <div className="container" style={{position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', padding: '0 24px'}}>
                {/* The brand's own lockup: the mark set beside the wordmark on one
                    line, with "Reinventing" as the overline above it. "The Thai
                    Way" is set in Good Brush - the hand-painted brush face the
                    brand uses for this phrase - not the display serif. */}
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
            <div className="container" style={{position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)'}}>
                <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8vw', margin: '0 auto'}}>
                    
                    {/* Media Side - feathered so the footage dissolves into the
                        section rather than reading as an outlined rectangle */}
                    <div className="reveal-hidden" style={{
                        flex: '1 1 500px',
                        position: 'relative',
                        zIndex: 1,
                        aspectRatio: '16/9'
                    }}>
                        <BackgroundVideo
                            src="/assets/Brand_Asset/Khao_San_Food_is_fuel_but_its_a_984497544399650_1080p_20260706.mp4"
                            className="media-feather"
                            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                        />
                    </div>

                    {/* Content Side */}
                    <div style={{
                        flex: '1 1 300px',
                        position: 'relative', 
                        zIndex: 2,
                        maxWidth: '450px'
                    }}>
                        <span className="overline" style={{color: 'var(--color-brand-butter)', display: 'block', marginBottom: '24px', letterSpacing: '4px'}}>The Kitchen</span>
                        {/* Brush lettering: this is a "heat" line, which is exactly
                            the register the caps-only brush face suits. Third and
                            middle of the three brush-hand moments (hero, here,
                            closing) - see .display-brush. */}
                        <h2 className="display-2 display-brush" style={{marginBottom: '40px', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.94, color: '#ffffff'}}>The Theatre of Fire.</h2>
                        <p className="body-large" style={{color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontSize: '1.2rem', marginBottom: '48px'}}>
                            Our woks are fueled by raw heat and culinary discipline. By tossing fresh ingredients at extreme temperatures, we achieve a charred, complex caramelization that defines the soul of authentic street craft.
                        </p>
                        <Link href="/menu" className="btn btn-primary">See the Craft</Link>
                    </div>

                </div>
            </div>
        </section>

        {/* CHAPTER III: THE STORY - immersive editorial storytelling band */}
        <section id="heritage" className="heritage reveal-hidden bg-orange-field section-blend">
            <div className="heritage-inner">
                <div className="heritage-head">
                    <span className="heritage-eyebrow">Our Heritage</span>
                    <blockquote className="heritage-quote">
                        Bangkok&rsquo;s fiercest street corners, <em>quietly elevated.</em>
                    </blockquote>
                </div>

                {/* The rooms themselves - the murals, the neon, the tuk-tuk. The
                    dish photography carries the Exhibition chapter immediately
                    below; running plates here too made the two chapters read as
                    one continuous food grid with a heading in the middle. */}
                <div className="heritage-gallery">
                    {HERITAGE_ROOMS.map((room) => (
                        <figure className="hg" key={room.caption}>
                            <div className="hg-card">
                                <Image
                                    src={room.src}
                                    alt={room.alt}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 560px) 90vw, (max-width: 900px) 50vw, 30vw"
                                />
                                <div className="hg-scrim" aria-hidden="true"></div>
                                <figcaption className="hg-cap">{room.caption}</figcaption>
                            </div>
                        </figure>
                    ))}
                </div>

                <div className="heritage-note">
                    <p>
                        Khao San is a bridge. We preserve the raw techniques and heat of
                        legendary Thai street stalls, then set them in a room built for
                        sharing. No shortcuts &mdash; just authentic craft.
                    </p>
                    <Link href="/menu" className="btn btn-secondary">Explore the Menu</Link>
                </div>
            </div>
        </section>
 
        {/* CHAPTER IV: THE EXHIBITION (Food Spotlight) - a clean gallery wall,
            not another full lotus wash, so the photography carries the section */}
        {/* Padding via .section-pad rather than an inline value: this section
            follows another orange one, and the adjacent-field rule in
            globals.css needs to be able to collapse the doubled seam - an
            inline padding would outrank it. */}
        <section className="bg-orange-field section-pad section-blend" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Heritage above is the same orange, so there is no colour change to
                mark the join - the seam supplies the divider. */}
            <div className="section-seam" aria-hidden="true"><span className="section-seam-mark" /></div>

            <div className="container" style={{position: 'relative', zIndex: 2}}>
                <div style={{textAlign: 'left', marginBottom: '80px', maxWidth: '1000px', margin: '0 auto 80px'}}>
                    <span className="overline" style={{color: 'var(--color-primary)'}}>The Exhibition</span>
                    <h2 className="display-2" style={{marginTop: '8px'}}>Signature Spreads</h2>
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
                            <div className="spread-meta">
                                <span style={{color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase'}}>★ Signature</span>
                                <span style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic'}}>Tamarind &amp; Charred Wok</span>
                            </div>
                            <h3 className="display-2" style={{marginBottom: '18px'}}>Pad Thai Goong</h3>
                            <p className="body-large text-pretty" style={{color: 'var(--color-text-secondary)', marginBottom: '28px', lineHeight: 1.8, fontSize: '1.1rem'}}>
                                Rice noodles flash-tossed in high wok fire with river prawns, baked tofu, peanuts and our house tamarind reduction &mdash; the rhythm of the wok in a single plate.
                            </p>
                            <p style={{color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '1rem', marginBottom: '28px', letterSpacing: '0.04em'}}>1250 BDT</p>
                            <Link href="/menu#e-noodles" className="btn btn-secondary">View Noodles</Link>
                        </div>
                    </div>

                    {/* 02 - Tom Yum: copy left, large plate bleeding into the right */}
                    <div className="spread spread--reverse">
                        <div className="spread-copy">
                            <div className="spread-meta">
                                <span style={{color: 'var(--color-brand-blue)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase'}}>🌶 Fiery</span>
                                <span style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic'}}>Lemongrass &amp; Kaffir Lime</span>
                            </div>
                            <h3 className="display-2" style={{marginBottom: '18px'}}>Tom Yum Goong</h3>
                            <p className="body-large text-pretty" style={{color: 'var(--color-text-secondary)', marginBottom: '28px', lineHeight: 1.8, fontSize: '1.1rem', marginLeft: 'auto'}}>
                                A piping-hot, sour-spicy river-prawn soup infused with hand-crushed aromatics &mdash; an uncompromising standard of true Bangkok street balance.
                            </p>
                            <p style={{color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '1rem', marginBottom: '28px', letterSpacing: '0.04em'}}>950 BDT</p>
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
        <section id="havens" className="bg-blue-field section-blend" style={{ padding: 'var(--space-macro) 0', position: 'relative', overflow: 'hidden' }}>
            <div className="container" style={{position: 'relative', zIndex: 1}}>
                <div className="reveal-hidden" style={{textAlign: 'center', marginBottom: '56px'}}>
                    <span className="overline" style={{color: 'var(--color-primary)'}}>The Spaces</span>
                    <h2 className="display-2" style={{marginTop: '8px', fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-text-primary)'}}>Our Havens.</h2>
                    <p style={{color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '24px auto 0', fontSize: '1.1rem'}}>Three deeply atmospheric dining rooms across Dhaka. Find your nearby sanctuary.</p>
                </div>

                <div className="havens-grid">
                    {LOCATIONS.map((loc, i) => (
                        <div key={loc.name} className={`reveal-hidden haven-card${i === 0 ? ' haven-card--feature' : ''}`}>
                            <div className="haven-card-image">
                                <Image src={loc.imageSrc} alt={`Khao San ${loc.name} dining room`} fill style={{objectFit: 'cover'}} sizes={i === 0 ? '(max-width: 900px) 100vw, 600px' : '(max-width: 900px) 100vw, 560px'} />
                            </div>
                            {/* The category moved off the photograph and into the label,
                                where it sets the block as a marked overline. */}
                            <div className="haven-card-body">
                                <span className="haven-card-type">{loc.type}</span>
                                <h3>{loc.name}</h3>
                                {loc.tagline && <p className="haven-card-tagline">{loc.tagline}</p>}
                                <div className="haven-card-meta">
                                    <p className="haven-card-address">{loc.address}</p>
                                    <p className="haven-card-hours">{loc.hours.join(' · ')}</p>
                                </div>
                                <div className="haven-card-actions">
                                    <a
                                        href={`https://wa.me/${loc.whatsapp}?text=${encodeURIComponent(`Hi, I'd like to reserve a table at Khao San ${loc.name}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >Reserve</a>
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(loc.mapQuery)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-secondary"
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
                            Purchase Gift Card &rarr;
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
                        <div aria-hidden="true" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-38deg) scale(1.42)', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'}}>
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
                src="/assets/Brand_Asset/Khao_San_The_wait_is_finally_over_2134770693761947_1080p_20260706.mp4"
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, opacity: 0.75}}
            />
            <div className="invitation-light" aria-hidden="true"></div>

            <div className="container reveal-hidden" style={{position: 'relative', zIndex: 2, maxWidth: '700px', textAlign: 'center'}}>
                {/* hero-text-shadow: this copy sits directly on bright footage, the
                    case that class exists for. See .section-reservation in
                    globals.css for the measured reasoning. */}
                <span className="overline hero-text-shadow" style={{color: 'var(--color-accent)', display: 'block', marginBottom: '24px'}}>The Final Table</span>
                {/* Set in the brand's own brush hand - see .display-brush. This is
                    the closing bookend to the hero's "The Thai Way": the site opens
                    and closes in the same lettering. */}
                <h2 className="display-2 display-brush hero-text-shadow" style={{marginBottom: '32px'}}>Taste the fire.</h2>
                <p className="body-large hero-text-shadow" style={{color: 'var(--color-text-secondary)', marginBottom: '48px', fontSize: '1.2rem'}}>We recommend reserving in advance. Claim your seat in one of our Dhaka sanctuaries.</p>
                <a
                    href={`https://wa.me/8801600068193?text=${encodeURIComponent("Hi, I'd like to reserve a table at Khao San.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >Reserve A Table Now &rarr;</a>
            </div>
        </section>
        </>
    );
}
