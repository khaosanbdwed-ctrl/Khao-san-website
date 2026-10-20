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

const nextConfig: NextConfig = {
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
