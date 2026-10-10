// /src/app/about_us/page.jsx

import AboutUsClient from "./AboutUsClient";

const SITE_URL = "https://chefalarab.com";
const PAGE_URL = `${SITE_URL}/about_us`;
const SITE_NAME = "شيف العرب";
const DESCRIPTION =
  "تعرف على شيف العرب، موقع عربي للوصفات العربية والعالمية، ومنهج إعداد المحتوى وتنظيم الوصفات ومراجعتها، وما نقدمه للزائر وطرق التواصل معنا.";

function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const metadata = {
  title: "من نحن – منصة وصفات عربية وعالمية موثوقة",
  description: DESCRIPTION,
  keywords: [
    "من نحن شيف العرب",
    "شيف العرب",
    "موقع وصفات عربية",
    "وصفات طبخ عربية",
    "وصفات عالمية",
    "موقع طبخ",
    "وصفات موثوقة",
    "محتوى طبخ عربي",
    "إدارة شيف العرب",
  ],

  authors: [{ name: SITE_NAME, url: PAGE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "الطبخ والوصفات",

  alternates: {
    canonical: PAGE_URL,
    languages: {
      "ar-EG": PAGE_URL,
      ar: PAGE_URL,
    },
  },

  openGraph: {
    title: "من نحن – شيف العرب ووصفاتنا العربية والعالمية",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "شيف العرب - من نحن",
      },
    ],
    locale: "ar_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "من نحن – شيف العرب",
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg`],
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
};

export default function AboutPage() {
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
          contentUrl: `${SITE_URL}/favicon.webp`,
          caption: "شعار شيف العرب",
        },
        image: { "@id": `${SITE_URL}/#logo` },
        description: DESCRIPTION,
        email: "chefalarabonline@gmail.com",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["ar"],
          areaServed: "Worldwide",
          email: "chefalarabonline@gmail.com",
          url: `${SITE_URL}/contact_us`,
        },
        knowsAbout: [
          "وصفات الطبخ العربية",
          "الوصفات العالمية",
          "الحلويات والمخبوزات",
          "المشروبات والسلطات",
          "نصائح الطهي المنزلي",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: "Chef Al Arab",
        inLanguage: "ar",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "AboutPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "من نحن – شيف العرب",
        description: DESCRIPTION,
        inLanguage: "ar",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
        },
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
            name: "من نحن",
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

      <AboutUsClient />
    </>
  );
}

