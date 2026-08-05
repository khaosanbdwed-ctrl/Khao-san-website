import React from 'react';
import Image from 'next/image';
import { Flame, BookOpen, Camera, Sparkles } from 'lucide-react';

export type MenuBadge = 'spicy' | 'special' | 'featured' | 'new';

export interface MenuCardProps {
    number?: number;
    title: string;
    imageSrc: string;
    price: string;
    groupPrice?: string;
    portionNote?: string;
    description: string;
    badges?: MenuBadge[];
    addOnNote?: string;
    index?: number;
    /** Gently rotate a face-on plate (e.g. top-down soups) so it reads as
        placed on a table rather than staring at the viewer. */
    angled?: boolean;
}

const BADGE_META: Record<MenuBadge, { label: string; icon: React.ReactNode; color: string }> = {
    spicy: { label: 'Spicy', icon: <Flame size={12} strokeWidth={3} />, color: '#ff6b4d' },
    special: { label: 'Special', icon: <BookOpen size={12} strokeWidth={3} />, color: 'var(--color-primary)' },
    featured: { label: 'Featured', icon: <Camera size={12} strokeWidth={3} />, color: '#e8c874' },
    new: { label: 'New', icon: <Sparkles size={12} strokeWidth={3} />, color: '#5fc7b8' },
};

export default function MenuCard({
    number,
    title,
    imageSrc,
    price,
    groupPrice,
    portionNote,
    description,
    badges = [],
    addOnNote,
    index = 0,
    angled = false,
}: MenuCardProps) {
    const isEven = index % 2 === 0;

    return (
        <div className={`reveal-hidden menu-card ${isEven ? 'is-even' : 'is-odd'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left' }}>
            <div className={`dish${angled ? ' dish--angled' : ''}`} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', marginBottom: '20px' }}>
                <Image className="dish-img img-feather" src={imageSrc} alt={title} fill style={{ padding: '8%' }} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />

                {badges.length > 0 && (
                    <div style={{ position: 'absolute', top: '0', left: '0', display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: 'calc(100% - 24px)', zIndex: 3 }}>
                        {badges.map((b) => (
                            <span
                                key={b}
                                title={BADGE_META[b].label}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    color: '#fdfbf7',
                                    backgroundColor: 'rgba(5, 7, 10, 0.72)',
                                    backdropFilter: 'blur(6px)',
                                    border: `1px solid ${BADGE_META[b].color}`,
                                    boxShadow: `0 2px 8px ${BADGE_META[b].color}40`,
                                    borderRadius: 'var(--radius-pill)',
                                    padding: '4px 10px',
                                }}
                            >
                                <span aria-hidden="true" style={{ display: 'flex' }}>{BADGE_META[b].icon}</span>
                                {BADGE_META[b].label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: '0 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--color-text-primary)', lineHeight: 1.3, marginBottom: '8px' }}>
                    {number != null && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginRight: '10px', fontSize: '1rem' }}>{String(number).padStart(2, '0')}</span>}
                    {title}
                    {portionNote && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 400, marginLeft: '8px' }}>{portionNote}</span>}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{price} BDT</span>
                    {groupPrice && (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                            · Group {groupPrice} BDT
                        </span>
                    )}
                </div>

                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: addOnNote ? '8px' : 0 }}>
                    {description}
                </p>
                {addOnNote && (
                    <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        {addOnNote}
                    </p>
                )}
            </div>
        </div>
    );
}
