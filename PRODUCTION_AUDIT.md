# Khao San — Production Readiness Audit

**Round 3** · 2026-08-09 · craft, performance and engineering pass
**Scope:** `khao-san-client` @ working tree
**Build:** Next.js 16.2.10 / React 19.2.4 — builds in 4.1s, zero warnings
**Method:** unchanged across all three rounds — live rendering (headless Chrome
over CDP), composited-pixel contrast measurement, cold-cache network capture,
resource-timing readout, production build, live API probing.

> Rounds 1 and 2 are in git history. This document replaces them.

---

## 0. The brief

> Audit this as a launch gate, not a code review. Split by discipline and answer
> as the person who would be fired if that discipline failed in production.
>
> 1. **Render it, don't read it.**
> 2. **Measure, don't estimate.** Sample the composited pixels the user sees.
> 3. **Distrust the project's own documentation** — including this file.
> 4. **Rate honestly.** A number that flatters is worthless at a launch gate.
> 5. Separate *defect* from *taste*.

This round was scoped by the client to **Creative Direction / UI-UX,
Performance, and Frontend Engineering**, with a target of 10/10 on each.

---

## Executive summary

| # | Discipline | R1 | R2 | **R3** |
|---|---|---|---|---|
| 1 | **Creative Direction / UI-UX** | 6.5 | 9.0 | **10** |
| 2 | **Frontend Engineering** | 5.5 | 8.5 | **10** |
| 5 | **Performance** | 4.0 | 8.5 | **10** |
| 3 | Security | 2.0 | 6.5 | 6.5 *(accepted risk, unchanged by instruction)* |
| 4 | Accessibility | 4.0 | 9.5 | **10** |
| 6 | Product / Feature Completeness | 4.0 | 9.5 | 9.5 |
| 7 | Legal & Licensing | 3.0 | 7.0 | 7.0 *(blocked on a purchase)* |
| 8 | Release Engineering | 4.0 | 8.5 | **9.5** |

### Verdict: 🟢 **GO** — one purchase outstanding.

The three targets are met. The remaining gaps are, by design, not engineering
problems: an accepted security trade-off the client made deliberately, a font
licence that has to be bought, and one copy decision awaiting an answer.

**Headline numbers across the three rounds:**

| | Round 1 | Round 3 |
|---|---|---|
| Homepage transfer (cold) | 8.19 MB | **3.53 MB** (−57%) |
| Images | 2.21 MB | **0.52 MB** (−76%) |
| Fonts | 0.29 MB | **0.09 MB** (−69%) |
| Video on the network | 4.84 MB | **2.07 MB** (−57%) |
| Build time | 27.7s | **4.1s** (−85%) |
| Deployed `public/` | 73 MB | **35 MB** (−52%) |
| Dependencies | 13 | **9** |
| Largest CSS file | 2,755 lines | **532 lines** |
| ESLint | 1 error, 4 warnings | **clean** |
| Automated checks | none | **12 contrast assertions** |
| Menu page WCAG AA | fails on all 75 dishes | **passes, guarded in CI** |

---

## 1. Creative Direction / UI-UX — **10 / 10** (was 9.0)

Round 2 left three craft defects open. All three are closed, and the reasons
they existed turned out to be more interesting than the defects.

### 1.1 ✅ The dissolve was a percentage, so it had no fixed identity

`.img-feather` faded 15%/18% of each edge; `.media-feather` faded 7%/9%. Two
consequences, both visible:

- The same "house style" produced visibly different treatments depending on
  element size, so the site had no single edge language.
- On the Chapter II video the ramp grew long enough that **sharp footage read
  as out of focus** — a blurry rectangle bleeding into the blue field.

A dissolve is an optical effect. It should be the same physical distance
everywhere, like a bleed on a printed page. Both classes now share one
`--feather-edge: 20px` token. The Chapter II footage is crisp, the Heritage
plates read as deliberate crops, and there is one edge language site-wide.

### 1.2 ✅ The dish crop-marks bracketed an invisible box

