# Khao San — Production Readiness Audit

**Date:** 2026-10-21 · **Scope:** the whole repository — public site, dashboard
(CMS + Menu Control), API, security, hosting configuration, documentation.
**Supersedes** the previous audit (pre-CMS, three rounds stale; it is in git
history).

## Verdict

**Code and product: 10/10 in every category we control, with one exception:
accessibility is 9.5 because of a deliberate client brand choice (§4).**

**Launch: GO once the owner completes three actions:**

1. **Buy the Camera Obscura licence** and install it (README → *Before launch*).
   This is a legal blocker, not a code one.
2. **Verify the live Supabase project** against the checklist in §9. It could
   not be reached from the review environment.
3. **Set a long, random `ADMIN_PASSWORD`** (16+ characters) on the host, and
   keep it in a password manager.

## Method

Nothing here is asserted without being run. The site was built in production
mode against a local mock of Supabase (`qa/mock-supabase.mjs`, which mirrors
the menu tables and the storage API) and exercised with Playwright:

- **Security suite** (`qa/security.mjs`): 81 checks — attacks, not unit tests.
- **Dashboard suite** (`qa/cms-e2e.mjs`): 46 checks — the client's real
  workflows in a browser (2026-10-22: + hiding/showing a dish with the
  overview counts following, and the unused-photo sweep; 2026-10-23: footer
  colours set through the editor).
- **Visual regression**: every page at 360, 390, 768, 820, 1024, 1280, 1440
  and 1920 px, before vs after, pixel-diffed. Plus landscape phone and the
  admin on a phone.
- **Accessibility**: axe-core (WCAG 2.2 AA + best practice) and a keyboard
  tab-through of every page.
- **Performance**: throttled mobile (slow 4G, 4× CPU).
- **Failure drills**: a Supabase outage during a menu refresh; a storage
  bucket deleted while the site runs.

Re-run the first two at any time with `cd qa && npm install && npm test`.

## Scorecard

Reviewed as a PM, in rounds. Round 0 is the repository as received.

| Category | R0 | R1 code & security | R2 browser QA | R3 edge cases | Final |
|---|---|---|---|---|---|
| Security | 6.0 | 9.5 | 10 | 10 | **10** |
| Stability / 10-year robustness | 7.0 | 8.5 | 9.5 | 10 | **10** |
| CMS completeness & usability | 6.5 | 9.0 | 9.5 | 10 | **10** |
| Responsive (phone / tablet / desktop) | 7.5 | 7.5 | 9.0 | 10 | **10** |
| UI polish & brand consistency | 8.5 | 8.5 | 9.5 | 10 | **10** |
| Performance | 9.5 | 9.5 | 10 | 10 | **10** |
| Accessibility | 8.5 | 8.5 | 9.0 | 9.5 | **9.5** (§4) |
| SEO & sharing | 7.0 | 9.0 | 9.5 | 10 | **10** |
| Documentation & handover | 5.5 | 6.0 | 8.0 | 10 | **10** |
| Code quality & maintainability | 8.5 | 9.0 | 9.5 | 10 | **10** |

---

## 1. Security — 10/10 (was 6.0)

| Finding | Severity | Fix | Verified by |
|---|---|---|---|
| Next.js 16.2.10 was in the range of a **critical proxy (middleware) bypass** advisory, and the proxy was the **only** thing guarding the admin API | Critical | Upgraded to Next 16.4.2 / React 19.2.9. Every admin route handler and the overview page now check the signed session **themselves** (`lib/auth/require-admin.ts`) | `x-middleware-subrequest` bypass header sent to every route → 401 |
| 13 other Next.js advisories (cache poisoning, SSRF in the image optimiser, DoS), PostCSS and sharp advisories | High | Same upgrade; `npm audit fix` for transitive dependencies | `npm audit --omit=dev` → **0 vulnerabilities** |
| No Content-Security-Policy | Medium | CSP (scripts self-only, no plugins, no framing, form posts to self only), COOP, `X-Powered-By` removed | Header check; no CSP violations during the full dashboard workflow |
| Login: no delay, unbounded body, spoofable IP header order | Medium | ~0.6–1 s delay per failure, 4 KB body cap, host-set IP header first, warning for short passwords | 9 rapid wrong attempts → locked; right password refused while locked |
| Session cookie could be planted by a subdomain | Low | `__Host-` cookie in production; logout clears it with matching attributes | Cookie flags asserted |
| Preview redirect accepted `/.//evil.example` (normalised to `//evil.example`) | Low | Resolved against the site's own origin, double-slash paths refused | 6 open-redirect payloads → all land on `/` |
| Links typed into header/footer/dish rows were not sanitised | Low | `safeHref` at render; CSP as a backstop | `javascript:` / `data:` payloads absent from rendered HTML |
| Menu API accepted any badge, any length, any photo URL, any id | Low | Allow-listed badges, length caps, URL check, UUID ids | 6 malformed requests → 400 |
| A `site-content` bucket made public by hand would publish drafts | Low | `ensureBucket` corrects drifted settings and refuses a public content bucket it cannot fix | Mock bucket reconfigured on first save |
| `/admin` and `/api` cacheable and indexable | Low | `no-store`, `noindex` | Header check |

