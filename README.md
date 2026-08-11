# Khao San — Dhaka

Marketing site for Khao San, a Thai restaurant brand with three outlets in
Dhaka (Gulshan 1, Dhanmondi, Uttara), plus a small internal panel for managing
the menu.

**This is the client working copy.** The sibling `khao-san-app` folder is a
separate portfolio build — do not port changes into it.

## Running it

```bash
npm install
npm run dev -- -p 3200
```

Port 3200 is this copy's convention; 3000 belongs to the portfolio build.

Requires a `.env.local` (never committed):

```
ADMIN_USERNAME=
ADMIN_PASSWORD=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres +
Storage). No CSS framework — the design system lives in `app/globals.css` as
CSS custom properties. No animation library — scroll reveals use a custom
IntersectionObserver in `components/ClientWrapper.tsx`.

## Layout

```
app/
  page.tsx              homepage — seven chapters, anchor-linked
  menu/                 menu, served from Supabase, ISR (1h + on-demand)
  legal/                privacy, terms
  admin/                login → overview → menu control
  api/admin/menu        menu CRUD (service role)
  api/admin/upload      dish photo upload — PNG only
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

**Dish photos must be PNGs with the background removed.** The menu presents
each dish floating on the page with no card behind it, so the image needs a
real alpha channel — a JPEG renders as an opaque box. This is enforced at the
file picker, at the API (by checking the actual PNG signature bytes, not the
declared MIME type), and on the storage bucket itself.

To reset the schema and reseed from the printed menu:

```bash
node scripts/setup-db.mjs
```

## Before launch

- `app/fonts/CameraObscura.otf` is the vendor's **demo/personal-use** build and
  is the primary display face on every page. Replace it with the licensed file
  (same filename), then drop the digit-excluding `unicode-range` in
  `app/layout.tsx` — it only exists because the demo build ships broken numerals.
- Point `SITE` in `app/robots.ts` and `app/sitemap.ts` at the real domain if it
  is not `khaosan.com.bd`.

See `PRODUCTION_AUDIT.md` for the current launch-readiness assessment and
`PRD.md` for the decision log.