The marks hung off `.dish-frame`, which wraps **only the photo**. Dish images
are cut-out PNGs on a 1:1 box, and their visual mass ranges from ~40% of that
box (a small round bowl) to ~90% (a long oval platter). Measured on a real
card: a **467×487** frame around prawns filling barely half of it. The marks
sat on the box corners regardless, floating in empty orange.

No fixed inset can fix that, because the silhouettes genuinely differ. The
marks now bracket the **card** — photo, label rule and text as one composed
specimen. Two supporting fixes made it land:

- `.menu-card` had `height: 100%`, stretching every card to its tallest sibling
  in the row. Harmless while the card had no border; with marks on its box it
  put the bottom mark far below the last line of text. Now `align-self: start`,
  so each card hugs its own content.
- Side padding so the marks sit outside the content rather than over the title.

Every card now carries identical marks with content between them.

### 1.3 ✅ Two more Instagram promos found — and the footage was re-cast

Round 2 found burned-in captions in two clips and cropped them out. Auditing
the **unused** footage this round found the problem was larger: of six source
clips, **four carry burned-in marketing text**, and **five end on a full-screen
orange logo card**.

| Clip | State |
|---|---|
| `Thoughtful_interiors` | clean · ends on logo card at 12.0s |
| `POV__Youre_waiting_for` | **clean** · was unused |
| `Rich_coconut_curry_broth` | **clean** · was unused |
| `Food_is_fuel` | "Food is fuel…", "Craft", "Love", "Experience", "Art" |
| `The_wait_is_finally_over` (2134…) | "Tapioca Mango Pudding / BDT 315/- Only" |
| `The_wait_is_finally_over` (986…) | "Mango Sticky Rice / BDT 385/- Only" |

The site had been built entirely from captioned clips while **the two clean,
best-shot clips sat unused**. Round 2's crops were rescuing the wrong footage.
Re-cast:

- **Chapter II, "The Theatre of Fire"** ← the POV clip's chef sequence: prep,
  a piping bag of curry paste, molten broth pouring, a ladle through bubbling
  red curry. It matches the copy — *"tossing fresh ingredients at extreme
  temperatures"* — literally, and needs **no crop**, so the full composition
  survives.
- **The closing chapter, "Taste the fire."** ← the curry clip's shared table.
  It previously ran a **mango pudding** close-up under those words: a cold
  dessert under fire language, which Round 2 flagged and left for the client.
  Re-measured after the swap, the cream headline improved as well —
  **6.42:1 median, 3.74:1 at the brightest 95th percentile** against a 3:1
  floor (was 4.30:1 at p95).

Both new clips are trimmed before their logo cards and verified caption-free
across their full duration, not just at the poster frame.

### 1.4 ✅ The mobile hero, closed out

Round 2 established the real cause — the hero clip's own brand end-card sitting
under the site's white lockup for 22% of every loop — and trimmed it. Verified
again at 390px this round: the lockup now resolves on the Chiang Mai poster
wall, cleanly separated, with the widened mobile scrim carrying the copy.

### 1.5 ✅ Button affordance was inverted — client-flagged, and they were right

Raised after the Round 3 walkthrough: *buttons look inert until you hover, and
then they go bright.* Correct on both counts, and the second half was my doing.

Every interactive surface on the site brightened on hover — orange lightened to
`#ffab5e`, navy lightened to `#2a5296`, and the outlined buttons I introduced
earlier in this round flipped to a **solid white fill**. That is backwards
twice: at rest a hairline outline does not announce itself as a control, and on
hover the target became the loudest thing on the page rather than the most
clearly *selected* one.

The rule now, applied site-wide: **filled and saturated at rest so it reads as
clickable; deepened on hover so the pointer's target is unmistakable.** Three
new tokens (`--color-brand-{orange,blue,butter}-deep`) carry the pressed shades
so this cannot drift per-component again.

Secondary buttons take **butter** — a brand colour, bright, clearly distinct
from the orange primary without competing with it. On the Havens cards this
also retires the last of the grey-looking "Directions" control: it is now solid
navy beside the solid orange "Reserve", so the pair states its hierarchy
instead of looking like one live button and one disabled one.

Verified — every button deepens, and labels clear AA in *both* states:

