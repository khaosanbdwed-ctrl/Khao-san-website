---
name: project-khao-san
description: "Full project context for the Khao San Thai restaurant website in Dhaka, Bangladesh — production audit and refinement pass"
metadata: 
  node_type: memory
  type: project
  originSessionId: 20e5dfa6-9f92-48ac-bcba-c7ff8ce7ea36
  lastUpdated: 2026-07-12
---

# Khao San Restaurant Website

A premium Thai restaurant brand based in Dhaka, Bangladesh with three outlets (Gulshan 1, Dhanmondi, Uttara).

**Why:** Production-ready marketing/hospitality website for a real restaurant brand. Approaching launch.
**Status:** Draft 1 → Production Refinement Pass (110-issue audit underway, 2 critical issues fixed)
**How to apply:** Treat every decision as production quality. Preserve the editorial, cinematic design language.

## Tech Stack
- Next.js 16.2.10 (App Router), React 19, TypeScript
- **No CSS framework** — pure custom CSS in globals.css + inline styles
- No animation library — custom IntersectionObserver via ClientWrapper
- Google Fonts: Playfair Display (display/headings) + Montserrat (sans/body)
- Working directory: `C:\Users\HP\Downloads\Khao san\khao-san-app`

## Design Language
- **Dark, cinematic aesthetic**: surface-base #070911, surface-elevated #111115
- **Brand accent**: Burnt Saffron #f08b43 / #D76F30
- **Lotus motif**: recurring across all overlays, backgrounds, section dividers
- **Typography**: Playfair Display for all editorial headings; Montserrat for nav/labels/overlines
- **Overline pattern**: small-caps, high letter-spacing labels above every section heading
- **Motion**: reveal-hidden → reveal-visible via IntersectionObserver (ClientWrapper)
- **Brush strokes**: saffron.png and terracotta.png used as decorative organic elements

## Route Architecture
- `/` — Home: 7 chapters (Hero, Flame, Story, Exhibition, Havens, Gift, Invitation)
- `/menu` — Full culinary menu (13 categories, 80+ items, sticky pill nav)
- `/about` — Brand story via EditorialBlock components
- `/locations` — Full-viewport LocationCard panels per outlet
- `/giftcards` — Gift card hero + Z-pattern collection + mechanics + corporate section
- `/legal/privacy` — Privacy policy (NEW)
- `/legal/terms` — Terms of service (NEW)
- Reservation: global drawer (not a page) via ReservationContext

## Component System (components/)
- Header.tsx — centered logo, split nav, scrolled glass state, mobile overlay
- Footer.tsx — minimal links + giant "KHAO SAN" watermark
- ClientWrapper.tsx — global IntersectionObserver for scroll reveals
- ReservationContext.tsx — global drawer with form; body lock on open; focus management

## UI Components (components/ui/)
- SectionOverlay — reusable section with background image + dark overlay + lotus pattern
- PageHero — subpage hero with background, overline, display-1 title, body-large description
- EditorialBlock — media (video/image) + text split; supports reverse layout
- LocationCard — full-viewport panel with full-bleed image + gradient overlay + text
  - ✅ NOW: Uses useReservation hook; "Reserve" button opens drawer (FIXED)
- MenuCard — dual mode: regular card (staggered offset) or "special" full-width spotlight
- GiftCard — 3D tilt on hover, brush stroke backdrop
- BrushStroke — decorative element; references brushes that don't exist yet (ochre/saffron/terracotta horizontal/vertical/diagonal)

## Repo State (as of 2026-07-12)
- Branch: `master`, post-commit `86a2ae4 "Checkpoint before luxury refinement"`
- Working tree has uncommitted changes (legal pages created, component fixes)
- Dev server running on port 3000 (HMR active)
- preview_start will assign different port; screenshot times out (documented)

## Production Audit Status
**110 Total Issues Identified** — See DESIGN_AUDIT.md for comprehensive list

**MAJOR MILESTONE (2026-07-12, cycle 2): Real menu data extraction**
Found the complete real menu — all 14 categories, 75 items — as printed-menu photos inside `public/assets/Brand_Asset/*.jpg` (NOT in the "Menu" asset folder, which only has dish photography). Each page has real prices in BDT, real 1-2 sentence descriptions, and a 4-icon badge system (🌶️Spicy/📕Special/📷Featured/✨New). Also found the closing terms page with real operating hours, VAT/service-charge/halal disclosures, and phone numbers.

