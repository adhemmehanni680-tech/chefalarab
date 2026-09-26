// /src/app/layout.tsx

import type {
  Metadata,
  Viewport,
} from "next";

import type {
  ReactNode,
} from "react";

import Script from "next/script";

import {
  Aref_Ruqaa,
  Cairo,
} from "next/font/google";

import "./globals.css";

import Header from "./Components/header/Header";
import Footer from "./Components/footer/Footer";
import RootClient from "./RootClient";
import AdSenseScript from "./Components/AdSenseScript";

import {
  adsenseClient,
} from "@/lib/ads";

/* =========================================================
   Fonts
   ========================================================= */

const cairo = Cairo({
  subsets: [
    "arabic",
    "latin",
  ],

  variable:
    "--font-cairo",

  display:
    "swap",

  preload:
    true,
});

const arefRuqaa =
  Aref_Ruqaa({
    subsets: [
      "arabic",
    ],

    weight: [
      "400",
      "700",
    ],

    variable:
      "--font-aref-ruqaa",

    display:
      "swap",

    /*
     * Cairo هو الخط الأساسي،
     * لذلك لا نحتاج تحميل Aref Ruqaa
     * مسبقًا على كل صفحة.
     */
    preload:
      false,
  });

/* =========================================================
   Site
   ========================================================= */

const SITE_URL = "https://chefalarab.com";

/* =========================================================
   Google Tag Manager
   ========================================================= */

const GTM_ID =
  process.env
    .NEXT_PUBLIC_GTM_ID
    ?.trim() ||
  "GTM-P8MZTC3W";

const hasValidGtmId =
  /^GTM-[A-Z0-9]+$/i.test(
    GTM_ID,
  );

/* =========================================================
   Google AdSense
   ========================================================= */

const ADSENSE_CLIENT =
  adsenseClient?.trim() ??
  "";

const hasValidAdsenseClient =
  /^ca-pub-\d+$/i.test(
    ADSENSE_CLIENT,
  );

