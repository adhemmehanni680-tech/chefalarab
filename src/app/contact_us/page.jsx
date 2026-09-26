// /src/app/contact_us/page.jsx

import ContactClient from "./ContactClient";

const SITE_URL = "https://chefalarab.com";
const PAGE_URL = `${SITE_URL}/contact_us`;
const SITE_NAME = "شيف العرب";
const DESCRIPTION =
  "تواصل مع إدارة شيف العرب عبر البريد الإلكتروني أو واتساب لإرسال اقتراح أو ملاحظة على وصفة أو طلب تعاون أو استفسار متعلق بالموقع.";

function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const metadata = {
  title: "تواصل معنا – الاقتراحات والاستفسارات",
  description: DESCRIPTION,
  keywords: [
    "تواصل مع شيف العرب",
    "الاتصال بشيف العرب",
    "بريد شيف العرب",
    "واتساب شيف العرب",
    "اقتراح وصفة",
    "التعاون مع شيف العرب",
  ],
  authors: [{ name: SITE_NAME, url: `${SITE_URL}/about_us` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "التواصل والدعم",
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
    title: "تواصل معنا – شيف العرب",
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
        alt: "التواصل مع إدارة شيف العرب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تواصل معنا – شيف العرب",
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: "Chef Al Arab",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/favicon.webp`,
          caption: "شعار شيف العرب",
        },
        email: "chefalarabonline@gmail.com",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: "+20-110-723-2016",
          email: "chefalarabonline@gmail.com",
          url: PAGE_URL,
          availableLanguage: ["ar"],
          areaServed: "Worldwide",
        },
      },
      {
        "@type": "ContactPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "تواصل معنا – شيف العرب",
        description: DESCRIPTION,
        inLanguage: "ar",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        about: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/#organization` },
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
            name: "تواصل معنا",
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

      <ContactClient />
    </>
  );
}