Key filenames (do not delete — these are the source-of-truth menu, re-derive from them if data is ever lost):
670355676*(Appetizers p1), 670389303*(Soup p2), 671139371*(Dumplings p3), 670499375*(Salads/Kids p4), 671022384*(Noodles p5), 670969446*(Rice p6), 672346546*(Chicken p7), 672159448*(Beef p8), 671152753*(Seafood p9), 671588916*(Vegetarian p10), 672074397*(Rice Bowls p11), 672603980*(Desserts p12), 671484363*(Drinks p13), 672670437*(terms/hours/phone, unnumbered back page), `Card design.jpg`(Gift cards p14).

**Critical Issues Fixed This Session (cycle 2):**
✅ #1 - Reservation form: real API route `app/api/reservations/route.ts` (server-side validation, confirmation codes) + frontend loading/success/error states, wired via fetch. Verified end-to-end.
✅ #2 - Gift card buttons: no payment backend exists, so replaced "Add to Cart" with WhatsApp CTA (`wa.me` deep links, prefilled message per denomination); corporate inquiry also WhatsApp now (was a fake mailto)
✅ #3 - Legal pages created (/legal/privacy, /legal/terms) — contact info in both corrected to WhatsApp/Facebook (no fabricated email)
✅ #4 - Menu prices/descriptions: ALL 75 items now have real price, description, badges — sourced from the printed menu photos above, not invented
✅ #5 - "Reserve Table" links now open drawer (LocationCard uses useReservation)
✅ Operating hours corrected sitewide: was wrongly "Everyday 12PM–10:15PM"; real hours are **Sat–Thu 12PM–11PM, Fri 2PM–11PM** (fixed in app/page.tsx and app/locations/page.tsx)
✅ Uttara address/type inconsistency resolved: locations page had a different (more specific/correct) address and type ("New") than homepage ("Sanctuary" + vaguer address) — standardized on the specific address + "Sanctuary" naming across both
✅ MenuCard rebuilt: progressive disclosure (click "View details" to expand description, smooth grid-template-rows animation), badge chips as icons over image, price + group-price display, add-ons per category (Noodles/Rice/Rice Bowls) rendered below grid
✅ Fixed legacy `.menu-card` CSS (`align-items:center; text-align:center`) conflicting with new left-aligned card design — overridden inline

**Contact policy enforced:** No contact forms exist anywhere on the site (verified via grep). All contact funnels through WhatsApp (`wa.me/8801600068193`) or Facebook/Instagram social links, per explicit instruction.

**Remaining Blocking Issues:**
⚪ #7 - Mobile hero scaling (needs re-verification against new menu-card layout)
⚪ #12 - Horizontal overflow on mobile (re-verify across all pages)
⚪ Menu page terms/legend footer added (VAT/service charge/halal notice) — verify rendering
⚪ Continue systematic mobile audit across about/giftcards/locations pages
⚪ Continue broader design refinement pass (spacing rhythm, typography consistency) per user's "draft 1, not benchmark" directive

## MAJOR MILESTONE (2026-07-12, cycle 3): Premium Visual & Motion Refinement Pass
User approved the creative direction — this was refinement, not redesign, following a detailed 14-point brief. Key changes, all verified in-browser (desktop+mobile, zero console errors, zero lint/type errors):

**Design tokens (app/globals.css):** Added a unified radius scale (`--radius-sm:8px`, `--radius-md:14px`, `--radius-lg:22px`, `--radius-pill` unchanged) applied across buttons, menu cards, food photos, EditorialBlock media, reservation form inputs/party-size buttons, error banners. Reduced `--space-macro` 240→190px and `--space-layout` 80→64px for tighter section rhythm. Added `--hero-text-shadow` token, scoped via `.hero-text-shadow` utility class — used ONLY in hero-type sections (homepage hero, closing Invitation section, PageHero component), nowhere else.

**Found and fixed a real bug:** a duplicate/stale `.btn-secondary:hover { background-color: var(--color-surface-elevated); }` rule further down globals.css was silently overriding the intended hover state back to near-black — this was likely the exact cause of the brief's "hover blends into background" complaint. Removed it. New button system: `.btn-primary` uses a primary→secondary gradient; `.btn-secondary` uses an orange-tinted border/bg by default and inverts to solid orange on hover — both brand-driven rather than generic white-invert.

**Food photography system:** New `.food-photo-frame` / `.food-photo-inner` / `.food-photo-tilt-a` / `.food-photo-tilt-b` utility classes give every dish photo a resting contact shadow (radial blur beneath), a soft diagonal overhead-light sheen, rounded corners, and a slight alternating rotation (±2deg) — replacing the old flat "cutout on drop-shadow" look. Confirmed via inspection that the source dish photos have solid white backgrounds (not transparent), so cover+rounded-frame+shadow reads as a physically-placed photograph rather than a floating sticker. Applied to [MenuCard.tsx](../../components/ui/menu-card.tsx) (all 75 items) and the homepage Exhibition section's two signature dishes.

