// /app/faq/page
import type { Metadata } from "next";
import FAQClient from "./FaqClient";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات على الأسئلة الشائعة حول موقع شيف العرب: استخدام الموقع، الوصفات، الصور، الإعلانات، الخصوصية، الكوكيز، والتواصل.",
  alternates: {
    canonical: "https://chefalarab.com/faq",
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
  openGraph: {
    title: "الأسئلة الشائعة | شيف العرب",
    description:
      "إجابات على الأسئلة الشائعة حول موقع شيف العرب: استخدام الموقع، الوصفات، الخصوصية والكوكيز.",
    url: "https://chefalarab.com/faq",
    siteName: "شيف العرب",
    type: "article",
    locale: "ar_AR",
    images: [
      {
        url: "https://chefalarab.com/og-image.jpg", //  absolute
        width: 1200,
        height: 630,
        alt: "الأسئلة الشائعة | شيف العرب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الأسئلة الشائعة | شيف العرب",
    description:
      "إجابات على الأسئلة الشائعة حول موقع شيف العرب: استخدام الموقع، الوصفات، الخصوصية والكوكيز.",
    images: ["https://chefalarab.com/og-image.jpg"],
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
