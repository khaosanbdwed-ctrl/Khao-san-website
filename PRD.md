# Khao San — Client Revision PRD

This is the **client-facing working copy**. `khao-san-app` (sibling folder) is
a separate, untouched portfolio build — do not port changes back into it, and
do not pull from it except as read-only reference. This file is the single
source of truth for this copy: append to the Change Log on every future
round instead of re-deriving context from scratch.

Dev server: `npm run dev -- -p 3200` (or `.claude/launch.json` → `khao-san-client`, port 3200 — 3000 is reserved for the portfolio copy).

---

## 1. Project Overview

Khao San — premium Thai restaurant brand, Dhaka, Bangladesh, three outlets
(Gulshan 1, Dhanmondi, Uttara). Marketing/hospitality site: home, menu,
about, locations, gift cards, legal pages, plus a small internal admin panel
for menu content.

**Tech stack:** Next.js 16.2.10 (App Router), React 19, TypeScript. No CSS
framework — custom CSS in `app/globals.css` (CSS custom properties for the
design-token system) plus inline styles in `.tsx` files. No animation
library — custom IntersectionObserver via `components/ClientWrapper.tsx`.
Fonts: Playfair Display (headings) + Montserrat (body/UI), via `next/font/google`.

**Routes:** `/` (7-chapter homepage), `/menu` (13 categories, 80+ items),
`/about`, `/locations`, `/giftcards`, `/legal/privacy`, `/legal/terms`,
`/admin/login` → `/admin` (overview) → `/admin/menu` (menu content
management — mock data, not yet wired to a real database).

**Component map:** `Header.tsx` / `Footer.tsx` (global chrome),
`ClientWrapper.tsx` (scroll-reveal observer), `components/ui/section-overlay.tsx`
(background image + scrim + pattern wrapper), `page-hero.tsx` (subpage hero),
`editorial-block.tsx` (media+text split, image or video), `location-card.tsx`,
`menu-card.tsx` (dish presentation — currently a "floating" image treatment,
not a bordered card), `background-video.tsx` (reduced-motion-aware video).

## 2. Brand Identity (verified, do not approximate)

Source: client-supplied swatch sheet. These are the only correct hex values —
never invent or eyeball a substitute.

| Role | Hex |
|---|---|
| Brand Blue (logo colour) | `#1e417b` |
| Brand Orange | `#ff964f` |
| Butter (pale yellow) | `#f9eb9b` |
| Powder Blue (pale blue) | `#cadbe9` |
| White | `#ffffff` |
| Near-black | `#161616` |

Verified contrast ratios: blue/white 10.0 · black/white 18.1 · blue/orange
4.64 (passes AA all text sizes) · powder/blue 7.07 · **white/orange 2.16 —
FAILS, never use white text on an orange field.** Near-black or brand-blue
text on orange is the client's own correct lockup.

Logo: `Khao San Logo.webp`, elephant formed from K-H-A-O, solid `#1e417b` on
transparent — knock out to white via `filter: brightness(0) invert(1)` when
placed on a dark or photographic background.

Tagline: "Re-inventing The Thai Way." Terms: 5% VAT inclusive, 5% service
charge, 100% halal.

## 3. Design System (resolved, current — supersedes the old dark "Editorial Nocturne" tokens)

As of the 2026-08 rebrand round, the site moved from a near-black cinematic
palette to a **bright, colorful** hierarchy: **Orange (dominant) → Blue →
White → Black (minimal, text-only)**.

Root tokens in `app/globals.css` (`:root`):
- `--color-brand-orange: #ff964f`, `--color-brand-blue: #1e417b`,
  `--color-brand-butter: #f9eb9b`, `--color-brand-powder: #cadbe9`,
  `--color-brand-white: #ffffff`, `--color-brand-black: #161616`
- `--color-primary` / `--color-accent`: `#ff964f`
- `--color-surface-base`: light warm cream (off Butter)
- `--color-surface-elevated`: white / pale warm neutral
- `--color-text-primary`: `#161616`, `--color-text-secondary`: muted warm
  gray-brown

Section-background classes (replace the old `.bg-lattice` / `.bg-lattice--quiet`
/ `.bg-lotus-corners` near-black scrim system):
- `.bg-orange-field` — dominant, used on Menu + editorial "story" sections
- `.bg-blue-field` — structural elements (header scrolled state, footer,
  section dividers) — white/butter text only, never near-black text on blue
- `.bg-warm-white` — legibility-first zones, used sparingly (not the
  dominant surface — per client: "don't focus on white too much")

Shadows: no black shadows anywhere. `--shadow-float`, `.media-soft` (video
shadow), and dish `drop-shadow` filters all use a soft, low-opacity
blue- or terracotta-tinted shadow instead of `rgba(0,0,0,*)`.

Reservations: **removed from the entire site** (see Change Log below) — no
booking drawer, no "Reserve" CTAs, no reservation API. Replaced everywhere
by a WhatsApp CTA using the existing pattern
(`https://wa.me/8801600068193?text=...`, already used for gift cards).

## 4. Client Feedback Log

### Round 1 — 2026-08-05

> "The website is too dark, so it should be regulated into orange, then
> blue, then white, then black. So it should be in this hierarchy... focus
> on the orange background most, like the menu section, then the other
> story section... And in the menu section, menu page, that background
> should also use a shade of orange. And the dishes are so normal right
> now... they need to make the dishes into a card. But I don't think that
> will look well because we have made this design like a dish floating...
> Let's think or figure it something out in the future. But just right now,
> focus on the color grade... use the blue color of the logo, the orange
> color... Don't focus on the white too much, focus on the oranges, and
> focus on the blue. And the videos that use shadow and everything, that
> should be light as well, not too shadowish... shadow was black, but right
> now they don't want black."

Follow-up clarifications (via Q&A): color direction is **"Bright &
colorful"** (genuine light backgrounds, not just a warmer dark theme).
Admin will "just consist [of] menu updates, reservation will be removed
properly" → clarified to mean reservations are removed **site-wide**
(drawer + CTAs + API), not just hidden from admin. Admin gets the same
bright re-theme as the public site.

## 5. This Round's Scope

1. Full color-token rebuild per the Design System above (dominant orange,
   structural blue, sparing white, near-zero black except text-on-orange).
2. Menu page + all editorial/story sections → orange-field background.
3. Video and dish shadows: black → soft warm/blue tint.
4. Remove the entire reservation feature (drawer, CTAs, `/api/reservations`,
   `/admin/reservations`, `/api/admin/reservations`) → WhatsApp CTA
   everywhere a Reserve button used to be.
5. Admin restructured to menu-management only; re-themed to match.

## 6. Deferred / Backlog (not this round)

- **Dish cards**: client felt the current "floating dish" presentation
  (no card/border, image feathered onto the section background) is too
  plain and wants dish name/price/description inside a card — but is
  unsure a literal card fits the established floating-dish design language.
  Explicitly punted to a future round: needs a design exploration, not a
  blind implementation. Revisit after this color round ships and gets
  client sign-off.

## 7. Change Log

- **2026-08-05** — Forked from `khao-san-app` at commit `8dc3427`. Fresh
  independent git history (not connected to the portfolio's public GitHub
  remote). PRD created.
