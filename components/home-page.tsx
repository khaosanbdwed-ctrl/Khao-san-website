"use client";

import React from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';
import BrushTransition from '@/components/ui/brush-transition';
import RoomGallery from '@/components/ui/room-gallery';
import FeatureDish from '@/components/ui/feature-dish';
import type { FeatureDishItem } from '@/components/ui/feature-dish';
import ScrollParallax from '@/components/ui/scroll-parallax';
import { X } from 'lucide-react';
import { mapLink, waLink, type Location } from '@/lib/locations';
import type { HomeContent } from '@/lib/cms/docs/home';
import { BackgroundLayers, CmsButton, RichText, isOptimizable, sectionBackground } from '@/components/cms/cms-ui';

/**
 * The homepage. Every word, photo, video and background below comes from the
 * CMS (Homepage in the dashboard; defaults in lib/cms/docs/home.ts), and the
 * chapters render in the order and visibility the dashboard sets.
 *
 * The design reasoning that used to sit beside the hardcoded copy is kept with
 * the markup it explains. Where a note described CONTENT (why three dishes,
 * why these room shots), it now lives with the defaults instead.
 */

type Props = { content: HomeContent; locations: Location[]; whatsapp: string };

export default function HomePage({ content, locations, whatsapp }: Props) {
    const { hero, craft, story, gift, invitation } = content;

    /* The hero poster is what the visitor actually sees first - the video
       behind it cannot paint for a while, so this still is the LCP element.
       Browsers give a <video poster> no loading priority, so it is preloaded
       here (homepage only - in layout.tsx it would load on /menu too). */
    if (hero.visible && hero.background.poster) {
        ReactDOM.preload(hero.background.poster, { as: 'image', fetchPriority: 'high' });
    }

    const sections: Record<string, React.ReactNode> = {
        hero: (
            <React.Fragment key="hero">
                <section
                    {...sectionBackground(hero.background, {
                        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--color-surface-base)',
                    }, 'hero')}
                >
                    <BackgroundLayers bg={hero.background} priority videoClassName="hero-ken-burns" />
                    <div className="hero-copy" style={{ position: 'relative', zIndex: 2 }}>
                        {/* ⚠ NOTHING SEPARATES THIS COPY FROM THE FOOTAGE, BY
                            REQUEST. The shadow under the hero type and the shade
                            behind it were both removed at the client's request.
                            If contrast ever has to be won back, add a wash in
                            the dashboard (Background -> overlay) or bias the
                            video's window with `object-position` in
                            05-motion.css before reaching for either removed
                            mechanism. */}
                        <div className="hero-lockup ignition-reveal ignition-reveal-1">
                            {/* unoptimized is REQUIRED: the image pipeline
                                re-encodes transparent WebP without alpha, and
                                the `brightness(0) invert(1)` knock-out needs a
                                silhouette to preserve - without alpha the logo
                                disappears entirely. */}
                            {hero.logo && (
                                <Image
                                    src={hero.logo}
                                    alt={hero.logoAlt}
                                    width={232}
                                    height={196}
                                    priority
                                    unoptimized
                                    className="hero-mark"
                                />
                            )}
                            <div className="hero-lockup-text">
                                {hero.eyebrow && <span className="hero-eyebrow">{hero.eyebrow}</span>}
                                <h1 className="hero-title">{hero.title}</h1>
                            </div>
                        </div>
                        <div className="hero-actions ignition-reveal ignition-reveal-2">
                            <CmsButton link={hero.primaryButton} whatsapp={whatsapp} className="btn btn-primary" />
                            <CmsButton link={hero.secondaryButton} whatsapp={whatsapp} className="btn btn-secondary" />
                        </div>
                    </div>
                </section>
                {/* The seam between chapters is a mark, not a cut. */}
                {hero.showDivider && <BrushTransition color={hero.dividerColor} />}
            </React.Fragment>
        ),

        /* THE FLAME - footage one side, copy the other, a 57/43 grid inside
           the page's own 1280 measure with a 3:2 frame. See .craft-split /
           .craft-stage in 09-home-sections.css for why the breakout to a wider
           frame must not come back. */
        craft: (
            <section key="craft" {...sectionBackground(craft.background, { position: 'relative' }, 'craft-chapter bg-blue-field overflow-hidden')}>
                <BackgroundLayers bg={craft.background} />
                <div className="craft-inner">
                    <div className="craft-split">
                        {craft.video && (
                            <div className="reveal-hidden craft-stage">
                                <BackgroundVideo
                                    key={craft.video}
                                    src={craft.video}
                                    poster={craft.poster || undefined}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            </div>
                        )}
                        <div className="craft-copy">
                            <h2 className="display-2" style={{ marginBottom: '28px', fontSize: 'clamp(2rem, 3vw, 3rem)', lineHeight: 1.0, color: 'var(--cms-text-strong, #ffffff)' }}>{craft.heading}</h2>
                            {craft.body && (
                                <p className="body-large" style={{ color: 'var(--cms-text-soft, rgba(255,255,255,0.8))', lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '36px' }}>
                                    {craft.body}
                                </p>
                            )}
                            <CmsButton link={craft.button} whatsapp={whatsapp} className="btn btn-primary" />
                        </div>
                    </div>
                </div>
            </section>
        ),

        /* THE STORY and THE EXHIBITION - one <section>, not two. Two adjacent
           fields each paint their own copy of the background at
           `background-size: cover`, so the art restarted at the join and drew
           a visible line across the page. The background has to be one
           continuous field, which means one element. */
        story: (
            <section key="story" id="heritage" {...sectionBackground(story.background, undefined, 'heritage bg-orange-field')}>
                <BackgroundLayers bg={story.background} />
                <div className="heritage-inner reveal-hidden">
                    {story.quote && (
                        <div className="heritage-head">
                            <blockquote className="heritage-quote"><RichText text={story.quote} /></blockquote>
                        </div>
                    )}
                    {/* One wide frame, two stacked beside it, repeating off the
                        right edge - see RoomGallery. */}
                    {story.gallery.some(s => s.src) && (
                        <RoomGallery shots={story.gallery.filter(s => s.src)} ariaLabel="Inside our rooms" />
                    )}
                    <div className="heritage-note">
                        <CmsButton link={story.button} whatsapp={whatsapp} className="btn btn-secondary" />
                    </div>
                </div>

                {story.signatureHeading && (
                    <div className="signature-row-head">
                        <h2 className="display-2">{story.signatureHeading}</h2>
                    </div>
                )}
                <FeatureDish
                    dishes={story.dishes.filter(d => d.image).map((d): FeatureDishItem => ({
                        src: d.image, name: d.name, blurb: d.blurb, href: d.href,
                        badges: d.badges as FeatureDishItem['badges'],
                    }))}
                />
            </section>
        ),

        locations: (
            <section
                key="locations"
                id="locations"
                {...sectionBackground(content.locations.background, { padding: 'var(--space-macro) 0', position: 'relative', overflow: 'hidden' }, 'bg-blue-field')}
            >
                <BackgroundLayers bg={content.locations.background} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="reveal-hidden" style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <h2 className="display-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-text-primary)' }}>{content.locations.heading}</h2>
                        {content.locations.intro && (
                            <p style={{ color: 'var(--cms-text-soft, rgba(255,255,255,0.75))', maxWidth: '500px', margin: '24px auto 0', fontSize: '1.1rem' }}>{content.locations.intro}</p>
                        )}
                    </div>

                    <div className="havens-grid">
                        {locations.map((loc, i) => (
                            <div key={`${loc.name}-${i}`} className="reveal-hidden haven-card">
                                {/* The room drifts against the scroll inside its
                                    frame, staggered per card so the three do not
                                    move as one block. */}
                                <ScrollParallax className="haven-card-image" shift={[22, 30, 26][i % 3]}>
                                    {loc.imageSrc && (
                                        <Image
                                            src={loc.imageSrc}
                                            alt={`Khao San ${loc.name} dining room`}
                                            fill
                                            unoptimized={!isOptimizable(loc.imageSrc)}
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 900px) 100vw, 560px"
                                        />
                                    )}
                                </ScrollParallax>
                                <div className="haven-card-body">
                                    <h3>{loc.name}</h3>
                                    <div className="haven-card-meta">
                                        <p className="haven-card-address">{loc.address}</p>
                                        <p className="haven-card-hours">{loc.hours.join(' · ')}</p>
                                    </div>
                                    <div className="haven-card-actions">
                                        {content.locations.contactLabel && (
                                            <a
                                                href={waLink(content.locations.contactMessage.replaceAll('{outlet}', loc.name), loc.whatsapp)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary"
                                            >{content.locations.contactLabel}</a>
                                        )}
                                        {content.locations.directionsLabel && (
                                            <a
                                                href={mapLink(loc.mapQuery)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-secondary btn-directions"
                                            >{content.locations.directionsLabel}</a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        ),

        /* THE GIFT - a pale ground carrying a single lotus bloom (.gift-field
           in 10-backgrounds.css: the saffron brush and the dark cards both
           need a light surface). overflow:hidden keeps the tilted cards from
           spilling into the section below. */
        gift: (
            <section key="gift" id="gift" {...sectionBackground(gift.background, { position: 'relative', overflow: 'hidden' }, 'reveal-hidden gift-field')}>
                <BackgroundLayers bg={gift.background} />
                <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)' }}>
                    <div className="landing-gift-grid">
                        <h2 className="reveal-stagger landing-gift-head"><RichText text={gift.heading} /></h2>

                        <div className="reveal-stagger landing-gift-body">
                            {gift.lede && <p className="gift-lede">{gift.lede}</p>}

                            {/* ⚠ THE LEDGER IS A NATIVE POPOVER, DELIBERATELY.
                                `popover` gives top-layer painting (the section's
                                overflow:hidden would clip an absolute panel),
                                Escape and click-outside to dismiss, and focus
                                management - with no state or portal. Without
                                Popover API support it renders inline, and the
                                Details button is hidden (see the @supports guard
                                in 11-layout.css). That is why it sits BEFORE the
                                actions: in the fallback the reading order stays
                                lede, ledger, buttons. */}
                            {gift.details.length > 0 && (
                                <div id="gift-details" popover="auto" className="gift-details">
                                    <div className="gift-details-head">
                                        <h3 className="gift-details-title">{gift.detailsTitle}</h3>
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
                                        {gift.details.map((row, i) => (
                                            <div className="gift-spec-row" key={i}>
                                                <dt>{row.label}</dt>
                                                <dd>{row.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            )}

                            <div className="gift-actions">
                                <CmsButton link={gift.buyButton} whatsapp={whatsapp} className="btn btn-primary" />
                                {gift.details.length > 0 && gift.detailsButtonLabel && (
                                    <button type="button" className="btn btn-secondary gift-details-trigger" popoverTarget="gift-details">
                                        {gift.detailsButtonLabel}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="reveal-hidden landing-gift-cards" style={{ position: 'relative', minHeight: '460px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {/* One confident brush sweep. The painted mass in
                                saffron.png sits low-left of its own frame and the
                                -38deg rotation swings it further, so the box is
                                offset (+13% / -6.3%, measured from the render) to
                                keep the cards in the middle of the paint. */}
                            {gift.brush && (
                                <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(calc(-50% + 13%), calc(-50% - 6.3%)) rotate(-38deg) scale(1.42)', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                                    <Image src={gift.brush} alt="" fill unoptimized={!isOptimizable(gift.brush)} style={{ objectFit: 'contain', opacity: 0.95 }} sizes="(max-width: 768px) 100vw, 800px" />
                                </div>
                            )}

                            <div style={{ position: 'relative', width: '100%', maxWidth: '760px', aspectRatio: '16/11', zIndex: 1 }}>
                                {/* The pair sits tight and right so it reads as one
                                    stacked object, with only a corner touching -
                                    a deeper overlap cut the back card's wordmark. */}
                                {gift.backCard.src && (
                                    <div style={{ position: 'absolute', bottom: '6%', right: '0%', width: '58%', transform: 'rotate(6deg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 32px 64px rgba(141, 54, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.05)', zIndex: 1, overflow: 'hidden' }}>
                                        <Image src={gift.backCard.src} alt={gift.backCard.alt} width={1523} height={871} unoptimized={!isOptimizable(gift.backCard.src)} style={{ width: '100%', height: 'auto', display: 'block' }} sizes="(max-width: 768px) 80vw, 600px" />
                                    </div>
                                )}
                                {gift.frontCard.src && (
                                    <div style={{ position: 'absolute', top: '6%', left: '10%', width: '58%', transform: 'rotate(-5deg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 48px 100px rgba(141, 54, 31, 0.8), 0 0 0 1px rgba(255,255,255,0.1)', zIndex: 2, overflow: 'hidden' }}>
                                        <Image src={gift.frontCard.src} alt={gift.frontCard.alt} width={1524} height={871} unoptimized={!isOptimizable(gift.frontCard.src)} style={{ width: '100%', height: 'auto', display: 'block' }} sizes="(max-width: 768px) 80vw, 600px" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        ),

        /* THE INVITATION - the closing bookend, set in the brand's brush hand
           like the hero's "The Thai Way". hero-text-shadow: this copy sits on
           bright footage, the case that class exists for. */
        invitation: (
            <section key="invitation" {...sectionBackground(invitation.background, undefined, 'section-reservation')}>
                {/* The designed ground - the lotus photo under a slate wash -
                    stays exactly as it was unless the dashboard sets a colour
                    or photo of its own. The layers keep their original order
                    and z-indexes (photo 0, wash 1, film 1 above it). */}
                {!invitation.background.color && !invitation.background.image && (
                    <>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                            <Image src="/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp" alt="" fill className="img-feather" style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(30, 41, 59, 0.8)', zIndex: 1 }}></div>
                    </>
                )}
                {invitation.background.video && (
                    <BackgroundVideo
                        key={invitation.background.video}
                        src={invitation.background.video}
                        poster={invitation.background.poster || undefined}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, opacity: invitation.background.videoOpacity / 100 }}
                    />
                )}
                {invitation.background.overlayOpacity > 0 && (
                    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundColor: invitation.background.overlayColor, opacity: invitation.background.overlayOpacity / 100 }} />
                )}
                <div className="invitation-light" aria-hidden="true"></div>
                <div className="container reveal-hidden" style={{ position: 'relative', zIndex: 2, maxWidth: '700px', textAlign: 'center' }}>
                    <h2 className="display-2 display-brush hero-text-shadow" style={{ marginBottom: '44px' }}>{invitation.heading}</h2>
                    <CmsButton link={invitation.button} whatsapp={whatsapp} className="btn btn-primary" />
                </div>
            </section>
        ),
    };

    return (
        <>
            {content.sectionOrder.map(key => {
                const section = content[key as keyof Omit<HomeContent, 'sectionOrder'>];
                return section && section.visible ? sections[key] : null;
            })}
        </>
    );
}
