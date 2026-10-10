// /src/app/cookie_policy/page.jsx

import CookiePolicyClient from "./CookiePolicyClient";

const SITE_URL = "https://chefalarab.com";
const PAGE_URL = `${SITE_URL}/cookie_policy`;
const SITE_NAME = "شيف العرب";
const DATE_MODIFIED = "2026-09-17";
const DESCRIPTION =
  "تعرف على سياسة ملفات تعريف الارتباط في شيف العرب، وأنواع الكوكيز المستخدمة، وكيفية إدارة موافقتك، وعلاقتها بخدمات التحليل وإعلانات Google AdSense.";

function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const metadata = {
  title: "سياسة ملفات الارتباط وإدارة الكوكيز",
  description: DESCRIPTION,
  keywords: [
    "سياسة الكوكيز شيف العرب",
    "سياسة ملفات الارتباط",
    "إدارة موافقة الكوكيز",
    "ملفات تعريف الارتباط",
    "كوكيز Google AdSense",
    "خصوصية شيف العرب",
  ],
  authors: [{ name: SITE_NAME, url: `${SITE_URL}/about_us` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "السياسات القانونية",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      "ar-EG": PAGE_URL,
      ar: PAGE_URL,
    },
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
    title: "سياسة ملفات الارتباط – شيف العرب",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ar_AR",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "سياسة ملفات الارتباط في شيف العرب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سياسة ملفات الارتباط – شيف العرب",
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function CookiePolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "سياسة ملفات الارتباط – شيف العرب",
        description: DESCRIPTION,
        inLanguage: "ar",
        dateModified: DATE_MODIFIED,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/favicon.webp`,
          },
        },
        about: {
          "@type": "Thing",
          name: "ملفات تعريف الارتباط وإدارة الموافقة",
        },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "سياسة الكوكيز",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <CookiePolicyClient />
    </>
  );
}
