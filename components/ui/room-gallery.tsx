"use client";

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { isOptimizable } from '@/lib/media';

export interface RoomShot {
    src: string;
    alt: string;
}

export interface RoomGalleryProps {
    shots: RoomShot[];
    ariaLabel: string;
}

/** Drift speed, px per second. Slow enough to read as a room being panned
 *  rather than a carousel advancing - this chapter is the calm one. */
const DRIFT_PX_PER_SECOND = 30;

/** How long the drift stays out of the way after the visitor last touched it.
 *  Long enough that a flick's momentum finishes and a read of one photograph
 *  is not interrupted; short enough that the strip comes back to life. */
const RESUME_DELAY_MS = 1600;

/** Pause at each end before turning back, so the reversal reads as a decision
 *  rather than a bounce. */
const TURNAROUND_PAUSE_MS = 900;

/** Phones: how long each photograph is held before the strip glides on. */
const STEP_HOLD_MS = 3200;
/** Long enough for a smooth `scrollTo` to land, during which the scroll
 *  events are ours, not the visitor's. */
const STEP_GLIDE_MS = 900;

/* The drift flag comes from useSyncExternalStore rather than state set in an
   effect: `setState` in an effect is a double render the compiler rejects, and
   a store also re-renders when the media query flips, so switching reduced
   motion on stops the drift live rather than at the next reload. */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
}
const driftAllowed = () => !window.matchMedia(REDUCED_MOTION).matches;
const driftAllowedOnServer = () => false;

/**
 * The rooms, as a gallery that drifts sideways and that you can also scroll.
 *
 * Replaces `InteriorDrift`, a three-column masonry whose columns drifted
 * upward at different rates. Looked at rather than measured, it had four
 * problems and they were all the same problem - it was restless where it
 * should have been calm:
 *
 *  - the columns were mid-drift at every moment, so the top and bottom of the
 *    section were always slicing images in half;
 *  - the plates were staggered and unequal, so there was no line anywhere for
 *    the eye to rest on;
 *  - every plate carried a burnt-in location label, which meant "DHANMONDI"
 *    and "UTTARA" each appeared twice in one view;
 *  - and it needed a "PAUSE GALLERY" button - a control that exists only to
 *    stop a motion nobody asked for.
 *
 * This is the shape the client described: a big frame with two stacked beside
 * it, repeating, running off the right edge so it reads as a strip that
 * continues. Every image is fully inside its frame and every frame aligns to
 * the same top and bottom line.
 *
 * ⚠ THE DRIFT IS ADDED ON TOP OF A REAL SCROLLER, NOT INSTEAD OF ONE. The
 * element is still `overflow-x: auto`, so touch, trackpad, shift+wheel and
 * keyboard all work exactly as they did with no script; the loop below only
 * writes `scrollLeft`. Nothing here is a substitute for the visitor's own
 * control, and every path that stops the drift leaves the strip scrollable.
 *
 * It stops when touched, hovered, focused, or scrolled by hand; when the strip
 * is off screen; and entirely under `prefers-reduced-motion`.
 *
 * ⚠ IT TURNS AROUND AT THE ENDS RATHER THAN LOOPING, AND THAT IS THE SECOND
 * DESIGN OF THIS. The first wrapped seamlessly by rendering a second, identical
 * copy of all nine photographs and jumping back one repeat-length. It worked
 * arithmetically, but it doubled the images in the DOM to buy an effect nobody
 * asked for, and every photograph in the chapter appeared twice to anyone who
 * scrolled far enough. A strip that reaches its end, waits, and comes back is
 * nine photographs shown honestly.
 */
