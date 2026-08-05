import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import { ReservationProvider } from "@/components/ReservationContext";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://khaosan.com.bd'),
  title: "Khao San | The Thai Way in Dhaka",
  description: "Experience the uncompromising standard of authentic Thai Street Food at Khao San Dhaka. A curated dining experience in Gulshan, Dhanmondi, and Uttara.",
  keywords: ["Thai Food Dhaka", "Khao San", "Best Thai Restaurant", "Fine Dining", "Tom Yum Goong", "Pad Thai", "Gulshan Restaurant"],
  openGraph: {
      title: "Khao San | The Thai Way",
      description: "An evening of unforgettable Thai hospitality. Experience the uncompromising standard of authentic Thai cuisine in Dhaka.",
      url: "https://khaosan.com.bd",
      siteName: "Khao San",
      images: [
        {
          url: "/assets/Background-20260709T183540Z-2-001/Background/Elephant%2016%20by%209%20Ratio%20Landscape.webp",
          width: 1920,
          height: 1080,
          alt: "Khao San Restaurant",
        },
      ],
      type: "website",
      locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khao San | The Thai Way",
    description: "Experience the uncompromising standard of authentic Thai cuisine in Dhaka.",
    images: ["/assets/Background-20260709T183540Z-2-001/Background/Elephant%2016%20by%209%20Ratio%20Landscape.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${montserrat.variable}`}
      // data-ignition is deliberately set by an inline script before hydration
      // (see the script below) - same sanctioned pattern as no-flash theme
      // scripts. SSR can't know it, so this attribute intentionally differs
      // client-side; suppress the (expected, harmless) hydration warning.
      suppressHydrationWarning
    >
      <head>
          <link rel="icon" type="image/webp" href="/assets/Logos-20260709T183558Z-2-001/Logos/Dark Blue.webp" />
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
              __html: `(function(){try{var isHome=location.pathname==='/';var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=sessionStorage.getItem('khaosan-ignited')==='1';document.documentElement.setAttribute('data-ignition',(isHome&&!reduced&&!seen)?'igniting':'lit');}catch(e){document.documentElement.setAttribute('data-ignition','lit');}})();`,
            }}
          />
      </head>
      <body>
        <ReservationProvider>
            <ClientWrapper>
                {children}
            </ClientWrapper>
        </ReservationProvider>
      </body>
    </html>
  );
}
