// src/app/layout.tsx

import type { Metadata } from "next";
import { Cairo, Aref_Ruqaa } from "next/font/google";
import "./globals.css";

import Header from "./Components/header/Header";
import Footer from "./Components/footer/Footer";
import RootClient from "./RootClient"; // 👈 مهم

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://chefalarab.com"),
  title: {
    default: "شيف العرب",
    template: "%s | شيف العرب",
  },
  description:
    "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة.",
  keywords: [
    "شيف العرب", "الطبق العربي", "وصفات عربية", "وصفات شيف العرب",
    "أكلات مصرية", "أكلات شرقية", "مأكولات عربية", "مأكولات شعبية",
    "أكلات عربية تقليدية", "الطبق الغربي", "وصفات غربية", "مأكولات غربية",
    "أكلات عالمية", "وصفات عالمية", "سلطات ومخللات", "حلويات", "مثلجات",
    "مشروبات", "وصفات سهلة وسريعة"
  ],
  authors: [{ name: "Adhem Mehanni", url: "https://chefalarab.com" }],
  alternates: { canonical: "https://chefalarab.com" },

  openGraph: {
    title: "شيف العرب",
    description: "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة.",
    url: "https://chefalarab.com",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "شيف العرب" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "شيف العرب",
    description:
      "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة.",
    images: ["/og-image.jpg"],
  },

  robots: { index: true, follow: true },

  other: {
    "google-adsense-account": "ca-pub-9717868267549745",
  },

  verification: {
    google: "tdSwWzOnOuUsvJhYhKTI616MoDw3Vb4Xvle7no2xtas",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="ar" dir="rtl"  data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>

      <body
        className={`${cairo.variable} ${arefRuqaa.variable} flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
      >
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* 👇 كل السكريبتات  */}
        <RootClient>
          <Header />
          {children}
          <Footer />
        </RootClient>

      </body>
    </html>
  );
}