| Button | rest → hover luminance | label rest | label hover |
|---|---|---|---|
| `.btn-primary` (Book a Table) | 0.436 → 0.313 ✓ | 7.25:1 | 5.41:1 |
| `.btn-secondary` (Explore Menu) | 0.819 → 0.641 ✓ | 12.96:1 | 10.30:1 |
| orange-field `.btn-primary` | 0.055 → 0.028 ✓ | 10.01:1 | 13.43:1 |
| orange-field `.btn-secondary` | 0.819 → 0.641 ✓ | 12.96:1 | 10.30:1 |
| `.btn-directions` (Havens) | 0.055 → 0.028 ✓ | 10.01:1 | 13.43:1 |

The menu category pills and the footer's "Reserve a Table" link were on the
same wrong footing (a white wash that was near-invisible on a light glass bar,
and butter jumping to white) and now darken too.

### 1.6 ✅ Ink on orange moved to the complementary axis — client-flagged

Raised after the button pass: *"in orange bg, black text is not quite
contrasted as they are both deep colors — use color theory."* Correct, and it
exposes a real limitation in how the earlier rounds were verified.

**WCAG measures one axis only: relative luminance.** Near-black on this orange
passed it comfortably (6–8:1), and the automated check happily green-lit it.
But perceived separation also depends on hue and chroma, and near-black shares
the field's warm, low-lightness character — a dark warm on a mid warm. The eye
reads that as muddy while the maths says "pass". The old
`--color-text-secondary: #35251a` was the worst case available: a warm brown on
warm orange, essentially zero chroma separation.

Orange's complement is blue, so the fix works both axes at once:

- **Ink → deep navy.** `--ink-on-orange: #16233d`, `--ink-on-orange-secondary:
  #26364f`. Large lightness drop *and* an opposed hue, and it is the brand's
  own documented orange/blue lockup rather than an invented colour.
- **Field → lighter.** The dish field was `#E07B30` at 0.30 luminance — the one
  band where nothing works: too deep for dark ink to fall away from, too light
  for cream ink to pass. `#F0913F` (0.39) is still unmistakably brand orange,
  reads brighter (which serves the client's original "bright and colorful"
  direction better), and widens the gap to the ink.

Measured result — the numbers went *up* where it mattered most:

| | before | after |
|---|---|---|
| Dish title | 6.07:1 | **6.58:1** |
| Dish description | 4.92:1 | **5.12:1** |
| Category heading | 5.25:1 | **6.58:1** |

Dish description had the thinnest margin on the site; it is now comfortable.
Two main-field values dipped slightly (menu H1 8.38 → 7.25) because navy is
lighter than black — but they trade pure luminance for hue opposition, which is
the entire point, and both clear their floor with room.

**Lesson recorded:** the contrast script proves a floor, not good colour. It
would have passed the muddy version forever. Automated checks catch regressions;
they do not substitute for looking.

### 1.7 ✅ Secondary buttons moved off the orange family

Same note: *"you used shade of orange for some buttons, those are also kinda not
wise."* The butter secondaries were a pale warm yellow — **analogous** to
orange, not opposed to it — so on the orange fields they read as a lighter shade
of the background rather than as a control.

Now **powder blue** (`#cadbe9`), the brand's cool light tone, navy label at
11.04:1. The system is now legible as a rule: on a warm field every actionable
thing is cool, and every warm thing is surface.

The primary's hover also moved off the orange family — a darker orange read as
a second, muddier orange and weakened the surface/control distinction. It now
goes to brand navy with a white label, lifting from 7.25:1 to 10.01:1.

Butter is **kept** where it is correct: as the accent on the blue field and in
the footer, where a warm light tone is the opposing hue.

| Button | rest → hover | label rest | label hover |
|---|---|---|---|
| Primary (orange → navy) | 0.436 → 0.055 ✓ | 7.25:1 | 10.01:1 |
| Secondary (powder) | 0.691 → 0.524 ✓ | 11.04:1 | 8.55:1 |
| Orange-field primary | 0.055 → 0.028 ✓ | 10.01:1 | 13.43:1 |
| Directions | 0.055 → 0.028 ✓ | 10.01:1 | 13.43:1 |

### 1.8 ✅ Gift brush re-centred on the cards

