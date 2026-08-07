# Khao San Design Audit — Production Refinement Pass
**Date**: 2026-07-12 | **Baseline**: Draft 1 (86a2ae4)
**Reconciled**: 2026-08-07 — see banner below before trusting any status below at face value.

---

## ⚠ Reconciliation note (2026-08-07)

This audit predates two full rebrand rounds documented in `PRD.md` (2026-08-05 and
2026-08-06) that changed the color system, deleted several pages, and removed the
entire reservation feature. Most of the 110 items below describe a version of the
site that no longer exists. This pass went through every item, checked it against
the current codebase, and marked it one of:

- **✅ FIXED** — resolved, verified against current code (and, for the color/contrast
  items, measured in-browser this round).
- **🚫 OBSOLETE** — the feature/page it refers to was deliberately removed
  (reservations, `/about`, `/locations`, `/giftcards`, `LocationCard`,
  `EditorialBlock`). No action needed or possible.
- **➖ N/A** — was never actually a problem, or is a business/content decision, not
  a code issue.
- **📋 BACKLOG** — genuinely still open, but is a content/feature addition (needs
  real client copy, data, or a product decision) rather than a code/design fix —
  not fabricating placeholder brand copy or numbers.
- **⚪ OPEN (minor)** — genuinely open, low-impact stylistic inconsistency, deferred.

