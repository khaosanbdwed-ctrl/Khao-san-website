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