- **2026-08-06** — Round 1 shipped:
  - Full color-token rebuild in `app/globals.css`: brand tokens added
    (`--color-brand-orange/blue/butter/powder/white/black`), semantic
    tokens redefined for the bright theme, `.bg-lattice`/`.bg-lattice--quiet`/
    `.bg-lotus-corners` replaced by `.bg-orange-field`/`.bg-blue-field`/
    `.bg-warm-white`. All black shadows (`--shadow-float`, `.media-soft`,
    dish drop-shadows) recolored to a soft terracotta/blue-slate tint.
    The blanket `h1-h6`/`p,span,li,a` text-shadow rule (designed for the
    old dark theme) was removed — it was hazing/doubling every heading
    once text went dark-on-light; the opt-in `.hero-text-shadow` class
    still covers text directly over photography/video.
  - `SectionOverlay` (`components/ui/section-overlay.tsx`) clamps its
    orange tint to a minimum 0.88 opacity — a translucent orange wash
    over the dark navy Lotus BG art blends to muddy brown below that.
  - Hero vignette (`.hero-cinematic-light`), site footer (`.site-footer`),
    and `.btn-secondary`'s hover state were recolored — none were in any
    agent's original scope (found via screenshot review, not code search)
    and were still black/near-black after the first pass.
  - Header/Footer chrome (scrolled nav background, mobile nav overlay,
    hamburger icon) rebuilt from a dark-glass to a light-glass treatment
    so nav text stays legible against both the hero video and the new
    bright section fields.
  - Reservation feature removed site-wide: `ReservationContext.tsx`,
    `/api/reservations`, `/admin/reservations`, `/api/admin/reservations`
    all deleted. Every trigger (Header, Footer, Home hero x2, About,
    per-location cards) now opens a WhatsApp chat
    (`wa.me/8801600068193`, or the location's own number for location
    cards) with a prefilled message. Admin dashboard's reservation stat
    and copy removed; `--color-background-base` (a pre-existing dead CSS
    variable bug in `admin/layout.tsx` and `admin/login/page.tsx`) fixed
    to `--color-surface-base`.
  - `/about`, `/locations`, `/giftcards` standalone pages deleted along
    with the now-unused `LocationCard` component — their content already
    existed as homepage chapters (Heritage/Havens/Gift). Header and
    Footer nav now scroll-link to `/#heritage`, `/#havens`, `/#gift`
    instead of navigating to separate pages.
  - Homepage's "Our Havens" chapter rebuilt from 3 stacked full-viewport
    location panels (~3x100vh) into a single compact 3-card grid
    (`.havens-grid`/`.haven-card` in globals.css) — image, name, address,
    hours, Reserve (WhatsApp) + Directions buttons per card. Dropped
    total homepage height from ~9950px to ~7650px.
  - `Privacy Policy` copy updated — it referenced collecting data "when
    you make a reservation" / processing "bookings", which no longer
    describes the site.
  - Client brand fonts wired in: Camera Obscura (headings, `--font-display`),
    Good Brush 9 (`--font-script`, applied to the About-style "The Thai
    Way" tagline treatment), Bellavoir Delight (`--font-quote`, applied to
    the Heritage pull-quote). **Caveat**: the source files in
    `app/fonts/` (`CameraObscura.otf`, `BellavoirDelight.otf`) are the
    vendor's DEMO/PERSONAL-USE builds, not purchased commercial files —
    swap them for the licensed files before public launch (same
    filenames, no code change needed). Both demo builds have
    deliberately broken numeral glyphs; `declarations: [{ prop:
    'unicode-range', value: 'U+0000-002F, U+003A-10FFFF' }]` in
    `app/layout.tsx` excludes digits so they fall through to Playfair
    Display instead of rendering broken — remove that once licensed
    files are installed (their numerals should render correctly).
  - Verified: `tsc --noEmit` and `eslint` clean (zero new issues —
    remaining lint warnings are pre-existing, in files this round didn't
    touch the logic of). All routes walked live (Home, Menu, admin
    login, legal pages) with zero console errors beyond two known
    dev-mode-only false positives already documented in project memory.
    Screenshots captured via headless Chrome/CDP for genuine visual
    proof (the in-app browser preview doesn't composite reliably in
    this environment).
  - **Not committed to git** — left for the user to review before
    committing.

## 8. Round 2 — 2026-08-06 (shadow/overlay fixes, bug fixes, artistic refinement)

Client feedback verbatim (screenshot attached showing heavy shadow on menu
category headings/nav pills): shadow management read as overused/conscious
rather than subtle; hero overlay too bright, video not visible; Khao San logo
"missing"; location card design "cheap"; Heritage section reused Havens'
location photos; hamburger menu broken across device types with a padding
issue and poor visibility; all backgrounds read orange with no contrast;
requested a unique bordered (not traditional card) dish presentation; asked
to use the full variety of lotus/background assets instead of one file
everywhere, including a footer design; asked for a menu-page background
design without losing artistic value.

**Investigated and fixed:**
- **Footer logo bug (confirmed root cause)**: `<Image loading="lazy">` never
  triggered in this environment even after scroll-into-view — `loading="eager"`
  fixed it. This is likely what read as "logo missing" (the header logo itself
  was always fine, verified by direct render check).
