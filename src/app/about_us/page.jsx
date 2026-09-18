// /src/app/about_us/page.jsx

import AboutUsClient from "./AboutUsClient";

export const metadata = {
  title: "من نحن – شيف العرب | وصفات عربية وعالمية",
  description:
    "تعرف على شيف العرب، هدف الموقع، نوع المحتوى الذي نقدمه، طريقة إعداد وتنظيم الوصفات، وما نقدمه للزائر، وكيفية التواصل مع إدارة الموقع.",
  keywords: [
    "من نحن شيف العرب",
    "شيف العرب",
    "موقع وصفات عربية",
    "وصفات طبخ عربية",
    "وصفات عالمية",
    "موقع طبخ",
    "وصفات موثوقة",
  ],

  alternates: {
    canonical: "https://chefalarab.com/about_us",
  },

  openGraph: {
    title: "من نحن – شيف العرب",
    description:
      "تعرف على هدف شيف العرب، طريقة إعداد وتنظيم الوصفات، وما يقدمه الموقع للزائر.",
    url: "https://chefalarab.com/about_us",
    siteName: "شيف العرب",
    images: [
      {
        url: "https://chefalarab.com/og-image.jpg",
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
    description:
      "تعرف على هدف شيف العرب، وطريقة إعداد الوصفات، وما يقدمه الموقع للزائر.",
    images: ["https://chefalarab.com/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: "شيف العرب",
    alternateName: "Chef Al Arab",

    url: "https://chefalarab.com",

    logo: {
      "@type": "ImageObject",
      url: "https://chefalarab.com/favicon.webp",
    },

    description:
      "شيف العرب موقع عربي متخصص في تقديم وصفات الطبخ العربية والعالمية بطريقة واضحة ومنظمة، مع مقادير وخطوات ونصائح تساعد المستخدم على إعداد الوصفات في المنزل.",

    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Arabic"],
      email: "chefalarabonline@gmail.com",
      url: "https://chefalarab.com/contact_us",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <AboutUsClient />
    </>
  );
}