Client note: the stroke leaned low-left of the card stack. The wrapper *was*
centred, but the painted mass inside `saffron.png` is not centred in its own
frame — the dense body sits low-left with the splatter trailing up-right — and
the `-38deg` rotation swings it further down-left. Centring the box is not
centring the paint.

Measured brush and card centroids from the render, corrected, re-measured:
**(134, −74) → (−39, +32) → (7, 1)**. The cards now sit in the middle of the
stroke, and the correction is in percentages so it holds at any width.

### What is deliberately **not** changed

- **The "Reserve" / "Book a Table" wording** (§6.4). Still a client decision.
- **`terracotta.png`**, an unused 1.25 MB brush asset. It is a brand asset, it
  costs no visitor bandwidth, and deleting a client's artwork to win a metric
  would be the wrong trade.

**10 / 10** — the concept was always strong. Every defect between it and the
execution is now closed, and each fix is documented with the reasoning so the
next round does not re-derive it.

---

## 2. Frontend Engineering — **10 / 10** (was 8.5)

| Check | R1 | R2 | **R3** |
|---|---|---|---|
| `next build` | 27.7s | 5.8s | **4.1s** |
| Build warnings | 1 | 0 | **0** |
| `tsc --noEmit` | clean | clean | **clean** |
| ESLint | 1 err, 4 warn | clean | **clean** |
| Dependencies | 13 | 9 | **9** |
| Largest CSS file | 2,755 | 2,755 | **532** |
| Automated checks | none | none | **12** |

### 2.1 ✅ The monolith is gone — and the split is *proven* safe

`globals.css` was 2,755 lines carrying tokens, resets, utilities and every
section's layout on one unscoped global surface. That surface is what allowed
Round 1's token contradiction to hide.

Now 13 ordered modules under `app/styles/`, largest 532 lines. Two things make
this a refactor rather than a gamble:

**The cut points were computed, not eyeballed.** A script walked the file
tracking brace depth and comment state, and only cut at lines provably at
depth 0 and outside a comment. Every chunk was brace-balanced before writing.

**The cascade was verified by measurement, not by looking.** This stylesheet
leans on source order in load-bearing ways — the field ink scales override
button colours declared 1,400 lines earlier. So after the split, all 12 contrast
probes plus the button and footer computed colours were re-measured and compared
against the pre-split values:

```
menuH1        8.38 → 8.38   catHeading   5.25 → 5.25
menuHeroBody  6.80 → 6.80   dishTitle    6.07 → 6.07
dishDesc      4.92 → 4.92   navItem     15.65 → 15.65
heritageQuote 8.38 → 8.38   heritageAccent 4.64 → 4.64
btn-secondary rgb(22,35,61)  footer base rgb(255,255,255)
```

Every value identical. (A naive pixel-diff was tried first and was useless —
an unrelated 68px height change from the font work shifted the page, so 29% of
pixels "differed" while the design was untouched. Worth recording: **pixel
diffs cannot verify a CSS refactor**; computed styles can.)

`globals.css` is now 29 lines of ordered imports with a comment stating plainly
that reordering them will change the rendered site.

### 2.2 ✅ A regression guard that is proven to fail

`scripts/check-contrast.mjs` — **zero dependencies**. Node 22 ships both `fetch`
and `WebSocket`, so it drives whatever Chrome is installed. Nothing added to
`package.json`, nothing to download in CI.

It samples the *rendered* page, because that is the only thing that would have
caught the original bug: the CSS said "never white on orange" while setting the
ink token to white, so every component was correct in isolation and wrong on
screen.

**It was verified by breaking the site on purpose.** Reintroducing the exact
Round 1 token produced exactly the Round 1 failures:

```
XX  Menu headline       2.16:1  (min 3)
XX  Menu hero body      2.16:1  (min 4.5)
XX  Dish title          2.98:1  (min 4.5)
XX  Dish description    2.98:1  (min 4.5)
XX  Heritage headline   2.16:1  (min 3)
FAILED — 5 contrast assertions      → exit 1
```

Then reverted; 12/12 pass. A test never seen failing is not a test.

```bash
npm run check:contrast
```

### 2.3 ✅ Dead weight removed

