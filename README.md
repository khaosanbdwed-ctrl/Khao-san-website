# Khao San — Dhaka

Marketing site for Khao San, a Thai restaurant brand with three outlets in
Dhaka (Gulshan 1, Dhanmondi, Uttara), with a built-in CMS at `/admin` that
edits every word, image, video, colour, font and section on the site.

**Start with [CMS.md](CMS.md)**: one-time Supabase setup, how the editor
works, and how to add editable fields.

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
  page.tsx              homepage — rendered from the CMS section list
  menu/                 menu, served from Supabase, ISR (1h + on-demand)
  legal/                privacy, terms (CMS documents)
  admin/                dashboard, content editor, menu manager, media library
  api/admin/            content / media / menu APIs (signed session required)
components/cms/         content provider, homepage section renderers
components/admin/       the editor UI
components/ui/          presentational pieces
lib/cms/                schema (every editable field + default), validation
lib/supabase/           server + service-role clients
supabase/migrations/    CMS tables, functions, storage bucket
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

## Content

Site content (text, images, videos, theme, sections) lives in Supabase as
CMS documents. The defaults in `lib/cms/schema.ts` are the original site, so
with an empty database the site renders exactly as built. See CMS.md.

Dishes live in the Supabase menu tables. The admin's Menu dishes page writes
to `menu_items` and revalidates `/menu`, so edits appear on the live site
immediately. Dish photos are now ordinary photos (JPG/PNG/WebP), uploaded
through the media library. The original cut-outs keep being shown plated via
`platedSrc()` in `app/menu/page.tsx`.

To reset the schema and reseed from the printed menu:

```bash
node scripts/setup-db.mjs
```

## Before launch

- `app/fonts/CameraObscura.otf` is the vendor's **demo/personal-use** build and
  is the primary display face on every page. Replace it with the licensed file
  (same filename), then drop the digit-excluding `unicode-range` in
  `app/layout.tsx` — it only exists because the demo build ships broken numerals.
- Set the real domain in Admin → Site settings & SEO if it is not
  `khaosan.com.bd` (robots.txt, the sitemap and social tags follow it).
- Run the CMS migration in Supabase (CMS.md §1).

See `PRODUCTION_AUDIT.md` for the current launch-readiness assessment and
`PRD.md` for the decision log.
