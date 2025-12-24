// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Components/header/Header";
import Footer from "./Components/footer/Footer";
import RootClient from "./RootClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://chefalarab.com"),
  title: {
    default: "شيف العرب",
    template: "%s | شيف العرب",
  },
  description:
    "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة",
  keywords: [
     "شيف العرب",  "الطبق العربي", "وصفات عربية",  "وصفات شيف العرب",
     "أكلات مصرية", "أكلات شرقية",   "مأكولات عربية", "مأكولات شعبية", 
     "أكلات عربية تقليدية", 
     "الطبق الغربي", "وصفات غربية", 
     "مأكولات غربية", "أكلات عالمية", 
     "وصفات عالمية", "المطبخ الآسيوي","وصفات الآسيوي",
     " المطبخ الأمريكي","وصفات أمريكي",
     "المطبخ الأوروبي ","وصفات أوروبي ",
     "المطبخ اللاتيني","وصفات للاتيني",
     "المطبخ الأفريقي","وصفات افريقى",
     "سلطات ومخللات", 
     "حلويات", "مثلجات", "مشروبات", 
     "وصفات سهلة وسريعة"
  ],
  authors: [{ name: "Adhem Mehanni", url: "https://chefalarab.com" }],
  alternates: {
    canonical: "https://chefalarab.com",
  },
  openGraph: {
    title: "شيف العرب",
    description: "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة",
    url: "https://www.chefalarab.com",
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
    description: "اكتشف ألذ وأحدث الوصفات العربية الأصيلة، مع شيف العرب تجد وصفات شهية للطبخ المنزلي، الحلويات، المشروبات والمأكولات العربية بسهولة خطوة بخطوة",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100`}>
        <Header />
        <RootClient>{children}</RootClient>
        <Footer />
      </body>
    </html>
  );
}