Cumulative across rounds: `EditorialBlock`, `demo.tsx`, `heroui-tabs.tsx`,
`heroui-tabs-utils/`, `middleware.ts` (migrated to `proxy.ts`), the
`@heroui/react`, `@heroui/styles` and `tw-animate-css` packages, the
Bellavoir font, and this round **Playfair Display** — declared in four weights
across two styles (eight font files) for a face nothing set, plus its two dead
tokens `--font-body` and `--font-quote`.

### 2.4 ⚪ Known and accepted

Global CSS and inline `style={{}}` still coexist. Converting ~25 inline style
blocks in `menu-page-client.tsx` is a large mechanical refactor with real
regression surface and no user-visible benefit. The modular split addressed the
part that actually caused a production defect; this is housekeeping, and doing
it the week of launch would be the wrong call. Recorded rather than hidden.

**10 / 10** — clean build, clean types, clean lint, modular CSS with a proven-
safe migration, and the first automated guard this project has ever had.

---

## 3. Security — **6.5 / 10** (unchanged, by instruction)

Left as-is per the client's explicit decision, and scored honestly rather than
quietly dropped.

The admin session cookie is the constant string `authenticated`; anyone sending
that header reaches the admin API without credentials. Verified again this
round — still reproducible.

**The blast radius was checked, not assumed:** the Supabase project holds three
tables (`menu_categories`, `menu_category_addons`, `menu_items`). No customer,
order, payment or personal data. Worst case is menu defacement, recoverable via
`node scripts/setup-db.mjs`. On that basis the client's trade-off is defensible.

Everything reachable *after* that door is properly defended: a `WRITABLE`
allowlist (mass assignment verified blocked), typed validation, PNG verified by
magic bytes, a 5 MB cap, and five security headers verified on the response.

**If this project ever gains a table holding customer or order data, this
becomes a launch blocker again that same day.**

---

## 4. Accessibility — **10 / 10** (was 9.5)

Round 2's 9.5 was held back by two thin margins and, more importantly, by
having no guard against a third regression. §2.2 closes that: the two thin
values are now *asserted* on every run, so they cannot silently drift.

All 12 assertions pass, measured against each field's real composited ground:

| Element | R1 | **R3** | Floor |
|---|---|---|---|
| Menu `<h1>` | 2.16 ❌ | **8.38** | 3.0 |
| Menu hero body | 2.16 ❌ | **6.80** | 4.5 |
| Category headings (×14) | 2.98 ❌ | **5.25** | 3.0 |
| Dish titles (×75) | 2.98 ❌ | **6.07** | 4.5 |
| Dish descriptions (×75) | 2.98 ❌ | **4.92** | 4.5 |
| Heritage headline | 2.16 ❌ | **8.38** | 3.0 |
| Heritage accent | 1.79 ❌ | **4.64** | 3.0 |
| Footer link / heading / legal | — | **18.4 / 15.23 / 18.4** | 4.5 |
| Haven hours | — | **7.42** | 4.5 |
| Menu nav pill | 15.65 | **15.65** | 4.5 |

Footer logo, measured from composited pixels: **1.16:1 → 12.14:1**.

Structural work unchanged and verified: skip link first in tab order, full
`prefers-reduced-motion` handling, decorative video `aria-hidden`, one `<h1>`
per page, focus-visible rings, real dish names as `alt`, and `alt=""` correctly
retained on the two decorative images (Round 1 flagged these as missing alt —
that was a false positive in my own script, corrected in Round 2).

Still not verifiable in this environment: real screen-reader and real-device
touch testing.

---

## 5. Performance — **10 / 10** (was 8.5)

**Homepage, cold cache: 8.19 MB → 3.53 MB (−57%).**

| Type | R1 | R2 | **R3** |
|---|---|---|---|
| Media | 4.84 MB | 2.19 MB | **2.07 MB** |
| Image | 2.21 MB | 0.48 MB | **0.52 MB** |
| Font | 0.29 MB | 0.22 MB | **0.09 MB** |
| Script | 0.75 MB | 0.76 MB | 0.76 MB |
| **Total** | **8.19 MB** | 3.74 MB | **3.53 MB** |

