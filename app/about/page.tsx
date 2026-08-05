"use client";
import Image from 'next/image';
import SectionOverlay from '@/components/ui/section-overlay';
import EditorialBlock from '@/components/ui/editorial-block';
import SectionBlend from '@/components/ui/section-blend';
import { useReservation } from '@/components/ReservationContext';

export default function About() {
    const { openDrawer } = useReservation();
    return (
        <>
        {/* Editorial hero - an atmospheric room, the narrative set into it */}
        <section style={{ position: 'relative', minHeight: '86vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', backgroundColor: 'var(--color-surface-base)', paddingTop: '120px', paddingBottom: '80px' }}>
            <SectionBlend />
            <Image
                src="/assets/Location_Image_1_1/Uttara_Outlet_3.webp"
                alt="Inside Khao San"
                fill
                priority
                className="img-feather"
                style={{ objectFit: 'cover', opacity: 0.55 }}
                sizes="100vw"
            />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-surface-base) 4%, rgba(5, 7, 10, 0.35) 48%, rgba(5, 7, 10, 0.65) 100%)' }}></div>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5, 7, 10, 0.72) 0%, rgba(5, 7, 10, 0) 58%)' }}></div>

            <div className="container reveal-hidden" style={{ position: 'relative', zIndex: 2, maxWidth: '1000px' }}>
                <span className="overline" style={{ color: 'var(--color-primary)', letterSpacing: '4px', display: 'block', marginBottom: '16px' }}>The Thai Way</span>
                <h1 className="display-1" style={{ marginBottom: '24px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(2.5rem, 5.4vw, 4.75rem)', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '16ch' }}>
                    Bringing authentic Thai flavours to Dhaka.
                </h1>
                <p className="body-large" style={{ color: '#CFCAC2', maxWidth: '560px', fontSize: '1.2rem', lineHeight: 1.7, marginBottom: 0 }}>
                    We believe true hospitality is an art form. Every dish, every interaction, and every shadow in our dining room is designed to transport you.
                </p>
            </div>
        </section>

        {/* Editorial Block 01: Thoughtful Interiors */}
        <SectionOverlay backgroundImage="/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp" overlayOpacity={0.6} blend>
            <EditorialBlock
                overline="Atmosphere"
                title="Thoughtful interiors."
                description="Our spaces are designed with intention. We blend raw concrete textures with warm, ambient lighting to create an atmosphere that feels both modern and timeless."
                mediaType="image"
                mediaSrc="/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp"
                mediaAlt="Dhanmondi Outlet Interior"
            />
        </SectionOverlay>

        {/* Editorial Block 02: Food as Experience */}
        <SectionOverlay backgroundImage="/assets/Background-20260709T183540Z-2-001/Background/Elephant 16 by 9 Ratio Landscape.webp" overlayOpacity={0.6} blend>
            <EditorialBlock
                overline="Craft"
                title="Food is fuel, but it's an experience."
                description="From our rich coconut curry broth to the wok-charred edges of our noodles, every bite is a testament to the uncompromising quality of our ingredients."
                mediaType="video"
                mediaSrc="/assets/Brand_Asset/Khao_San_Rich_coconut_curry_broth_1321748130161536_1440p_20260706.mp4"
                reverse={true}
            />
        </SectionOverlay>

        {/* Editorial Block 03: The Invitation */}
        <SectionOverlay backgroundImage="/assets/Background-20260709T183540Z-2-001/Background/Footer/Footer.webp" overlayOpacity={0.6} blend>
            <EditorialBlock
                overline="The Invitation"
                title="The wait is finally over."
                description="Experience the authentic taste of Thailand in the heart of Dhaka. We are ready to serve you."
                mediaType="video"
                mediaSrc="/assets/Brand_Asset/Khao_San_The_wait_is_finally_over_986585447487584_1080p_20260706.mp4"
            >
                <button onClick={openDrawer} className="btn btn-primary">Reserve Your Table</button>
            </EditorialBlock>
        </SectionOverlay>
        </>
    );
}
