# MAP — Khao San client copy

Orientation index. Read this first; it points at the file that owns each
concern so a round does not re-derive the whole project. It does **not**
replace `PRD.md` (the decision log) — it is the table of contents for it.

Last synced: 2026-08-21, end of Round 9.

---

## 1. What this is

Marketing site for **Khao San**, a Thai restaurant brand in Dhaka with three
outlets (Gulshan 1, Dhanmondi, Uttara), plus a small internal admin panel for
menu content. Tagline: "Re-inventing The Thai Way." 5% VAT inclusive, 5%
service charge, 100% halal.

`../khao-san-app` is a separate portfolio build — **read-only reference, never
edit, never port changes into it.** This folder is the client working copy.

Dev: `npm run dev -- -p 3200` (3000 belongs to the portfolio copy).

## 2. Docs — who owns what

| File | Role | Trust |
|---|---|---|
| `MAP.md` | this index | current |
| `PRD.md` | decision log, Rounds 1–9 + client feedback verbatim | **source of truth** |
| `PRODUCTION_AUDIT.md` (645 ln) | launch-readiness scoring, 6 axes | current |
| `DESIGN_AUDIT.md` (224 ln) | 115 numbered issues by priority | partly reconciled — see its own "Reconciliation note" |
| `README.md` | run/deploy + the two classic traps | current |
| `COZY_DARK_PLAN.md` | **STALE** — the abandoned dark "midnight navy" direction | ignore; superseded by PRD §3 |
| `temp.txt` | stray 21st.dev HeroUI paste, unrelated to this project | delete |
| `_masters/Brand_Asset` | scanned printed menus + social posts | reference |
| `graphify-out/` | generated knowledge graph of the repo | regenerate, don't edit |

PRD section index:
§1 overview · §2 brand identity · §3 design system (current) · §4 client
feedback verbatim · §5–6 scope/backlog · §7 change log · §8 R2 · §9 R3 ·
§10 R4 visual audit · §11 brush-stroke rules · §12 deferred · §13 R5 (17
client items) · §14 R6 menu redesign, §14.6 R6b four corrections · §15 R7
including §15.1 the reverted background · **§16 R8 — the current design;
§16.1 supersedes §15.1's colour assumption, read both together** · **§17 R9 —
the screenshot tooling and what looking at the page found.**

## 3. Stack

Next.js 16.2.10 App Router · React 19.2 · TypeScript · Supabase (Postgres +
Storage) · lucide-react. Tailwind v4 is installed and `@import`ed, but the
design system is **hand-written CSS custom properties**, not utilities.
No animation library — IntersectionObserver in `components/ClientWrapper.tsx`.
Fonts: Camera Obscura (display, **demo build — must be licensed before
launch**), Montserrat (body/UI/numerals), Good Brush (script accent).

## 4. Routes

```
/                 homepage — 7 chapters, anchor-linked   app/page.tsx (583 ln)
/menu             Supabase-backed, ISR 1h + on-demand    app/menu/page.tsx + components/menu-page-client.tsx
/legal/privacy    static
/legal/terms      static
/admin/login → /admin → /admin/menu   menu CRUD only
/api/admin/menu   CRUD (service role)
/api/admin/upload dish photo — PNG signature-checked
/api/auth/{login,logout}
robots.ts · sitemap.ts   ← SITE const must point at the real domain before launch
```

PRD §1 lists `/about`, `/locations`, `/giftcards` as routes. **They are not
separate routes** — they are homepage chapters (`#heritage`, `#locations`,
`#gift`). PRD §1 is stale on this point.

Homepage chapters, in order:
I Threshold (hero, video) · II The Flame (`.bg-blue-field`, split editorial) ·
III+IV Heritage + Feature Dishes (**one** `.bg-orange-field` section — white
since R8, name notwithstanding; no divider between them) · V The Havens
(locations, `.bg-blue-field`, parallax room photos) · VI The Gift
(`.gift-field`, lotus ground, WhatsApp CTA) · VII The Invitation
(`.display-brush`).

Section rhythm after R8: video → blue → white → blue → white → dark video.
Only genuine colour shifts remain, and each is a clean edge with no seam
treatment at all.

## 5. Stylesheet — 13 files, and the order is load-bearing

`app/globals.css` imports `app/styles/01..13` **in original source order**.
Re-ordering changes the rendered site: the field ink scales in `10-backgrounds`
deliberately override the button colours in `03-buttons`, and the responsive
blocks at the end override everything above. Add rules to the file that owns
the concern; put an override in a *later* file rather than reaching for
`!important`.

