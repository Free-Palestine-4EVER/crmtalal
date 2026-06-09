import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "./providers";
import { getInitialLocale } from "@/i18n/server";
import { dirFor } from "@/i18n";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.crmtalal.website";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Edarah · Real Estate Valuation — إدارة للتقييم العقاري",
    template: "%s · Edarah",
  },
  description:
    "TAQEEM-accredited real estate valuation & advisory across Saudi Arabia and the region. Request, track, and receive IVS-compliant valuation reports.",
  applicationName: "Edarah",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Edarah",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: true },
  keywords: [
    "real estate valuation",
    "property appraisal",
    "TAQEEM",
    "تقييم عقاري",
    "Saudi Arabia",
    "Edarah",
    "إدارة",
  ],
  openGraph: {
    title: "Edarah · Real Estate Valuation",
    description:
      "The benchmark in real estate valuation — accurate values, proven expertise.",
    url: SITE_URL,
    siteName: "Edarah",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#101218",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getInitialLocale();
  const dir = dirFor(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ink-900 text-[#d7dae2]">
        {/* Hydration rescue — ES5-safe, runs even if the React bundle never
            loads (slow networks, old browsers, blocked CDNs). If hydration
            hasn't flagged itself within 6s, force-reveal every element that
            SSR'd in its pre-animation hidden state so the page is never blank. */}
        <Script id="hydration-rescue" strategy="beforeInteractive">
          {"setTimeout(function(){try{if(document.documentElement.getAttribute('data-hydrated')==='1')return;var n=document.querySelectorAll('[style]');for(var i=0;i<n.length;i++){var s=n[i].style;if(s.opacity==='0'){s.opacity='1';s.transform='none';}}}catch(e){}},6000);"}
        </Script>
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