- **Hamburger layout bug (confirmed root cause)**: the header's 3-column
  `1fr auto 1fr` CSS Grid (built for desktop's symmetric nav) didn't reliably
  size `.header-right` on mobile — hamburger sat ~40px short of a true
  right-align. Replaced with an explicit flex `space-between` override at
  ≤1024px. Verified correct at 375/768px.
- **Shadow de-intensification, sitewide**: every terracotta shadow/text-shadow
  token (`--hero-text-shadow`, `--shadow-float`, `.hero-cinematic-light`,
  `.dish::after` and sibling floating-shadow rules, button shadows, menu-hero
  cluster shadows) had its opacity roughly halved. Root cause: these were
  recolored from black→terracotta last round but kept the SAME intensities
  tuned for a near-black theme — correct hue, wrong strength. Also removed a
  blanket `h1-h6, p/span/li/a { text-shadow }` rule that no longer made sense
  once text went dark-on-light (was causing a visible halo effect on headings).
- **Hero video visibility**: `.hero-cinematic-light`'s vignette opacities cut
  ~40-50%; video's own opacity raised 0.4→0.62.
- **Background asset variety**: previously only `Lotus BG.webp` was used
  everywhere. Now: Menu category list uses `Lotus Crop.webp` (calmer, single
  corner bloom — the busy centered medallion competed with 75 dishes' worth
  of photography); Havens already used `Lotus background.webp` via
  `.bg-blue-field`; Footer now layers `Footer.webp` (kraft-paper grain,
  previously unused) under a `Lotus Crop Transparent.webp` corner bloom
  instead of reusing the same lattice wash as every other section.
- **Orange/blue rebalance**: Chapter II "Theatre of Fire" moved from orange
  to `.bg-blue-field` (it's process/craft storytelling, not the menu/story
  content the client specifically asked to keep orange) — homepage now reads
  orange→blue→orange→blue going down instead of orange the whole way.
- **Heritage section redesign**: dropped the location-interior photo mosaic
  (verified identical images to the Havens cards below it) — no other
  lifestyle/craft photography exists anywhere in the asset library (checked;
  `Brand_Asset/*.jpg` are scanned menu pages), so it now uses three dish
  photos (Wok Charred Beef, Bangkok Fried Chicken, Chicken Penang Curry —
  none reused from the Exhibition chapter) with craft-themed captions instead
  of location names.
- **Havens card redesign**: asymmetric layout (Gulshan spans a taller
  "flagship" column, echoing the Heritage mosaic's own feature/tall
  asymmetry), a corner-bloom watermark per card, a Bellavoir Delight
  editorial tagline on the flagship card, refined type hierarchy, hover lift.
- **Menu dish framing**: new `.dish-frame` treatment — two diagonal corner
  brackets (top-left + bottom-right, not a full rectangle) plus a thin accent
  line beneath the dish, echoing a museum-label/plated-presentation mark
  rather than a traditional card. Preserves the existing floating/feathered
  dish presentation.
- Verified: `tsc`/`eslint` clean (same pre-existing warnings only), every
  changed section screenshotted via CDP, hamburger checked at 375/768px,
  9 WhatsApp CTAs and the orange/blue field split confirmed intact via a
  fresh browser tab (a reused tab in this environment accumulates a stale
  console-error buffer across navigations/HMR — always verify suspicious
  console errors against `preview_logs` server output and/or a fresh tab
  before trusting them).

## 9. Round 3 — 2026-08-07 (DESIGN_AUDIT.md reconciliation)

Not client-driven — a full reconciliation of `DESIGN_AUDIT.md` (dated 2026-07-12,
predating both rebrand rounds above) against the current codebase, then fixing
whatever was still genuinely open. Scope: color/contrast/visibility/readability,
main site only (admin excluded per instruction). Full item-by-item reconciliation
(all 110 items, each marked FIXED / OBSOLETE / N/A / BACKLOG / OPEN-minor with
reasoning) now lives at the top of `DESIGN_AUDIT.md` itself rather than duplicated
here.

**Two real, measured contrast bugs found and fixed** (screenshot review alone
wouldn't have caught these precisely — verified via live canvas-pixel sampling +
WCAG relative-luminance math in-browser, not estimated from hex values):
- **Active menu-category pill, all viewports**: white text on brand-orange
  measured 2.17:1 — the exact pairing `globals.css`'s own comments elsewhere
  call the site's worst/forbidden contrast pair. It had slipped through both
  prior rounds because the pill's colors are set inline in `app/menu/page.tsx`,
  outside the `.bg-orange-field` ink-scale system that governs everywhere else.
  Fixed to navy `#16233d` (matches `.btn-primary`'s own established orange-fill
  solution) — verified 7.25:1 live.
- **Tablet-only sticky nav bar (768–1024px)**: background was still
  `rgba(60,40,20,0.88)`, a near-black-brown leftover from the pre-rebrand dark
  theme, never touched by either color round because it lives inside a
  `<style>` tag scoped to a `max-width: 1024px` query that the desktop/mobile
  screenshot passes wouldn't have naturally hit. Inactive labels measured
  2.11:1. Fixed to a light glass bar matching the header's own treatment —
  verified 6.26:1 live.
- Added a missing skip-to-main-content link (`.skip-link` in `globals.css`,
  wired in `components/ClientWrapper.tsx`) — audit item #54, a real a11y gap.

**Environment note for next time**: after these edits, the dev server kept
serving a stale CSS bundle (missing the new rule entirely) even after a full
process stop/start — not the usual "Turbopack needs a file touch" issue
documented earlier. Root cause was a stale `.next` build cache; deleting the
`.next` directory before restarting resolved it. If a CSS/JS edit still isn't
showing up after a normal restart, clear `.next` before assuming the change is
wrong.

Verified: `tsc --noEmit` and `eslint` clean on all touched files
(`app/menu/page.tsx`, `components/ClientWrapper.tsx`, `app/globals.css`).
Contrast fixes confirmed live at desktop (1280px) and tablet (900px) via
in-browser measurement, post-cache-clear. Not committed to git — left for the
user to review.

## 10. Round 4 — 2026-08-07 (visual audit — screenshot-driven)

A genuine visual audit: the site was rendered and *looked at* (headless Chrome
over CDP, retina viewport crops at 1440px and 390px), rather than reviewed by
reading CSS. That surfaced defects no amount of code reading had caught across
three prior rounds — including two that the client had already complained about
and that were believed fixed.

**THE BIG ONE — the logo was invisible in 2 of its 3 placements.**
The hero lockup and the footer both rendered *nothing* where the Khao San
elephant mark should be. The hero — the single most important brand moment on
the site — had no logo at all; the mark still occupied layout space, which is
why the hero headline sat visibly off-centre.
Root cause, proven by isolating the variables: the image pipeline re-encodes
`Khao San Logo.webp` (navy mark on a transparent ground) into a format with **no
alpha channel**, flattening transparency to solid black. Both of these
placements knock the mark out to cream with `filter: brightness(0) invert(1)`,
which fundamentally requires alpha to survive — with the alpha gone the filter
has no silhouette to preserve. Serving the original file (`unoptimized`) renders
the mark correctly; verified by screenshotting the same element with the raw
source vs the pipeline output. Applied to all three logo placements so they
behave identically. **This is almost certainly the real cause of the client's
"Khao San logo missing" note, which Round 2 mis-diagnosed as a lazy-loading
problem** — `loading="eager"` changed nothing because loading was never the issue.

**The hamburger was still broken, in a different way than Round 2 fixed.**
Round 2 corrected its right-alignment. But the three bars were never aligned
with each other: the two outer bars are absolutely positioned and only set
`top`/`bottom`, so their horizontal placement fell through to the CSS static
position, which inherited centre text-alignment and pushed them 12px right of
the middle bar. The icon rendered as a zigzag. Fixed with an explicit `left: 0`.

**Contrast / legibility fixes (all measured, not eyeballed):**
- Closing headline "Taste the fire." was brand orange over a bright, near-white
  drink shot — 2.16:1, the same white-on-orange-class failure the stylesheet
  forbids everywhere else. `--color-primary` had simply been omitted from the
  `.section-reservation` ink scale. Now cream, over a new `.invitation-light`
  pool (the hero's "shade behind the copy" pattern rather than a blanket scrim,
  so the footage stays visible per the client's Round 2 request) plus the
  existing opt-in text-shadow. Measured composited ground behind the headline:
  **2.9:1 → 6.68:1 median, 4.30:1 at the 95th percentile** (large-text floor is
  3:1); the shadow covers the remaining specular-highlight sliver.
- Heritage pull-quote's `<em>` accent was brand blue on near-navy body ink —
  **1.56:1 apart, i.e. invisible**. The intended emphasis on "quietly elevated"
  did nothing. Now terracotta (2.00:1 separation from the base, 3.63:1 on the
  field).
- Footer legal/copyright text was **3.29:1** — under the 4.5:1 floor. Now 5.22:1.

**Typography:**
- Digits inside display headings were falling through Camera Obscura's
  digit-excluding `unicode-range` onto Playfair Display — a hairline Didone
  beside heavy deco caps, so "Gulshan 1" and "(4pcs)" visibly changed typeface
  mid-word. The display fallback is now Montserrat, the brand's own sans, which
  already sets every price on the site.
- The Bellavoir Delight copperplate script was doing real damage in its only two
  uses: as the Heritage pull-quote (the section's emotional centrepiece, and the
  hardest line on the page to read) and as the flagship Havens tagline (a looped
  display face set at 1.08rem body size). Moved to the display face and the sans
  italic respectively. **Bellavoir is now unreferenced in CSS** — it can be
  dropped from `app/layout.tsx` and `app/fonts/` entirely, removing one of the
  two personal-use-licence launch blockers. Good Brush remains the brand's
  script and still carries "The Thai Way" in the hero, which is the phrase the
  brand actually sets in script.

**Art direction:**
- Menu category field — **first attempt was wrong, corrected**. The initial pass
  read the problem as "pattern too loud" and raised the wash 0.80/0.84 → 0.88/0.91.
  That only made the noise fainter; the client immediately (and correctly) said
  the lotus background still looked bad. Capturing the field *in isolation* (all
  content hidden, so the texture could be judged on its own) showed the real
  fault: the field was painting **three** things at once —
  `Lotus Single.webp` tiled at ~340–480px, **the same tile again** at ~160–230px
  at an unrelated offset, **plus** a navy naturalistic hatched corner bloom
  (`Lotus Crop Transparent.webp`) on top. Two grids of one motif at different
  scales are never in phase, so the small medallions landed arbitrarily across
  the large ones and both patterns' geometry collapsed into mush; the corner
  bloom added a second, incompatible visual language (flat geometric quatrefoil
  vs engraved botanical line-art).
  `Lotus Single.webp` is actually an excellent asset — a perfectly seamless Thai
  lotus lattice whose corner elements resolve into diamonds where four tiles
  meet. It just needed to be used **once**. Now a single grid at
  `clamp(190px, 22vw, 330px)` (~4–5 medallions across desktop, ~2 across a
  phone), no second grid, no corner bloom, wash 0.86/0.89 — slightly *more*
  pattern presence than the failed attempt, yet far calmer, because clean
  geometry at moderate contrast reads as deliberate ornament whereas noise reads
  as dirt at any contrast. Dish text unchanged at 7.25:1 / 8.38:1 / 4.80:1.
  **Lesson: when a texture "looks bad", screenshot it with the content hidden
  before touching opacity — turning down a broken pattern doesn't fix it.**
- Menu field, **second correction — the motif itself was wrong**. Collapsing to
  one grid fixed the noise, but the client said it still looked weird, and they
  were right: `Lotus Single.webp` is a set of large, soft, SOLID medallions that
  float as isolated blobs with empty diamonds between them. At background scale
  that reads as bubbly wallpaper, not Thai ornament — it was missing the
  continuous woven lattice that makes the brand's pattern feel architectural.
  Rather than approximate it, **the client's own pattern was recovered from
  their brand artwork** (`Brand_Asset/433075883_*.jpg` — the elephant logo
  sitting on their orange pattern). The logo occludes the middle, so the tile
  period was measured off the unoccluded top/left strips by autocorrelation
  (245px × 244px, correlation 0.95/0.96), one exact period cut from a clean
  corner, and converted to a white-on-transparent **soft-alpha** mask (a hard
  threshold turned JPEG noise into ragged stroke edges) so it tints to any brand
  colour at any opacity. Saved as grayscale+alpha PNG, 16KB, at
  `public/assets/patterns/thai-lotus-lattice.png`. It tiles with no seam because
  it is a true single period of an already-seamless pattern. Now used at
  `clamp(118px, 11vw, 168px)` with a 0.90/0.92 wash — fine line-work at small
  scale reads as texture rather than wallpaper, and it is literally the brand's
  own pattern rather than an interpretation of it.
  **⚠ Do NOT use `Background/thai-lotus-flower-pattern-vector-*.avif` as an
  alternative — it is watermarked VectorStock comp art (VectorStock.com/16429254
  is baked into the pixels) and is not licensed.** It should probably be deleted
  from the repo.
- **Dish corner brackets scaled up** (client request, directly caused by the
  above): at 22px long / 1.5px stroke they worked against a flat orange field,
  but dissolved into the new lattice and read as stray artefacts. Now 44px at a
  3px stroke (60px on hover), and the accent rule beneath them — previously a
  1px line in `--color-border`, i.e. near-black at 0.08 alpha and invisible on
  orange — is now a 2px rule in the field's own accent, fading out to the right
  so it reads as a specimen-label underline rather than a full-width divider.
  Bracket-on-field contrast 4.64:1; still only two opposite corners, since the
  point is a museum-label crop rather than a box.
- **Footer → kraft paper** (client request). `Background/Footer/Footer.webp` is
  now the footer's actual surface — **the paper and nothing else**: no tint
  wash, no pattern layered over it. A first attempt added a cream wash plus a
  lotus overlay; the client corrected that to the bare texture, which is right —
  the paper is the design.
  This inverts the footer from dark to light, so all of its ink had to change,
  not just its background. Measured against the untinted paper (mean
  rgb(206,165,128)): **white = 2.25:1 and brand orange = 1.04:1** — and the old
  footer used white links and orange column headings throughout, i.e. the entire
  footer would have been unreadable on a straight swap. Re-inked via the
  section's own token scale: body/links `#161616` (8.03:1), headings `#16233d`
  (6.99:1), secondary `#4a3a2c` (4.83:1), legal `#5c4835`. The logo's
  `brightness(0) invert(1)` knock-out was **removed** — the source mark is solid
  brand navy, which is correct on kraft (4.44:1) and is the brand's own printed
  lockup; inverting it to cream here would have left it at 2.25:1.
- **Gift chapter → cream field with a lotus bloom** (client request: it was the
  one section still a flat solid). Two wrong turns before the right answer,
  both caught by the client:
  1. Reused the menu's lattice — but repeating the same pattern made the two
     sections read as the same wallpaper twice.
  2. Switched it to `.bg-orange-field` — which killed the saffron brush stroke
     entirely (orange paint on an orange ground) and flattened the dark cards.
  The resolution is a **cream** ground (`.gift-field`): the two gift cards are
  dark premium objects and the brush is the section's energy — both need a pale
  surface to read at all. It also paces the page (blue Havens → cream gift →
  dark video) and rhymes with the new kraft footer. Not flat: a single large
  `Lotus.webp` bloom under a 0.955 cream wash, anchored low-left and bleeding
  off both edges as a **corner flourish**. A first pass had it centred-left at
  58vw, which put a full spread of leaves behind the heading and body copy and
  read as clutter — smaller and fainter does more.
  Composition also retuned per the client: cards tightened toward each other and
  shifted right (`top 6%/left 10%` and `bottom 6%/right 0%`, 58% wide) with a
  `padding-left` nudge, opening cream to the brush's left so the stroke is
  visible instead of colliding with the copy. The copy column was widened back
  to 0.82fr after the first retune squeezed it to 0.68fr and broke the heading
  onto three lines ("An" / "evening," / "Gifted.") — a worse outcome than the
  slightly tighter gap it bought.
  Brush opacity restored to 0.95 (from 0.45). The 0.45 value dated from when
  three strokes were stacked *and* the section was orange; with one stroke on
  cream it read as a washed-out smudge rather than paint. At full strength the
  asset's impasto texture and bristle marks show and the mark carries the
  section's energy, while the dark cards still sit clearly on top of it.
  **Watch the specificity trap here:** `#gift` was carrying the cream
  terracotta ink scale as an *ID* selector (specificity 100). Left in place it
  silently beats any field class (10), so while the section was briefly orange
  the accent would have stayed terracotta at 3.48:1 — failing AA while the CSS
  still looked correct. It was removed from that rule; `.gift-field` now
  declares its own scale. Verified: heading/body 17.14:1, terracotta accent
  7.42:1.
- Gift chapter: three near-opaque copies of the same brush stroke stacked at
  different angles had become an undifferentiated orange mass — the crudest
  element on the site. Reduced to one sweep at 0.45. Separately, the two gift
  cards overlapped such that the rear card's "The Thai Way" wordmark was cut
  mid-phrase; the overlap is now a corner touch, so both wordmarks read.

Verified: `tsc --noEmit` clean; `eslint` unchanged from baseline (2 errors, 5
warnings, all pre-existing and all in `app/admin/*`, which was out of scope this
round by request). Every fix re-screenshotted and re-measured after the change.
Zero console errors on a clean load of `/` and `/menu` in a fresh tab.

**Tooling note:** the screenshot script force-sets `loading="eager"` on lazy
images before React hydrates, which produces a *spurious* hydration-mismatch
warning in the dev overlay (`loading="lazy"` server vs `"eager"` client). That
warning is an artefact of the capture harness, not a site defect — a clean load
without the injection shows zero console errors. Don't chase it.

Not committed to git — left for review.

## 11. Brush stroke as brand identity — where it can and cannot go

Client note: *"the brush stroke is one of their brand identity"* — asked how and
where to use more of it. Answered by prototyping rather than assertion, and the
prototypes overturned the initial recommendation.

**Starting state:** the brush identity was badly under-used. `saffron.png`
appeared in only 2 places (the once-only chapter seam, the gift backdrop),
`terracotta.png` was **completely unused**, and Good Brush — the brand's actual
hand-lettering, the face their own gift cards use — appeared exactly **once**
site-wide (the hero).

**Constraints discovered, which decided everything:**
1. **Good Brush is caps-only.** Verified by rendering, not assumed — lowercase
   input returns caps glyphs. So brush lettering forces any phrase into a raised
   voice. That is right for heat/fire/street copy and wrong for intimacy: "An
   evening, GIFTED." reads as shouting a present at someone. This constraint is
   a feature — it self-limits the device and prevents wallpaper.
2. **The stroke asset must be LARGE.** Its whole value is texture (impasto
   ridges, bristle drag, splatter). Below ~300px that is gone and it reads as a
   smudge — worse than a clean rule. This is why it is *not* used as an eyebrow
   underline or thin divider, despite that being the obvious first idea.
3. **The stroke cannot sit behind light type.** White/cream on saffron is
   2.16:1, the pairing forbidden throughout the stylesheet. Behind a *centred*
   white heading it has nowhere to dodge except an edge, where it reads as a
   stain. Tried on the Havens chapter and **removed**.

**Brush-as-mask on photography was prototyped and REJECTED** (three variants
rendered offline before touching the site):
  - *full silhouette* — clipped the image to the brush shape; the subject became
    unrecognisable. Unusable.
  - *torn edges* — kept the subject but the edge read as grunge/compression
    artefacts, which fights the brand's own "quietly elevated" positioning.
  - *painted mount* — image sitting on a brush mark; this is already what the
    gift chapter does, so repeating it elsewhere is repetition, not identity.
  Conclusion: masking is not right for this brand. The existing soft
  `.img-feather` dissolve is more "quietly elevated" than a torn brush edge.

**What was actually implemented — brush as VOICE, not more copies of the stroke:**
- New `.display-brush` utility. Pairs with `.display-2` (which supplies
  size/colour/margin) and overrides only the face plus the metrics the brush
  needs — tighter leading, since the lettering carries its own vertical air, and
  the deco face's negative tracking dropped.
- Applied to the two "heat" headings: **"The Theatre of Fire."** (Chapter II) and
  **"Taste the fire."** (closing). With the hero's "The Thai Way" that gives
  three brush-hand moments, well spaced, all on heat language — and the site now
  **opens and closes in the brand's own hand**. That bookend is the point;
  scattering the class through the middle chapters would destroy it.

The full "where the brush can and cannot go" reasoning is recorded as a comment
block in `globals.css` above `.brush-sweep`, so the next round does not
re-derive it.

**Housekeeping:** both brush PNGs are ~1MB. Converting to WebP measured **77%
smaller**, which matters for any CSS `background-image` use (unlike
`next/image`, a CSS background ships the raw file). The derived `.webp` files
were removed again since the final implementation uses no CSS-background brush —
regenerate if that changes. `terracotta.png` remains unused.

## 12. Deferred to a future round
- Font licensing: confirm the client's purchased font files and drop
  them into `app/fonts/` in place of the demo builds.
- `middleware.ts` uses the deprecated Next.js "middleware" file
  convention (a console warning, not an error) — Next.js suggests
  migrating to "proxy". Not touched this round, unrelated to the
  client's feedback.
- `DESIGN_AUDIT.md` backlog items (see its own summary): menu category
  descriptions, search/filter, social proof, redemption instructions,
  seasonal indicators, distance-from-center info — all need real content
  or a product decision from the client, not a design/code fix.

## 13. Round 5 — 2026-08-10 (client feedback, 17 items) — IN PROGRESS

**Status: in progress. Three corrections came in late in the session;
corrections 1 and 2 are now applied and verified, correction 3 (the menu
page revamp) is the next piece of work — read §13.3.**

Client feedback arrived as a 17-item list plus an action-item split between
"Khaosan Team" (assets/copy) and "Website Development/Design" (build work).
Roughly half the list is blocked on deliverables Khaosan has not supplied yet.

### 13.1 Done and verified this session

Verified with `tsc --noEmit` clean, `eslint` clean, and CDP screenshots at
1440px (the in-app preview does not composite in this environment — see the
project memory note; the capture script is in the session scratchpad as
`shoot.py`).

- **Header** (`components/Header.tsx`): logo moved out of the centre nav into
  its own left column; nav links centred; CTA right. Measured at 1280px —
  logo flush left at the header gutter, nav centre exactly on the viewport
  centre, CTA flush right. Mobile (≤1024px) now hides `.header-center`
  instead of `.header-left`, so flex `space-between` puts the logo and
  hamburger at the two edges.
- **Hero** (`app/page.tsx`, `04-hero.css`, `05-motion.css`): `.hero-lockup`
  changed from a horizontal mark-beside-wordmark arrangement to a centred
  column, so the order is now mark → tagline → description → CTAs. Mark
  enlarged to `clamp(120px, 14vw, 200px)` now that it stands alone. The old
  640px `flex-direction: column` override is gone (it is a column at every
  width) along with the `.hero-eyebrow` left optical padding.
- **Section labels removed sitewide**: "The Kitchen", "Our Heritage",
  "The Exhibition", "The Spaces", "The Final Table". `.heritage-eyebrow`
  deleted from `09-home-sections.css`.
- **Seamless chapter transitions** — this replaced a mechanism that was
  actively working against the brief. Every `<section>` carried an inset
  black `box-shadow` at its top edge; a dark band in a section's first 40px
  is itself a boundary marker, so every join was still announced as a line.
  It is now a genuine cross-fade: each section paints a
  `clamp(110px, 15vh, 200px)` `::before` band carrying the colour of the
  section above it, fading to transparent (`10-backgrounds.css`).
  Three things were learned doing this and are worth not re-learning:
  1. **The hero seam cannot be fixed from the incoming side.** A band inside
     the next section fades *its* colour in, but the hero ends on whatever
     video frame is showing — often bright — so the join still stepped from a
     light frame to a dark band. The hero now fades out instead
     (`.hero::after` → blue), and the craft video's top edge dissolves back
     out of that same blue.
  2. **Fade to the COMPOSITED colour, not the token.** `.bg-blue-field` is a
     0.86–0.92 wash over dark artwork, so it renders darker than
     `--color-brand-blue`. Fading the hero to `#1e417b` left a measured
     rgb(32,66,123) → rgb(28,59,111) step. Sampling the real pixels and
     fading to rgb(28,59,111) closed it — verified continuous across the
     boundary.
  3. **Two adjacent same-colour sections still show a line**, because each
     paints its own copy of the lotus artwork at `background-size: cover`, so
     the art restarts at the join. No padding or seam work fixes that.
     Heritage and Exhibition are therefore now **one `<section>`** — one
     element, one continuous field, line gone.

  `.section-seam` / `.section-seam-mark` deleted from `11-layout.css` (an
  explicit divider line is the opposite of the brief), and
  `.bg-orange-field + .bg-orange-field` padding collapsed to 0.
- **Typography**: `.display-brush` removed from Chapter II's "The Theatre of
  Fire." The brush face is now only the hero's "The Thai Way" and the closing
  "Taste the fire." — the opening/closing bookend the client asked for.
- **Locations**: `#havens` → `#locations` (Header, Footer, mobile nav all
  updated); "Our Havens." → "Our Locations."; `type` (Flagship / Original /
  Sanctuary) and the Gulshan `tagline` removed from the `LOCATIONS` data and
  from `13-havens.css`. The first card's layout — the full-width horizontal
  plate, photo one side, label the other — is now the base `.haven-card`
  structure for all three; the `--feature` modifier and the 2-up grid are
  gone. The photo dissolve runs sideways into the label, turning downward
  below 900px where the plate stacks.
- **Prices and specialty text removed**: homepage signature spreads lost the
  `.spread-meta` line ("★ Signature / Tamarind & Charred Wok") and the BDT
  figures; `MenuCard` no longer takes or renders `price`/`groupPrice`; add-on
  prices dropped; the two pricing footnotes on /menu reworded (a note about
  what prices include reads oddly on a menu with no prices).
  **The `price` / `group_price` columns are untouched in Supabase and still
  editable in admin** — the client asked for prices off the site, not out of
  the data.
- **CTA copy**: "See the Craft" → "See the Menu". Reservation CTAs → "Contact
  Us" in the closing section, the gift chapter, the header (desktop + mobile
  overlay), the footer, and each location card.
  **Judgement call to confirm:** item 12 names only "Purchase a Gift Card"
  and "Reserve a Table Now", but leaving "Reserve" in the header and footer
  while the closing section says "Contact Us" would be incoherent on a site
  with no booking system. Easy to revert if the client disagrees.

### 13.2 Blocked on Khaosan deliverables (not started)

- Final copywriting and CTA text (item 5) — only the named
  "See the Craft" → "See the Menu" example was applied.
- Gift section redesign (item 11) — awaiting Zidan's concept.
- Footer redesign, site and menu page (items 13, 17) — awaiting direction.
  Only the footer's "Reserve a Table" → "Contact Us" text was changed.
- Closing-section videos (item 12) — awaiting new footage.
- Menu page hero artwork, background artwork, menu artwork, copy (item 14).
- Signature/Menu section background artwork (item 8).
- Menu names, descriptions and dish photography (items 8, 16).

### 13.3 CORRECTIONS RECEIVED

Three corrections came in after the work in §13.1 was built.

**1. Chapter II video — DONE.** The brief was a *bigger frame*; it had been
rebuilt as a full-bleed, near-viewport-height stage, which is a hero
treatment and overshot. It is a contained side-by-side split again, with the
film given most of it. **Measured: 953px wide at a 1440 viewport, 67% of the
screen — up from ~608px originally. +57% width, ~2.5x the area.**

Three attempts, because the first two under-delivered. Recorded so they are
not retried:
  1. **Column ratio alone** (1.62fr / 1fr inside `.container`) measured only
     **~4% wider** than the original `flex: 1 1 500px` / `flex: 1 1 300px`.
     The old layout's constraint was never the ratio — it was the **8vw
     gutter**, eating more width than the columns were.
  2. **Capping the copy column** inside `.container` got it to ~800px, but
     `.container`'s own `max-width: 1280` and 8vw padding are a hard ceiling.
     On a 1440 screen that is barely half the viewport.
  3. **Breaking out of the container** is what actually moved it.
     `.craft-split` now sets its own `width: min(94vw, 1660px)` and centres
     itself, with `grid-template-columns: minmax(0, 1fr) clamp(300px, 26%,
     420px)` — the copy is the quiet half and the film takes ~70% of the row.
     This is the only place on the homepage that exceeds the 1280 measure,
     and that is the point: per Impeccable's `bolder.md`, this chapter's job
     is to be a peak in the scroll, and a frame bound by the same container
     as a paragraph of body copy cannot be one. Both side margins survive and
     the copy still sits beside it, so it stays a frame, not the rejected
     full-bleed hero.
  - 94vw keeps a real margin at every width; the 1660px cap stops it growing
    unbounded on ultrawide, where an uncapped frame stops reading as a
    composition. Below 900px the split stacks, drops back to the page's own
    `max(8vw, 24px)` gutter, and the breakout is abandoned — there is no
    container to break out of on a phone.
  - Copy column capped at 420px, not 360px: at 360 the heading broke to three
    lines. Same trade-off Round 4 hit on the gift chapter. Heading also
    dropped to `clamp(2rem, 3vw, 3rem)`. Verified 2 lines at 1440.
  - The `.craft-stage .media-feather` vertical-mask override was removed with
    the full-bleed layout; the stock 20px `--feather-edge` is correct again
    now the video is a contained frame.
  - **Environment note:** mid-verification the browser reported the mobile
    margins as 11px when the source said 30px — the base `.craft-split` rule
    had updated but its `@media (max-width: 900px)` block had not. A
    *partially* stale CSS bundle, which is a nastier version of the staleness
    noted in Round 3: it looks like a real layout bug rather than a cache
    problem. `rm -rf .next` and a server restart fixed it, and the measured
    values were correct afterwards (30px margins, no horizontal overflow).
    If a rule reads as ignored while its neighbours in the same file apply,
    clear `.next` before debugging the CSS.

**2. Gallery — DONE.** Rebuilt from the horizontal scroll-snap row into an
asymmetric masonry wall.
  - CSS multi-column (`column-count: 3` → 2 → 1), not grid: `grid-template-rows:
    masonry` is not broadly shipping, and a grid with row spans needs each
    image's height known in advance. Columns need nothing but content, so
    adding a photograph is a one-line data change.
  - Each entry in `HERITAGE_ROOMS` now carries a `ratio` (3/4, 1/1, 4/5)
    applied inline to `.hg-card`. Mixing tall, square and landscape is what
    creates the stagger; uniform ratios would collapse it back to rows.
  - **Column flow is column-major** — it fills down each column before moving
    right. Fine for an unordered gallery; do not reuse this layout where
    sequence carries meaning.
  - **Only 3 photographs exist** (`public/assets/Heritage/`). With 3 images in
    3 columns each column holds exactly one, so it currently reads as a row of
    unequal-height plates rather than a true cascade. The layout is correct and
    will cascade as soon as Khaosan's additional photography lands.

**3. Menu page full UI revamp — NOT STARTED. Next piece of work.**
Design and plan first, then execute. **Do not continue patching the current
menu page.** The partial changes in §13.4 are interim and the revamp should
supersede them wholesale. Note that most of the menu page's inputs (hero
artwork, background artwork, menu artwork, dish photography, names,
descriptions, copy) are on Khaosan's side per §13.2, so the plan can settle
structure, navigation and layout system now, but the art direction is gated.

