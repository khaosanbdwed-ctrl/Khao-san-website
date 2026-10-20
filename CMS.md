# Khao San CMS

A content management system built into this site. From `/admin` the client can
change every word, photo, video, button, link, colour, font and background on
the website, reorder or hide homepage sections, add new sections, and manage
the menu. All of it is stored in Supabase.

---

## 1. One-time setup (about 5 minutes)

### a. Create the CMS tables in Supabase

Supabase dashboard → **SQL Editor** → **New query** → paste the whole of
`supabase/migrations/20261020000000_cms.sql` → **Run**.

It creates four tables (`cms_published`, `cms_drafts`, `cms_revisions`,
`cms_media`), two database functions (`cms_publish`, `menu_reorder`) and a
public storage bucket (`site-media`). It is safe to run again; it never
deletes data.

The menu tables must already exist. On a brand-new Supabase project, run the
menu schema first (`node scripts/setup-db.mjs` prints it), then this file.

Until this is run, the website keeps working and shows its built-in content.
The dashboard shows a "One-time setup needed" notice.

### b. Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only, never `NEXT_PUBLIC_`** |
| `ADMIN_USERNAME` | the shared admin login |
| `ADMIN_PASSWORD` | use a long one; changing it signs everyone out |
| `ADMIN_SESSION_SECRET` | optional, 32+ random characters |

Tick Production, Preview and Development, then **redeploy**. Image hosting
follows `NEXT_PUBLIC_SUPABASE_URL` automatically (`next.config.ts`), so moving
to another Supabase project needs no code change.

---

## 2. Using it (for the Khao San team)

Go to `yoursite.com/admin` and sign in.

- **Dashboard**: every editable area, with its status. An orange dot means
  that area has changes that are not live yet.
- **Editing**: the form is on the left and the real website is on the right.
  The preview updates as you type, and you can switch it between desktop,
  tablet and phone sizes.
- **Saving**: automatic. Changes are kept as a **draft** that visitors do not
  see.
- **Publish** (green button): puts the draft live on the website immediately.
- **History**: every publish is kept. *Restore* loads an old version as a
  draft so you can check it before publishing. *Original website content*
  brings back the site exactly as it was built.
- **Discard changes**: throws the draft away and goes back to what is live.
- **Drag and drop**: grab any item by the ⋮⋮ handle (or focus the handle and
  use the arrow keys). This works for homepage sections, gallery photos,
  dishes, menu categories, links, opening-hours lines and more.
- **Hide a section**: use the eye button. It leaves the page but keeps its
  content, so you can bring it back later.
- **Add a section**: "Add a section" at the bottom of the Homepage list.
- **Photos & videos**: "Choose image" lets you upload a new file, pick one
  you uploaded before, or pick one already built into the site. Large photos
  are resized automatically. Files that are in use cannot be deleted from the
  Media library, so you can't break a page by deleting one.
- **Menu dishes**: changes go live **immediately** (no draft step), as they
  always have. Dish photos can be normal JPG/PNG/WebP photos.
- **Text formatting**: `*italic*`, `**bold**`, `[link text](/menu)`.
- **Colours**: a readability check shows how legible each colour combination
  is. A combination that would make text unreadable cannot be published.

| Area | What it controls |
|---|---|
| Homepage | Every section: hero, brush divider, video + text, story & gallery & signature dishes, locations, gift cards, closing banner, plus any sections you add |
| Menu dishes | Dishes, categories, add-ons, photos, marks (Spicy, Signature...), order |
| Menu page | Headline, video, dish carousel, the notes at the bottom, the names of the dish marks |
| Header & footer | Menu links, buttons, opening hours, social media, copyright, legal links |
| Locations | Outlet names, addresses, phones, WhatsApp numbers, hours, photos (used on the homepage, in the footer and for Google) |
| Colours, fonts & backgrounds | Brand colours, heading/script/body fonts (Google Fonts or upload your own), background artwork |
| Site settings & SEO | Logo, main WhatsApp number, Google title & description, keywords, social sharing image, favicon, intro animation |
| Privacy / Terms | The legal pages |

---

## 3. Why it won't break

- **The site can never render a blank or broken page from bad content.**
  Every document read from the database is checked against the schema and
  repaired: missing values fall back to the original content, wrong types are
  replaced, unknown sections are skipped (`lib/cms/fields.ts`).
- **If Supabase is unreachable**, pages keep serving their last good cached
  version. A failed refresh never replaces a page.
