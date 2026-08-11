import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dish photos uploaded through the admin panel are served from Supabase
    // Storage, so next/image needs the bucket host allowlisted or every
    // uploaded dish renders as a broken image on the public menu.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "breqqsquwkxgjzrxbxso.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
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
