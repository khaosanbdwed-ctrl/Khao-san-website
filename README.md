# Khao San — Dhaka

Marketing site for Khao San, a Thai restaurant brand with three outlets in
Dhaka (Gulshan 1, Dhanmondi, Uttara), plus a dashboard (`/admin`) for managing
every word, photo, video and dish on it. Live at **https://khaosan.bd**.

- **For the restaurant team:** `CLIENT_GUIDE.md` (how to use the dashboard,
  photo and video sizes).
- **For developers:** this file, then `CMS.md`, `PRODUCTION_AUDIT.md` (the
  current launch-readiness and security review) and `HANDOFF.md`.

**This is the client working copy.** The sibling `khao-san-app` folder is a
separate portfolio build — do not port changes into it.

## Running it

```bash
npm install
npm run dev -- -p 3200
```

Port 3200 is this copy's convention; 3000 belongs to the portfolio build.

Requires a `.env.local` (never committed) - see `.env.example` for every
variable and what it does:

```
ADMIN_USERNAME=
ADMIN_PASSWORD=          # long and random: this login controls the whole site
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# optional
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=    # defaults to https://khaosan.bd
```

Node 20.9 or later. Checks before every deploy:

```bash
npm run typecheck && npm run lint && npm run build
npm audit --omit=dev     # must report 0 vulnerabilities
```

## Stack

Next.js 16.4 (App Router) · React 19.2 · TypeScript · Supabase (Postgres +
Storage). No CSS framework — the design system lives in `app/globals.css` as
CSS custom properties. No animation library — scroll reveals use a custom
IntersectionObserver in `components/ClientWrapper.tsx`.

## Layout

```
app/
  page.tsx              homepage — seven chapters, anchor-linked
  menu/                 menu, served from Supabase, ISR (1h + on-demand)
  legal/                privacy, terms
  admin/                login → overview → website content / menu control / media
  api/admin/*           dashboard API (service role) - every handler checks the
                        session itself (lib/auth/require-admin.ts) as well as proxy.ts
  api/admin/upload      signed upload URLs for plated dish photos
components/ui/          presentational pieces
lib/supabase/           server + service-role clients
scripts/setup-db.mjs    schema + seed for the menu tables
```

## The two things most likely to trip you up

**1. The colour fields own their ink.** `.bg-orange-field`, `.bg-blue-field`,
`.gift-field` and `.site-footer` each redeclare `--color-text-primary` and
friends. Write `color: var(--color-text-primary)` and the right value arrives.
Never hardcode white on an orange field — that pairing measures 2.16:1 and the
stylesheet says so in three places. This has broken twice; both times the
symptom was invisible at the call site because the fault was in a token.

**2. The logo needs `unoptimized`.** `Khao San Logo.webp` is a navy mark on
transparency, knocked out to cream with `filter: brightness(0) invert(1)`. The
image optimiser strips its alpha channel, which silently defeats the filter and
renders the mark invisible. Every placement passes `unoptimized`. If a footer
or hero logo ever "goes missing", check this first.

## Menu content

Dishes live in Supabase, not in the code. The admin panel writes to
`menu_items` and revalidates `/menu`, so edits appear on the live site
immediately.

**Dish photos are uploaded background-removed and plated in the browser.**
The client supplies a transparent PNG/WebP cut-out; `components/admin/
plate-dish.ts` composites it onto the warm studio ground with a contact shadow
and consistent framing (the same algorithm and constants as
`scripts/plate-dishes.py`, which plated the original 75 - verified to match
its output), and uploads the plated square plus the original cut-out straight
to the `dish-images` bucket with signed URLs. A photo with no transparency is
refused with an explanation. The menu never shows a floating cut-out.

To reset the schema and reseed from the printed menu:

```bash
node scripts/setup-db.mjs
```

## Before launch

- **Font licence.** Camera Obscura is the vendor's **demo/personal-use** build
  and is the primary display face on every page. The site loads
  `app/fonts/CameraObscura.woff2` (a basic-Latin subset made from the `.otf`
  beside it) - so replacing only the `.otf` changes nothing. With the licensed
  file: convert it to a subset woff2 under the same name, e.g.
  `pyftsubset CameraObscura.otf --unicodes=U+0020-007E --flavor=woff2 --output-file=CameraObscura.woff2`,
  then delete the digit-excluding `declarations` line in `app/layout.tsx` (it
  only exists because the demo build ships broken numerals).
- The domain is set once, in `lib/site.ts` (`https://khaosan.bd`), or by the
  `NEXT_PUBLIC_SITE_URL` variable. Sitemap, robots.txt, share previews,
  canonical URLs and the outlets' Google data all read it.

See `PRODUCTION_AUDIT.md` for the current launch-readiness assessment and
`PRD.md` for the decision log.
