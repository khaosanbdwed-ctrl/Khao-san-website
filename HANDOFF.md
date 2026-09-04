# HANDOFF — start here for a new session

> ## ⛔ STOP. THE TREE IS MID-MIGRATION AND THE MENU PAGE IS BROKEN RIGHT NOW.
>
> The session of **2026-09-04** replaced the desktop category index in
> `app/styles/08-menu.css` with a new design (**the dial**) and ran out of
> budget **before touching the markup**. The new CSS targets a DOM that
> `components/menu-page-client.tsx` does not yet emit.
>
> **Concretely: `/menu` on a >1024px viewport currently renders a category
> index that is unstyled, mispositioned, or invisible.** This is not a
> regression to diagnose — it is a half-applied change, and §1 below is the
> exact recipe to finish it. Do that first, or revert (see §1.4).
>
> Nothing else on the site is affected. The homepage and footer were only
> *surveyed* this session; no file but `08-menu.css` was written.

This is a session-to-session handoff, not a design doc. Read it first, then:

1. **`MAP.md`** — orientation index (which file owns which concern, stylesheet
   load order, brand hierarchy, the rules that have already cost a round each).
2. **`PRD.md`** — the actual decision log, Rounds 1–9, client feedback quoted
   verbatim. §16 (Round 8) and §17 (Round 9) are the live design system.
3. This file — the unfinished migration (§1), the client brief that drove it
   (§2), a verified risk list (§3), and pending work (§5).

Do **not** trust `PRODUCTION_AUDIT.md` (three rounds stale), `COZY_DARK_PLAN.md`
(fully obsolete — abandoned dark-theme direction), or
`.claude/progress.md` / `.claude/memory/project_khao_san.md` (describe an
earlier, structurally different version of this site under a different path).
`DESIGN_AUDIT.md` (110 items, reconciled 2026-08-07) is real and under-used —
check it before re-raising a design complaint; many are already adjudicated
as obsolete there.

---

## 1. The unfinished migration — finish this first

### 1.1 What actually landed

**One file was written: `app/styles/08-menu.css`.**

Lines 487–832 (the old `.menu-index` block) were replaced with a new ~330-line
block. The splice was verified: both seams are clean and the file's braces
balance 119/119. It grew 1131 → 1157 lines.

A byte-exact backup of the pre-change file is committed to the working tree at
**`app/styles/08-menu.css.pre-dial.bak`** (42.6 KB, 1131 lines). It was copied
out of the session scratchpad deliberately: `git` cannot help here, because the
file was uncommitted before this change too (see risk #1), so that `.bak` is
the only record of design 3.

⚠ **Delete it once §1 is finished and verified** — a stray `.bak` in
`app/styles/` will be picked up by any glob that walks the stylesheet
directory, and a second file defining `.menu-index` is exactly the kind of
thing that costs a round to track down.

**Nothing else was written.** No `.tsx`, no other stylesheet.

### 1.2 What the new CSS expects, and what the markup still emits

`components/menu-page-client.tsx` around **line 425** still renders the design-3
markup. The new CSS needs four changes to it:

| | Old markup (still in the file) | New CSS expects |
|---|---|---|
| Wrapper | `<nav class="menu-index">` → `<ol>` directly | a `<div class="menu-index-dial">` **between** them |
| Centring | — | `style={{'--active': String(dialIndex)}}` on the `<nav>` |
| Falloff | — | `style={{'--d': String(Math.abs(index - dialIndex))}}` on each `<a>` |
| Spans | `.menu-index-mark`, `.menu-index-name`, `.menu-index-count` | `.menu-index-name`, `.menu-index-count`, **`.menu-index-tick`** (mark is gone) |
| Title | `<p class="menu-index-title">The Menu</p>` | **deleted** — it sits inside the sticky box and would shift the dial's centre line. `aria-label="Menu categories"` on the `<nav>` already names the landmark. |

Target markup:

```jsx
<nav
    className="menu-index"
    aria-label="Menu categories"
    style={{ '--active': String(dialIndex) } as React.CSSProperties}
>
    <div className="menu-index-dial">
        <ol className="menu-index-list">
            {categories.map((category, index) => (
                <li key={category.id}>
                    <a
                        href={`#${category.id}`}
                        ref={el => { navRefs.current[index] = el; }}
                        onClick={(e) => handleClick(e, index, category.id)}
                        onFocus={() => setNavFocusIndex(index)}
                        onBlur={() => setNavFocusIndex(null)}
                        className={`menu-index-link${activeIndex === index ? ' is-active' : ''}`}
                        aria-current={activeIndex === index ? 'true' : undefined}
                        style={{ '--d': String(Math.abs(index - dialIndex)) } as React.CSSProperties}
                    >
                        <span className="menu-index-name">{category.name}</span>
                        <span className="menu-index-count" aria-hidden="true">{category.items.length}</span>
                        <span className="menu-index-tick" aria-hidden="true" />
                    </a>
                </li>
            ))}
        </ol>
    </div>