| File | Ln | Owns |
|---|---|---|
| 01-tokens | 143 | all custom properties, fonts, radii, spacing, `--header-h` |
| 02-base | 80 | resets, type scale |
| 03-buttons | 99 | `.btn`, `.btn-primary/secondary`; hover = **deepen, never brighten** |
| 04-hero | 36 | homepage hero |
| 05-motion | 257 | reveal/scroll animation, reduced-motion |
| 06-page-hero | 136 | subpage hero |
| 07-forms | 60 | inputs (admin) |
| 08-menu | ~525 | menu page — rows, 3-col grid, right rail, phone rail |
| 09-home-sections | ~880 | homepage chapters, dish carousel, feature split |
| 10-backgrounds | ~415 | the fields — **they redeclare their own ink tokens**. Seams all removed in R8 |
| 11-layout | 212 | container, grid |
| 12-footer | 195 | `.site-footer` (also redeclares ink) |
| 13-havens | 342 | locations cards |

## 6. Components

```
components/
  Header.tsx (330)            fixed nav; hidden over .hero and .menu-hero, fades in past them
  Footer.tsx (76)
  ClientWrapper.tsx (80)      IntersectionObserver scroll reveals
  menu-page-client.tsx        menu interactivity, right-edge rail, phone rail
  ui/
    dish-carousel.tsx         centred carousel, peeking neighbours (menu hero)
    feature-dish.tsx          ruled split rows (homepage dish chapter)
    room-gallery.tsx          sideways strip: 1 wide + 2 stacked, zero JS
    scroll-parallax.tsx       image drifts against scroll inside a clipped frame
    background-video.tsx      reduced-motion aware
    brush-transition.tsx      seam mark between chapters
    ignition-veil.tsx         load veil (#0C1220)
    menu-row.tsx              one dish: photo + category + name (R8: nothing else)
    page-hero.tsx
lib/supabase/  env.ts (requireEnv) · server.ts · admin.ts · public.ts
scripts/  plate-dishes.py · setup-db.mjs · check-contrast.mjs · shoot.sh · shoot.mjs
```

## 7. Brand identity — exact, never approximate

| Role | Hex |
|---|---|
| Brand Blue (logo) | `#1e417b` |
| Brand Orange | `#ff964f` |
| Butter | `#f9eb9b` |
| Powder Blue | `#cadbe9` |
| White | `#ffffff` |
| Near-black | `#161616` |
| Ink on orange | `#16233d`, secondary `#26364f` |
| Cool slate (secondary ink on white) | `#55606E` |

Measured contrast: blue/white 10.0 · black/white 18.1 · slate/white 6.0 ·
blue/orange 4.64 · powder/blue 7.07 · **white/orange 2.16 — FAILS.**

**Round 8 hierarchy — supersedes the Round 1 "orange dominant" direction:**

| Role | Colour | Where |
|---|---|---|
| Surface | `#ffffff` | every reading surface |
| Structure | `#1e417b` | blue fields, ink accents, rules, marks, ornament |
| Action | `#ff964f` | the primary button, the menu rail's active mark |

No brand hex changed to get here — only where each is allowed to appear.
Orange is never a background and never a texture. `--color-dish-field`
(`#F0913F`) is gone with the orange field. See PRD §16.1.

## 8. The rules that have already cost a round each

1. **Never re-tone a brand hex to fix contrast.** Change the ink, weight,
   size or element. If ink truly cannot work on a field, say so and ask.
   (PRD §15.1 — done once, fully reverted: "you change the brand image.")
   R8 did not break this: it changed *where* orange appears, on the client's
   explicit instruction, and left every hex untouched. See PRD §16.1.
2. **Field colour and plate ground are coupled.** The plated dishes are baked
   against a ground tuned to contrast with the page surface — cool stone
   `(222,224,228)` on white since R8. Move one and every dish photo either
   dissolves into the page or floats. Re-run `scripts/plate-dishes.py`, and
   keep its `W, H` matching `.menu-row-photo`'s aspect or `cover` crops the
   food.
3. **The colour fields own their ink.** `.bg-orange-field`, `.bg-blue-field`,
   `.gift-field` and `.site-footer` each redeclare `--color-text-primary`.
   Write `color: var(--color-text-primary)` and the right value arrives. Never
   hardcode white on orange.
