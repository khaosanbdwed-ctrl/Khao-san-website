import React from 'react';
import Image from 'next/image';
import BackgroundVideo from '@/components/ui/background-video';

export interface EditorialBlockProps {
    overline: string;
    title: string;
    description: string;
    mediaType: 'image' | 'video';
    mediaSrc: string;
    mediaAlt?: string;
    reverse?: boolean;
    children?: React.ReactNode;
}

export default function EditorialBlock({
    overline,
    title,
    description,
    mediaType,
    mediaSrc,
    mediaAlt,
    reverse = false,
    children
}: EditorialBlockProps) {
    return (
        <div className="container" style={{position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)'}}>
            <div style={{display: 'flex', flexWrap: reverse ? 'wrap-reverse' : 'wrap', alignItems: 'center', gap: '8vw', margin: '0 auto'}}>
                
                {/* Content Side */}
                <div className="reveal-hidden" style={{
                    flex: '1 1 300px',
                    position: 'relative', 
                    zIndex: 2,
                    order: reverse ? 2 : 1,
                    maxWidth: '450px'
                }}>
                    <span className="overline" style={{color: 'var(--color-primary)', display: 'block', marginBottom: '24px', letterSpacing: '4px'}}>{overline}</span>
                    <h2 className="display-2" style={{marginBottom: '40px', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontFamily: 'var(--font-display)', lineHeight: 1.1}}>{title}</h2>
                    <p className="body-large" style={{color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.2rem', marginBottom: children ? '48px' : '0'}}>{description}</p>
                    {children}
                </div>
                
                {/* Media Side - videos feather into the page (no hard frame);
                    still images keep the rounded editorial card treatment. */}
                <div className="reveal-hidden" style={{
                    flex: '1 1 500px',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'hidden',
                    borderRadius: mediaType === 'video' ? '0' : 'var(--radius-lg)',
                    boxShadow: mediaType === 'video' ? 'none' : 'var(--shadow-float)',
                    aspectRatio: mediaType === 'video' ? '16/9' : '4/5',
                    order: reverse ? 1 : 2,
                }}>
                    {mediaType === 'video' ? (
                        <BackgroundVideo
                            src={mediaSrc}
                            className="media-feather"
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'block',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <Image src={mediaSrc} alt={mediaAlt || title} fill className="img-feather" style={{objectFit: 'cover', display: 'block'}} sizes="(max-width: 768px) 100vw, 60vw" />
                    )}
                </div>
                
            </div>
        </div>
    );
}
