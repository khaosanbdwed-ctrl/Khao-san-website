"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export interface ShowcaseStep {
    categoryId: string;
    categoryName: string;
    dishTitle: string;
    imageSrc: string;
}
export interface MenuShowcaseProps { steps: ShowcaseStep[]; }
const wrap = (value: number, length: number) => ((value % length) + length) % length;

/** A continuous position, not a scroll container with endpoints to reset.
 * Slides wrap only offscreen, so crossing the last category never reverses motion. */
export default function MenuShowcase({ steps }: MenuShowcaseProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const targetRef = useRef(0);
    const frame = useRef(0);
    const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pointer = useRef<{ id: number; x: number; lastX: number; time: number; velocity: number; origin: number } | null>(null);
    const [position, setPosition] = useState(0);
    const count = steps.length;
    // Small menus still need enough offscreen copies to recycle invisibly.
    const slides = count ? Array.from({ length: count * Math.ceil(7 / count) }, (_, i) => steps[i % count]) : [];
    const active = count ? wrap(Math.round(position), count) : 0;

    const present = useCallback((value: number) => {
        positionRef.current = value;
        setPosition(value);
    }, []);

    const animateTo = useCallback((target: number) => {
        cancelAnimationFrame(frame.current);
        targetRef.current = target;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            present(target);
            return;
        }
        let previous = performance.now();
        const tick = (now: number) => {
            const dt = Math.min(now - previous, 40);
            previous = now;
            const next = positionRef.current + (targetRef.current - positionRef.current) * (1 - Math.exp(-dt / 75));
            if (Math.abs(targetRef.current - next) < 0.001) {
                present(targetRef.current);
                return;
            }
            present(next);
            frame.current = requestAnimationFrame(tick);
        };
        frame.current = requestAnimationFrame(tick);
    }, [present]);

    const stride = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return 400;
        const styles = getComputedStyle(viewport);
        return (parseFloat(styles.getPropertyValue('--center-w')) + parseFloat(styles.getPropertyValue('--side-w'))) / 2 + parseFloat(styles.getPropertyValue('--gap'));
    }, []);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const wheel = (event: WheelEvent) => {
            const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
            if (count < 2 || Math.abs(delta) <= Math.abs(event.shiftKey ? 0 : event.deltaY)) return;
            event.preventDefault();
            cancelAnimationFrame(frame.current);
            const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1);
            present(positionRef.current + pixels / stride());
            targetRef.current = positionRef.current;
            if (wheelTimer.current) clearTimeout(wheelTimer.current);
            wheelTimer.current = setTimeout(() => animateTo(Math.round(positionRef.current)), 120);
        };
        // Pixel values keep gesture distance consistent with responsive CSS geometry.
        const resize = new ResizeObserver(() => {
            const width = viewport.clientWidth;
            viewport.style.setProperty('--center-w', `${width * (width < 768 ? 0.78 : 0.44)}px`);
            viewport.style.setProperty('--side-w', `${width * (width < 768 ? 0.60 : 0.23)}px`);
            viewport.style.setProperty('--gap', `${Math.max(8, Math.min(16, width * 0.009))}px`);
        });
        resize.observe(viewport);
        viewport.addEventListener('wheel', wheel, { passive: false });
        return () => {
            resize.disconnect();
            viewport.removeEventListener('wheel', wheel);
            cancelAnimationFrame(frame.current);
            if (wheelTimer.current) clearTimeout(wheelTimer.current);
        };
    }, [animateTo, count, present, stride]);

    const advance = (direction: number) => animateTo(Math.round(targetRef.current) + direction);
    const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = pointer.current;
        if (!drag || drag.id !== event.pointerId) return;
        pointer.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        const velocity = event.timeStamp - drag.time < 100 && event.type !== 'pointercancel' ? drag.velocity : 0;
        animateTo(Math.round(positionRef.current - Math.max(-0.8, Math.min(0.8, velocity * 180 / stride()))));
    };

    if (!count) return null;
    return (
        <section id="menu-carousel" className="menu-carousel" aria-label="A taste of Khao San">
            <h2 className="menu-carousel__title">A taste of Khao San</h2>
            <div className="menu-carousel__stage">
                <div ref={viewportRef} className="menu-carousel__viewport" role="region" aria-roledescription="carousel"
                    aria-label="Menu categories" aria-describedby="menu-carousel-hint" tabIndex={0}
                    onPointerDown={(event) => {
                        if (count < 2 || event.button !== 0) return;
                        cancelAnimationFrame(frame.current);
                        if (wheelTimer.current) clearTimeout(wheelTimer.current);
                        targetRef.current = positionRef.current;
                        pointer.current = { id: event.pointerId, x: event.clientX, lastX: event.clientX, time: event.timeStamp, velocity: 0, origin: positionRef.current };
                        event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                        const drag = pointer.current;
                        if (!drag || drag.id !== event.pointerId) return;
                        const dt = event.timeStamp - drag.time;
                        if (dt > 0) drag.velocity = (event.clientX - drag.lastX) / dt;
                        drag.lastX = event.clientX;
                        drag.time = event.timeStamp;
                        present(drag.origin - (event.clientX - drag.x) / stride());
                    }}
                    onPointerUp={finishPointer} onPointerCancel={finishPointer} onLostPointerCapture={finishPointer}
                    onKeyDown={(event) => {
                        if (count < 2) return;
                        if (event.key === 'ArrowLeft') { event.preventDefault(); advance(-1); }
                        if (event.key === 'ArrowRight') { event.preventDefault(); advance(1); }
                    }}>
                    {slides.map((slide, index) => {
                        const distance = wrap(index - position + slides.length / 2, slides.length) - slides.length / 2;
                        const depth = Math.min(1, Math.abs(distance));
                        const sign = Math.sign(distance);
                        const style = {
                            '--depth': depth,
                            '--first': sign * Math.min(1, Math.abs(distance)),
                            '--rest': sign * Math.max(0, Math.abs(distance) - 1),
                            opacity: Math.abs(distance) > 3 ? 0 : 1,
                            zIndex: Math.round(10 - Math.abs(distance)),
                        } as React.CSSProperties;
                        return <div key={`${slide.categoryId}-${index}`} className="menu-carousel__slide" style={style}
                            aria-hidden={Math.abs(distance) > 0.5}>
                            <Image src={slide.imageSrc} alt={slide.dishTitle} fill draggable={false}
                                sizes="(max-width: 767px) 78vw, 44vw" loading={Math.abs(distance) <= 2 ? 'eager' : 'lazy'} />
                        </div>;
                    })}
                </div>
                {count > 1 && <>
                    <button type="button" className="menu-carousel__control menu-carousel__control--previous" aria-label="Show previous menu category" onClick={() => advance(-1)}>←</button>
                    <button type="button" className="menu-carousel__control menu-carousel__control--next" aria-label="Show next menu category" onClick={() => advance(1)}>→</button>
                </>}
            </div>
            <div className="menu-carousel__caption">
                <div className="menu-carousel__details" aria-live="polite" aria-atomic="true">
                    <p className="menu-carousel__eyebrow">{steps[active].categoryName} <span>{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span></p>
                    <h3>{steps[active].dishTitle}</h3>
                    <a href={`#${steps[active].categoryId}`}>Explore {steps[active].categoryName.toLowerCase()} <span aria-hidden="true">↗</span></a>
                </div>
                <p id="menu-carousel-hint" className="menu-carousel__hint">Drag to discover <span aria-hidden="true">⟷</span></p>
            </div>
        </section>
    );
}