**Important implementation gotcha:** don't combine a scroll-reveal class (`.reveal-toss`, `.reveal-hidden`) with `.food-photo-tilt-*` on the *same* element — both set the `transform` CSS property, so whichever animation's "visible" end-state fires last wins and silently erases the other's rotation. Fix: put the reveal class on an outer wrapper and `.food-photo-frame`/tilt on an inner child. Found this bug once already in the Exhibition section — check for it if new food photography is added elsewhere.

**Hero cinematic treatment:** New `.hero-vignette` (radial darken toward edges, keeps text-area focal) and `.hero-directional-light` (soft warm diagonal glow, soft-light blend) utility classes, applied to homepage hero, the closing "Taste the fire" Invitation section (structurally a hero — video bg + centered CTA), and [PageHero.tsx](../../components/ui/page-hero.tsx) (used by Locations/Giftcards/About). Added `.hero-ken-burns` (very slow 20s alternate scale, respects reduced-motion) to hero background videos.

**Footer redesign:** Was near-black; now uses a previously-unused asset `public/assets/Background-20260709T183540Z-2-001/Background/Footer/Footer.webp` (a warm kraft-paper texture) with a terracotta/burnt-saffron gradient wash overlaid — "warm branded orange, still luxurious" per brief. Text colors adjusted for contrast against the new warm bg (secondary text → rgba(253,251,247,0.85), copyright → rgba(255,255,255,0.72), giant watermark → rgba(7,9,17,0.07) for a debossed-into-paper look instead of a faint glow).

**Background system variation:** The Lotus.webp mandala was reused full-bleed on ~4 sections in a row; discovered it's actually a light/white-background line-art image that a dark overlay flattens to near-invisible regardless of which lotus variant is used — so swapping lotus files wouldn't have helped. Instead varied the *treatment*: Exhibition section now uses solid `--color-surface-elevated` + a single low-opacity partial corner motif (unused asset `Lotus Crop Transparent.webp`) instead of full-bleed pattern; Gift section now uses a plain terracotta gradient wash instead of Lotus.webp-under-brush-strokes (redundant layering). Chapter II (Flame) kept Lotus.webp as the one full-pattern moment.