export default function RoomGallery({ shots, ariaLabel }: RoomGalleryProps) {
    /* Groups of three: one wide frame, then two stacked. A group is the unit
       that repeats, so the rhythm stays legible however many photographs the
       client eventually delivers. */
    const groups: RoomShot[][] = [];
    for (let i = 0; i < shots.length; i += 3) groups.push(shots.slice(i, i + 3));

    const scrollerRef = useRef<HTMLDivElement>(null);

    const drifting = useSyncExternalStore(
        subscribeToMotionPreference,
        driftAllowed,
        driftAllowedOnServer,
    );

    useEffect(() => {
        if (!drifting) return;
        const scroller = scrollerRef.current;
        if (!scroller) return;

        let frame = 0;
        let lastFrameAt = 0;
        let hovering = false;
        let pressing = false;
        let focused = false;
        let onScreen = true;
        let interactedUntil = 0;
        let turningUntil = 0;
        let direction: 1 | -1 = 1;

        /* ⚠ THE POSITION IS HELD HERE AS A FLOAT, NOT READ BACK OFF THE
           ELEMENT, AND THAT IS THE BUG THIS VERSION EXISTS TO FIX.

           At 30px/s and 60fps each frame advances the strip by half a pixel.
           The previous loop did `scrollLeft = scrollLeft + 0.5`, and browsers
           quantise `scrollLeft` on write - so the read-back returned the same
           integer, the next frame added another half pixel to that same
           integer, and the strip never moved at all. Half-pixel steps only
           accumulate if something keeps the fraction, so this does.

           It is re-synced from the element whenever the visitor scrolls or the
           drift is paused, which is what keeps the two in agreement. */
        let position = 0;
        /* What we last wrote, so our own scroll events can be told from the
           visitor's - without this the drift reads its own motion as a hand on
           the strip and pauses itself on the first frame. */
        let ownScrollLeft = -1;

        const paused = () =>
            hovering || pressing || focused || !onScreen ||
            performance.now() < interactedUntil;

        /* ⚠ TWO MODES, BECAUSE PHONES SNAP. On phones the strip has
           `scroll-snap-type: x mandatory` (14-phone.css) so a swipe lands on a
           whole photograph. A half-pixel drift cannot coexist with that: the
           browser snaps every write back to the nearest photograph, the strip
           never moves, and the snap-back reads as the visitor's own scroll
           and pauses the drift (client: the gallery "isn't automatically
           scrolling in the phone version"). So a snapping strip advances one
           photograph at a time - hold, glide, hold - and turns back at the
           end; a free strip (tablet and desktop) keeps the continuous drift. */
        let snapping = false;
        const readSnap = () => { snapping = getComputedStyle(scroller).scrollSnapType.startsWith('x'); };
        readSnap();
        window.addEventListener('resize', readSnap);
        let nextStepAt = performance.now() + STEP_HOLD_MS;
        let glidingUntil = 0;

        const stepSlide = (now: number) => {
            if (paused()) { nextStepAt = now + STEP_HOLD_MS; return; }
            if (now < nextStepAt) return;
            const max = scroller.scrollWidth - scroller.clientWidth;
            if (max <= 1) return;
            const pad = parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
            const here = scroller.scrollLeft;
            // The snap stops: each frame's left edge, less the scroll padding.
            const stops = [...scroller.querySelectorAll<HTMLElement>('.room-frame')]
                .map(f => Math.min(max, Math.max(0, f.offsetLeft - scroller.offsetLeft - pad)));
            let target = direction === 1
                ? stops.find(x => x > here + 4)
                : [...stops].reverse().find(x => x < here - 4);
            if (target === undefined) {
                direction = direction === 1 ? -1 : 1;
                target = direction === 1 ? stops.find(x => x > here + 4) : [...stops].reverse().find(x => x < here - 4);
                if (target === undefined) return;
            }
            glidingUntil = now + STEP_GLIDE_MS;
            nextStepAt = now + STEP_GLIDE_MS + STEP_HOLD_MS;
            scroller.scrollTo({ left: target, behavior: 'smooth' });
        };

        const step = (now: number) => {
            frame = requestAnimationFrame(step);
            if (snapping) { stepSlide(now); return; }
            if (!lastFrameAt) { lastFrameAt = now; return; }
            /* Clamped: coming back from a background tab or a long paint hands
               us a delta of seconds, which would teleport the strip. */
            const dt = Math.min(now - lastFrameAt, 64);
            lastFrameAt = now;

            if (paused()) { position = scroller.scrollLeft; return; }
            if (now < turningUntil) return;

            const max = scroller.scrollWidth - scroller.clientWidth;
            if (max <= 1) return;

            position += direction * (DRIFT_PX_PER_SECOND * dt) / 1000;

            if (position >= max) {
                position = max;
                direction = -1;
                turningUntil = now + TURNAROUND_PAUSE_MS;
            } else if (position <= 0) {
                position = 0;
                direction = 1;
                turningUntil = now + TURNAROUND_PAUSE_MS;
            }

            scroller.scrollLeft = position;
            ownScrollLeft = scroller.scrollLeft;
        };

        const onScroll = () => {
            /* Anything we did not write ourselves is the visitor scrolling.
               Take their position as the new truth rather than yanking the
               strip back to ours. */
            if (snapping) {
                // During our own glide the events are ours.
                if (performance.now() > glidingUntil) interactedUntil = performance.now() + RESUME_DELAY_MS;
                return;
            }
            if (Math.abs(scroller.scrollLeft - ownScrollLeft) > 2) {
                position = scroller.scrollLeft;
                interactedUntil = performance.now() + RESUME_DELAY_MS;
            }
        };
        const onEnter = () => { hovering = true; };
        const onLeave = () => { hovering = false; };
        const onDown = () => { pressing = true; };
        const onUp = () => {
            pressing = false;
            /* A flick keeps scrolling after the finger leaves; give the
               momentum the floor rather than fighting it. */
            interactedUntil = performance.now() + RESUME_DELAY_MS;
        };
        const onFocusIn = () => { focused = true; };
        const onFocusOut = () => { focused = false; };

        scroller.addEventListener('scroll', onScroll, { passive: true });
        scroller.addEventListener('pointerenter', onEnter);
        scroller.addEventListener('pointerleave', onLeave);
        scroller.addEventListener('pointerdown', onDown, { passive: true });
        scroller.addEventListener('pointerup', onUp, { passive: true });
        scroller.addEventListener('pointercancel', onUp, { passive: true });
        scroller.addEventListener('focusin', onFocusIn);
        scroller.addEventListener('focusout', onFocusOut);

        /* Off screen it is burning frames to move something nobody is looking
           at. rAF already stops on a hidden tab; this covers a visible tab
           scrolled to another chapter. */
        const io = new IntersectionObserver(
            ([entry]) => { onScreen = entry.isIntersecting; },
            { threshold: 0 },
        );
        io.observe(scroller);

        position = scroller.scrollLeft;
        frame = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(frame);
            io.disconnect();
            window.removeEventListener('resize', readSnap);
            scroller.removeEventListener('scroll', onScroll);
            scroller.removeEventListener('pointerenter', onEnter);
            scroller.removeEventListener('pointerleave', onLeave);
            scroller.removeEventListener('pointerdown', onDown);
            scroller.removeEventListener('pointerup', onUp);
            scroller.removeEventListener('pointercancel', onUp);
            scroller.removeEventListener('focusin', onFocusIn);
            scroller.removeEventListener('focusout', onFocusOut);
        };
    }, [drifting]);

    return (
        <div
            className="room-gallery"
            role="region"
            aria-label={ariaLabel}
            tabIndex={0}
            ref={scrollerRef}
        >
            <div className="room-gallery-track">
                {groups.map((group, gi) => (
                    <div className="room-group" key={gi}>
                        <figure className="room-frame room-frame--lead">
                            <Image
                                src={group[0].src}
                                alt={group[0].alt}
                                fill
                                style={{ objectFit: 'cover' }}
                                /* Measured, not estimated: each photo is cropped to fill
                                   its frame, so a tall frame needs a wider file than
                                   its width. The old hints (42vw / 22vw) were short
                                   by up to 3x on phones and 2x on desktops. */
                                sizes="(max-width: 767px) 90vw, (max-width: 1100px) 60vw, 700px"
                                loading={gi === 0 ? 'eager' : 'lazy'}
                                unoptimized={!isOptimizable(group[0].src)}
                            />
                        </figure>
                        {group.length > 1 && (
                            <div className="room-stack">
                                {group.slice(1).map((shot, si) => (
                                    <figure className="room-frame" key={`${shot.src}-${si}`}>
                                        <Image
                                            src={shot.src}
                                            alt={shot.alt}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 767px) 160vw, (max-width: 1100px) 60vw, 460px"
                                            loading="lazy"
                                            unoptimized={!isOptimizable(shot.src)}
                                        />
                                    </figure>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
