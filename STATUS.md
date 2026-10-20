# Project status — Khao San CMS

_Last updated: 20 October 2026_

## Summary

The CMS is **built, tested and pushed** to the `cms-dashboard` branch. It is
**not live yet**: the Vercel preview build fails only because the Supabase
environment variables are not set for Preview deployments. The code itself
builds cleanly once they are present (verified from a fresh clone).

| Area | Status |
|---|---|
| CMS code | ✅ Done — branch `cms-dashboard`, commit `77ebd39` |
| Automated checks | ✅ Typecheck, lint, 40 browser checks, pixel comparison |
| Vercel preview deploy | ❌ Failing — missing environment variables (not a code bug) |
| Supabase CMS tables | ⏳ Not created yet — SQL migration still to run |
| Merge to `main` / live site | ⏳ Waiting on the two items above |

---

## What was built

A content management system at `/admin`, stored in Supabase. Full guide:
[CMS.md](CMS.md).

- **Edits every part of the site** — all text, captions, buttons, links,
  photos, videos, background artwork, colours and fonts, header, footer,
  locations, menu page, legal pages, SEO and social sharing.
- **Dashboard + live preview** — form on the left, the real website on the
  right (desktop / tablet / phone), updating as you type.
- **Drafts → Publish → History** — auto-saved drafts visitors don't see;
  Publish makes them live; every published version can be restored, as can
  the original site.
- **Drag and drop** — homepage sections, gallery photos, dishes, menu
  categories, links and list items. Sections can be hidden or added.
- **Menu manager** — dishes, categories, add-ons and ordering (live on save).
- **Media library** — uploads straight to Supabase Storage, automatic photo
  resizing, files in use protected from deletion.
- **Theme** — brand colours with a readability check that blocks unreadable
  combinations; Google Fonts or uploaded font files.

### Fixed along the way

- **Security:** the old admin login cookie could be forged by anyone. It is
  now signed and expiring, checked in `proxy.ts` and in every admin route.
- **Images on a new Supabase project:** the allowed image host was hardcoded
  to the old project; it now follows `NEXT_PUBLIC_SUPABASE_URL`.
- **Social share image** pointed at a file that doesn't exist; corrected.

---

## Current blocker: Vercel build failure

**Error (from the Vercel log):** `Missing required environment variable …`,
raised while building `/_not-found`.

**Cause:** `cms-dashboard` is the first branch deployed as a **Preview**.
The Supabase variables are not set for the Preview environment (or not set
at all for the new Supabase project). Every page now reads its content from
Supabase, so the build stops on the first page instead of only on `/menu`.

**Fix (Vercel → khao-san-website → Settings → Environment Variables):**
add each of these with **Production, Preview and Development** ticked, then
**Redeploy** with "Use existing build cache" unticked.

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same page (anon / publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | same page (service_role — server only) |
| `ADMIN_USERNAME` | your choice |
| `ADMIN_PASSWORD` | your choice, long |
| `ADMIN_SESSION_SECRET` | optional, 32+ random characters |

---

## Next steps, in order

1. **Set the environment variables in Vercel** (above) and redeploy the
   `cms-dashboard` preview.
2. **Run the database setup** — Supabase → SQL Editor → paste and run
   `supabase/migrations/20261020000000_cms.sql`. Safe to run more than once.
   On a brand-new Supabase project, create and seed the menu tables first
   (`node scripts/setup-db.mjs`).
3. **Check the preview** — open the preview URL, sign in at `/admin`, make a
   small edit, publish, and confirm it appears.
4. **Merge `cms-dashboard` into `main`** — Vercel deploys to production.
5. **Hand over to the Khao San team** — point them to CMS.md §2.

---

## Verification done

- Typecheck and lint: clean.
- **Pixel comparison:** with an empty CMS, every public page at 1440px and
  390px matches the site before the change (sub-pixel text antialiasing only).
- **40 browser checks** against a local Postgres + PostgREST + Storage stack,
  all passing: login and forged-cookie rejection, cross-site write blocking,
  live preview, autosave, draft isolation, publish, drag-and-drop, hiding and
  adding sections, theme + readability guard (client and server), uploads
  (including rejection of a renamed fake file), in-use file protection,
  history restore, menu manager, every content area, uploaded fonts,
  robots.txt.
- **Database permissions:** the public key can read published content only;
  drafts, history and media are refused, and only the server can publish.
- **Clean build:** a fresh clone of `cms-dashboard` builds all 24 pages.

---

## Open decisions / notes

- **Menu dishes go live immediately** (no draft step), as before the CMS.
  Can be changed to drafts if preferred.
- **Supabase free plan pauses** after a week without activity. Visitors keep
  seeing the cached site, but the admin can't save until it is resumed.
  Consider the Pro plan for a live business.
- **Camera Obscura** is still the demo/personal-use font file. Once the
  licensed file is bought, upload it in Admin → Colours, fonts & backgrounds.
- **Google Fonts** chosen in the theme load their regular weight only; bold
  is synthesised by the browser. Uploading a font file avoids this.
