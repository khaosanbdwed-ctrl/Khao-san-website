"use client";
import React from 'react';
import Image from 'next/image';
import { useReservation } from '@/components/ReservationContext';

export interface LocationCardProps {
    type: string;
    name: string;
    address: string;
    phone: string;
    hours: string[];
    imageSrc: string;
    imageAlt?: string;
    mapQuery: string;
    reverse?: boolean;
    className?: string;
    blendTop?: boolean;
    blendBottom?: boolean;
}

export default function LocationCard({
    type,
    name,
    address,
    phone,
    hours,
    imageSrc,
    imageAlt,
    mapQuery,
    reverse = false,
    className = "",
    blendTop = false,
    blendBottom = false
}: LocationCardProps) {
    const { openDrawer } = useReservation();
    const whatsappNumber = phone.replace(/[^0-9]/g, '');
    return (
        <div className={`reveal-hidden location-card-container ${className}`} style={{justifyContent: reverse ? 'flex-start' : 'flex-end'}}>
            
            {/* Massive Background Image */}
            <div className="location-card-image-wrapper">
                <Image src={imageSrc} alt={imageAlt || name} fill style={{objectFit: 'cover'}} sizes="100vw" />
            </div>
            
            {/* Gradient Overlay for text contrast only */}
            <div className={`location-card-gradient ${reverse ? 'align-left' : 'align-right'}`}></div>
            
            {/* Top and Bottom Blends for seamless integration into the page */}
            {blendTop && <div aria-hidden="true" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '25vh', minHeight: '200px', background: 'linear-gradient(to bottom, rgba(5,7,10,1) 0%, rgba(5,7,10,0) 100%)', zIndex: 2}}></div>}
            {blendBottom && <div aria-hidden="true" style={{position: 'absolute', bottom: 0, left: 0, width: '100%', height: '25vh', minHeight: '200px', background: 'linear-gradient(to top, rgba(5,7,10,1) 0%, rgba(5,7,10,0) 100%)', zIndex: 2}}></div>}
            
            {/* Typography Canvas */}
            <div className="reveal-hidden location-card-content" style={{textAlign: reverse ? 'left' : 'right'}}>
                <span className="overline hero-text-shadow" style={{color: 'var(--color-primary)', display: 'block', marginBottom: '24px', letterSpacing: '6px'}}>{type}</span>
                <h2 className="display-2 hero-text-shadow" style={{marginBottom: '32px', fontSize: 'clamp(3rem, 8vw, 7rem)', fontFamily: 'var(--font-display)', lineHeight: 0.9}}>{name}</h2>
                <p className="body-large hero-text-shadow" style={{color: 'rgba(255,255,255,0.9)', marginBottom: '32px', lineHeight: 1.8, fontSize: '1.2rem', marginLeft: reverse ? '0' : 'auto', marginRight: reverse ? 'auto' : '0'}}>{address}</p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '48px', alignItems: reverse ? 'flex-start' : 'flex-end'}}>
                    <span className="hero-text-shadow" style={{color: 'var(--color-text-primary)', fontWeight: 600, letterSpacing: '2px', fontSize: '1.1rem'}}>📞 {phone}</span>
                    {hours.map((line) => (
                        <span key={line} className="hero-text-shadow" style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px'}}>{line}</span>
                    ))}
                </div>
                <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: reverse ? 'flex-start' : 'flex-end'}}>
                    <button onClick={openDrawer} className="btn btn-primary">Reserve Table</button>
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="btn btn-secondary">WhatsApp</a>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer" className="btn btn-secondary">Directions</a>
                </div>
            </div>
        </div>
    );
}