### 13.4 Menu page — partial, interim state

Made before correction 3 landed. Functional and lint/type clean, but expect
the revamp to replace it:

- `MenuCard` rebuilt from the floating cut-out to a photographic plate
  (`.dish-photo`, 4/3, `object-fit: cover`). The museum-label corner brackets
  (`.menu-card::before/::after`) and the `.dish-frame-mark` accent rule were
  removed with it, as was `.dish-frame`.
  **⚠ Asset caveat that will matter for the revamp:** the images in Supabase
  are alpha-PNG *cut-outs* on a transparent ground, and the upload API and
  storage bucket actively enforce that. Cropped to fill, a cut-out shows its
  transparent ground — which is why `.dish-photo` carries a warm plate colour
  behind the image. Do not loosen the alpha-PNG enforcement until Khaosan's
  real photographs are in.
- Nav accessibility: the pill strip is now a real `<nav aria-label="Menu
  categories">` instead of an anonymous div of links, the active category
  carries `aria-current` rather than being signalled by colour and weight
  alone, and the pills have a `:focus-visible` ring.
- Category `<section>`s lost their bottom margin so the list reads as one
  continuous run.
- **Known leftover:** one price survives on /menu — `"Add coconut ice cream -
  465 BDT total."` is baked into an `add_on_note` string in Supabase, not in
  code. It is client content in their database, so it was left alone rather
  than edited unilaterally. Flag it to Khaosan or fix it in admin.