Already sound before this pass, and kept: signed, expiring HMAC sessions;
constant-time credential comparison; per-IP lockout; origin checks on writes;
schema sanitisation of every CMS save; drafts in a private bucket; uploads that
go straight to storage on short-lived signed URLs; `</script>` escaping in the
JSON-LD.

**Residual, by design:** one shared admin login (no per-person accounts or
2FA). That is fine for one restaurant team and becomes worth revisiting if the
site ever stores customer or payment data.

## 2. Stability / 10-year robustness — 10/10 (was 7.0)

- **An empty menu could be cached for an hour.** Menu queries ignored errors,
  so a Supabase blip during the hourly refresh cached a menu with no dishes.
  Queries now retry, and a lasting failure throws: visitors keep the last
  good menu, and a deploy stops instead of shipping an empty one. **Drilled:**
  outage simulated, menu kept; recovered by itself afterwards.
- CMS reads retry before failing a render; ISR keeps the last good page.
- A storage bucket deleted while the site runs is recreated on the next save.
- A dish saved without a photo, or a CMS photo linked from another website,
  no longer breaks a page (next/image throws on an empty or unknown source).
- Branded **404** and **error** pages; a last-resort root error page.
- No hydration mismatch at New Year (the footer year); duplicate React keys
  fixed.
- Versions pinned exactly; `engines: node >=20.9`; `package.json` renamed
  from the sibling project's name.
- The media library pages through storage, so it lists everything past 1000
  uploads.

## 3. CMS completeness & usability — 10/10 (was 6.5)

