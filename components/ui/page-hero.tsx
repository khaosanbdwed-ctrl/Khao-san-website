import React from 'react';

type PageHeroProps = {
    overline: string;
    title: string;
    description: string;
    backgroundImage?: string;
    align?: 'left' | 'center';
};

export default function PageHero({ 
    overline, 
    title, 
    description, 
    backgroundImage = 'url("/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp")',
    align = 'left' 
}: PageHeroProps) {
    return (
        <section className="page-hero" style={{
            paddingTop: '160px',
            paddingBottom: '52px',
            position: 'relative', 
            overflow: 'hidden',
            backgroundImage: backgroundImage, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'var(--color-surface-base)'
        }}>
            <div className="hero-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, rgba(5, 7, 10, 0.72) 0%, rgba(5, 7, 10, 0.55) 45%, rgba(5, 7, 10, 0.8) 100%)',
                zIndex: 0
            }}></div>

            <div className="container" style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: '900px',
                textAlign: align === 'center' ? 'center' : 'left',
                margin: align === 'center' ? '0 auto' : '0'
            }}>
                <span className="overline" style={{
                    color: 'var(--color-primary)',
                    letterSpacing: '4px',
                    display: 'block',
                    marginBottom: '16px'
                }}>
                    {overline}
                </span>
                <h1 className="display-1" style={{
                    marginBottom: '24px',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    maxWidth: align === 'left' ? '18ch' : 'none'
                }}>
                    {title}
                </h1>
                <p className="body-large" style={{
                    color: 'var(--color-text-secondary)',
                    maxWidth: align === 'center' ? '600px' : '600px',
                    margin: align === 'center' ? '0 auto' : '0',
                    fontSize: '1.2rem',
                    lineHeight: 1.6
                }}>
                    {description}
                </p>
            </div>
        </section>
    );
}
