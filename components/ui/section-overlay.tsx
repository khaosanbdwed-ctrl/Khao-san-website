import React from 'react';
import SectionBlend from '@/components/ui/section-blend';

interface SectionOverlayProps {
    backgroundImage: string;
    overlayOpacity?: number;
    padding?: string;
    children: React.ReactNode;
    className?: string;
    blend?: boolean;
}

export default function SectionOverlay({ 
    backgroundImage, 
    overlayOpacity = 0.6, 
    padding = 'var(--space-macro) 0',
    children,
    className = '',
    blend = false,
}: SectionOverlayProps) {
    // The source art (Lotus BG / Landing Page Section backgrounds) is a deep
    // navy photo/pattern. A translucent orange wash over a dark image blends
    // to muddy brown at low-to-mid opacity - it needs to be near-opaque to
    // read as clean brand orange, so the floor is clamped here regardless of
    // what each call site requests.
    const effectiveOpacity = Math.max(overlayOpacity, 0.88);
    return (
        <section className={`pattern-overlay ${className}`.trim()} style={{
            padding: padding,
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
        }}>
            <div
                className="hero-overlay"
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: `rgba(255, 150, 63, ${effectiveOpacity})`,
                    zIndex: 0
                }}
            ></div>
            {blend && <SectionBlend />}
            {children}
        </section>
    );
}
