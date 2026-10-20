"use client";

import Image from 'next/image';
import ScrollParallax from '@/components/ui/scroll-parallax';
import { useContent } from '@/components/cms/content-context';
import { isOptimizable, mapLink, usePrimaryWhatsApp, waLink } from '@/components/cms/cms-ui';
import { isWhatsAppNumber } from '@/lib/cms/safe';
import { rootAttrs, type SectionProps } from './types';

/**
 * CHAPTER V: THE HAVENS - a card per outlet. The outlets come from the
 * Locations document, the same list the footer and Google's structured data
 * read, so an address can only ever be edited in one place.
 */
export default function LocationsSection({ data, anchor, cmsId }: SectionProps<'locations'>) {
    const { locations } = useContent();
    const primary = usePrimaryWhatsApp();

    return (
        <section {...rootAttrs(anchor, cmsId)} className="bg-blue-field" style={{ padding: 'var(--space-macro) 0', position: 'relative', overflow: 'hidden' }}>
            <div className="container" style={{position: 'relative', zIndex: 1}}>
                <div className="reveal-hidden" style={{textAlign: 'center', marginBottom: '56px'}}>
                    {data.heading && <h2 className="display-2" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-text-primary)'}}>{data.heading}</h2>}
                    {data.intro && <p style={{color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '24px auto 0', fontSize: '1.1rem'}}>{data.intro}</p>}
                </div>

                <div className="havens-grid">
                    {locations.outlets.map((loc, i) => (
                        <div key={`${loc.name}-${i}`} className="reveal-hidden haven-card">
                            {/* Parallax shifts stay near the bottom of the
                                reference's range (22-47) and vary per card so
                                the three do not move as one block. */}
                            <ScrollParallax className="haven-card-image" shift={[22, 30, 26][i % 3]}>
                                {loc.image.src && (
                                    <Image
                                        src={loc.image.src}
                                        alt={loc.image.alt || `Khao San ${loc.name} dining room`}
                                        fill
                                        style={{objectFit: 'cover'}}
                                        sizes="(max-width: 900px) 100vw, 560px"
                                        unoptimized={!isOptimizable(loc.image.src)}
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
                                    {data.contactLabel && (
                                        <a
                                            href={waLink(data.contactMessage.replace(/\{name\}/g, loc.name), isWhatsAppNumber(loc.whatsapp) ? loc.whatsapp : primary)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >{data.contactLabel}</a>
                                    )}
                                    {data.directionsLabel && (
                                        <a
                                            href={mapLink(loc.mapQuery || loc.address)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-secondary btn-directions"
                                        >{data.directionsLabel}</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
