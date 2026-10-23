# QA suites

Automated checks that the security guarantees and the dashboard workflows
still hold. They run against a **local mock of Supabase** (`mock-supabase.mjs`),
so they need no Supabase project, no keys and no network.

```bash
npm ci                         # at the repo root, once
cd qa && npm install           # once
npx playwright install chromium   # once
npm test                       # builds the site, starts it, runs both suites
```

| Suite | What it proves |
|---|---|
| `security.mjs` (81 checks) | Every admin API refuses anonymous, forged, tampered and expired sessions; the Next.js `x-middleware-subrequest` bypass does nothing; login is slowed and locked after 8 failures; the session cookie is `__Host-`/HttpOnly/Secure/SameSite; cross-site writes are refused; the preview redirect cannot be pointed at another site; `javascript:`/`data:` links, `<script>` text and `</script>` in Google data are neutralised; the menu API validates input; security headers are present. |
| `cms-e2e.mjs` (44 checks) | Sign in; save draft, preview, exit preview, publish, history, reset; hide and show a homepage section; upload a photo (optimised) and a video; add a dish with a background-removed photo (plated in the browser), edit its badges, hide and show it (the overview counts follow), delete it (the photo sweep keeps a photo in use and removes the deleted one); set the footer's background, text and accent colours and check every line follows; sign out. No CSP violations or console errors. |
| `screenshots.mjs` | Not part of `npm test`. Screenshots every page at 360-1920 px and reports overflow, small tap targets and tiny text - run it before and after a design change and compare. |

Run these after upgrading Next.js or any dependency, and after any change to
`proxy.ts`, `lib/auth/*`, `app/api/*`, `lib/cms/*` or `next.config.ts`.

Set `QA_CHROMIUM=/path/to/chrome` to use a specific browser binary.