**Heritage section redesign:** Was a plain 50/50 image+quote split. Now asymmetric/layered: the primary Dhanmondi interior photo has a second, rotated, offset panel surfacing from behind it using a previously-unused brand asset (`Elephant 16 by 9 Ratio Landscape.webp` — the brand's elephant mark on a warm mountain-landscape watercolor), reinforcing brand heritage as texture rather than illustration.

**Menu page hero redesign:** Was a plain centered PageHero (text-only). Replaced with a custom left-text/right-food-collage editorial hero — three dishes (Pad Thai, Tom Yum Goong, Mango Sticky Rice) in an overlapping, alternating-tilt arrangement using the food-photo-frame system, with a "Start with Appetizers" CTA that scrolls to the first category.

**MenuCard simplification:** Removed the click-to-expand interaction entirely — description now always visible by default (per brief: "remove the need to expand cards just to read basic information"). Tightened card spacing.

**Menu nav hierarchy:** Added a `.menu-nav-item` hover state (soft background highlight on inactive pills) rather than static dividers, which risked visual clutter against the already-solid active pill.

**Layout rhythm:** Exhibition section header changed from centered to left-aligned to reduce the site's over-reliance on centered compositions, per brief.

**Unused brand assets discovered and now in use** (do not delete): `Footer.webp`, `Elephant 16 by 9 Ratio Landscape.webp`, `Lotus Crop Transparent.webp`, `brush-strokes/terracotta.png` (found but not yet used — available for future variation work).

**Still open from this brief:** further spacing-rhythm pass beyond the token change, more sectional background variety (terracotta brush accent unused), broader "reduce over-centering" pass beyond the Exhibition section, refined scroll choreography/microinteractions beyond what's listed above.

## CORRECTION PASS (2026-07-12, cycle 4): fixing cycle-3 misinterpretations
The user rejected several cycle-3 choices as literal misinterpretations of design intent. Core lesson: **when a brief says "lighting / shadow / depth / atmosphere," think cinematography and premium food PHOTOGRAPHY, not UI containers/frames/boxes.** Corrections (all verified in browser, desktop+mobile, tsc+eslint clean):

1. **Food photography — reverted the framed-box approach.** Cycle-3 wrongly put each dish in a rounded `.food-photo-frame/.food-photo-inner` box with `object-fit:cover` + tilt. Deleted all `.food-photo-*` classes. New `.dish` system (in globals.css): the dish cutout (menu webp images are transparent PNsG/cutouts on transparent bg) rests directly on the page via `object-fit:contain` + a silhouette-following `drop-shadow` (reads as overhead key light) + a separate blurred radial `::after` contact-shadow ellipse beneath the plate. No frame, no border, no box. Hover lifts the dish and spreads its contact shadow. Usage: `<div class="dish"><Image class="dish-img" fill/></div>`.
2. **Hero lighting is HOMEPAGE-ONLY and is a real cinematic composition.** Deleted the reused `.hero-vignette`/`.hero-directional-light`. New single `.hero-cinematic-light` layers: warm key glow behind headline + top gradient (nav readability) + bottom gradient + left/right side vignettes + overall edge vignette. Applied ONLY to the homepage hero video. Removed all hero-lighting/ken-burns/hero-text-shadow reuse from PageHero, the Invitation ("Taste the fire") section, and the menu hero.
3. **Heritage — full redesign** (not the cycle-3 refine). New `.heritage` band: tall interior image (Dhanmondi) with a smaller accent image (Gulshan) at different scale overlapping its corner, and a large display quote as the signature breaking into the negative space. Dark. New copy: "Bangkok's fiercest street corners, translated into a quietly elevated journey."
4. **Backgrounds — kept dark (Editorial Nocturne).** Reverted the cycle-3 terracotta-gradient Gift section and any elevated washes back to dark surfaces with restrained accents (a single low-opacity saffron brush + warm radial glow). The Lotus.webp is light line-art that a dark overlay flattens — vary via *treatment* (dark surface + partial motif/glow), not by swapping lotus files or introducing new bright backgrounds.
5. **Gift section overlap fixed:** reduced card rotation (12/-8 → 6/-5deg), added `overflow:hidden` to the section; gift cards now clear the Reserve section (verified 247px gap).
6. **Havens heading integrated:** added a warm radial glow behind "Our Havens." + reduced padding so it no longer reads as an isolated black block above the vibrant location cards.
7. **Buttons:** primary = solid bright orange `var(--color-primary)` + dark text (prominent); secondary = transparent with a cream `rgba(253,251,247,0.5)` border + light text, inverting to solid cream + dark text on hover. Deliberately NOT orange, to avoid orange-on-orange on warm sections. (Also removed a duplicate `.btn-secondary:hover` rule that had been overriding hover to near-black.)
8. **Story/About hero** rebuilt as an editorial hero with a full-bleed darkened interior image + gradient scrims. About page converted to a client component; its **dead `/reserve` link fixed** — the CTA now opens the reservation drawer (there is NO `/reserve` route; reservation is a global drawer via `useReservation().openDrawer`).
9. **Gift-cards page hero** rebuilt self-contained (was double-padded by a nested SectionOverlay + macro padding → huge empty gap under the nav). Now `min-height:92vh`, content vertically centred, headline ~152px from top.
10. **Menu hero** discarded the 3-dish collage; new `.menu-hero` = one dramatic dish (Tom Yum Goong) under a warm radial spotlight glow, left copy "A journey through fire. · 75 dishes · 14 chapters", food-first stacking on mobile (`.menu-hero-stage { order:-1 }`).

**Dev-server gotcha hit this session:** editing a file through a transient invalid JSX state made Turbopack's error overlay stick on a phantom "Expected '</', got 'jsx text' … </SectionOverlay>" at a line that on disk was already `</div>`. tsc/eslint/get_page_text all confirmed the file was valid; `read_console_messages` was replaying a stale buffer. Also note: **only one `next dev` can run per project dir** (it locks `.next`) — a second `npm run dev` exits with "Another next dev server is already running." If a server gets wedged, `taskkill //PID <pid> //F` + `rm -rf .next/dev` then restart. The project dev server now runs on port 3000 (launch.json name `khao-san-dev`, base port bumped to 3100 w/ autoPort but it reclaimed 3000).

## Next.js gotchas (this project, Next 16 / React 19 / Turbopack)
- Dev-mode React hydration diagnostics noisier than production (see: ignition script pattern)
- `next/script` with `strategy="beforeInteractive"` not ideal for inline pre-hydration DOM mutation — use `<script dangerouslySetInnerHTML>` instead
- To test different Next.js mode: run `npx next start -p <freeport>` after `npm run build`

## Preview-browser gotchas (in-app Claude_Browser)
- `computer{screenshot}` times out — use get_page_text / read_page / javascript_tool instead
- **Root cause of CSS animation issues: `document.visibilityState === 'hidden'`** in Browser tool (power-saving)
  - Never affects real visitors; IntersectionObserver callbacks throttled, animations suspended
  - Verify with JS instead: check DOM attributes, compiled CSS, state toggles
- resize_window may not update window.innerWidth reliably on localhost; use documentElement.clientWidth
- Screenshots work on mobile but timeout on desktop (known issue)

## Resolved (Cycles 1–5, 2026-07-12)
- Broken Dhanmondi image path → fixed to underscore path
- Undefined CSS variables → `--color-surface-base`
- Footer "Reserve A Table" link → opens drawer (FIXED)
- Dhanmondi address conflict → unified address
- Dead GiftCard + BrushStroke components deleted
- globals.css streamlined: 962 → ~410 lines
- Google Fonts migrated to next/font/google (self-hosted)
- Reservation form: `selected` → `defaultValue`; added 9:30 PM slot
- A11y interaction layer: Escape-to-close, focus trap, `inert`, dialog semantics
- Party-size radios: sr-only + focus ring
- Reduced-motion support in globals.css + BackgroundVideo component
- MenuCard stagger: desktop-only via `.is-even/.is-odd` + `@media(min-width:768px)`
- Root overflow fix: `html,body { overflow-x: clip }` + transform-based navigation
- Touch targets (WCAG 2.5.5/2.5.8): 44×44px minimum
- Contrast verified strong (AAA standard)
- Ignition animation: ember bloom + staggered hero reveal (~1.75s)
- Brush chapter transition: saffron stroke across Hero→Fire seam
- Wok-toss reveal: arc+rotate+overshoot on Signature Dishes
- Ember-drift scroll cue: motif-consistent scroll affordance

## Known Issues / Opportunities
- ReservationContext form is UI-only — no backend/API integration
- GiftCard "Add to Cart" / "Purchase Digital Card" buttons non-functional
- Menu items have no prices or descriptions (only Pad Thai, Tom Yum spotlight have prices)
- Spice indicator is binary (🌶️ Fiery or none) — could be scale with real data
- Footer Privacy/Terms now link to `/legal/*` pages (created this session)
- "Reserve" buttons now open drawer everywhere (fixed this session)
- Mobile spacing may need adjustment at various breakpoints
- Form validation & error states not fully implemented

## Files to Review/Update
- `app/globals.css` — Core styling, animations, responsive rules
- `components/ReservationContext.tsx` — Form validation, error states
- `app/menu/page.tsx` — Menu data structure; needs price field addition
- `components/ui/menu-card.tsx` — MenuCard rendering; needs price display

## Available Brand Assets (Not All Used)
- **Imagery**: ~40 brand photos (Instagram, events, atmosphere shots)
- **Video**: Elephant 16:9 background, 4 brand videos
- **Audio**: 4 background sound variants (MP3)
- **Graphics**: Multiple lotus variations (crops, white SVG), brush strokes (saffron, terracotta)
- **Colors**: Defined in CSS (Burnt Saffron, Temple Gold, Deep Terracotta, Warm Clay, Muted Ochre)

---

## Quick Reference: Audit Categories

**Mobile Responsiveness** (Critical)
- Hero text scaling (Issue #7)
- Category nav stickiness (Issue #8)
- Location card image sizing (Issue #9)
- Gift card layout on mobile (Issue #10)
- Form input sizing (Issue #13)

**Spacing & Layout** (High)
- Container padding inconsistency (Issue #26)
- Section padding too large on tablet (Issue #27)
- Horizontal gaps vary across components (Issue #28)
- Edge-to-edge behavior inconsistent (Issue #30)

**Accessibility** (Critical & High)
- Image alt text missing (Issue #51)
- Focus states not visible (Issue #36)
- Skip-to-main link missing (Issue #54)
- Heading hierarchy gaps (Issue #55)

**Forms & Interaction** (Critical & High)
- Form validation missing (Issue #71)
- Error states not designed (Issue #71)
- Loading states missing (Issue #70)
- Button hover feedback subtle (Issue #69)

**Content** (Critical & High)
- Menu prices missing (Issue #4)
- Legal pages missing → FIXED (Issue #3)
- Menu descriptions missing (Issue #6)
- Category descriptions missing

**Next Session Focus**
1. Add menu pricing system
2. Implement form validation
3. Fix mobile spacing rhythm
4. Add focus/hover states to all interactive elements
5. Backend integration planning

