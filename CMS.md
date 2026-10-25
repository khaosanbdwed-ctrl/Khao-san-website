# Website CMS

The dashboard at **/admin** (same login as Menu Control) controls the site's
content: every word, photo, video, background, link, outlet address, opening
hour, show/hide setting and section order. The **design** (layout, fonts,
spacing, animation) stays in the code. Until something is edited and
published, the site renders exactly as designed: the code defaults *are* the
current content.

## For the people editing the site

The full manual for the restaurant team, including the photo and video size
for every place on the site, is `CLIENT_GUIDE.md`. The summary:

Sidebar → **Website Content** lists every area:

| Area | What it covers |
|---|---|
| Homepage | Every section: opening video and logo, Theatre of Fire, rooms gallery and signature dishes, Locations, Gift cards, closing banner. Show/hide and reorder sections. |
| Menu page | Opening video and title, dish showcase, backgrounds, notes at the bottom. (Dishes and prices stay in **Menu Control**.) |
| Header | Logo, navigation links, the button, bar colours. |
| Footer | Logo, tagline, hours line, button, links, social media accounts, copyright line, background. |
| Locations & hours | Outlet names, addresses, phones, WhatsApp numbers, photos, opening hours. Feeds the homepage, the footer and the information Google reads. |
| Privacy & Terms | The two legal pages. |
| Google & sharing | Browser-tab title, Google description, the picture shown when the site is shared, the tab icon. |

How a change goes live:

1. Open an area, open a section, edit. Every field has **Reset**, which puts back the original.
2. **Save draft**: nothing changes on the live site.
3. **Preview ↗**: opens the real site showing your draft (an orange bar at the bottom says so; only you see it).
4. **Publish**: visitors see it immediately.
5. **History**: every publish is kept (the last 40). **Restore** copies an old version into the draft, so you can preview it, then Publish.

Backgrounds: every section has a Background panel. Leave it empty to keep
the designed background, or set a colour, a photo, or a video, plus an
optional darkening wash. If the new background is much lighter or darker than
the design's, set **Text colour** to match.

**Photos and videos are uploaded and shown exactly as they are** *(2026-10-24)*.
The dashboard used to scale photos and re-encode videos in the browser
(WebCodecs via `mediabunny`), and next/image re-encoded photos again on every
view; the client's designers now prepare every file for the web, and both
lossy passes were softening finished work, so both are gone:

- **Media library uploads** go to storage byte for byte (`uploadMedia` in
  `components/admin/cms/media-library.tsx`) and bypass the image optimiser
  (`isOptimizable` in `lib/media.ts`). Videos uploaded before this still have
  their phone file and still beside them and keep using them.
- **The link-preview image** is the one conversion left: a non-JPEG/PNG
  becomes a JPEG (`share-image.ts`), because WhatsApp cannot read WebP.
- **Dish photos** are still plated by the dashboard (a new image has to be
  made), now losslessly (WebP at quality 1.0, PNG on Safari), and the cut-out
  is stored as uploaded. They still go through the optimiser: the menu shows
  ~70 at once, so each screen is sent a copy sized for it.
- `CLIENT_GUIDE.md` §4 gives the designers export sizes.
- **Any shape fits any screen.** A photo or video always fills its frame,
  cropping what does not fit. Nothing is stretched or letterboxed, so a
  portrait phone video works in a landscape section. Background panels have a
  **Focus** setting (centre / top / bottom / left / right) for choosing which
  part stays in view.

Limits: photos 10 MB, videos 50 MB. Everything uploaded
appears in **Media Library** and can be reused anywhere.

In text fields, `*words*` sets words in italic (the brand accent, e.g.
"Bangkok, *quietly elevated.*"). In the legal pages, `[label](https://…)`
makes a link and lines starting with `- ` make a bulleted list.

## For developers

**No setup step.** The CMS stores its data in Supabase Storage, using the
same `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` the menu already
uses. Buckets are created on first use (`lib/cms/bucket.ts`):

- `site-content` (**private**): `<area>/published.json`, `<area>/draft.json`, `<area>/versions/*.json`, the login rate-limit counters, `menu-visibility/hidden.json` (dishes hidden with Menu Control's Hide button - `lib/menu-visibility.ts`) and `dish-photos/sweep.json` (the unused-photo sweep's state). Drafts are never readable with the public key.
- `site-media` (public): uploaded photos and videos, stored exactly as uploaded and uploaded straight to Supabase with signed URLs from `/api/admin/media`, so no file passes through Vercel's ~4.5 MB request limit. Videos the dashboard optimised before 2026-10-24 are `videos/<stem>.web.mp4` with `.web-sm.mp4` (phone) and `.web.webp` (still) beside them; `lib/media.ts` derives those, and `BackgroundVideo` lists the phone file as a `<source media="(max-width: 768px)">`.
- `dish-images` (public): Menu Control's dish photos - `dishes/*` the plated squares the menu shows, `originals/*` the transparent cut-outs they were made from. Plating happens in the browser (`components/admin/plate-dish.ts`, a port of `scripts/plate-dishes.py`); `/api/admin/upload` only signs the two paths. Photos no dish or content uses any more are deleted after 14 days unused, with their cut-out (`lib/dish-photo-sweep.ts`, run after menu saves at most once a day).

`ensureBucket` also corrects a bucket whose settings have drifted from `lib/cms/bucket.ts` (public flag, size limit, allowed types) - so `site-content` switched to public by hand is made private again on the next save.

**Menu page background.** `menu.page.background` (Website Content → Menu page → Whole page background) sits behind everything under the menu hero; sections without a background of their own show it through. See `components/menu-page-client.tsx`.

Where things live:

- `lib/cms/fields.ts`: the field vocabulary, plus `sanitizeDoc`, which every read and every save goes through. Stored content can only ever take the documented shape, and anything missing falls back to the code default.
- `lib/cms/docs/*.ts`: one file per area, with its TypeScript type, its defaults (today's content) and its schema (what the editor shows). **To make something new editable:** add it to the type, the defaults and the schema, then read it in the component. The dashboard form appears automatically.
- `lib/cms/content.ts`: `getSiteContent()`, the per-request read used by the layout and pages. It reads drafts in Draft Mode.
- `lib/cms/store.ts`: save / publish / discard / history / restore. Publishing calls `revalidatePath('/', 'layout')`, so every cached page refreshes at once.
- `components/cms/cms-ui.tsx`: `CmsButton`, `RichText`, `sectionBackground()` and `BackgroundLayers`, which the sections are built from.
- `components/admin/cms/*`: the dashboard editor.

Section keys (`hero`, `craft`, `story`…) are stored ids. Rename a section's
`title`, never its `key`, or its saved content is orphaned.

Admin auth is one shared login, hardened. The session cookie is signed,
expires after 7 days and is `__Host-` prefixed in production
(`lib/auth/session.ts`). The proxy checks it, and **every admin route handler
checks it again** (`requireAdmin` in `lib/auth/require-admin.ts`) together with
the request origin on writes - call it first in any new admin route. Failed
logins are delayed and rate limited per IP (8 per 15 minutes).
`ADMIN_SESSION_SECRET` is optional. Without it, the signing key is derived
from `ADMIN_PASSWORD` and the service key, so changing the password signs
everyone out.

Links typed into the CMS go through `safeHref` and media through
`safeMediaUrl` (`lib/cms/fields.ts`) before they reach the page (buttons and
media are also cleaned when saved), and the
Content-Security-Policy in `next.config.ts` blocks scripts from anywhere else.
