import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import { ContentProvider } from "@/components/cms/content-context";
import { getSiteContent } from "@/lib/cms/store";
import { themeToCss } from "@/lib/cms/theme";

/* Every page reads its words, images and theme from the CMS (lib/cms). Pages
   are static and cached; publishing in /admin revalidates them on demand.
   The hour is only a backstop for edits made directly in Supabase. */
export const revalidate = 3600;

// Playfair Display was removed on 2026-08-09. It was declared with four
// weights in two styles — eight font files — and nothing on the site set it.
// Its only remaining reference was as the fallback inside --font-script,
// behind Good Brush, so it would only ever have rendered if a local font
// failed to load. Two other tokens that pointed at it (--font-body,
// --font-quote) were dead. Montserrat carries the fallback now.

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

// Client brand fonts.
//
// ⚠ LAUNCH BLOCKER: CameraObscura.otf on disk is the vendor's DEMO /
// PERSONAL-USE build, not a purchased commercial licence, and it is the
// site's primary display face on every page. Replace it with the licensed
// file before this goes public — same filename, no code change needed.
// Its demo build also ships deliberately sabotaged numerals, which is why
// `declarations` below excludes U+0030-0039 so digits fall through to
// Montserrat instead of rendering as watermark text. Delete that
// `declarations` line once the licensed file is installed.
//
// Bellavoir Delight was removed on 2026-08-09: it had zero references in
// globals.css (its two former uses moved to the display face and the sans
// italic for legibility), yet it was still registered here and therefore
// downloaded by every visitor — shipping an unlicensed personal-use font
// for no rendering benefit at all.
// Both faces are subset to basic Latin (U+0020-007E) and converted to woff2.
// next/font/local does not subset local files, so the full OTFs were shipping
// every glyph in the face: Good Brush went 163 KB -> 54 KB, Camera Obscura
// 12.7 KB -> 6.2 KB. Regenerate with fontTools if the brand ever needs
// characters outside basic Latin; the source .otf files are kept alongside.
const cameraObscura = localFont({
  src: "./fonts/CameraObscura.woff2",
  variable: "--font-camera-obscura",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0000-002F, U+003A-10FFFF" }],
});

const goodBrush = localFont({
  src: "./fonts/GoodBrush9.woff2",
  variable: "--font-good-brush",
  display: "swap",
});

/* ⚠ `viewportFit: 'cover'` IS NOT COSMETIC HERE - IT IS WHAT MAKES THE SAFE
   AREA INSETS REAL. Two rules in this codebase already position against
   `env(safe-area-inset-*)`: the menu category index sits at
   `right: max(14px, env(safe-area-inset-right))` and the mobile category bar
   pads its bottom by `env(safe-area-inset-bottom)`. Without `viewport-fit`
   the browser reports every inset as 0, so both were quietly doing nothing on
   exactly the notched phones they were written for, and the bar sat under the
   home indicator.

   No `maximumScale` or `userScalable` here on purpose. Locking zoom is the
   usual companion to this line and it breaks pinch-to-zoom for anyone who
   needs it; the layout is built to survive zooming instead. */
export async function generateViewport(): Promise<Viewport> {
  const { content } = await getSiteContent();
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: content.theme.colors.blue,
  };
}

/** Local paths can contain spaces; metadata URLs must not. */
const metaUrl = (src: string) => (src.startsWith('/') ? encodeURI(src) : src);

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSiteContent();
  const { site } = content;
  let base: URL;
  try { base = new URL(site.siteUrl); } catch { base = new URL('https://khaosan.com.bd'); }
  const shareImage = site.seo.shareImage.src;
  return {
    metadataBase: base,
    title: site.seo.title,
    description: site.seo.description,
    keywords: site.seo.keywords,
    openGraph: {
        title: site.seo.shareTitle,
        description: site.seo.shareDescription,
        url: base.toString().replace(/\/$/, ''),
        siteName: site.siteName,
        images: shareImage ? [
          {
            url: metaUrl(shareImage),
            width: 1920,
            height: 1080,
            alt: site.seo.shareImage.alt,
          },
        ] : [],
        type: "website",
        locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.shareTitle,
      description: site.seo.shareDescriptionShort,
      images: shareImage ? [metaUrl(shareImage)] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { content, preview } = await getSiteContent();
  const favicon = content.site.favicon.src;
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cameraObscura.variable} ${goodBrush.variable}`}
      // data-ignition is deliberately set by an inline script before hydration
      // (see the script below) - same sanctioned pattern as no-flash theme
      // scripts. SSR can't know it, so this attribute intentionally differs
      // client-side; suppress the (expected, harmless) hydration warning.
      suppressHydrationWarning
    >
      <head>
          {favicon && <link rel="icon" href={favicon} />}
          {/*
            Sets data-ignition before first paint (classic no-FOUC pattern -
            the same technique dark-mode theme scripts use: a plain synchronous
            script tag, not next/script, which is documented for external
            critical resources, not inline pre-hydration DOM state) so the
            homepage's opening sequence never flashes unstyled. Runs once per
            browser session, and only on the homepage - arriving at the
            flagship, not every page. suppressHydrationWarning on <html> covers
            the resulting (expected, harmless) attribute mismatch.
          */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var isHome=${content.site.intro ? "location.pathname==='/'" : 'false'};var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=sessionStorage.getItem('khaosan-ignited')==='1';document.documentElement.setAttribute('data-ignition',(isHome&&!reduced&&!seen)?'igniting':'lit');}catch(e){document.documentElement.setAttribute('data-ignition','lit');}})();`,
            }}
          />
      </head>
      {/*
        Browser extensions write their own attributes onto <body> before React
        hydrates - Grammarly adds data-new-gr-c-s-check-loaded and
        data-gr-ext-installed, and password managers and ad blockers do the
        same. The server HTML has none of them, so React reports an attribute
        mismatch on <body> that no code change here can prevent: it is the
        visitor's extension, not the app.

        suppressHydrationWarning on <html> above does NOT cover this. The flag
        applies only to the element it is set on - it does not cascade to
        descendants - so <body> needs its own.

        Scope: this silences attribute/text mismatch warnings on the <body>
        element itself only. Real mismatches inside ClientWrapper and the page
        tree are still reported normally, so this does not hide app bugs.
      */}
      <body suppressHydrationWarning>
        <ContentProvider initial={content} themeCss={themeToCss(content.theme)} preview={preview}>
          <ClientWrapper>
              {children}
          </ClientWrapper>
        </ContentProvider>
      </body>
    </html>
  );
}
