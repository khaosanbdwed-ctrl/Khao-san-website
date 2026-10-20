# Website CMS

The dashboard at **/admin** (same login as Menu Control) controls the site's
content: every word, photo, video, background, link, outlet address, opening
hour, show/hide setting and section order. The **design** (layout, fonts,
spacing, animation) stays in the code. Until something is edited and
published, the site renders exactly as designed: the code defaults *are* the
current content.

## For the people editing the site

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

Photos up to 10 MB (JPG, PNG, WebP, AVIF, GIF); videos up to 50 MB (MP4
recommended, 720p is plenty for a background). Everything uploaded appears in
**Media Library** and can be reused anywhere.

In text fields, `*words*` sets words in italic (the brand accent, e.g.
"Bangkok, *quietly elevated.*"). In the legal pages, `[label](https://…)`
makes a link and lines starting with `- ` make a bulleted list.

## For developers

**No setup step.** The CMS stores its data in Supabase Storage, using the
same `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` the menu already
uses. Buckets are created on first use (`lib/cms/bucket.ts`):

- `site-content` (**private**): `<area>/published.json`, `<area>/draft.json`, `<area>/versions/*.json`, and the login rate-limit counters. Drafts are never readable with the public key.
- `site-media` (public): uploaded photos and videos. The browser uploads straight to Supabase with a signed URL from `/api/admin/media`, so large videos never pass through Vercel's ~4.5 MB request limit.
- `dish-images` (public): Menu Control's dish photos. It is now created automatically too (it used to be an undocumented manual step).

Where things live:

- `lib/cms/fields.ts`: the field vocabulary, plus `sanitizeDoc`, which every read and every save goes through. Stored content can only ever take the documented shape, and anything missing falls back to the code default.
- `lib/cms/docs/*.ts`: one file per area, with its TypeScript type, its defaults (today's content) and its schema (what the editor shows). **To make something new editable:** add it to the type, the defaults and the schema, then read it in the component. The dashboard form appears automatically.
- `lib/cms/content.ts`: `getSiteContent()`, the per-request read used by the layout and pages. It reads drafts in Draft Mode.
- `lib/cms/store.ts`: save / publish / discard / history / restore. Publishing calls `revalidatePath('/', 'layout')`, so every cached page refreshes at once.
- `components/cms/cms-ui.tsx`: `CmsButton`, `RichText`, `sectionBackground()` and `BackgroundLayers`, which the sections are built from.
- `components/admin/cms/*`: the dashboard editor.

Section keys (`hero`, `craft`, `story`…) are stored ids. Rename a section's
`title`, never its `key`, or its saved content is orphaned.

Admin auth is one shared login, hardened. The session cookie is signed and
expires (`lib/auth/session.ts`), the proxy checks it plus the request origin on
writes, and failed logins are rate limited per IP (8 per 15 minutes).
`ADMIN_SESSION_SECRET` is optional. Without it, the signing key is derived
from `ADMIN_PASSWORD` and the service key, so changing the password signs
everyone out.
