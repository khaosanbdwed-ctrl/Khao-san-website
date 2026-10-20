"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';

/**
 * Drag-and-drop reordering with no library.
 *
 * Grab the handle and drag - mouse, pen and touch all go through Pointer
 * Events, and the item swaps live as it passes its neighbours' midpoints.
 * Keyboard: focus the handle and use the arrow keys.
 *
 * Move/up listeners sit on `window`, not on the handle with pointer capture,
 * because React physically moves the dragged node in the DOM on every swap
 * and a moved node can lose its capture.
 */
export interface SortableItemApi {
    handle: React.ReactElement;
    dragging: boolean;
    index: number;
}

export function SortableList<T>({
    items,
    keyOf,
    onMove,
    render,
    className = 'cms-list',
    itemSelector = '[data-sortable-item]',
    label = 'item',
}: {
    items: T[];
    keyOf: (item: T, index: number) => string;
    onMove: (from: number, to: number) => void;
    render: (item: T, api: SortableItemApi) => React.ReactNode;
    className?: string;
    itemSelector?: string;
    label?: string;
}) {
    const listRef = useRef<HTMLDivElement>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const dragRef = useRef<number | null>(null);
    const [focusKey, setFocusKey] = useState<string | null>(null);
    /* True between asking the parent to move an item and receiving the
       re-ordered list back. Pointer events can arrive faster than React
       re-renders, and a second move computed against the old order would
       swap the wrong items. */
    const pending = useRef(false);
    useEffect(() => { pending.current = false; }, [items]);

    const move = useCallback((from: number, to: number) => {
        if (to < 0 || to >= items.length || from === to) return;
        onMove(from, to);
    }, [items.length, onMove]);

    useEffect(() => {
        if (dragIndex === null) return;
        const onPointerMove = (e: PointerEvent) => {
            const list = listRef.current;
            const from = dragRef.current;
            if (!list || from === null || pending.current) return;
            const nodes = Array.from(list.querySelectorAll<HTMLElement>(`:scope > ${itemSelector}`));
            let to = from;
            for (let i = 0; i < nodes.length; i++) {
                if (i === from) continue;
                const r = nodes[i].getBoundingClientRect();
                const mid = r.top + r.height / 2;
                if (i < from && e.clientY < mid) { to = i; break; }
                if (i > from && e.clientY > mid) to = i;
            }
            if (to !== from) {
                pending.current = true;
                dragRef.current = to;
                setDragIndex(to);
                onMove(from, to);
            }
            // Keep the page scrolling when dragging near the viewport edge.
            const edge = 60;
            if (e.clientY < edge) window.scrollBy(0, -12);
            else if (e.clientY > window.innerHeight - edge) window.scrollBy(0, 12);
        };
        const onUp = () => { dragRef.current = null; pending.current = false; setDragIndex(null); };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [dragIndex, itemSelector, onMove]);

    // A moved DOM node can drop keyboard focus; put it back on the handle.
    useEffect(() => {
        if (!focusKey) return;
        const el = listRef.current?.querySelector<HTMLElement>(`[data-handle-key="${CSS.escape(focusKey)}"]`);
        el?.focus();
    }, [items, focusKey]);

    return (
        <div ref={listRef} className={className}>
            {items.map((item, index) => {
                const key = keyOf(item, index);
                const handle = (
                    <button
                        type="button"
                        className="cms-handle"
                        data-handle-key={key}
                        aria-label={`Drag to reorder ${label} ${index + 1} of ${items.length}. Or use the arrow keys.`}
                        title="Drag to reorder"
                        onPointerDown={(e) => {
                            if (e.button !== 0) return;
                            e.preventDefault();
                            dragRef.current = index;
                            setDragIndex(index);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                setFocusKey(key);
                                move(index, index + (e.key === 'ArrowUp' ? -1 : 1));
                            }
                        }}
                        onBlur={() => setFocusKey(k => (k === key ? null : k))}
                    >
                        <GripVertical size={16} aria-hidden="true" />
                    </button>
                );
                return (
                    <React.Fragment key={key}>
                        {render(item, { handle, dragging: dragIndex === index, index })}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/** Move an array element - the standard onMove implementation. */
export function arrayMove<T>(list: T[], from: number, to: number): T[] {
    const next = list.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}
