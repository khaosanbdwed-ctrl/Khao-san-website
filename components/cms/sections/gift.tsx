"use client";

import Image from 'next/image';
import { X } from 'lucide-react';
import { CmsButton, isOptimizable } from '@/components/cms/cms-ui';
import { renderInline } from '@/lib/cms/inline';
import { rootAttrs, type SectionProps } from './types';

/**
 * CHAPTER VI: THE GIFT.
 *
 * ⚠ The details ledger is a native `popover`, deliberately not a React modal:
 * top-layer painting escapes this section's `overflow: hidden` (which stops
 * the tilted cards spilling into the next section), and Escape, click-outside
 * and focus return come from the browser. Without popover support it renders
 * inline, which is why it sits BEFORE the buttons in the DOM - see the
 * @supports guard in 11-layout.css.
 *
 * The brush offset (+13% / -6.3%) is measured: the painted mass in
 * saffron.png sits low-left of its own frame, and this keeps the cards in the
 * middle of the paint at any width.
 */
export default function GiftSection({ data, anchor, cmsId }: SectionProps<'gift'>) {
    const popoverId = `${anchor || cmsId || 'gift'}-details`;
    const hasDetails = data.detailsLabel.trim() !== '' && data.details.length > 0;

    return (
        <section
            {...rootAttrs(anchor, cmsId)}
            className="reveal-hidden gift-field"
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            <div className="container" style={{position: 'relative', zIndex: 2, paddingTop: 'var(--space-macro)', paddingBottom: 'var(--space-macro)'}}>
                <div className="landing-gift-grid">

                    {data.heading && (
                        <h2 className="reveal-stagger landing-gift-head">
                            {renderInline(data.heading)}
                        </h2>
                    )}

                    <div className="reveal-stagger landing-gift-body">
                        {data.lede && (
                            <p className="gift-lede">
                                {renderInline(data.lede)}
                            </p>
                        )}

                        {hasDetails && (
                            <div id={popoverId} popover="auto" className="gift-details">
                                <div className="gift-details-head">
                                    <h3 className="gift-details-title">{data.detailsTitle}</h3>
                                    <button
                                        type="button"
                                        className="gift-details-close"
                                        popoverTarget={popoverId}
                                        popoverTargetAction="hide"
                                        aria-label="Close details"
                                    >
                                        <X size={18} strokeWidth={2} aria-hidden="true" />
                                    </button>
                                </div>

                                <dl className="gift-spec">
                                    {data.details.map((row, i) => (
                                        <div className="gift-spec-row" key={i}>
                                            <dt>{row.label}</dt>
                                            <dd>{row.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        <div className="gift-actions">
                            <CmsButton cta={data.button} />
                            {hasDetails && (
                                <button
                                    type="button"
                                    className="btn btn-secondary gift-details-trigger"
                                    popoverTarget={popoverId}
                                >
                                    {data.detailsLabel}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="reveal-hidden landing-gift-cards" style={{position: 'relative', minHeight: '460px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                        {data.showBrush && (
                            <div aria-hidden="true" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(calc(-50% + 13%), calc(-50% - 6.3%)) rotate(-38deg) scale(1.42)', width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'}}>
                                <Image src="/assets/brush-strokes/saffron.png" alt="" fill style={{ objectFit: 'contain', opacity: 0.95 }} sizes="(max-width: 768px) 100vw, 800px" />
                            </div>
                        )}

                        <div style={{position: 'relative', width: '100%', maxWidth: '760px', aspectRatio: '16/11', zIndex: 1}}>
                            {data.backCard.src && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '6%',
                                    right: '0%',
                                    width: '58%',
                                    transform: 'rotate(6deg)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 32px 64px rgba(141, 54, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                                    zIndex: 1,
                                    overflow: 'hidden'
                                }}>
                                    <Image
                                        src={data.backCard.src}
                                        alt={data.backCard.alt}
                                        width={1523}
                                        height={871}
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                        sizes="(max-width: 768px) 80vw, 600px"
                                        unoptimized={!isOptimizable(data.backCard.src)}
                                    />
                                </div>
                            )}

                            {data.frontCard.src && (
                                <div style={{
                                    position: 'absolute',
                                    top: '6%',
                                    left: '10%',
                                    width: '58%',
                                    transform: 'rotate(-5deg)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 48px 100px rgba(141, 54, 31, 0.8), 0 0 0 1px rgba(255,255,255,0.1)',
                                    zIndex: 2,
                                    overflow: 'hidden'
                                }}>
                                    <Image
                                        src={data.frontCard.src}
                                        alt={data.frontCard.alt}
                                        width={1524}
                                        height={871}
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                        sizes="(max-width: 768px) 80vw, 600px"
                                        unoptimized={!isOptimizable(data.frontCard.src)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