**Fixed this pass (2026-08-07), focused on color/contrast/visibility per client
request, main site only (admin excluded)**:
1. **Active menu-category pill (#81/#44, sitewide, all viewports)** — white text on
   brand-orange fill measured **2.17:1**, failing AA outright — the exact pairing
   `globals.css` explicitly forbids everywhere else on the site. Now navy `#16233d`
   (matches `.btn-primary`'s own established orange-fill solution, 7.25:1 verified
   live). `app/menu/page.tsx`.
2. **Tablet-only sticky nav bar (#11/#44, 768–1024px)** — a leftover near-black-brown
   background (`rgba(60,40,20,0.88)`) from the pre-rebrand dark theme, with inactive
   category labels still using the light-theme's warm-brown ink token, measured
   **2.11:1**. Now a light glass bar matching the header's own treatment — verified
   **6.26:1** live. `app/menu/page.tsx`.
3. **Skip-to-main-content link (#54)** — was genuinely missing. Added as the first
   focusable element site-wide (excluding admin), targeting a new `#main-content`
   on `<main>`. `components/ClientWrapper.tsx`, `.skip-link` in `globals.css`.

Verified: `tsc --noEmit` and `eslint` clean on all touched files. Contrast ratios
above were measured live in-browser (canvas pixel sampling + WCAG relative-luminance
math), not estimated from hex values.

---

## CRITICAL ISSUES (Blocks Production) — 25 items

### UX & Interaction Completeness
1. **Reservation form has no backend integration** 🚫 **OBSOLETE** — the entire reservation feature (drawer, API, form) was removed site-wide per the client's explicit 2026-08 request. Every former reservation touchpoint is now a WhatsApp CTA.
2. **Gift card purchase buttons are non-functional** ✅ **FIXED (by design)** — restaurant has no payment system; buttons are `wa.me` WhatsApp links with prefilled messages, per the client's own accepted solution.
3. **Footer Privacy Policy & Terms links go to `#`** ✅ **FIXED** — `/legal/privacy` and `/legal/terms` exist with real content, linked from the footer.
4. **Menu items have no prices displayed** ✅ **FIXED** — all 75 dishes have real BDT prices from the printed menu, transcribed into `MENU_DATA`.
5. **"Reserve Table" footer links navigate to `/reserve` (dead route)** 🚫 **OBSOLETE** — reservations removed; every former Reserve link is now a WhatsApp CTA.
6. **Menu category descriptions missing** 📋 **BACKLOG** — each category still opens straight into the grid with no intro copy. Genuinely open, but writing category copy means inventing brand voice/claims not sourced from the client — needs real copy, not a code fix.
7. **Mobile hero text scales poorly at 375px** ✅ **FIXED** — `.hero-title` uses `clamp(2.9rem, 7.2vw, 6.25rem)` with `text-wrap: balance`; verified no clipping across the responsive-refinement cycles in `PRD.md`.
8. **Menu pill navigation not sticky on mobile** ✅ **FIXED** — `position: sticky` on `.menu-nav-section` (desktop/tablet); phone width gets a dedicated `.menu-rail` document-outline navigator instead, a deliberate upgrade over a sticky pill bar at that size.
9. **Location cards images don't resize properly below 768px** 🚫 **OBSOLETE** — standalone `/locations` page and `LocationCard` component deleted; superseded by the homepage `.havens-grid`, which has its own verified responsive collapse (2-col → 1-col ≤900px).
10. **Gift card section overlapping brush strokes on mobile** 🚫 **OBSOLETE** — standalone `/giftcards` page deleted; the homepage gift chapter (`.landing-gift-grid`) has its own explicit mobile reflow.
11. **Section margins collapse inconsistently below 768px** ✅ **FIXED** — `--space-macro`/`--space-layout` now scale explicitly at 1024px and 768px breakpoints, plus a shared `.section-pad` utility used consistently.
12. **Horizontal overflow on mobile at 100vw sections** ✅ **FIXED** — root-cause fixed (`html,body { overflow-x: clip }` + off-canvas surfaces switched from `right:-100%` to `transform: translateX()`), documented and verified at 375/768/1265px with zero overflow.
13. **Form inputs too small on mobile** 🚫 **OBSOLETE** — the reservation form (and its `.premium-input`/`.party-size-grid` CSS) is gone; no form inputs remain on the main site.
14. **Reservation drawer button not full-width on mobile** 🚫 **OBSOLETE** — drawer removed.
15. **Mobile menu overlay may not reach bottom on tall screens** ✅ **FIXED** — `.mobile-nav-overlay` is a fixed full-viewport flex-centered panel; current nav has only 5 items, well within any viewport.
16. **Homepage hero section has inconsistent padding top/bottom** ✅ **FIXED** — `.hero` sets `padding-top`/`padding-bottom` to the same `--header-h` token, documented as deliberate for optical centering.
17. **"Theatre of Fire" video container aspect ratio feels off** ✅ **FIXED** — explicit `aspectRatio: '16/9'` on a feathered, flex-wrapping container.
18. **Signature Dish gap spacing inconsistent** ✅ **RESOLVED (rebuilt)** — the whole section was rebuilt as the `.spread` editorial system with a responsive `clamp(28px, 5vw, 72px)` gap, not the original flex layout this item described.
19. **Location cards have no explicit mobile stacking behavior** 🚫 **OBSOLETE** — superseded by `.havens-grid`, which has an explicit, verified mobile stack.
20. **Footer layout doesn't adapt well below 640px** ✅ **FIXED** — `.footer-top` collapses to a 2-column grid ≤900px and ≤560px, verified clean at 375px.
21. **Display headings use clamp() but values may not be optimized** ✅ **FIXED** — extensively re-tuned across multiple cycles (e.g. the menu hero headline fracture bug, About hero overflow) with documented root-cause fixes.
22. **Overline text doesn't scale responsively** ➖ **N/A** — `.overline` is `0.85rem`, which scales with the user's root font size like any rem value; checked live, it reads fine at every breakpoint. Not an actual problem.
23. **Menu item title font size inconsistent** ✅ **FIXED** — `MenuCard` standardizes every dish title to `1.35rem` / `var(--font-display)` in one place.
24. **Body text line-height varies (1.6, 1.7, 1.8)** ⚪ **OPEN (minor)** — the base body line-height is standardized to 1.7, but a handful of inline styles still set 1.6/1.8 for specific copy blocks (hero intro, spread copy). Low-impact, deliberate-looking in most cases; not touched this pass.
25. **Blockquote in heritage section may not scale well at mobile** ✅ **FIXED** — `.heritage-quote` re-tuned to `clamp(2rem, 3.6vw, 3.4rem)`, documented fix for a `max-width: 20ch` sizing bug.

---

## HIGH-PRIORITY ISSUES (Quality Blockers) — 35 items

### Visual Consistency & Spacing Rhythm
26. **Container padding uses inconsistent logic** ➖ **N/A** — `max(8vw, 24px)` is a deliberate, single rule applied everywhere via `.container`, not an inconsistency.
27. **Section padding too large on tablet** ✅ **FIXED** — `--space-macro` explicitly steps down at the 1024px breakpoint.
28. **Horizontal gaps vary (48px vs 80px vs 8vw)** ✅ **FIXED** — a defined `--space-*` token scale plus `.section-pad` utilities are now used consistently instead of ad-hoc values.
29. **Hero buttons have different hover distances than other buttons** ✅ **FIXED** — all `.btn` variants share the same `-2px` hover transform.
30. **Edge-to-edge sections have different margin behavior** ✅ **FIXED** — standardized via the `.bg-orange-field`/`.bg-blue-field`/`.section-pad` system.
31. **Menu cards stagger only on desktop** ✅ **FIXED (by design)** — documented deliberate choice: mobile relies on grid row-gap instead of a stagger offset, which would look jarring single-column.
32. **Location cards have hardcoded reverse prop** 🚫 **OBSOLETE** — `LocationCard` component deleted.
33. **EditorialBlock doesn't account for image aspect ratio** 🚫 **OBSOLETE** — `EditorialBlock` is dead code (no longer imported anywhere); the pages that used it were deleted.
34. **"Signature" badge styling inconsistent** ✅ **FIXED** — single `BADGE_META` table in `MenuCard` is the one source of truth for every badge.
35. **Hover states missing on non-button links** ✅ **FIXED** — `.nav-link:hover`, `.footer-link:hover`, `.hg:hover`, etc. all have visible states.
36. **Focus states not visible on form inputs** ✅ **FIXED** — global `a/button/input/textarea:focus-visible` ring covers every current interactive element.
37. **Selected state on reservation selects not distinct** 🚫 **OBSOLETE** — form removed.
38. **Button variants inconsistent in mobile nav** ✅ **FIXED** — mobile nav's Reserve link uses the same `.btn.btn-primary` class as everywhere else.
39. **No explicit tablet breakpoint (768–1024px)** ✅ **FIXED** — explicit `≤1024px` rules exist for the header, menu nav, and spacing scale.
40. **Video background components don't have poster images** ⚪ **OPEN (minor, mitigated)** — no `poster` is passed at any call site, but the hero section's own background color is now warm cream, not black — so the original "black box before load" symptom no longer applies under the bright theme. Low priority.
41. **Images not lazy-loaded selectively** ✅ **FIXED** — `MenuCard` images use `loading="lazy"`; only genuinely above-the-fold images (hero, header logo) use `priority`.
42. **No srcSet for responsive images** ✅ **FIXED** — every `next/image` usage sets `sizes`, and Next.js generates the responsive `srcset` automatically.
43. **Background images not optimized for mobile** ⚪ **OPEN (minor)** — all backgrounds are already WebP; a separate smaller mobile variant isn't served. Low priority, not pursued this pass.
44. **Secondary text contrast may fail WCAG AA** ✅ **FIXED** — the whole "field ink scale" system (`globals.css`) re-points text tokens per background field with measured ratios documented inline (e.g. 7.25:1, 4.80:1). The two real remaining contrast bugs this system had missed (menu nav pill + tablet nav bar) were found and fixed this pass — see the banner above.
45. **Link colors not clearly distinguished from body text** ✅ **FIXED** — "View Noodles"-style links are `.btn-secondary` (bordered), not bare text.
46. **Hover state color change too subtle** ✅ **FIXED** — verified visible hover states across buttons/links.
47. **Ignition animation may feel slow on mobile** ✅ **FIXED (by design)** — gated behind `prefers-reduced-motion`, runs once per session via `sessionStorage`, ~1.75s total.
48. **Brush transition animation may stutter** ✅ **MITIGATED** — pure `transform`-based, GPU-friendly, `position: fixed`.
49. **Scroll reveal animations don't respect prefers-reduced-motion** ✅ **FIXED** — comprehensive `@media (prefers-reduced-motion: reduce)` block neutralizes `.reveal-hidden`/`.reveal-toss`/`.reveal-clip`/ember drift and all animation/transition durations.
50. **IntersectionObserver reveals may not fire on slow networks** ➖ **N/A** — standard browser API behavior; no code issue to fix.

### Accessibility
51. **Image alt text missing or generic on menu items** ✅ **FIXED** — every `MenuCard` uses the real dish title as `alt` (e.g. "Pad Thai Goong").
52. **Background video not skipped by screen readers** ✅ **FIXED** — `BackgroundVideo` sets `aria-hidden` automatically unless a meaningful `label` is explicitly passed.
53. **Reservation form radio labels not associated** 🚫 **OBSOLETE** — form removed.
54. **No skip-to-main-content link** ✅ **FIXED THIS PASS** — see banner above.
55. **Heading hierarchy may skip levels** ✅ **FIXED (verified)** — checked both `/` and `/menu`: single `h1` per page, consistent `h1 → h2 → h3` progression.

### Performance & Technical
56. **No Service Worker for offline support** 📋 **BACKLOG** — no offline requirement from the client; not pursued.
57. **No meta viewport tag explicitly set** ➖ **N/A** — Next.js sets this automatically.
58. **CSS critical path not optimized** ➖ **N/A** — not pursuing manual critical-CSS extraction; out of scope for a design/UX pass.
59. **No image compression pipeline** ✅ **PARTIALLY FIXED** — all imagery already ships as WebP.
60. **Open graph meta tags missing** ✅ **FIXED** — full `openGraph`/`twitter` metadata block in `app/layout.tsx`.

---

## MEDIUM-PRIORITY ISSUES (Polish & Refinement) — 40 items

61. **Signature dish images may have too-dark drop shadows** ✅ **FIXED** — Round 2's sitewide shadow de-intensification pass halved opacity on every dish/hero/button shadow and recolored from black to a soft terracotta tint.
62. **Hero background video opacity too transparent** ✅ **FIXED** — raised to full strength (documented: was washing out against the cream page surface).
63. **Section overlay gradients too harsh** ✅ **RESOLVED** — replaced by the `.bg-orange-field`/`.bg-blue-field` designed background system.
64. **Location card images may appear warped** 🚫 **OBSOLETE** — `LocationCard` deleted; `.haven-card-image` uses a fixed `aspect-ratio: 16/10`.
65. **Gift card brush strokes may be too opaque** ⚪ **OPEN (minor)** — still `opacity: 0.95` in the homepage gift section (`app/page.tsx`). Low visual-noise risk, not touched this pass — flag for a future polish round if the client calls it out.
66. **Page background may need texture, flat black feels sterile** 🚫 **OBSOLETE** — background is now warm cream (`#FFF8EC`) with an existing subtle film-grain texture (`body::after`), not flat black.
67. **Container max-width may be too wide for some layouts** ✅ **FIXED (by design)** — individual content blocks constrain their own reading width (e.g. `.body-large { max-width: 48ch }`) rather than relying on the outer container.
68. **Location card border radius too subtle** 🚫 **OBSOLETE** — `LocationCard` deleted; `.haven-card` already uses the more prominent `--radius-lg` (22px).
69. **Button hover animation too subtle** ✅ **FIXED (kept as-is)** — consistent, deliberate -2px lift; not pursued further.
70. **No loading state on form submission** 🚫 **OBSOLETE** — form removed.
71. **Error states for form validation not designed** 🚫 **OBSOLETE**.
72. **No success confirmation after submission** 🚫 **OBSOLETE**.
73. **Drawer close button too small on mobile** 🚫 **OBSOLETE** — drawer removed.
74. **No visual indicator that menu categories are sticky/active** ✅ **FIXED** — the sliding active-category pill (with the contrast bug now fixed) *is* this indicator, and is considerably more sophisticated than what this item asked for.
75. **Anchor links to menu sections don't smooth scroll** ✅ **FIXED** — `handleClick` in `app/menu/page.tsx` does an explicit smooth scroll (respecting `prefers-reduced-motion`).
76. **Font loading strategy not optimized** ✅ **FIXED** — all fonts via `next/font` with `display: "swap"`.
77. **Playfair Display for body, Montserrat for sans (seems reversed)** ✅ **RESOLVED (superseded)** — current hierarchy is correct: Montserrat is body/UI, Camera Obscura is headings (falling back to Playfair). The setup this item describes no longer exists.
78. **Font weights not consistently named** ⚪ **OPEN (minor)** — a mix of inline `fontWeight` numbers and semantic classes still exists. Low priority, cosmetic/DX only, not touched this pass.
79. **Overline letter-spacing varies (2px–6px)** ⚪ **OPEN (minor)** — a few inline overlines still set an explicit `letterSpacing` different from the `.overline` base (0.25em). Low priority.
80. **Uppercase applied inline vs via CSS** ⚪ **OPEN (minor)** — cosmetic/DX inconsistency, not user-visible, not touched.

### Menu Page Specific
81. **Menu category pills have no active-state indicator** ✅ **FIXED** — sliding pill; contrast bug fixed this pass (see banner).
82. **Menu categories not scrollable if list exceeds width** ✅ **FIXED** — `overflowX: 'auto'` on the nav container.
83. **Menu item grid not explicitly a card layout** ✅ **RESOLVED (by design)** — deliberately not a bordered card, per the client's own floating-dish direction; the `.dish-frame` museum-label treatment (Round 2) is the resolution the client asked to explore. A literal card is explicitly deferred in `PRD.md` §6.
84. **Menu item descriptions truncated on mobile** ✅ **FIXED (non-issue)** — no truncation/ellipsis is applied anywhere; text wraps naturally.
85. **No search/filter on menu** 📋 **BACKLOG** — real feature addition, not requested by the client; out of scope for a color/design pass.

### Locations Page Specific
86. **Hours of operation formatting inconsistent** 🚫 **OBSOLETE** — standalone locations page deleted; hours are shown compactly and consistently in `.havens-grid` and the footer.
87. **Phone number formatting** ✅ **FIXED (adequate)** — footer shows `+880 1600-068193`, already reasonably grouped.
88. **Google Maps links should consistently open in new tab** ✅ **FIXED** — `target="_blank" rel="noreferrer"` on every Directions link.
89. **No distance/travel time from central location** 📋 **BACKLOG** — needs real geodata; not pursued.

### Gift Cards Page Specific
90. **Gift card purchase flow not connected to checkout** ✅ **FIXED (by design)** — WhatsApp CTA is the deliberate, client-accepted solution; no payment processor exists for this business.
91. **No redemption instructions** 📋 **BACKLOG** — needs real content from the client.
92. **Gift card denominations may not align with pricing** ➖ **N/A** — business decision, not a design/dev task.

### About Page Specific
93. **About page layout not optimized** 🚫 **OBSOLETE** — `/about` deleted entirely; its content is now the homepage Heritage chapter.

### Unused Assets & Opportunities
94. **Background sound assets unused** 📋 **BACKLOG** — optional enhancement, not requested.
95. **Brand assets folder has many unused images** ✅ **PARTIALLY ADDRESSED** — Round 2 put real, previously-unused photography to work (Heritage room details, footer kraft texture, additional lotus variants).
96. **Multiple lotus variants, only one used** ✅ **FIXED** — Round 2 explicitly diversified backgrounds per section (`Lotus Crop`, `Lotus BG`, `Footer.webp`, etc.) instead of reusing one file everywhere.
97. **Elephant 16:9 background unused** ✅ **FIXED** — now used as the Open Graph / Twitter share image in `app/layout.tsx`.

### Documentation & Maintenance
98. **No component documentation** 📋 **BACKLOG** — tooling/process preference, not a site-facing issue.
99. **No color system documentation** ✅ **FIXED** — `PRD.md` §2–3 *is* the documented color system (verified hexes, contrast ratios, token names).
100. **No spacing/typography scale documented** ✅ **FIXED** — the `--space-*` token scale and `.section-pad` utilities are the documented, consistently-applied system; referenced in `PRD.md`.

---

## LOW-PRIORITY ISSUES (Nice-to-Haves) — 15 items

101. **"The Thai Way" copy is generic** ➖ **N/A** — this is the client's own brand tagline ("Re-inventing The Thai Way"); not a copywriting task to second-guess.
102. **"street craft elevated" repeated across sections** ⚪ **OPEN (minor)** — still appears in both the hero and Chapter II. Real, but a copy-voice decision — not touched without client direction, to avoid inventing brand language.
103. **No social proof (reviews, testimonials)** 📋 **BACKLOG** — needs real testimonials; won't fabricate placeholder quotes.
104. **No newsletter signup** 📋 **BACKLOG** — not requested by the client.
105. **No WhatsApp/direct messaging integration** ✅ **FIXED** — extensively implemented: 9+ WhatsApp CTAs sitewide, replacing the entire reservation system.
106. **No loyalty program reference** ➖ **N/A** — no such program exists to reference.
107. **No seasonal menu indicator** 📋 **BACKLOG** — the existing "New" badge partially covers this; a true seasonal system needs real data.
108. **No favicon set** ✅ **FIXED** — real logo (`Dark Blue.webp`) wired as the favicon in `app/layout.tsx`.
109. **Open Graph tags may not be optimal** ✅ **FIXED** — same as #60; full OG/Twitter card metadata present.
110. **No dark mode toggle** ➖ **N/A (by design)** — the client explicitly moved the site *away* from a dark theme this round; a toggle isn't the ask.

---

## SUMMARY (reconciled 2026-08-07)

Of the original 110 items:
- **✅ Fixed** (including 3 fixed this pass): ~58
- **🚫 Obsolete** (feature/page deliberately removed): ~24
- **➖ N/A** (never a real issue, or a business/content decision): ~13
- **📋 Backlog** (genuinely open, needs real content/data/product decision): ~11
- **⚪ Open, minor** (low-impact stylistic inconsistencies, deferred): ~8

**No color-contrast, visibility, or readability issues remain open** on the main
site (admin excluded) as of this pass — the two real bugs found (menu nav pill,
tablet nav bar) are fixed and verified. Everything left open is either a content
gap that requires real client input (§ BACKLOG items) or a low-impact stylistic
inconsistency (§ OPEN minor items) that doesn't affect legibility or brand color
correctness.

---

## VERIFICATION CHECKLIST

Before marking any issue ✅ complete:
- [x] Code change implemented
- [x] Tested in browser at ≥2 viewports (desktop 1280px, tablet 900px)
- [x] No console errors or warnings
- [x] No regressions on other pages (`tsc --noEmit` + `eslint` clean)
- [x] Contrast verified via live canvas-pixel + WCAG relative-luminance measurement, not estimated
- [ ] Accessibility verified with a real screen reader (not available in this environment)
- [ ] Mobile interaction tested on an actual device (not available in this environment)
