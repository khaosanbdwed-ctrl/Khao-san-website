import type { NextConfig } from "next";

// The project's own Supabase host, from the same variable the app uses, so a
// new Supabase project (or a local one) does not need this file edited. The
// original project's host stays listed explicitly as well.
const supabaseHost = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return { protocol: u.protocol.replace(":", "") as "http" | "https", hostname: u.hostname, port: u.port };
  } catch {
    return null;
  }
})();

/* Content-Security-Policy: the browser refuses anything this list does not
   name, so injected markup cannot load a script from elsewhere, post a form to
   another site, or frame the dashboard.

   - Scripts: this site only. 'unsafe-inline' is required by Next's own inline
     bootstrapping of statically cached pages (a per-request nonce would make
     every page dynamic) and by the ignition script in app/layout.tsx.
   - Photos and videos: any https address, because the dashboard lets an editor
     paste a link to media hosted elsewhere.
   - connect-src includes Supabase: the dashboard uploads straight to storage.
   - worker-src blob: - the in-browser video optimiser runs workers from blobs.
   Production only: the dev server needs eval and a websocket for hot reload. */
const supabaseOrigin = supabaseHost ? `${supabaseHost.protocol}://${supabaseHost.hostname}${supabaseHost.port ? `:${supabaseHost.port}` : ''}` : '';
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https: ${supabaseOrigin}`.trim(),
  `media-src 'self' blob: https: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} https://*.supabase.co`.trim(),
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
].join('; ');

const nextConfig: NextConfig = {
  // Do not advertise the framework (and so its version's known issues).
  poweredByHeader: false,

  images: {
    // Dish photos and every photo uploaded through the website CMS are served
    // from Supabase Storage, so next/image needs the bucket host allowlisted
    // or every uploaded image renders broken on the public site.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "breqqsquwkxgjzrxbxso.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(supabaseHost
        ? [{ ...supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
    // A local Supabase (127.0.0.1) is a private address, which the optimiser
    // refuses unless told otherwise. Development only.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    // The quality every served image is re-encoded at. Next's default is 75,
    // and every photo has already been compressed once on upload
    // (components/admin/cms/optimize-media.ts), so 75 was a second lossy pass
    // that visibly softened them. With a single allowed value, every <Image>
    // is served at it without a per-component `quality` prop. Measured on a
    // 5 MP photo at 1920px: 75 -> 33.1 dB PSNR / ~290 KB, 85 -> 36.1 dB /
    // ~480 KB.
    qualities: [85],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: nothing on this site is meant to be framed.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop browsers second-guessing declared content types.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the origin to third parties, never the full path.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site asks for none of these; deny them by default.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Force HTTPS for two years once served over TLS in production.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // A page opened from this site cannot reach back into it.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: csp }]
            : []),
        ],
      },
      {
        // The dashboard and its API: never cached by a browser or a shared
        // proxy (a signed-out visitor must not be served a signed-in page from
        // cache), and never indexed even if a link to it leaks.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
