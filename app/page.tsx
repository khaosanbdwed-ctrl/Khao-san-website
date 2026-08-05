"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SectionOverlay from '@/components/ui/section-overlay';
import LocationCard from '@/components/ui/location-card';
import BackgroundVideo from '@/components/ui/background-video';
import BrushTransition from '@/components/ui/brush-transition';
import SectionBlend from '@/components/ui/section-blend';
import { useReservation } from '@/components/ReservationContext';

export default function Home() {
    const { openDrawer } = useReservation();

    return (
        <>
        {/* CHAPTER I: THE THRESHOLD (Hero) */}
        <section className="hero" style={{position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--color-surface-base)'}}>
            <BackgroundVideo
                src="/assets/Brand_Asset/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.mp4"
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.4}}
                className="hero-ken-burns"
            />
            <div className="hero-cinematic-light" aria-hidden="true"></div>

            <div className="container" style={{position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', padding: '0 24px'}}>
                <span className="overline ignition-reveal ignition-reveal-1 hero-text-shadow" style={{color: 'var(--color-primary)', letterSpacing: '6px', marginBottom: '24px', display: 'block', fontSize: '0.85rem'}}> Dhaka Flagship </span>
                <h1 className="display-1 ignition-reveal ignition-reveal-2 hero-text-shadow" style={{color: 'var(--color-text-primary)', marginBottom: '32px', position: 'relative', display: 'inline-block'}}>
                    The Thai Way.
                </h1>
                <p className="body-large ignition-reveal ignition-reveal-3 hero-text-shadow" style={{color: 'var(--color-text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: 1.6}}>
                    Stepping inside is stepping into Bangkok. Dimly lit intimacy, authentic spice, and street craft elevated.
                </p>
                <div className="ignition-reveal ignition-reveal-4" style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <button onClick={openDrawer} className="btn btn-primary">Book A Table</button>
                    <Link href="/menu" className="btn btn-secondary">Explore Menu</Link>
                </div>
            </div>
            
            <SectionBlend />
        </section>

        {/* The seam between chapters is a mark, not a cut */}
        <BrushTransition color="saffron" />

        {/* CHAPTER II: THE FLAME (Energy & Craft - Split Editorial) */}
        <SectionOverlay
            backgroundImage="/assets/Background-20260709T183540Z-2-001/Background/Lotus/Lotus BG.webp"
            overlayOpacity={0.74}
            className="overflow-hidden"
            blend
        >
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
                        <span className="overline" style={{color: 'var(--color-primary)', display: 'block', marginBottom: '24px', letterSpacing: '4px'}}>The Kitchen</span>
                        <h2 className="display-2" style={{marginBottom: '40px', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontFamily: 'var(--font-display)', lineHeight: 1.1}}>The Theatre of Fire.</h2>
                        <p className="body-large" style={{color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.2rem', marginBottom: '48px'}}>
                            Our woks are fueled by raw heat and culinary discipline. By tossing fresh ingredients at extreme temperatures, we achieve a charred, complex caramelization that defines the soul of authentic street craft.
                        </p>
                        <Link href="/menu" className="btn btn-secondary">See the Craft</Link>
                    </div>

                </div>
            </div>
        </SectionOverlay>

        {/* CHAPTER III: THE STORY - immersive editorial storytelling band */}
        <section className="heritage reveal-hidden bg-lattice--quiet">
            <SectionBlend />
            <div className="heritage-inner">
                <div className="heritage-head">
                    <span className="heritage-eyebrow">Our Heritage</span>
                    <blockquote className="heritage-quote">
                        Bangkok&rsquo;s fiercest street corners, <em>quietly elevated.</em>
                    </blockquote>
                </div>

                <div className="heritage-mosaic">
                    <figure className="hm hm--feature">
                        <Image
                            className="img-feather"
                            src="/assets/Location_Image_1_1/Gulshan_Outlet_2.webp"
                            alt="Khao San flagship dining room, Gulshan"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 560px) 100vw, (max-width: 900px) 100vw, 45vw"
                        />
                        <div className="hm-scrim" aria-hidden="true"></div>
                        <figcaption className="hm-cap">Gulshan &middot; Flagship</figcaption>
                    </figure>

                    <figure className="hm hm--tall">
                        <Image
                            className="img-feather"
                            src="/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp"
                            alt="Khao San dining room, Dhanmondi"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 900px) 50vw, 22vw"
                        />
                        <div className="hm-scrim" aria-hidden="true"></div>
                        <figcaption className="hm-cap">Dhanmondi &middot; Original</figcaption>
                    </figure>

                    <figure className="hm hm--wide">
                        <Image
                            className="img-feather"
                            src="/assets/Location_Image_1_1/Uttara_Outlet_3.webp"
                            alt="Khao San night-market dining room, Uttara"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 900px) 100vw, 44vw"
                        />
                        <div className="hm-scrim" aria-hidden="true"></div>
                        <figcaption className="hm-cap">Uttara &middot; Sanctuary</figcaption>
                    </figure>

                    <div className="hm hm--note">
                        <p>
                            Khao San is a bridge. We preserve the raw techniques and heat of
                            legendary Thai street stalls, then set them in a room built for
                            sharing. No shortcuts &mdash; just authentic craft.
                        </p>
                        <Link href="/about" className="btn btn-secondary">Discover Our Story</Link>
                    </div>
                </div>
            </div>
        </section>
 
        {/* CHAPTER IV: THE EXHIBITION (Food Spotlight) - a clean gallery wall,
            not another full lotus wash, so the photography carries the section */}
        <section className="bg-lattice" style={{ position: 'relative', padding: 'var(--space-macro) 0', overflow: 'hidden' }}>
            <SectionBlend />

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
                            <p style={{color: '#fdfbf7', fontWeight: 600, fontSize: '1rem', marginBottom: '28px', letterSpacing: '0.04em'}}>1250 BDT</p>
                            <Link href="/menu#e-noodles" className="btn btn-secondary">View Noodles</Link>
                        </div>
                    </div>

                    {/* 02 - Tom Yum: copy left, large plate bleeding into the right */}
                    <div className="spread spread--reverse">
                        <div className="spread-copy">
                            <div className="spread-meta">
                                <span style={{color: '#ff6b4d', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase'}}>🌶 Fiery</span>
                                <span style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic'}}>Lemongrass &amp; Kaffir Lime</span>
                            </div>
                            <h3 className="display-2" style={{marginBottom: '18px'}}>Tom Yum Goong</h3>
                            <p className="body-large text-pretty" style={{color: 'var(--color-text-secondary)', marginBottom: '28px', lineHeight: 1.8, fontSize: '1.1rem', marginLeft: 'auto'}}>
                                A piping-hot, sour-spicy river-prawn soup infused with hand-crushed aromatics &mdash; an uncompromising standard of true Bangkok street balance.
                            </p>
                            <p style={{color: '#fdfbf7', fontWeight: 600, fontSize: '1rem', marginBottom: '28px', letterSpacing: '0.04em'}}>950 BDT</p>
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

        {/* CHAPTER V: THE HAVENS (Locations Spread - Full Width / Reduced Margins) */}
        <section className="bg-lattice--quiet" style={{ padding: '120px 0 0 0', position: 'relative', overflow: 'hidden' }}>
            <SectionBlend />

            {/* A warm atmospheric glow ties the heading to the vibrant rooms
                below, so it reads as one composition rather than a black void
                sitting above the imagery. */}
            <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(1000px, 92vw)', height: '460px', background: 'radial-gradient(ellipse at 50% 12%, rgba(240, 139, 67, 0.10) 0%, rgba(240, 139, 67, 0) 62%)', pointerEvents: 'none', zIndex: 0 }}></div>

            {/* Edge-to-edge container */}
            <div style={{position: 'relative', zIndex: 1, width: '100%', margin: '0', padding: '0'}}>
                <div className="reveal-hidden" style={{textAlign: 'center', marginBottom: '56px'}}>
                    <span className="overline" style={{color: 'var(--color-primary)'}}>The Spaces</span>
                    <h2 className="display-2" style={{marginTop: '8px', fontSize: 'clamp(3rem, 6vw, 5rem)'}}>Our Havens.</h2>
                    <p style={{color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '24px auto 0', fontSize: '1.2rem'}}>Three deeply atmospheric dining rooms across Dhaka. Find your nearby sanctuary.</p>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '0'}}>
                    <LocationCard
                        className="reveal-stagger"
                        type="Flagship"
                        name="Gulshan 1"
                        address="Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka 1212"
                        phone="+88 01600-068193"
                        hours={["Sat–Thu: 12:00 PM – 11:00 PM", "Friday: 2:00 PM – 11:00 PM"]}
                        imageSrc="/assets/Location_Image_1_1/Gulshan_Outlet_2.webp"
                        mapQuery="Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka"
                        blendTop={true}
                    />

                    <LocationCard
                        className="reveal-stagger"
                        type="Original"
                        name="Dhanmondi"
                        address="Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka"
                        phone="+88 01603-523731"
                        hours={["Sat–Thu: 12:00 PM – 11:00 PM", "Friday: 2:00 PM – 11:00 PM"]}
                        imageSrc="/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp"
                        mapQuery="Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka"
                        reverse={true}
                    />

                    <LocationCard
                        className="reveal-stagger"
                        type="Sanctuary"
                        name="Uttara"
                        address="House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka"
                        phone="+88 01627-167758"
                        hours={["Sat–Thu: 12:00 PM – 11:00 PM", "Friday: 2:00 PM – 11:00 PM"]}
                        imageSrc="/assets/Location_Image_1_1/Uttara_Outlet_3.webp"
                        mapQuery="House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka"
                        blendBottom={true}
                    />
                </div>

                <div style={{textAlign: 'center', padding: '80px 0'}}>
                    <Link href="/locations" className="btn btn-secondary">View All Details &rarr;</Link>
                </div>
            </div></section>
        {/* CHAPTER VI: THE GIFT - dark, with a single restrained saffron brush
            accent and a warm glow. overflow:hidden keeps the tilted cards from
            spilling into the Reserve section below. */}
        <section className="reveal-hidden" style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-surface-base)' }}>
            <SectionBlend />
            <div aria-hidden="true" style={{ position: 'absolute', top: '50%', right: '8%', transform: 'translateY(-50%)', width: 'min(760px, 60vw)', height: '460px', background: 'radial-gradient(ellipse at center, rgba(240, 139, 67, 0.10) 0%, rgba(240, 139, 67, 0) 66%)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div className="container" style={{position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)'}}>
                <div className="landing-gift-grid">

                    {/* Header - desktop: col 1 row 1. Mobile: first (order -2). */}
                    <h2 className="reveal-stagger landing-gift-head" style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                        lineHeight: 1.1,
                        color: '#fdfbf7',
                        fontWeight: 600
                    }}>
                        An evening, <span style={{color: 'var(--color-primary)', fontStyle: 'italic'}}>Gifted.</span>
                    </h2>

                    {/* Body - desktop: col 1 row 2. Mobile: last (order 0). */}
                    <div className="reveal-stagger landing-gift-body">
                        <p style={{
                            color: '#fdfbf7',
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
                            color: '#fdfbf7',
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

                        <Link href="/giftcards" className="btn btn-primary">
                            Purchase Gift Card &rarr;
                        </Link>
                    </div>

                    {/* Cards - desktop: col 2 rows 1-2. Mobile: second (order -1). */}
                    <div className="reveal-hidden landing-gift-cards" style={{position: 'relative', minHeight: '460px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>

                        {/* Dynamic Orange Brush/Splash Backdrop - Sweeping Curve */}
                        {/* Bottom-Left piece */}
                        <div aria-hidden="true" style={{position: 'absolute', top: '70%', left: '35%', transform: 'translate(-50%, -50%) rotate(-30deg) scale(1.3)', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'}}>
                            <Image src="/assets/brush-strokes/saffron.png" alt="" fill style={{ objectFit: 'contain', opacity: 0.95 }} sizes="(max-width: 768px) 100vw, 800px" />
                        </div>
                        {/* Center piece */}
                        <div aria-hidden="true" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg) scale(1.4)', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'}}>
                            <Image src="/assets/brush-strokes/saffron.png" alt="" fill style={{ objectFit: 'contain', opacity: 0.95 }} sizes="(max-width: 768px) 100vw, 800px" />
                        </div>
                        {/* Top-Right piece */}
                        <div aria-hidden="true" style={{position: 'absolute', top: '30%', left: '65%', transform: 'translate(-50%, -50%) rotate(-60deg) scale(1.3)', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'}}>
                            <Image src="/assets/brush-strokes/saffron.png" alt="" fill style={{ objectFit: 'contain', opacity: 0.95 }} sizes="(max-width: 768px) 100vw, 800px" />
                        </div>

                        {/* Gift Cards Container */}
                        <div style={{position: 'relative', width: '100%', maxWidth: '760px', aspectRatio: '16/11', zIndex: 1}}>

                            {/* 1500Tk Card (Bottom layer, rotated right) */}
                            <div style={{
                                position: 'absolute',
                                bottom: '8%',
                                right: '9%',
                                width: '66%',
                                transform: 'rotate(6deg)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                                zIndex: 1,
                                overflow: 'hidden'
                            }}>
                                <Image
                                    src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/1500Tk Front.webp"
                                    alt="1500 BDT Gift Card"
                                    width={1500}
                                    height={850}
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                                    sizes="(max-width: 768px) 80vw, 600px"
                                />
                            </div>

                            {/* 3000Tk Card (Top layer, rotated left) */}
                            <div style={{
                                position: 'absolute',
                                top: '8%',
                                left: '6%',
                                width: '66%',
                                transform: 'rotate(-5deg)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: '0 48px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
                                zIndex: 2,
                                overflow: 'hidden'
                            }}>
                                <Image
                                    src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/3000Tk Front.webp"
                                    alt="3000 BDT Gift Card"
                                    width={1500}
                                    height={850}
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
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
            <SectionBlend />
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0}}>
                <Image src="/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp" alt="" fill className="img-feather" style={{objectFit: 'cover'}} />
            </div>
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(5, 7, 10, 0.8)', zIndex: 1}}></div>
            
            <BackgroundVideo
                src="/assets/Brand_Asset/Khao_San_The_wait_is_finally_over_2134770693761947_1080p_20260706.mp4"
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, opacity: 0.75}}
            />
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(5, 7, 10, 0.25) 0%, rgba(5, 7, 10, 0.75) 100%)', zIndex: 1}}></div>

            <div className="container reveal-hidden" style={{position: 'relative', zIndex: 2, maxWidth: '700px', textAlign: 'center'}}>
                <span className="overline" style={{color: 'var(--color-primary)', display: 'block', marginBottom: '24px'}}>The Final Table</span>
                <h2 className="display-2" style={{marginBottom: '32px'}}>Taste the fire.</h2>
                <p className="body-large" style={{color: 'var(--color-text-secondary)', marginBottom: '48px', fontSize: '1.2rem'}}>We recommend reserving in advance. Claim your seat in one of our Dhaka sanctuaries.</p>
                <button onClick={openDrawer} className="btn btn-primary">Reserve A Table Now &rarr;</button>
            </div>
        </section>
        </>
    );
}
