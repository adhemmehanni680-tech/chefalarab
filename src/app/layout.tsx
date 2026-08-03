import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Aref_Ruqaa, Cairo } from "next/font/google";
import "./globals.css";

import Header from "./Components/header/Header";
import Footer from "./Components/footer/Footer";
import RootClient from "./RootClient";

import {
  adsEnabled,
  adsenseClient,
} from "@/lib/ads";

/* =========================================================
   Fonts
   ========================================================= */

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

/* =========================================================
   Site configuration
   ========================================================= */

const SITE_URL = "https://chefalarab.com";

/*
 * نستخدم Environment Variable أولًا.
 * ولو غير موجود، نستخدم رقم GTM الاحتياطي.
 */
const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() ||
  "GTM-P8MZTC3W";

const hasValidGtmId =
  /^GTM-[A-Z0-9]+$/i.test(GTM_ID);

/* =========================================================
   Viewport
   ========================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",

  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#101827",
    },
  ],
};

/* =========================================================
   Metadata
   ========================================================= */

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

  authors: [
    {
      name: "Adhem Mehanni",
      url: SITE_URL,
    },
  ],

  creator: "شيف العرب",
  publisher: "شيف العرب",

  alternates: {
    canonical: "/",
  },

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
    description:
      "وصفات عربية وعالمية مجربة بخطوات واضحة.",
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
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  other: {
    "google-adsense-account": adsenseClient,
  },

  verification: {
    google:
      "tdSwWzOnOuUsvJhYhKTI616MoDw3Vb4Xvle7no2xtas",
  },
};

/* =========================================================
   Root layout
   ========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className={`
          ${cairo.variable}
          ${arefRuqaa.variable}
          flex min-h-screen flex-col
          bg-white text-gray-900 antialiased
          dark:bg-gray-900 dark:text-gray-100
        `}
      >
        {/* ===============================================
            GTM fallback for browsers without JavaScript
            =============================================== */}

        {hasValidGtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              title="Google Tag Manager"
              style={{
                display: "none",
                visibility: "hidden",
              }}
            />
          </noscript>
        )}

        {/* ===============================================
            Google Consent Mode v2

            المستخدم الجديد أو الرافض:
            Analytics وAds = denied

            المستخدم الذي وافق سابقًا:
            Analytics وAds = granted
            =============================================== */}

        <Script
          id="google-consent-default"
          strategy="beforeInteractive"
        >
          {`
            (function () {
              window.dataLayer =
                window.dataLayer || [];

              window.gtag =
                window.gtag ||
                function () {
                  window.dataLayer.push(arguments);
                };

              var storedConsent = null;

              try {
                storedConsent =
                  window.localStorage.getItem(
                    "cookie_consent_v1"
                  );
              } catch (error) {
                storedConsent = null;
              }

              var consentGranted =
                storedConsent === "accepted";

              var optionalStorageState =
                consentGranted
                  ? "granted"
                  : "denied";

              window.gtag(
                "consent",
                "default",
                {
                  ad_storage:
                    optionalStorageState,

                  analytics_storage:
                    optionalStorageState,

                  ad_user_data:
                    optionalStorageState,

                  ad_personalization:
                    optionalStorageState,

                  personalization_storage:
                    optionalStorageState,

                  functionality_storage:
                    "granted",

                  security_storage:
                    "granted",

                  wait_for_update: 500
                }
              );
            })();
          `}
        </Script>

        {/* ===============================================
            Theme initialization
            =============================================== */}

        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >
          {`
            (function () {
              try {
                var savedTheme =
                  window.localStorage.getItem(
                    "theme"
                  );

                var isDark = savedTheme
                  ? savedTheme === "dark"
                  : window.matchMedia(
                      "(prefers-color-scheme: dark)"
                    ).matches;

                document.documentElement
                  .classList
                  .toggle("dark", isDark);

                document.documentElement
                  .style
                  .colorScheme =
                    isDark ? "dark" : "light";
              } catch (error) {}
            })();
          `}
        </Script>

        {/* ===============================================
            Google Tag Manager

            يعمل سواء كانت الإعلانات مفعلة أم لا.
            Consent Mode هو المسؤول عن السماح بالقياس.
            =============================================== */}

        {hasValidGtmId && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
          >
            {`
              (function (
                windowObject,
                documentObject,
                scriptTag,
                dataLayerName,
                containerId
              ) {
                windowObject[dataLayerName] =
                  windowObject[dataLayerName] || [];

                windowObject[dataLayerName].push({
                  "gtm.start":
                    new Date().getTime(),
                  event: "gtm.js"
                });

                var firstScript =
                  documentObject
                    .getElementsByTagName(
                      scriptTag
                    )[0];

                var gtmScript =
                  documentObject
                    .createElement(scriptTag);

                var dataLayerQuery =
                  dataLayerName !== "dataLayer"
                    ? "&l=" + dataLayerName
                    : "";

                gtmScript.async = true;

                gtmScript.src =
                  "https://www.googletagmanager.com/gtm.js?id=" +
                  containerId +
                  dataLayerQuery;

                firstScript.parentNode.insertBefore(
                  gtmScript,
                  firstScript
                );
              })(
                window,
                document,
                "script",
                "dataLayer",
                "${GTM_ID}"
              );
            `}
          </Script>
        )}

        {/* ===============================================
            Google AdSense

            لا يتم تحميله نهائيًا إلا عندما تكون:
            NEXT_PUBLIC_ADS_ENABLED=true
            =============================================== */}

        {adsEnabled && (
          <Script
            id="google-adsense"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}

        <Header />

        <main className="min-h-0 flex-1">
          {children}
        </main>

        <Footer />

        <RootClient />
      </body>
    </html>
  );
}