</nav>
```

Plus, next to the existing state declarations (~line 93):

```ts
const [navFocusIndex, setNavFocusIndex] = useState<number | null>(null);
// The dial follows the KEYBOARD when a link is focused and the SCROLL
// otherwise. `is-active` stays bound to activeIndex, so the orange tick keeps
// marking what you are actually reading while tabbing travels the list.
const dialIndex = navFocusIndex ?? activeIndex;
```

⚠ **Pass the custom properties as strings.** `String(n)`, not `n`. React has
historically appended `px` to numeric style values, and a `--d: 3px` silently
breaks every `calc()` in the falloff with no error anywhere.

⚠ Do **not** reuse the existing `focusedIndex` state — that belongs to the
phone rail's drag handler (`focusFromPoint`). Separate concern, separate state.

### 1.3 Then verify

`npx tsc --noEmit` must still pass (it did before this change, on the dirty
tree). Then load `/menu` above 1024px and check, in this order:

1. Dishes on the **left**, index on the **right**.
2. At rest: **five ticks and one word** — the current category's name.
3. The named row sits on the **vertical centre** of the dial and **does not
   move** as you scroll from Appetizers to Drinks. This is the whole feature;
   if it drifts, `--row-h` (38px) and the link's `height` have desynchronised.
4. On hover: all thirteen names resolve, active full and bold, the rest fading
   and shrinking with distance. The active row still has not moved.
5. Tab into it: same reveal, and the dial travels to the focused row while the
   orange tick stays put.
6. Below 1024px the dial is `display: none` and the phone pill rail is
   unaffected.

⚠ **Screenshotting `/menu` deep in the page does not work.** The page is
~26,000px tall and the Browser pane's capture times out and returns pure white
below roughly y=8,000 — this was hit repeatedly and wasted several calls this
session. It is a *capture* limitation, not a render bug: `getBoundingClientRect`
and `getComputedStyle` return correct values at any depth, and screenshots at
the top of the page are fine. Verify the dial with `read_page` / DOM
measurement, or screenshot near the top of `.menu-layout` (~y=4,000).

### 1.4 If you would rather revert than finish

Restore `08-menu.css.bak` over `app/styles/08-menu.css` (path in §1.1) and
change nothing else. The old design returns intact. But the client's Round 10
brief in §2 is unaddressed either way, so this only buys a working page, not a
closed note.

---

## 2. The Round 10 brief this was built against

The client's note, decoded. Recorded verbatim in intent because the CSS is
built to answer it point by point and a future round should not have to guess
which requirement each rule serves.

**Menu page — the category index**

1. **Dishes left, navigation right.** Stated as a principle, not a preference:
   *"as our eyes sees the left side first, so it should be highlighted."* The
   left column belongs to the thing being sold.
2. **The current category must be named at rest.** *"if I scroll down the
   chicken section, chicken should be appear on the side. Others other names
   should be hidden."* Design 3 named nothing without a hover — that is the
   defect.
3. **Smaller. Not thirteen marks.** *"if there is fourteen dishes, I don't
   need to see the fourteen dotted... there should be four or five dot."*
4. **The active row is always vertically centred.** *"desert should be supposed
   to be in the lower side of the navigation panel, but I don't want that...
   it should always be on the middle whatever the section I'm scrolling."*
   The list travels; the reading position does not.
5. **On hover: everything resolves, in depth.** *"the desert only visible and
   bold, and the other are gradually shadowing and a little distant."*
6. Stated overall goal: **reduce the consumer's cognitive load.**

**Homepage** — the gallery/heritage section header is a two-liner; make it one
line and smaller.

**Footer** — *"still horrible, and small details are missing."* Specifically:
the social links are **set as words** (`Instagram`, `Facebook`) where logos
belong; too much white space; everything should be compact and aligned to an
edge rather than floating.

### How the new CSS answers 1–6

Read the block comment at `08-menu.css:487` — it documents the reasoning at
length. In brief: a real (narrow, ~160px) right-hand grid column; the list
absolutely positioned and translated by `-(active + 0.5) × --row-h` so the
active row lands on the dial's centre line for every index; a per-row `--d`
distance driving opacity, scale and x-offset; a non-repeating `mask-image`
window that feathers rather than clips.

Two decisions worth not re-litigating:

- **The column may take real width now.** The old comment forbade it, and was
  right *for design 3* — a column that reserves space has to earn it by being
  permanently legible, and design 3 named nothing at rest. This one always
  names your position, so the condition is met. If a future round hides the
  resting name again, the column must go back to zero width in the same commit.
- **Row height dropped 44px → 38px**, which is a deliberate WCAG trade: it
  loses 2.5.5 (AAA) and keeps 2.5.8 (AA, 24px). Safe *here specifically*
  because the control is `display: none` below 1024px and touch users get
  `.menu-rail`, whose targets are unchanged. Do not copy 38px into a control
  that survives to touch.

---

## 3. Verified risks — grounded 2026-09-03/04

Ranked by cost if ignored. Re-verified against the live tree this session
except where noted.

1. **The entire Round 8 + Round 9 working tree is uncommitted, and now the
   Round 10 CSS with it.** `git status --short` — **105 changed paths**
   (was 103). `git log` HEAD is still `6b80de3`, the Round 5–7 env-diagnostics
   commit. A `git checkout .`, `git stash drop`, or a clean clone loses three
   revision rounds, including `lib/locations.ts` and five components that exist
   nowhere else. **Propose committing before anything else touches the tree —
   but only when the user explicitly asks (standing repo rule).** Note the tree
   is *not* currently in a committable state: finish §1 first.

2. **Camera Obscura font licence — the only 🔴 launch blocker.**
   `app/fonts/CameraObscura.otf` is the vendor's demo/personal-use build; it
   is `--font-display` / `--font-heading`, the primary display face on every
   page. This is a client purchase, not a code fix. It has a coupled
   workaround: the demo build ships deliberately sabotaged numerals, so
   `app/layout.tsx`'s `cameraObscura` font declaration excludes
   `U+0030-0039` to push digits to Montserrat instead. **When the licensed
   file lands, delete that `declarations` line in the same change** — the
   comment says so, but if it's forgotten, digits will just silently keep
   falling back forever with no visible error.

3. **Social share image 404s right now. Re-verified 2026-09-04.**
   `app/layout.tsx:67` points `openGraph.images` at
   `/assets/Background-20260709T183540Z-2-001/Background/Elephant%2016%20by%209%20Ratio%20Landscape.webp`.
   That directory holds only `Footer/`, `Landing Page Section/`, `Lotus/`,
   `010.jpg` and `images (1).jpg` — the path is missing the
   `Landing Page Section/` segment. A correct, already-optimized **24.5 KB**
   replacement exists at `/assets/bg-web/elephant-landscape.webp` (the footer
   CSS already uses it). One-line fix, external-facing, no reason to wait
   behind the design backlog.

4. **`dish-images` Supabase Storage bucket is never provisioned.**
   `scripts/setup-db.mjs` creates the three tables, RLS policies and
   indexes, but no `storage`/`bucket` call anywhere creates the bucket
   `app/api/admin/upload/route.ts` writes to (and `next.config.ts`
   allowlists for images). A fresh Supabase project reproduces schema +
   seed correctly, then every admin photo upload fails. Manual setup nobody
   wrote down.

5. **Footer hours can silently drift from the JSON-LD. Re-verified
   2026-09-04.** `Footer.tsx:143–146` hardcodes `Sat–Thu · 12pm–11pm` /
   `Friday · 2pm–11pm` directly in JSX, while the Restaurant JSON-LD reads
   `loc.openingHours` from `lib/locations.ts`. Editing hours in
   `locations.ts` today updates the structured data and the homepage but
   **not** the visible footer line — exactly the NAP inconsistency the file's
   own comment says never to allow. Search engines read both. Worth fixing
   inside the footer rework (§5), since that file is being opened anyway.

6. **Port convention disagrees three ways.** `README.md`,
   `check-contrast.mjs`, `shoot.sh` and `shoot.mjs` all default to
   `localhost:3200`. `.claude/launch.json` declares the dev server on port
   `3100` with `autoPort`. **In practice it came up on 3001** this session,
   because `autoPort` walked past both. Start the app via `launch.json` and
   then run `npm run check:contrast` with no argument and it silently checks
   nothing, or the wrong host.

7. **`scripts/plate-dishes.py` cannot run as written.** `SRC`/`OUT` are
   hardcoded to `C:\Users\HP\Downloads\Khao san\khao-san-client\...`, a
   directory that no longer exists — the repo lives under
   `Desktop\Claude\Projects` now. `PRD.md` and `app/menu/page.tsx`'s own
   comment both assume this script is re-runnable; it isn't, until the
   paths are fixed. Two broken `.claude/skills/` symlinks point at the same
   dead `Downloads` path.

8. **Admin auth is intentionally weak, and that's a ticking clock, not a
   closed item.** The session cookie is the literal string `"authenticated"`
   — unsigned, forgeable, no rate limit on `/api/auth/login` (it sits
   outside `proxy.ts`'s matcher by necessity). Client-accepted tradeoff
   scored 6.5/10 because the Supabase project currently holds no
   customer/order/payment data — worst case today is menu defacement,
   recoverable via `setup-db.mjs`. **PRD's own audit says this becomes a
   launch blocker again the day the project gains a table holding customer
   or order data** — remember before any "add reservations" or "add
   ordering" feature request.

9. **`package.json`'s `"name"` is `"khao-san-app"`. Re-verified 2026-09-04** —
   the exact name `README.md` uses for the separate, read-only sibling
   portfolio build it explicitly warns not to port changes into. Any tooling
   that identifies the project by package name will conflate the two.

---

## 4. Stale comments and facts worth knowing

The project's convention is heavy in-code rationale comments
(`HISTORICAL, Round N:` / `⚠ ROUND N`), which is generally excellent — but
several have gone stale relative to the code they sit next to. Don't trust a
comment's prose over the actual rendered CSS/behavior; when they disagree,
the CSS wins.

- **The menu has 13 categories, not 14.** Every comment in `08-menu.css` and
  `menu-page-client.tsx` that says "fourteen" is off by one. From
  `scripts/setup-db.mjs`, in `sort_order`: Appetizers, Soups, Dumplings,
  Salads, Noodles, Rice, Chicken, Beef, Seafood, Vegetarian, Rice Bowls,
  Desserts, Drinks. Longest name is ten characters — which is what lets the
  new index column be as narrow as it is. The new CSS block says thirteen.
- **`SHOWCASE_PICKS` is sound — the old §4 sanity check is closed.** All five
  ids (`b-soups`, `e-noodles`, `k-rice-bowls`, `i-seafood`, `l-desserts`)
  exist in the seed. Only the *comment* beside it is wrong: it claims the
  first five categories in sort order are "Appetizers, Soups, Dumplings,
  Salads, **Kids Menu**". There is no Kids Menu; the fifth is Noodles. Fix
  the comment, leave the picks alone.
- **`MAP.md` is behind** — synced 2026-08-21. It does not have the
  menu-index sticky-not-fixed fix, the footer's three-zone rebuild, the
  single-line `"Taste the fire."` fix, or anything from this session. Its
  component table still lists `Footer.tsx` at 76 lines (it is ~200) and
  doesn't mention `lib/locations.ts`, `dish-tags.tsx`, `feature-dish.tsx`,
  `menu-showcase.tsx`, `room-gallery.tsx` or `scroll-parallax.tsx` at all.
  It also lists the menu components under `components/` when several live in
  `components/ui/`. Worth a light resync pass, not a rewrite.
- **`07-forms.css` is misnamed.** Its only live rule styles `.menu-category`
  section padding on the menu page; everything else in it
  (`.premium-form`, `.premium-input`, `.page-hero`) is dead code from a
  reservation feature deleted rounds ago.
- **`.hero-overlay`, `.page-hero`, `components/ui/page-hero.tsx` are fully
  dead** (zero importers, not "used elsewhere" as one comment implies) —
  safe to delete outright if anyone wants the cleanup.
- **`.bg-orange-field` renders white**, not orange, since Round 8 — several
  comments in `09-home-sections.css` and `page.tsx` still describe an
  "orange→blue→orange rhythm" or a masonry gallery layout that predates the
  current flex strip. The class name is legacy; don't read it as the colour.
- **The `position: fixed` trap is real and was re-confirmed this session.**
  `getComputedStyle(document.querySelector('main')).transform` returns
  `matrix(1, 0, 0, 1, 0, 0)` — an identity transform left by
  `.page-transition`'s `forwards`-filled `fadeUpIn`. That makes `<main>` the
  containing block for every `position: fixed` descendant on the page. Use
  `position: sticky`, or portal to `document.body`.

---

## 5. Pending / not yet done

**Immediate**

- **Finish the dial migration (§1).** Everything else is blocked behind this
  in the sense that `/menu` is not presentable until it is done.

**The rest of the Round 10 brief — surveyed but NOT started**

- **Homepage gallery header.** The two-liner is `.heritage-quote` in
  `app/page.tsx` (~line 265): *"Bangkok's fiercest street corners, quietly
  elevated."* Styled at `09-home-sections.css:128` — `clamp(2rem, 3.6vw,
  3.4rem)` inside a `max-width: 800px` `.heritage-head`, with
  `text-wrap: balance`. The `balance` and the 800px cap are what *force* two
  lines; the size makes them large. Fix is all three together: smaller clamp,
  drop `balance`, widen the head. Verify at 1440 and at 1024 — the em on
  "quietly elevated" is brand blue at a measured 3.41:1 on the composited
  orange field, which is **large-text-only contrast**, so it must not be
  shrunk past ~24px without re-checking. (`npm run check:contrast`, and see
  risk #6 about the port.)
- **Footer.** `components/Footer.tsx` + `app/styles/12-footer.css`. Three
  things: (a) `SOCIAL` at `Footer.tsx:70` emits the words `Instagram` and
  `Facebook` — needs inline SVG marks with `aria-label`, per the client's
  note; (b) compaction — the current shape is a 4-column grid, then a nav
  row, then a bottom row, and the client reads the gaps as empty; (c) align
  to an edge rather than centring blocks in their columns. Fold risk #5
  (hardcoded hours) into the same change while the file is open.
  ⚠ Read `12-footer.css:50` first — the footer has a documented
  804px→525px height regression from vertical link lists. **Do not turn
  `.footer-nav` back into stacked columns.** And `.footer-logo`'s
  `filter: brightness(0) invert(1)` is paired with the dark surface; if the
  surface ever goes light the filter must change in the same commit or the
  logo silently disappears.

**Considered but not done**

- **Flip the showcase rail to the right too.** `.menu-stage-pin`
  (`08-menu.css:142`) is `grid-template-columns: minmax(210px, 26%)
  minmax(0, 1fr)` — nav left, plate right, which now contradicts the dial
  below it *and* the client's stated left-is-content principle. The fix is
  to swap the template, place `.menu-stage-rail { grid-column: 2 }` /
  `.menu-stage-plates { grid-column: 1 }` (keeping DOM order), and mirror the
  rail item: `border-left` → `border-right`, `padding: 10px 0 10px 16px` →
  `10px 16px 10px 0`, `justify-content: flex-end`, and
  `.menu-stage-rail-name`'s `transform-origin: left center` → `right center`.
  Not started. Worth doing in the same round so the page has one
  navigational language rather than two on opposite edges.
- **Menu hero video** opens on a shot of a staff member rather than food —
  confirmed again this session, visible in the first frame. Flagged to the
  client previously, never actioned either way. Confirm intent before
  swapping it.
- **Locations (Havens) card aesthetics.** In the original brief; only ever
  touched for NAP data wiring (`lib/locations.ts`), not visual treatment.

**Post-launch backlog** (from PRD, genuinely not started)

- Sign + expire the admin session cookie and rate-limit `/api/auth/login`.
- Migrate the ~25 inline `style={}` blocks in `menu-page-client.tsx` into the
  modular CSS system.
- Add error monitoring.

---

## 6. Load-bearing rules for the subsystems in play

Things that break **silently, with no error**, if violated.

**Menu category index — the dial (`08-menu.css`, `.menu-index*`)**

- `.menu-layout` must keep `align-items: start`. Remove it and the sticky
  index has nowhere to travel — `position: sticky` does nothing, no error.
- `--row-h` (38px) is arithmetic, not spacing. `.menu-index-link` must keep an
  **exact matching `height`**. A `min-height`, a stray margin, or a name that
  wraps to two lines desynchronises the centring, and the drift compounds with
  every category down the list.
- The dial's `mask-image` **must** keep `mask-repeat: no-repeat` and
  `mask-size: 100% 100%`. At the defaults the gradient tiles instead of
  clipping, and the list runs up under the header and down over the dishes.
- Never add `overflow` (anything but `visible`) anywhere in this subtree. A
  scroll container reintroduces the very first design's defect: navigation you
  have to scroll *inside* to use.
- Custom properties `--active` and `--d` must be passed as **strings** from
  React. A numeric value can pick up a `px` suffix and every `calc()` in the
  falloff fails silently.
- All opacity rules for `.menu-index-name` / `.menu-index-count` /
  `.menu-index-tick` live in the one `THE FALLOFF` block, ordered
  rest → engaged → hover. Add new ones **inside** it. (The old warning was
  "never set opacity on `.menu-index-count`" — that no longer applies, because
  opacity *is* the mechanism now, but the reason it existed does: a stray
  opacity rule after the block wins the cascade and kills the reveal.)
- `position: fixed` anywhere inside `<main>` is broken by `.page-transition`
  (see §4). Use `position: sticky`, or portal to `document.body`.

**Footer (`12-footer.css`, `Footer.tsx`)**

- Don't turn `.footer-nav` back into vertical link lists — that is literally
  the 804px→525px regression a previous round fixed, and the CSS comment says
  so explicitly. Anything new goes in a column of the existing grid, not a
  fifth stacked band.
- `.footer-logo`'s `filter: brightness(0) invert(1)` and `unoptimized` on the
  `Image` are a matched pair with the dark `.site-footer` surface. If the
  surface is ever made light again, the filter must change in the same commit
  or the logo silently goes invisible (this has happened once already).
- NAP data has exactly one source: `lib/locations.ts`. Don't inline an
  address, phone, or hours anywhere else — see risk #5 for what happens when
  that rule is broken even partially.