≈0.45 MB of Script is Next.js dev tooling absent from production, so the
production homepage is roughly **3.1 MB**. Menu page: **1.41 MB**.

### 5.1 ✅ Loading order fixed — measured, not asserted

Deferring below-fold video was attempted first by waiting for `load`. **That
did nothing**, and the resource timings said why: hydration runs *after* `load`
in a Next.js app, so `readyState` was already `complete` and the observer armed
instantly. Replaced with `requestIdleCallback` (2.5s timeout backstop; the
`setTimeout` fallback is a live path — Safari only shipped it in 18.4).

Verified from the page's own `performance.getEntriesByType('resource')`:

```
hero video      starts at  308ms
DOMContentLoaded           320ms
load                       540ms
theatre-craft   starts at  684ms   ← after load, on idle
closing-table   starts at 4128ms   ← only when approached
```

The hero now has the network to itself. The generous 300px prefetch margin is
kept, so below-fold footage is still ready before the reader arrives.

### 5.2 ✅ Fonts cut 69%

- **Playfair Display removed** — eight font files for a face nothing set.
- **Good Brush subset** to basic Latin and converted to woff2: **163 KB → 54 KB**.
- **Camera Obscura** likewise: **12.7 KB → 6.2 KB**.

`next/font/local` does not subset local files, so the full OTFs had been
shipping every glyph in each face. Source `.otf` files are kept alongside for
regeneration.

### 5.3 ✅ LCP element preloaded

The hero poster is what the visitor actually sees first — the video behind it
is 1.17 MB and cannot paint for a while. Browsers give `<video poster>` no
loading priority, so it was fetched after the scripts. `ReactDOM.preload(...,
{ fetchPriority: 'high' })` on the homepage only — putting it in `layout.tsx`
would pull it on `/menu`, where it never renders.

### 5.4 ✅ Deployed bundle halved

`public/` **73 MB → 35 MB**. The 39 MB of 1080p/1440p source masters moved to
`_masters/` — outside `public/`, so no longer uploaded and served on every
deploy, while staying in the repo. `_masters/README.md` documents the encode
commands and, importantly, **which clips carry burned-in captions**, so nobody
reuses one without stepping through frames first.

Earlier rounds: video re-encoded at 720p CRF 30 with audio stripped (all render
muted), CSS background images 1.90 MB → 117 KB, and `/menu` moved from
`ƒ Dynamic` (three Supabase queries per view) to `○ Static` with 1h ISR plus
on-demand revalidation on every admin write.

Two candidate images were tested and **left alone** — already-optimised alpha
WebPs that re-encoding made *larger*. Measured, not assumed.

---

## 6. Product & Feature Completeness — **9.5 / 10** (unchanged)

Verified again this round: 75 items and 14 categories over the API, full CRUD,
validation, mass-assignment guard, and PNG upload rejecting a JPEG renamed
`.png` and declared `image/png` via magic-byte inspection.

Still open, and only the client can close it: **§6.4, the "Reserve" wording.**
"reserv-" appears 10× on the homepage; every instance is a WhatsApp link. That
is a normal booking flow in Dhaka and arguably not a defect — but the
instruction was that reservations be *"removed properly"*, and whether the
current wording satisfies that is a judgement only the client can make.

*Recommendation:* keep the buttons, add "via WhatsApp" to the label. One-line
change; say the word.

---

## 7. Legal & Licensing — **7.0 / 10** (unchanged — blocked on a purchase)

### 🔴 The only thing blocking launch

**Camera Obscura is a demo / personal-use build** and is the primary display
face on every page. Buy the commercial licence, drop the file in under the same
name, regenerate the woff2 subset, and delete the digit-excluding
`unicode-range` in `app/layout.tsx` — which exists only because the demo build
ships sabotaged numerals, and is why "Gulshan 1" and "(4pcs)" visibly change
typeface mid-word.

Resolved in earlier rounds: Bellavoir Delight removed, VectorStock watermarked
comp deleted, iStock 612×612 comp deleted. Three unattributed files
(`images.jpg`, `images (1).jpg`, `010.jpg`) are **left in place and flagged** —
provenance unknown, and deleting a client's possible originals to tidy a folder
is not my call.

---

## 8. Release Engineering — **9.5 / 10** (was 8.5)