### 13.5 Not committed

Nothing in this round is committed to git — left for review, as with every
prior round.

### 13.6 Interior gallery — drifting columns (`InteriorDrift`)

Supersedes the masonry in §13.3 correction 2. Client direction: the gallery has
to showcase a lot of interior across three outlets, ideally auto-scrolling —
"maybe an auto side scroll, or Pinterest grid auto scroll type within a box
frame which is vertically moving".

**The asset reality, checked rather than assumed.** There are **6** interior
images in the whole repo, and 3 of them are already used elsewhere:

| Source | Count | Status |
|---|---|---|
| `public/assets/Heritage/*.webp` | 3 | wall-art detail crops — the gallery's current content |
| `public/assets/Location_Image_1_1/*.webp` | 3 | already used by the Locations cards |

All 24 files in `_masters/Brand_Asset/` were opened as a contact sheet to
confirm: they are menu pages, food/social posts and gift-card art. **Zero
interior photography.** The gallery is therefore entirely gated on Khao San's
shoot, and is built to look deliberate at 3 images and switch on by itself at 8.

**Why columns translate instead of a scroll box.** The literal build of "a
Pinterest grid that scrolls vertically inside a frame" is an `overflow-y: auto`
element — a vertical scroll container nested inside a vertically scrolling
page. It captures the wheel, makes mobile touch ambiguous, and the visitor ends
up fighting it. Keeping the look and dropping the scrolling solves it: three
columns of plates `translate3d` upward inside an `overflow: hidden` frame,
masked top and bottom so plates dissolve in and out rather than being cut off
by the frame edge (the same dissolve language as `.media-feather` and the
chapter seams). There is no scrollable region in the component at all.

