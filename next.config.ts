import type { NextConfig } from "next";

/* Photos uploaded through the admin panel are served from Supabase Storage,
   so next/image needs that host allowlisted or every upload renders broken.

   ⚠ This used to name one project's host literally. Moving to a different
   Supabase project (a new NEXT_PUBLIC_SUPABASE_URL) would then have broken
   every uploaded image on the site with no code change to point at. The host
   is now read from the same environment variable the app connects with, plus
   a wildcard for any *.supabase.co project. */
const supabaseUrl = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
  } catch {
    return null;
  }
})();
const isLocalSupabase = !!supabaseUrl && ["localhost", "127.0.0.1"].includes(supabaseUrl.hostname);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseUrl
        ? [{
            protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/object/public/**",
          }]
        : []),
    ],
    // Only for a Supabase running on this machine (local development).
    dangerouslyAllowLocalIP: isLocalSupabase,
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
        ],
      },
    ];
  },
};

export default nextConfig;