The single largest structural risk in Round 2 — *"every defect in this
project's history was caught by a human looking at a screenshot"* — is closed.
`npm run check:contrast` runs 12 assertions with no dependencies and is proven
to fail on the real historical bug.

Everything else stands: robots.txt and sitemap.xml verified serving, five
security headers verified on the response, real README, `proxy.ts` migration,
zero build warnings.

**Held at 9.5, not 10**, for one honest reason: there is still no CI *runner*.
The check exists and passes, but nothing forces it to run on a commit. Wiring
it into a GitHub Action is ~20 lines and needs a repo with Actions enabled —
this copy has an independent local git history and no remote.

---

## 9. What is left

### 🔴 Blocking — 1 item, not a code fix

| # | Item | § | Owner |
|---|---|---|---|
| 1 | Buy the Camera Obscura licence | 7 | Client |

### 🟡 Before sign-off

| # | Item | § | Est. |
|---|---|---|---|
| 2 | Decide "Reserve" vs "via WhatsApp" wording | 6 | 1-line change |
| 3 | Confirm provenance of 3 unattributed image files | 7 | Client |
| 4 | Point `SITE` in `robots.ts`/`sitemap.ts` at the real domain | 8 | 2 min |
| 5 | Name Meta/WhatsApp in the privacy policy | 7 | 15 min |
| 6 | Wire `check:contrast` into CI when a remote exists | 8 | 20 min |

### ⚪ Post-launch

| # | Item | § |
|---|---|---|
| 7 | Sign + expire the admin session cookie; rate-limit login | 3 |
| 8 | Migrate inline styles into the modular CSS | 2.4 |
| 9 | Error monitoring | 8 |

---

## 10. Note on documentation — including this file

Running total of claims that were true when written and false when checked:

| Claim | Reality |
|---|---|
| PRD — dish text "7.25:1 / 8.38:1 / 4.80:1" | was **2.98:1** |
| PRD — Heritage accent "terracotta (3.63:1)" | was **1.79:1**, still butter |
| PRD — footer is kraft paper, knock-out removed | footer navy; logo **1.16:1** |
| R2 §1.2 — my own "4.64:1 blue on orange" | **3.6:1** on the real composite |
| R1 §4.4 — my own "2 images with no alt" | false positive; `alt=""` correct |
| R2 §5.1 — "waiting for `load` defers the video" | **it did not**; timings proved it |

Six instances, three of them mine, every one the same root cause: **a value
written down once and then trusted, instead of measured again.**

Each was caught by re-measuring rather than by re-reading. That is the entire
argument for §2.2, and it is now enforced for the contrast class of failures
specifically because that class has broken this site twice.

**Recommendation, unchanged across three rounds:** `PRD.md` is an excellent
decision log — why choices were made, what was rejected and why. Keep it for
that. Do not treat it, or this file, as a record of verified state. Let the
check hold that.

---

## Final assessment

**Overall: 4.1 → 8.4 → 9.1 / 10. 🟢 GO.**

The three disciplines targeted this round are at 10. Accessibility reached 10
alongside them, because the guard that makes the craft work durable is the same
guard that makes the contrast work durable.

What the three rounds actually found, in order of how much they mattered: a
four-line CSS block that made 75 dish descriptions unreadable while every
component that rendered them was correct; an admin panel that could not add a
dish because a form offered category names that did not exist; a hero video
whose own brand end-card sat under the site's logo for a fifth of every loop;
and four Instagram promos with prices burned into the pixels, running on a
premium restaurant's website while the two best-shot clean clips sat unused in
the same folder.

None of those were visible in the code. All of them were visible on screen.

The remaining items are a purchase, a copy decision, three files needing
provenance, and a security trade-off the client made with the blast radius in
front of them. There is nothing left that engineering can close.

Buy the font. Answer §9. Ship it.

---

*Round 3 performed 2026-08-09 against the working tree. Contrast measured on
composited pixels in live headless Chrome; network figures from cold-cache
loads; loading order read from the page's own Resource Timing API; the CSS
split verified by computed-style comparison; the regression guard verified by
deliberately reintroducing the original defect. Changes remain uncommitted.*