4. **The logo needs `unoptimized`.** Navy mark on alpha, knocked out with
   `filter: brightness(0) invert(1)`. The optimiser strips alpha and the mark
   goes invisible. If a logo "disappears", check this first.
5. **No black shadows anywhere.** All shadows are blue-tinted since R8
   (terracotta went with the warm palette). `--shadow-float`, `.media-soft`,
   the dish contact shadow.
6. **Display tracking stays positive.** Camera Obscura congests at negative
   tracking (`.display-1` 0.012em, `.display-2` 0.014em).
7. **Buttons deepen on hover, never brighten.** `.btn-primary`'s label is
   `#ffffff` on orange = 2.16:1, a **deliberate client-directed** AA failure.
   If it must pass, deepen the fill (~`#B4551A`); do not darken the label.
8. **No floating cut-out dishes.** The transparent-PNG treatment is rejected.
   The menu uses baked, opaque plates from `public/assets/menu-plated/` (73
   files). `platedSrc()` in `app/menu/page.tsx` rewrites the Supabase path; the
   database still stores the original.
9. **No cards as page structure**, no emoji standing in for icons. No
   eyebrows — with one sanctioned exception, the menu row's category caption
   (PRD §16.3).
9b. **No seams between sections.** No gradient band, inset shadow, divider
   rule or `.section-seam` mark. Four attempts, four rejections (PRD §16.2).
10. **Do not touch the phone nav rail** (`.menu-rail`) — client has said so
    three times now.
11. **Reservations are removed site-wide.** Every former Reserve CTA is
    WhatsApp: `https://wa.me/8801600068193?text=...`.
12. **Stop the dev server before `rm -rf .next`** — clearing it live corrupts
    the Turbopack cache and every route returns 500. A stale cache will also
    keep serving a broken build after the source is fixed, so clear it before
    concluding a CSS error is real.
13. **Prefer measuring position over IntersectionObserver** for scroll
    indicators. An observer reports transitions it witnesses; a jump (anchor
    click, deep link, restored scroll) skips the trigger and leaves the state
    stale. Two live bugs of exactly this shape were fixed in R8 (§16.7).

## 9. Open / outstanding

- **Dish photography is placeholder.** The plates under
  `public/assets/menu-plated/` are cut-outs composited onto a stone ground by
  `scripts/plate-dishes.py`. The client is supplying real photographs; when
  they land, both the script and `platedSrc()` in `app/menu/page.tsx` may stop
  being needed.
- **`BrushTransition` was kept** — the saffron brush sweep at the hero seam. It
  is brand identity (PRD §11), but it is also the last boundary signal on a
  page that just had every other one removed. Flagged to the client, not
  removed unilaterally.
- **Camera Obscura licence** — the shipped `.otf` is the demo/personal-use
  build and is the primary display face on every page. Replace it, then drop
  the digit-excluding `unicode-range` in `app/layout.tsx`.
- **Deploy env vars** — all five must be set on the host for Production,
  Preview *and* Development or `/menu` fails to prerender (see `.env.example`).
- **`SITE`** in `robots.ts` / `sitemap.ts` → the real domain.
- **Security scored 6.5/10** and left there by instruction (`PRODUCTION_AUDIT.md` §3).
- **Dish cards (PRD §6) is now moot** — R8 settled the dish presentation as a
  photograph, a category and a name, with no container at all.
- `package.json` `"name"` still says `khao-san-app`.

## 10. How a round is verified

```bash
npx tsc --noEmit && npx eslint
npm run check:contrast
bash scripts/shoot.sh          # then LOOK at scratch-shots/
```

**Look at the screenshots. Measurements are not a design review** — Round 8
passed every check and shipped copy floating in dead space, a grey box behind
every dish and a category label repeated 75 times. `scripts/shoot.sh` records
the working capture recipe and every dead end (PRD §17.1); the short version is
that Chrome's CLI works, CDP `Page.captureScreenshot` does not, and `.next`
must be cleared after re-plating or the image optimiser serves stale dishes.

Then measure in-browser at **1440x900** and **390px**: no horizontal overflow,
three dishes across (one column below 900px), the right-edge rail showing only
the active category's name, and the phone rail hidden over the menu hero and
present past it.

⚠ In the in-app browser pane, `window.scrollTo()` does not reliably emit
`scroll` events and `behavior: 'smooth'` is a no-op — scroll-driven state can
look stuck when it is not. Dispatch a synthetic `scroll` event to confirm
before chasing it. The HMR websocket also fails there, so CSS and component
edits need a full reload. (PRD §16.9.)