**Detail worth keeping:**
- Each column's track holds **two copies** of its plates and animates to
  exactly `-50%`, so the second copy lands where the first started and the loop
  has no seam. Any other distance shows a jump. The duplicate copy is
  `aria-hidden` with empty `alt`, so a screen reader reads the gallery once.
- Durations stagger (52s / 63s / 74s) and alternate direction. Identical speed
  in one direction reads as a single sliding sheet rather than a wall of
  separate photographs.
- Shots are dealt round-robin across columns, so orientations mix instead of
  every portrait landing in one column.
- `location` is rendered as each plate's caption. That is how the gallery says
  "three outlets" without filter chips, which would add interaction cost and
  empty states to a marketing page.

**Motion obligations, all verified in a real browser (see below):**
- `prefers-reduced-motion: reduce` → drift off entirely (not slowed), frame
  height goes auto, mask removed, pause control not rendered. Enforced twice:
  in the component and by a `!important` block in CSS, so it holds if the
  preference flips after mount or JS never runs.
- **WCAG 2.2.2** — motion running longer than 5s needs a pause mechanism. Hover
  pause alone does not satisfy this for keyboard users, so there is a real
  `<button>` with `aria-pressed` alongside hover pause.
- IntersectionObserver gates the animation to on-screen only (`animate.md`:
  nonessential loops must stop when offscreen).
- Transform-only, no layout-driving properties.

**Verification** (12-shot fixture, reverted afterwards; real headless Chrome,
not the preview pane):
- on screen → all three tracks `running`, measured 72 / 45 / 47 px of travel in
  2s — confirming they move at genuinely different speeds
- pause button → `paused`, measured zero travel over 1.5s, label and
  `aria-pressed` flip correctly, resume restores `running`
- `prefers-reduced-motion: reduce` → `animationName: none`, zero travel, frame
  height 3728px (everything visible, nothing clipped), no pause button
- frame is not scrollable; page has no horizontal overflow
- `tsc` and `eslint` clean

**⚠ Testing note that cost time.** The in-app Browser pane runs with
`document.visibilityState === 'hidden'`, and Chrome does not fire
IntersectionObserver callbacks for a hidden document — so anything IO-gated
reads as permanently inactive there, which looks exactly like a broken
component. This is the "hidden visibilityState" gotcha already in project
memory. Verify IO-gated work through CDP against real Chrome
(`scratchpad/probe.py`), never the preview pane.

**Asset spec for Khao San** — the gallery starts drifting at 8 images:
- **18–30 shots**, ideally 6–10 per outlet
- **~60% portrait** (4:5 or 2:3), **~40% landscape** (3:2). Mixed heights are
  what make the columns stagger; uniform ratios collapse the effect
- **≥1600px** on the long edge, originals (converted to WebP here)
- rooms, bar, seating, lighting, murals, textures — **not food**, which has its
  own chapter
- **no burned-in captions or logos** — the `_masters/README` already documents
  that hazard on their social exports
- named `interiors/<outlet>/NN-subject.jpg`

Adding them is a change to the `INTERIORS` array in `app/page.tsx` only: give
each entry `src`, `alt`, `location` and a `ratio`. No component or CSS change.