/* =========================================================
   Theme initialization

   Runs before React hydration to prevent:
   - theme flash
   - dark/light mismatch
   - hydration mismatch
   ========================================================= */

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var root =
      document.documentElement;

    var storageKey =
      "theme";

    var savedTheme =
      null;

    try {
      savedTheme =
        window.localStorage.getItem(
          storageKey
        );
    } catch (storageError) {
      savedTheme =
        null;
    }

    var theme;

    if (
      savedTheme === "dark" ||
      savedTheme === "light"
    ) {
      theme =
        savedTheme;
    } else {
      theme =
        window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light";
    }

    var isDark =
      theme === "dark";

    root.classList.toggle(
      "dark",
      isDark
    );

    root.style.colorScheme =
      isDark
        ? "dark"
        : "light";

    root.setAttribute(
      "data-theme",
      theme
    );
  } catch (error) {
    var root =
      document.documentElement;

    root.classList.remove(
      "dark"
    );

    root.style.colorScheme =
      "light";

    root.setAttribute(
      "data-theme",
      "light"
    );
  }
})();
`;

/* =========================================================
   Viewport
   ========================================================= */

export const viewport:
  Viewport = {
  width:
    "device-width",

  initialScale:
    1,

  viewportFit:
    "cover",

  themeColor: [
    {
      media:
        "(prefers-color-scheme: light)",

      color:
        "#ffffff",
    },
    {
      media:
        "(prefers-color-scheme: dark)",

      color:
        "#0b1220",
    },
  ],
};

/* =========================================================
   Metadata
   ========================================================= */

export const metadata:
  Metadata = {
  metadataBase:
    new URL(
      SITE_URL,
    ),

  title: {
    default:
      "شيف العرب",

    template:
      "%s | شيف العرب",
  },

  description:
    "اكتشف ألذ وأحدث الوصفات العربية الأصيلة والعالمية بخطوات واضحة ومقادير دقيقة للطبخ المنزلي والحلويات والمشروبات.",

  applicationName:
    "شيف العرب",

keywords: [
  // العربية
  "شيف العرب",
  "وصفات طبخ",
  "وصفات عربية",
  "وصفات مصرية",
  "أكلات مصرية",
  "وصفات عالمية",
  "وصفات سهلة",
  "وصفات حلويات",
  "وصفات سلطات",
  "وصفات مشروبات",
  "مخللات",
  "مثلجات",
  "طريقة عمل",
  "وصفات",
  "المطبخ العربي",
  "المطبخ الآسيوي",
  "المطبخ الأمريكي",
  "المطبخ الأوروبي",
  "المطبخ اللاتيني",
  "المطبخ الأفريقي",
  "المطبخ الرمضاني",
  "حلويات",
  "الحلويات الشرقية",
  "المخبوزات والمعجنات",
  "مشروبات ساخنة",
  "وجبات سريعة",
  "سندويشات",
  "أطباق رئيسية",
  "آيس كريم",
  "السلطات",
  "أكلات نباتية",
  "الغداء",
  "العشاء",
  "الإفطار",
  "يخنات",
  "محاشي",
  "شوربة",
  "أكلات عيد الأضحى",
  "عصائر",

  // English
  "chefalarab",
  "Arabic recipes",
  "Arabic cooking recipes",
  "Egyptian recipes",
  "Egyptian food",
  "international recipes",
  "easy recipes",
  "dessert recipes",
  "salad recipes",
  "drink recipes",
  "pickle recipes",
  "frozen dessert recipes",
  "how to cook",
  "recipes",
  "Arabic cuisine",
  "Asian cuisine",
  "American cuisine",
  "European cuisine",
  "Latin American cuisine",
  "African cuisine",
  "Ramadan recipes",
  "desserts",
  "Middle Eastern desserts",
  "baked goods and pastries",
  "hot drinks",
  "quick meals",
  "sandwich recipes",
  "main dishes",
  "ice cream recipes",
  "salads",
  "vegetarian recipes",
  "lunch recipes",
  "dinner recipes",
  "breakfast recipes",
  "stew recipes",
  "stuffed vegetables",
  "soup recipes",
  "Eid al-Adha recipes",
  "juice recipes",
],

  authors: [
    {
      name:
        "شيف العرب",

      url:
        SITE_URL,
    },
  ],

  creator:
    "شيف العرب",

  publisher:
    "شيف العرب",

  alternates: {
    canonical:
      "/",
  },

  openGraph: {
    title:
      "شيف العرب",

    description:
      "وصفات عربية وعالمية مجربة بخطوات واضحة ومقادير دقيقة.",

    url:
      "/",

    siteName:
      "شيف العرب",

    type:
      "website",

    locale:
      "ar_AR",

    images: [
      {
        url:
          "/og-image.jpg",

        width:
          1200,

        height:
          630,

        alt:
          "شيف العرب",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "شيف العرب",

    description:
      "وصفات عربية وعالمية مجربة بخطوات واضحة.",

    images: [
      "/og-image.jpg",
    ],
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },

  manifest:
    "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url:
          "/favicon.ico",

        sizes:
          "any",

        type:
          "image/x-icon",
      },
    ],

    apple: [
      {
        url:
          "/apple-touch-icon.png",

        sizes:
          "180x180",

        type:
          "image/png",
      },
    ],
  },

  other:
    hasValidAdsenseClient
      ? {
          "google-adsense-account":
            ADSENSE_CLIENT,
        }
      : {},

  verification: {
    google:
      "tdSwWzOnOuUsvJhYhKTI616MoDw3Vb4Xvle7no2xtas",
  },
};

/* =========================================================
   Root Layout
   ========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children:
    ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
    >
      <head>
        {/* =================================================
            Theme initialization
            ================================================= */}

        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html:
              THEME_INIT_SCRIPT,
          }}
        />

        {/* =================================================
            Google AdSense

            Consent Mode default يتم تهيئته داخل:
            src/instrumentation-client.ts

            AdSenseScript مسؤول عن تحميل AdSense
            فقط في الصفحات المسموح بها.
            ================================================= */}

        <AdSenseScript />
      </head>

      <body
        className={`
          ${cairo.variable}
          ${arefRuqaa.variable}

          flex
          min-h-screen
          flex-col

          bg-white
          text-gray-900

          antialiased

          transition-colors
          duration-300

          dark:bg-[#0b1220]
          dark:text-gray-100
        `}
      >
        {/* =================================================
            Accessibility: Skip to content

            مخفي تمامًا بشكل طبيعي.
            يظهر فقط عند الوصول إليه بالـ Tab.
            ================================================= */}

        <a
          href="#main-content"
          className="
            fixed
            left-1/2
            top-0
            z-[9999]

            -translate-x-1/2
            -translate-y-[125%]

            rounded-b-xl

            bg-orange-600

            px-5
            py-2.5

            text-sm
            font-black
            text-white

            shadow-xl
            shadow-black/20

            transition-transform
            duration-150

            focus:translate-y-0
            focus:outline-none

            focus-visible:translate-y-0
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white
            focus-visible:ring-offset-2
            focus-visible:ring-offset-orange-600
          "
        >
          تخطي إلى المحتوى الرئيسي
        </a>

        {/* =================================================
            GTM noscript
            ================================================= */}

        {hasValidGtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(
                GTM_ID,
              )}`}
              height="0"
              width="0"
              title="Google Tag Manager"
              aria-hidden="true"
              tabIndex={-1}
              style={{
                display:
                  "none",

                visibility:
                  "hidden",
              }}
            />
          </noscript>
        )}

        {/* =================================================
            Google Tag Manager

            Consent Mode default موجود بالفعل
            داخل instrumentation-client.ts
            ================================================= */}

        {hasValidGtmId && (
          <Script
            id="google-tag-manager"
            strategy="lazyOnload"
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

    event:
      "gtm.js"
  });

  var firstScript =
    documentObject
      .getElementsByTagName(
        scriptTag
      )[0];

  var gtmScript =
    documentObject
      .createElement(
        scriptTag
      );

  var dataLayerQuery =
    dataLayerName !==
      "dataLayer"
      ? "&l=" +
        dataLayerName
      : "";

  gtmScript.async =
    true;

  gtmScript.src =
    "https://www.googletagmanager.com/gtm.js?id=" +
    containerId +
    dataLayerQuery;

  if (
    firstScript &&
    firstScript.parentNode
  ) {
    firstScript
      .parentNode
      .insertBefore(
        gtmScript,
        firstScript
      );
  } else {
    documentObject
      .head
      .appendChild(
        gtmScript
      );
  }
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

        {/* =================================================
            Header
            ================================================= */}

        <Header />

        {/* =================================================
            Main content target

            tabIndex=-1 يسمح للـ Skip Link
            بنقل الـ focus للمحتوى بدون إدخاله
            في ترتيب Tab الطبيعي.
            ================================================= */}

        <div
          id="main-content"
          tabIndex={-1}
          className="
            min-h-0
            flex-1
            outline-none
          "
        >
          {children}
        </div>

        {/* =================================================
            Footer
            ================================================= */}

        <Footer />

        {/* =================================================
            Global client components
            ================================================= */}

        <RootClient />
      </body>
    </html>
  );
}