- **If the CMS tables don't exist**, the site shows its original content.
- **Every value that reaches HTML or CSS** (links, image addresses, colours,
  font names) passes an allow-list (`lib/cms/safe.ts`). Text is rendered as
  text, never as HTML.
- **Uploads** are checked by their actual bytes, not their file name, and go
  straight to Supabase Storage. That avoids the hosting platform's
  request-size limit, so large videos upload too.
- **Login**: a signed, expiring session cookie (`lib/auth/session.ts`),
  checked by `proxy.ts` and again inside every admin API route, plus
  cross-site request blocking. The old cookie could be forged; that hole is
  closed.
- **Database permissions**: the public key can read published content only.
  Drafts, history and the media list are server-only, and only the server
  can publish (verified).
- **No new dependencies.** Drag-and-drop, the editor, the uploader and the
  preview are plain React. There is no CMS framework or editor library to go
  out of date, and the content is plain JSON in Postgres.

---

## 4. For developers

### Map

```
lib/cms/fields.ts        field types, normalize(), TypeScript inference
lib/cms/schema.ts        EVERY editable field + its default (the original site)
lib/cms/content.ts       per-document normalize + versioned migrations
lib/cms/store.ts         server: read published (and draft in preview)
lib/cms/admin-store.ts   server: save draft / publish / history
lib/cms/theme.ts         theme -> CSS custom properties, contrast checks
lib/cms/safe.ts          allow-list validators
lib/cms/inline.tsx       *italic* / **bold** / [link](url) -> React nodes
lib/cms/media.ts         upload types, size limits, byte signatures
lib/auth/                session signing, request guard
components/cms/          ContentProvider (+ live-preview bridge), section renderers, buttons
components/admin/        editor UI: fields, drag-and-drop, media picker, preview frame
app/admin/               dashboard, editor, menu manager, media library
app/api/admin/           content, media, menu, preview APIs
supabase/migrations/     the SQL
```

### How a page gets its content

`app/layout.tsx` calls `getSiteContent()`: one query for all published
documents, normalized against the schema. The result goes to
`<ContentProvider>`, and components read it with `useContent()`. Pages stay
static (ISR). Publishing calls `revalidatePath('/', 'layout')`, so the whole
site refreshes on the next request.

The preview iframe loads the real site with Next.js Draft Mode on (only
honoured alongside a valid admin session). The editor posts unsaved edits into
it with `postMessage`.

### Adding something editable

1. Add a field, with its default, to the right document or section in
   `lib/cms/schema.ts`.
2. Read it in the component with `useContent()`.

That's all: the editor form, validation and types follow from the schema.
Existing stored content picks up the default.

**Adding a section type**: add it to `SECTION_TYPES` in `schema.ts`, write a
renderer in `components/cms/sections/`, and register it in
`components/cms/home-sections.tsx`. Sections render with no wrapper element,
on purpose (the stylesheet uses adjacent-sibling selectors between sections).

**Renaming or re-meaning a field**: bump `CONTENT_VERSION` and add a step to
`MIGRATIONS` in `lib/cms/content.ts`. Never rename a document key.

### Testing locally without Supabase cloud

The CMS was verified against Postgres 16 + PostgREST + a Storage stand-in, with
browser tests covering login security, live preview, autosave, publish,
drag-and-drop, hide/add sections, theme + contrast guard, uploads (including a
renamed fake file being rejected), history restore, the menu manager, every
content area, and a pixel comparison proving the default content renders the
site exactly as before. `supabase start` (Supabase CLI + Docker) is the
easiest equivalent.

---

## 5. Keeping it running for years

- **Supabase free projects pause after a week with no activity.** A paused
  project means published content cannot refresh (cached pages keep serving)
  and the admin cannot save. For a live business site, use the Pro plan or
  make sure something touches the project regularly.
- **Backups**: every publish is kept in `cms_revisions`. Supabase Pro adds
  daily database backups. Uploaded files live in the `site-media` bucket.
- **Updating Next.js / React**: the CMS uses only stable public APIs
  (`draftMode`, `revalidatePath`, route handlers, `proxy.ts`). After a major
  upgrade, run `npm run build` and click through `/admin`.
- **Fonts**: the demo Camera Obscura file can now be replaced from the admin
  (Colours, fonts & backgrounds → Headings → Upload a font file) once the
  licensed file is bought, or by replacing `app/fonts/` as before.