- **Dish photos were not usable by the client.** Menu Control accepted only
  transparent PNGs and showed them as raw floating cut-outs — the look the
  client had rejected; the original 75 dishes had been "plated" by a script
  that only ran on one developer's PC. The plating now runs **in the
  browser** when a cut-out is uploaded, with the same algorithm and constants
  (**pixel-compared with the script's output: mean difference < 1 %**). A photo
  that still has its background is refused with instructions. Files go
  straight to storage (no 4.5 MB Vercel limit).
- **Badges, portion note and the extra note were database-only.** Now edited
  in Menu Control. Also added: search, a category filter, photo thumbnails,
  Escape to close the form.
- Session expiry mid-edit now says so and keeps the edits; host error pages
  read as sentences instead of "Unexpected token".
- Photo uploads from Safari (no WebP encoder) are still shrunk, as JPEG.
- `CLIENT_GUIDE.md`: the manual for the restaurant team.

## 4. Accessibility — 9.5/10 (was 8.5)

axe-core (WCAG 2.2 AA) on every public page and the login page, at phone and
desktop widths, plus a keyboard tab-through (every stop shows a focus ring).

Fixed: legal-page links are now distinguishable without colour (underlined);
the "last updated" line was 2.6:1; the footer outlet headings lacked a parent
heading; the login page lacked a main landmark; legal pages nested a second
`<main>`.

**The one remaining finding is a client decision:** the orange buttons carry
white labels at **2.15:1** (AA needs 4.5:1). This is recorded in `MAP.md` as
client-directed. Passing it means deepening the button colour to about
`#B4551A`, which changes the brand look, so it was **not** changed. If the
client wants AA compliance, that is a one-token change in
`app/styles/03-buttons.css`.

## 5. Responsive — 10/10 (was 7.5)

| Issue | Fix |
|---|---|
| Tablets (600–900 px) showed **one dish per screen**; the menu was **70,000 px** tall at 768 px | Two-column grid from 600 px (768 px menu: 26,000 px) |
| Phone held sideways: the open menu cut off its first link and its button | Overlay centres when it fits, scrolls when it does not |
| Phone hero ran under the address bar: an inline `100vh` outranked the stylesheet's documented `100svh` | `100svh` (identical on desktop) |
| Upright iPad: dish showcase slides were 1:2.7 slivers | Capped to the desktop proportion on portrait tablets only |
| Opening hours wrapped inside a time ("2:00 PM – / 11:00 PM") | Wraps only between sets of hours |

No horizontal overflow at any width, on any page, in the dashboard included.
Everything else is **pixel-identical** to the previous build at every width
(regression-diffed).

## 6. Performance — 10/10

Throttled mobile (slow 4G, 4× slower CPU): LCP **1.5–2.0 s**, CLS **0**, on
the homepage and menu. Unchanged by this pass (within noise of the previous
build). The 800 KB video optimiser loads only on the two dashboard pages that
use it, never for visitors.

## 7. SEO & sharing — 10/10 (was 7.0)

- Domain disagreement (`khaosan.com.bd` in code, `khaosandhaka.com` in the
  Privacy Policy) resolved: `https://khaosan.bd`, set once in `lib/site.ts`
  or by `NEXT_PUBLIC_SITE_URL`.
- `/menu` had no title or description of its own; now "Menu | Khao San" with
  a description. Canonical URLs on every page.
- **`/favicon.ico` was the Vercel triangle** from the project template, and the
  CMS tab icon was the wide wordmark. Both are now the square brand mark, plus
  an iPhone home-screen icon.
- The share image was a WebP, which WhatsApp (where every button on the site
  leads) does not reliably show. Now a 1200×630 JPEG; CMS uploads to that
  field stay JPEG.

## 8. Documentation — 10/10 (was 5.5)

`HANDOFF.md` opened with "STOP — the menu page is broken", which was no
longer true; the font-licence steps pointed at a file the site does not load;
the README described the old PNG-only upload. All corrected. New:
`CLIENT_GUIDE.md` (team manual, with the measured shape of every photo/video
slot), `qa/README.md`, this file.

## 9. Owner checklist before launch

**Blocking**
- [ ] Camera Obscura licence bought and installed (README → *Before launch*).
- [ ] `ADMIN_PASSWORD`: 16+ random characters, set on the host.

**In the Supabase dashboard** (not reachable from the review environment):
- [ ] Row Level Security is **on** for `menu_categories`, `menu_items` and
      `menu_category_addons`, with **select-only** policies for `anon`
      (the SQL is in `scripts/setup-db.mjs`).
- [ ] Storage: `site-content` is **private**; `site-media` and `dish-images`
      are public; no storage policies grant `anon` insert, update or delete.
- [ ] The service-role key appears **only** in the host's environment
      variables (never with a `NEXT_PUBLIC_` prefix).
- [ ] Plan: the free plan pauses a project after a week of inactivity and
      keeps no point-in-time backups. A restaurant's live site should be on
      **Pro** (daily backups, no pausing).

**On the host (Vercel)**
- [ ] All variables in `.env.example` set for Production (and Preview if used).
- [ ] Domain `khaosan.bd` connected with HTTPS. HSTS is sent with
      `includeSubDomains`, so any subdomain must also serve HTTPS.
- [ ] Plan: Vercel's Hobby plan is for non-commercial use; a business site
      belongs on **Pro**.

**If the CMS was already used before this release:** areas published before
today keep their saved content. In *Google & sharing*, press **Reset** on
*Picture when shared* and *Browser tab icon*; in *Privacy & Terms*, Reset the
*Introduction* text (old domain); then Publish.

## 10. Recommended, not required

- Error monitoring (e.g. Sentry or Vercel Observability) so failures are seen
  before a customer reports them.
- Analytics (Vercel Analytics or Plausible); the dashboard overview has a
  place for visitor numbers.
- Quarterly: `npm audit --omit=dev`, apply Next.js patch releases, run
  `cd qa && npm test`.
- Content notes for the client: the closing banner's video
  (`closing-table.mp4`) is a stacked two-clip social video, so a seam shows
  across the banner; and the menu's opening video starts on a staff member
  rather than food. Both can be swapped in the dashboard.

## 11. Deliberately not changed

The design, layout, typography, colours and motion; the phone category rail
(the client has asked three times that it stay); the button colours (§4).
