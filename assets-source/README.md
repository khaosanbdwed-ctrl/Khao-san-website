# assets-source

Source material that is kept in the repository but **not deployed** - nothing
here is under `public/`, so none of it ships with the site.

| Folder | What | Used by |
|---|---|---|
| `menu-cutouts/` | The original 73 dish cut-outs (transparent background), one folder per menu category | `scripts/plate-dishes.py`, which turns them into the plated photos in `public/assets/menu-plated/`; the dashboard QA suite uploads one as a test dish |

The menu's database rows still store these files' old paths
(`/assets/Menu/KS Menu Webp/...`); `app/menu/page.tsx` and Menu Control rewrite
them to the plated photo, so the path is only a key and the file never needs
to be served. Dishes added through Menu Control are plated in the browser and
stored in Supabase Storage instead - see `lib/cms/bucket.ts`.
