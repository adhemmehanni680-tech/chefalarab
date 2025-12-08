import Script from "next/script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Components/header/Header";
import Footer from "./Components/footer/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://chefalarab.com"),

  title: "شيف العرب",
  description:
    "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة.",

  keywords: ["وصفات", "طبخ عربي", "حلويات", "مشروبات", "مأكولات"],

  authors: [{ name: "Mahmoud Mohamed", url: "https://chefalarab.com" }],

  alternates: {
    canonical: "https://chefalarab.com",
    languages: {
      ar: "https://chefalarab.com",
      "x-default": "https://chefalarab.com",
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "شيف العرب",
    description:
      "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة.",
    url: "https://chefalarab.com/",
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

  // ✅ Google Discover
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },

  // ✅ تفعيل التحقق من GSC عبر HTML Tag (اختياري)
  // حط كود google-site-verification هنا لو حابب تستخدمه
  // verification: {
  //   google: "PUT_GOOGLE_VERIFICATION_CODE_HERE",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* أيقونات الموقع */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* hreflang */}
        <link rel="alternate" href="https://chefalarab.com" hrefLang="ar" />
        <link
          rel="alternate"
          href="https://chefalarab.com"
          hrefLang="x-default"
        />

        {/* Google AdSense */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
      </head>

      <body
        className={`${inter.className} flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