### 13.7 Gallery — assets found, fallback removed, separate phone design

Three corrections to §13.6, all client-driven.

**1. There WAS enough photography — I had under-counted.** §13.6 said the
gallery was gated on Khao San's shoot. That was wrong in a specific way: the
three outlet photographs in `Location_Image_1_1/` are 1441x1441, and the
existing `Heritage/*.webp` plates were themselves cut from exactly those files
(the PRD said so). So more plates could be cut the same way.

Six new crops now live in `public/assets/interiors/<outlet>/`, cut from the
areas the Heritage crops did **not** already use — those three already cover
Uttara's neon signage, Uttara's elephant mural and Gulshan's Rocco wall, so
cutting near-duplicates of them would have put the same wall on the page twice:

| Outlet | New crops |
|---|---|
| Gulshan 1 | `tuktuk-booth` (2/3), `banquette` (3/2) |
| Dhanmondi | `mural-glass` (3/4), `tables-palm` (3/2) |
| Uttara | `pendants` (5/4), `dining-floor` (4/3) |

Nine plates total, three per column. Each crop was rendered to a contact sheet
and looked at before being wired in, not cropped blind.

`INTERIORS` is ordered **interleaved by outlet** (Gulshan, Dhanmondi, Uttara,
repeating), not grouped. The component deals round-robin, so a grouped list put
all three Gulshan plates across the top row; interleaved, every column carries
all three outlets.

Still worth having Khao San's real interior shoot — nine crops from three
source photographs is a floor, not a ceiling — but the section stands on its
own now. The asset spec in §13.6 is unchanged.

**2. The static-masonry fallback is deleted.** Client: *"delete the old layout,
and keep the new design we just did."* `.interior-masonry` and the
`driftThreshold` prop are gone; the drift is the only layout.

Short lists still had to work, so `dealt` gained a branch. With
`shots.length >= columns * minPerColumn` it is a plain round-robin. Below that
it cycles the list with a **phase offset of one per column**, so column 0 runs
a-b-c, column 1 runs b-c-a, column 2 runs c-a-b — every column shows the whole
set in a different order rather than repeating a single photograph.
**The stride must be 1 there, not `columns`:** with 3 shots across 3 columns a
stride of 3 lands on the same index every row and each column collapses to one
image repeated. That bug was written and caught before shipping.

**3. Phones get a different composition, not the desktop one squeezed.**
Client: *"this design is not for phone, build a different design section for
phone."* They were right — one column in a short frame is a single tall image
creeping through a letterbox, which reads as a broken carousel.

Phones now render a **horizontal filmstrip** (`.interior-strip`): full-bleed
edge to edge, all plates sharing one height and taking their width from their
own ratio, drifting sideways, masked left and right.

Sideways is not arbitrary. Horizontal motion is **orthogonal to the page
scroll**, so on a touch screen it can never compete with the thumb — the same
reasoning that ruled out a nested scroll container on desktop, applied to the
axis that actually has room on a phone. Under `prefers-reduced-motion` the
strip becomes a genuine swipeable scroll-snap row rather than a band the
visitor can only watch; horizontal, so still no conflict.

The switch is a `matchMedia('(max-width: 640px)')` hook that starts `false`, so
the first client render matches the server and hydration stays clean; the
effect flips it after mount. The IntersectionObserver effect depends on
`isPhone` because the observed element is swapped.

### 13.8 Hydration warning from browser extensions — fixed

Reported console error: *"A tree hydrated but some attributes of the server
rendered HTML didn't match"*, with the diff showing
`data-new-gr-c-s-check-loaded` and `data-gr-ext-installed` on `<body>`.

Those are **Grammarly's**. The extension stamps `<body>` before React hydrates,
the server HTML has neither attribute, and no application change can prevent
it — it is the visitor's extension. Password managers and ad blockers do the
same thing.

Fix: `suppressHydrationWarning` on `<body>` in `app/layout.tsx`.
`<html>` already had it, and that does **not** help — the flag applies only to
the element it is set on and does not cascade to descendants. Scope is narrow:
it silences attribute/text mismatches on `<body>` itself, so real mismatches
inside `ClientWrapper` and the page tree are still reported.

**Verified by reproducing it, with a control.** The extension is not installed
in headless Chrome, so the bug cannot be seen by simply loading the page.
`scratchpad/hydration-check.py` injects the exact two attributes at
document-start via `Page.addScriptToEvaluateOnNewDocument` and collects console
output:

- fix present → attributes confirmed on `<body>`, **0 hydration warnings**
- fix removed (control) → **1 hydration warning**, the client's exact message

Two traps in writing that harness, both of which produced a false pass first:
- the injector must observe **`document`**, not `document.documentElement` — at
  document-start `<html>` does not exist yet and `observe()` throws, so the
  attributes were never applied and the run "passed" while testing nothing
- do not drain the CDP event stream with a `recv()` timeout loop; a timeout
  leaves websocket-client's socket unusable for every later command. Sleep,
  then let the next `cmd()` read through the buffered events.

## 14. Round 6 — 2026-08-10: menu page redesign

Client: redesign the menu UI, *"try something different"*, and use **normal
pictures of the dishes — not the extracted-PNG floating treatment**, which is
rejected. One constraint given explicitly: **do not change the phone
navigation rail.** Layout choice was left to me.

### 14.1 The picture problem, and why CSS could not solve it

All 73 files under `Menu/KS Menu Webp/` are **RGBA cut-outs with real
transparency** — checked, every one. There are no un-extracted originals
anywhere in the repo (searched both copies; `_masters/Brand_Asset` is menu
pages and social posts). So "use normal pictures" could not be done by styling:
a cut-out dropped on a coloured box is still a cut-out, which is exactly what
the interim `.dish-photo` treatment was doing with its cream backdrop.

The backgrounds are therefore **baked back in**. `scratchpad/plate.py`
composites each dish onto a warm ground with a soft contact shadow and writes
an opaque WebP to `public/assets/menu-plated/` (73 files, 3.5 MB, re-runnable).
The floating treatment is now gone *at the asset level*, not hidden with CSS.

Two things the script does that matter more than they sound:

- **Framing is normalised.** The cut-outs are 1512² with the dish floating at
  wildly different scales — a small bowl fills ~40% of its box, a long platter
  ~90%. Dropped into a uniform row that reads as random zoom. Each dish is
  measured by its **alpha bounding box** and rescaled to occupy a consistent
  share of the frame, so every row carries the same visual weight.
- **The shadow is terracotta, never black** — the sitewide ban from Round 1.

`app/menu/page.tsx` rewrites the Supabase path (`Menu/KS Menu Webp/` →
`menu-plated/`) via `platedSrc()` rather than editing the database, so the
originals stay the record of what was uploaded and the admin upload flow is
untouched. An unrecognised path passes through unchanged, so a newly uploaded
dish still renders — just unplated until the script is re-run.

### 14.2 The layout, and why this one

Impeccable's craft floor is blunt about the previous structure:

> "Same-size cards of icon plus heading plus text as the page structure.
> **Cards are the lazy container.**"

That is precisely what the menu was — a masonry grid of bordered cards with
specimen corner brackets. So a card grid was ruled out before choosing.

The direction came from the brand's own material: **the scanned printed menus
in `_masters/Brand_Asset` are a two-column typographic list** — category
heading, dish name, description, with photography alongside. The web menu now
follows the brand's native format instead of an invented one.

**Result: a continuous two-column photographic list.**
- `.menu-list` uses CSS `columns: 2` with a hairline `column-rule` — the
  divider a printed menu would set. Rows, not grid cells, so each row hugs its
  own content and a long description never pads out the dish beside it.
- `.menu-row` is a photo + name + description + tags, separated by a hairline.
  No box, no shadow, no bracket.
- **The category name is the only thing marking a new category** — no rule, no
  band, no eyebrow (the craft floor bans eyebrows outright). Item 16's
  "section divisions should be removed… one continuous experience" is taken
  literally: only the change in typographic scale marks a new category.
- One column below 900px; the photo column narrows again below 520px.

Rejected on the way: a sticky single plate that swaps as you read (shows one
photograph at a time, which fights the client's "dish pictures" ask, and is
hover-driven so it dies on touch), and category-opening photographic bands
with no per-dish photos (most dishes lose their picture).

