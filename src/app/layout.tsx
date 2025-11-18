import Script from "next/script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Components/header/Header";
import Footer from "./Components/footer/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "شيف العرب",
  description: "أفضل الوصفات العربية مع شيف العرب",
  keywords: ["وصفات", "طبخ عربي", "حلويات", "مشروبات", "مأكولات"],
  authors: [{ name: "Mahmoud Mohamed", url: "https://example.com" }],
  openGraph: {
    title: "شيف العرب",
    description: "أفضل الوصفات العربية مع شيف العرب",
    url: "https://yourwebsite.com",
    siteName: "شيف العرب",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "شيف العرب",
    description: "أفضل الوصفات العربية مع شيف العرب",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <head>
        {/* سكربت Google Ads */}
        <Script
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        />
      </head>
      <body
        className="flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500"
        dir="rtl"
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
