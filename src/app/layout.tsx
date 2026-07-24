import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Aref_Ruqaa, Cairo } from "next/font/google";
import "./globals.css";

import Header from "./Components/header/Header";
import Footer from "./Components/footer/Footer";
import RootClient from "./RootClient";
import { adsEnabled } from "@/lib/ads";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
  preload: true,
});

const SITE_URL = "https://chefalarab.com";
const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9717868267549745";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#101827" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "شيف العرب",
    template: "%s | شيف العرب",
  },
  description:
    "اكتشف ألذ وأحدث الوصفات العربية الأصيلة والعالمية بخطوات واضحة ومقادير دقيقة للطبخ المنزلي والحلويات والمشروبات.",
  applicationName: "شيف العرب",
  keywords: [
    "شيف العرب",
    "وصفات عربية",
    "وصفات طبخ",
    "أكلات مصرية",
    "أكلات شرقية",
    "وصفات عالمية",
    "سلطات",
    "مخللات",
    "حلويات",
    "مثلجات",
    "مشروبات",
    "وصفات سهلة وسريعة",
  ],
  authors: [{ name: "Adhem Mehanni", url: SITE_URL }],
  creator: "شيف العرب",
  publisher: "شيف العرب",
  alternates: { canonical: "/" },
  openGraph: {
    title: "شيف العرب",
    description:
      "وصفات عربية وعالمية مجربة بخطوات واضحة ومقادير دقيقة.",
    url: "/",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "شيف العرب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "شيف العرب",
    description: "وصفات عربية وعالمية مجربة بخطوات واضحة.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  other: {
    "google-adsense-account": "ca-pub-9717868267549745",
  },
  verification: {
    google: "tdSwWzOnOuUsvJhYhKTI616MoDw3Vb4Xvle7no2xtas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className={`${cairo.variable} ${arefRuqaa.variable} flex min-h-screen flex-col bg-white text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var saved=localStorage.getItem('theme');var dark=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';}catch(e){}})();`}
        </Script>

        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
        </Script>

        {GTM_ID && (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                title="Google Tag Manager"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}

        {adsEnabled && (
          <Script
            id="google-adsense"
            strategy="lazyOnload"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}

        <Header />
        <div className="min-h-0 flex-1">{children}</div>
        <Footer />
        <RootClient />
      </body>
    </html>
  );
}