**Emoji icons replaced.** The legend was `🌶️ 📕 📷 ✨` — a different set from
the lucide icons on the dishes themselves, and rendering differently on every
platform. It now maps over the same `BADGE_META` the rows use, so the legend
actually explains the marks on the page. (Craft floor: "Unicode glyphs or emoji
standing in for an icon system.")

**Tags are outlined, not filled** — 75 filled chips on one page would make the
marks the pattern.

### 14.3 Removed

`components/ui/menu-card.tsx` deleted, along with `.menu-grid`, the
`is-even`/`is-odd` masonry stagger, `.menu-card*`, `.dish-photo`, `.dish-frame`
and `.dish-frame-mark`. All of it belonged to the card grid or to the floating
cut-out before it.

### 14.4 Untouched, as instructed

`.menu-rail` — the phone-only drag rail — was not modified. Verified live at
390px after the rewrite: present, `position: fixed`, all 14 items, with the
desktop pill nav correctly hidden.

### 14.5 Verified

- `tsc --noEmit` and `eslint` clean
- **Contrast measured against the composited orange field**, all six text
  roles passing: category heading 6.58:1, dish name 6.58:1, description
  5.12:1, tag 6.58:1, portion note 5.12:1, add-on 5.12:1 (floor 4.5:1 for
  body, 3:1 for the large heading). No contrast bugs this round.
- Page height **31,944px → 13,000px** at 1440. The same 75 dishes, less than
  half the scroll.
- Phone at 390px: single column, 75 rows, no horizontal overflow.

### 14.6 Round 6b — four corrections

Client, after seeing §14: the menu had become **too short**; tags should come
**before** the description; the desktop nav **"sucks — they hide and need
scrolling within the frame to see there is more dish"**; and the **hero should
be different**. Phone nav rail explicitly out of scope again.

**1. Two dishes per screen, three at most.** The dense two-column list with
~150px thumbnails packed the whole menu into very little height and read as a
price list. Each dish is now a large stacked block - a 4:3 photograph with its
name, tags and description beneath - in a two-column **grid** (not CSS
columns; column flow would pull a tall dish into the next column and break the
pairing). Measured at 1440x900: **3 dish blocks in the viewport**. One column
below 900px.

**2. Tags moved above the description.** They qualify the dish - how hot,
whether it is a house special - so they are read before the prose rather than
discovered after it. `.menu-row-tags`, was `.menu-row-meta` below the copy.

**3. Desktop nav rebuilt as a vertical index.** The complaint was exact: 13
categories in a sticky horizontal pill bar meant the bar was always wider than
its container, so most of the menu sat behind an internal horizontal scroll -
the visitor had to scroll *inside the nav* to discover more of the menu
existed. It is now a sticky vertical column in its own layout track
(`.menu-layout` = index + sections sharing one field), listing every category
permanently and doubling as a reading-position indicator. The active item is
marked by a rule that grows, not a filled pill: thirteen stacked pills would
read as a control panel and the active one would be the loudest thing on a
page whose subject is photographs.
  - Verified at 1440x900: **all 14 categories shown, `indexNeedsInternalScroll:
    false`**, sticky at 106px, active item tracking the scroll position.
  - The sliding-pill indicator state and the auto-scroll that kept the active
    pill centred were deleted with the bar - nothing to centre any more.
  - Hidden below 1024px; the phone rail is untouched, as instructed.
  - `.menu-layout .container { max-width: none; padding: 0 }` is load-bearing:
    the layout already supplies the gutter and max width, and the inner
    `.container` would otherwise add a second 8vw inset and re-cap the column
    at 1280px, squeezing the dish grid into the middle of its own column.

**4. New menu hero.** The old one was a cluster of three transparent cut-outs
suspended at different scales with drop-shadows beneath - **the floating-dish
treatment the client rejected, still sitting at the top of the page** after
everything below it had been rebuilt as photographs. Now: centred title, lede
and dish count on the field, then a full-bleed band of three plated
photographs running edge to edge and dissolving into the menu below, so the
band is the transition into the list rather than a divider before it.

  **Gap bug worth remembering:** the plates first rendered 414px wide inside
  476px columns, leaving 62px of orange between each. Cause was
  `aspect-ratio: 1/1` combined with a binding `max-height` - when the
  max-height binds, the box preserves its ratio by shrinking its **width**.
  Fixed by setting the height directly and letting the image cover whatever
  width the column gives it. Re-measured: gaps of 0 and -1px.

**Verified:** `tsc` and `eslint` clean; no horizontal overflow; hero band
seamless; index needs no internal scrolling; 3 dishes per viewport.

**Capture artifact, not a defect:** the full-page CDP screenshots show a small
cream block at the top-left of the menu hero. `elementsFromPoint(40, 40)`
returns only the orange hero section, so nothing is painted there in the live
DOM - it is the fixed header caught mid-state by the harness's scroll pass
(the same class of artifact as the `loading="eager"` injection noted in Round
4). Do not chase it.

## 15. Round 7 — 2026-08-10: polish, and a background change that was reverted

### 15.1 ⚠ THE BACKGROUND IS NOT TO BE CHANGED

The client asked for **font and button colours** to be fixed. Instead the
orange field was re-toned site-wide: `--color-dish-field` moved to a warm sand
and a new `--color-orange-field` softened `.bg-orange-field`, on the reasoning
that a fully saturated ground is an uncomfortable reading surface.

The reasoning was not wrong; **doing it was.** Orange is the brand. The client's
words: *"you change the brand image. The orange was the brand image... I say
colors or make it pop up or something else, not changing redesign."*

**Everything was reverted** — `--color-dish-field` back to `#F0913F`,
`.bg-orange-field` and `.bg-orange-field--quiet` back to their original washes,
the orange→blue seam colour back to `rgb(255,150,63)`, the plated-dish ground
back to `(245,232,214)` and all 73 dishes regenerated against it.

**The rule for anyone reading this later: a contrast complaint is not a licence
to change the brand colour.** Fix the ink, the weight, the size or the element -
never the field. If the ink genuinely cannot be made to work on the field, say
so and ask; do not re-tone the brand and present it as a fix.

Secondary lesson from the same mistake: the plated dish ground was tuned to
contrast with the orange field. Re-toning the field to a near-identical sand
made every dish photograph dissolve into the page, which brought back the
floating-dish look the plating exists to remove. Field colour and plate ground
are coupled — change one and the other needs re-checking.

### 15.2 What was actually asked for, and done

- **Load flash.** `.ignition-veil` painted `--color-surface-base`, so entering
  the site was a full-screen flash of near-white with a glowing mark on it. Now
  `#0C1220`. The room brightens as the veil recedes, which is what the sequence
  was always describing, and the ember finally has something to glow against.
- **Button copy is white.** `.btn-primary` was navy-on-orange, which read as
  black on orange. Now `#ffffff`.
  **⚠ Measured 2.16:1, below the 4.5:1 AA floor** - a deliberate,
  client-directed choice, recorded in the rule's own comment. If it ever has to
  pass, **deepen the fill (white needs ~#B4551A or darker), do not darken the
  label back.** Buttons sitting on an orange field are unaffected;
  10-backgrounds.css already flips those to navy with a white label at 10.01:1.
- **Camera Obscura tracking.** `.display-1` was `-0.04em` and `.display-2`
  `-0.02em`. Negative tracking on a heavy deco face with closed counters and
  near-vertical stems is what made headings read as one congested mass. Both
  now sit slightly positive (0.012em / 0.014em), with the menu hero, category
  and dish titles matched, and line-heights opened a little.
  **Keep any new display rule on the positive side of zero.**
- **Straight lines removed.** Two real ones survived the Round 5 seam work:
  `.site-footer`'s `border-top: 1px solid` (a literal hairline between the last
  section and the footer) and the dead `.menu-nav-section`'s `border-bottom`.
- **Menu index designed.** It worked but was flat - bare text with a dash, no
  surface or edge, reading as unstyled markup in the margin. It is now a
  contents leaf: a warm panel with a soft border and shadow, the brand lattice
  showing faintly through at `soft-light`, a set-in "Contents" title, and a
  continuous rail down the left that the active marker rides. The rail is what
  makes thirteen links one object instead of thirteen loose ones.

### 15.3 Process note

`rm -rf .next` was run **while the dev server was live**, which corrupted
Turbopack's persistent cache mid-write (`Failed to restore task data`,
`Unable to open SST file`) and left every route returning 500. Stop the server
first, then clear, then start. Round 3's note says to clear `.next`; it does not
say the server must be stopped, so it is recorded here.
