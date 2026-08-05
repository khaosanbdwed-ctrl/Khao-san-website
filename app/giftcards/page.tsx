"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, PenTool, Utensils } from 'lucide-react';
import SectionOverlay from '@/components/ui/section-overlay';
import SectionBlend from '@/components/ui/section-blend';

const WHATSAPP_NUMBER = '8801600068193';
const waLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export default function GiftCardsPage() {
    // gift cards page
    return (
        <main className="page-transition" style={{ minHeight: '100vh' }}>

            {/* Section 1: The Flagship Hero - same split-grid logic as the menu
                hero: contained copy on the left, the card composition on the
                right, one padding rhythm, on a designed lotus-corners ground */}
             <section className="bg-lotus-corners" style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
                <SectionBlend />
                <div aria-hidden="true" style={{ position: 'absolute', top: '50%', right: '8%', transform: 'translateY(-50%)', width: 'min(720px, 55vw)', height: '480px', background: 'radial-gradient(ellipse at center, rgba(240, 139, 67, 0.12) 0%, rgba(240, 139, 67, 0) 66%)', pointerEvents: 'none', zIndex: 0 }}></div>

                <div className="giftcard-hero-inner">
                    {/* Header - first grid child, on mobile order pushes it above cards */}
                    <div className="reveal-hidden gift-hero-head">
                        <span className="overline" style={{ color: 'var(--color-primary)', letterSpacing: '4px', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                            <span style={{ width: '32px', height: '1px', background: 'var(--color-primary)', display: 'inline-block' }}></span>
                            Gift Cards
                        </span>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.75rem, 5.5vw, 4.75rem)',
                            lineHeight: 1.08,
                            letterSpacing: '-0.02em',
                            color: '#fdfbf7',
                            fontWeight: 700,
                            textWrap: 'balance',
                        }}>
                            An evening, <span style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>Gifted.</span>
                        </h1>
                    </div>

                    {/* Body text - desktop: column 1 row 2. Mobile: below cards. */}
                    <div className="reveal-hidden gift-hero-body">

                        <p style={{ color: 'rgba(253,251,247,0.82)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: 1.7, maxWidth: '44ch' }}>
                            The perfect present for special occasions - unlocks the full menu across all three outlets. Message us on WhatsApp to arrange yours.
                        </p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '14px', color: 'rgba(253,251,247,0.9)', fontSize: '1rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block', flexShrink: 0 }}></span>
                                Redeemable at Dhanmondi, Gulshan &amp; Uttara
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block', flexShrink: 0 }}></span>
                                Personalised note with each digital card
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block', flexShrink: 0 }}></span>
                                No expiry, No hidden fees
                            </li>
                        </ul>

                        <Link href="#collection" className="btn btn-primary">
                            View Collection &darr;
                        </Link>
                    </div>

                    {/* Card composition */}
                    <div className="giftcard-hero-cards reveal-hidden">
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
                        <div style={{ position: 'relative', width: '100%', maxWidth: '620px', aspectRatio: '16/10', zIndex: 1 }}>
                            <div style={{ position: 'absolute', bottom: '6%', right: '10%', width: '66%', transform: 'rotate(8deg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)', zIndex: 1, overflow: 'hidden' }}>
                                <Image src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/1500Tk Front.webp" alt="1500 BDT Gift Card" width={1500} height={850} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} sizes="(max-width: 860px) 70vw, 420px" />
                            </div>

                            <div style={{ position: 'absolute', top: '6%', left: '6%', width: '66%', transform: 'rotate(-6deg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 48px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)', zIndex: 2, overflow: 'hidden' }}>
                                <Image src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/3000Tk Front.webp" alt="3000 BDT Gift Card" width={1500} height={850} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} sizes="(max-width: 860px) 70vw, 420px" priority />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: The Collection (Z-Pattern) */}
            <section id="collection" className="bg-lattice--quiet" style={{ padding: 'var(--space-macro) 0', position: 'relative', overflow: 'hidden' }}>
                <SectionBlend />
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <span className="overline" style={{ color: 'var(--color-primary)', letterSpacing: '4px' }}>The Collection</span>
                        <h2 className="display-2" style={{ marginTop: '16px' }}>Choose Your Denomination</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(96px, 12vw, 140px)' }}>
                        
                        {/* 1500 BDT Tier */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '64px', alignItems: 'center' }}>
                            <div style={{ flex: '1 1 450px', position: 'relative' }}>
                                
                                <div className="gift-card-stack" style={{ position: 'relative', zIndex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-float)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Image src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/1500Tk Front.webp" alt="1500 BDT Gift Card" width={1500} height={850} style={{ width: '100%', height: 'auto', display: 'block' }} sizes="(max-width: 768px) 100vw, 600px" />
                                </div>
                            </div>
                            <div style={{ flex: '1 1 400px' }}>
                                <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>1500 BDT</span>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '24px', color: 'var(--color-text-primary)' }}>The Introductory Tasting</h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '32px' }}>
                                    Perfect for a casual lunch or a delightful introductory tasting experience. Gives the recipient the freedom to explore our vibrant appetizers, signature curries, and refreshing beverages.
                                </p>
                                <a href={waLink("Hi Khao San! I'd like to purchase a 1500 BDT gift card.")} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                    Message Us to Buy &mdash; 1500 BDT
                                </a>
                            </div>
                        </div>

                        {/* 3000 BDT Tier */}
                        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '64px', alignItems: 'center' }}>
                            <div style={{ flex: '1 1 400px' }}>
                                <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>3000 BDT</span>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '24px', color: 'var(--color-text-primary)' }}>The Signature Feast</h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '32px' }}>
                                    Ideal for an evening of shared dishes. A generous gift that allows the recipient to indulge in our premium wok-charred specialties, elaborate seafood dishes, and complete course meals.
                                </p>
                                <a href={waLink("Hi Khao San! I'd like to purchase a 3000 BDT gift card.")} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                    Message Us to Buy &mdash; 3000 BDT
                                </a>
                            </div>
                            <div style={{ flex: '1 1 450px', position: 'relative' }}>
                                
                                <div className="gift-card-stack" style={{ position: 'relative', zIndex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-float)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Image src="/assets/Giftcards-20260709T183548Z-2-001/Giftcards/3000Tk Front.webp" alt="3000 BDT Gift Card" width={1500} height={850} style={{ width: '100%', height: 'auto', display: 'block' }} sizes="(max-width: 768px) 100vw, 600px" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Section 3: The Mechanics */}
            <section className="bg-lattice--quiet" style={{ padding: 'var(--space-macro) 0' }}>
                <SectionBlend />
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px' }}>
                        
                        <div className="reveal-hidden reveal-stagger" style={{ textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(240, 139, 67, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--color-primary)' }}>
                                <MessageCircle size={28} strokeWidth={1.5} />
                            </div>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Message to Order</h4>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                Send us a WhatsApp message with your chosen denomination and we&apos;ll arrange payment and delivery directly with you.
                            </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(240, 139, 67, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--color-primary)' }}>
                                <PenTool size={28} strokeWidth={1.5} />
                            </div>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Personal Touch</h4>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                Let us know the occasion and recipient&apos;s name - we&apos;ll personalise the card before it&apos;s delivered.
                            </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(240, 139, 67, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--color-primary)' }}>
                                <Utensils size={28} strokeWidth={1.5} />
                            </div>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Seamless Redemption</h4>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                Redeemable across all three Khao San outlets. No expiration dates, and no hidden maintenance fees.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Section 4: Corporate Gifting */}
            <section style={{ position: 'relative', overflow: 'hidden' }}>
                <SectionOverlay backgroundImage="/assets/Background-20260709T183540Z-2-001/Background/Lotus/Lotus BG.webp" overlayOpacity={0.82} blend>
                    <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <span className="overline" style={{ color: 'var(--color-primary)', letterSpacing: '4px', marginBottom: '24px', display: 'block' }}>Corporate & Bulk</span>
                        <h2 className="display-2" style={{ marginBottom: '32px' }}>Impress Your Clients. <br /> Reward Your Team.</h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '48px' }}>
                            Looking to purchase gift cards in bulk for corporate events, employee rewards, or client appreciation? We offer dedicated support and custom denomination options for corporate partners.
                        </p>
                        <a href={waLink("Hi Khao San! I'm interested in corporate/bulk gift cards.")} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                            Message Us for Corporate Gifting
                        </a>
                    </div>
                </SectionOverlay>
            </section>

        </main>
    );
}
