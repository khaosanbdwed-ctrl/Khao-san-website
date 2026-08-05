# Cozy Dark Warmth Plan

**Objective**: Shift the site from harsh near-black noir to a warm, luxury midnight navy while preserving the locked Editorial Nocturne design language, layouts, components, and hero.

**Base color direction**: `#0b1f3d` (deep midnight navy) replacing `#070911`.

---

## Phase 1 — Core Tokens
Update CSS variables in `app/globals.css`.

| Token | Current | New |
|---|---|---|
| `--color-surface-base` | `#070911` | `#0b1f3d` |
| `--color-surface-elevated` | `#111115` | `#13294d` |
| `--color-border` | `rgba(255,255,255,0.08)` | `rgba(245,240,232,0.12)` |
| `--color-text-primary` | `#fdfbf7` | `#f8f5ef` |
| `--color-text-secondary` | `#a0a0a0` | `#b8c0cc` |

**Status**: completed

---

## Phase 2 — Background Scrims
Lighten the overlays over lotus/lattice imagery so warm textures show through.

| Class | Current | New |
|---|---|---|
| `.bg-lattice` | `rgba(7,9,17,0.74)` | `rgba(11,31,61,0.52)` |
| `.bg-lattice--quiet` | `rgba(7,9,17,0.85)` | `rgba(11,31,61,0.68)` |
| `.bg-lotus-corners` | `rgba(7,9,17,0.72)` | `rgba(11,31,61,0.55)` |

**Status**: pending

---

## Phase 3 — Hero Overlay
Keep cinematic structure, soften black layers to navy. Saffron glow should pop even more.

- Update `app/page.tsx` hero overlay gradients.

**Status**: pending

---

## Phase 4 — Audit & Refinements
Test and adjust:
- Menu page flat category sections
- Reservation drawer
- Footer
- Menu rail backdrop/label contrast

**Status**: pending

---

## What Will NOT Change
- Layout, grid, typography, spacing, components
- Hero composition (locked per Design Continuity Constitution)
- Button styles, border radius, shadows
- All images and videos
- Saffron accent `#F08B43`
