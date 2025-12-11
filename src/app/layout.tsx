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

  keywords: [
    "شيف العرب",
    "الطبق العربي",
    "وصفات عربية",
    "وصفات شيف العرب",
    "أكلات مصرية",
    "أكلات شرقية",
    "مأكولات عربية",
    "مأكولات شعبية",
    "أكلات عربية تقليدية",
    "الطبق الغربي",
    "وصفات غربية",
    "مأكولات غربية",
    "أكلات عالمية",
    "وصفات عالمية",
    "سلطات ومخلّلات",
    "مخللات وسلطات",
    "وصفات سلطات",
    "سلطات خضار",
    "مخللات منزلية",
    "حلويات",
    "حلويات عربية",
    "حلويات شرقية",
    "حلويات غربية",
    "مثلجات",
    "مشروبات",
    "مشروبات باردة",
    "مشروبات ساخنة",
    "عصائر طبيعية",
    "مشروبات مثلجة",
    "وصفات سهلة وسريعة",
    "طبخ منزلي",
    "وصفات يومية",
    "أكلات سريعة",
  ],

  authors: [{ name: "Adhem Mehanni", url: "https://chefalarab.com" }],

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

  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
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

        {/* ✅ Google AdSense – الكود الرئيسي للتحقق + الإعلانات */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9717868267549745"
          crossOrigin="anonymous"
        />

        {/* ✅ Google Analytics gtag.js */}
        <Script
          id="gtag-js"
          strategy="afterInteractive"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GCE8E2TYB1"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GCE8E2TYB1');
          `}
        </Script>
      </head>

      <body
        className={`${inter.className} flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500 `}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
