// /src/app/about_us/page.jsx
import AboutUsClient from "./AboutUsClient";

export const metadata = {
  title: "من نحن – وصفات عربية موثوقة",
  description:
    "تعرف على شيف العرب، موقع وصفات الطبخ العربي والعالمي. نقدم وصفات واضحة ومجرّبة، نصائح عملية، وتجربة تصفح سريعة. رسالتنا، رؤيتنا، وقيمنا في مكان واحد.",
  keywords: [
    "من نحن شيف العرب",
    "موقع وصفات عربية",
    "طبخ عربي",
    "وصفات موثوقة",
    "شيف العرب عن الموقع",
  ],
  openGraph: {
    title: "من نحن – شيف العرب",
    description:
      "موقع وصفات عربية وعالمية بطريقة بسيطة وعملية. تعرف على قصتنا ورسالتنا وقيمنا.",
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
      "موقع وصفات عربية وعالمية بطريقة بسيطة وعملية. تعرف على قصتنا ورسالتنا وقيمنا.",
    images: ["https://chefalarab.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://chefalarab.com/about_us",
  },
};

export default function AboutPage() {
  // بيانات منظمة (Organization) لتعزيز الظهور في نتائج البحث
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "شيف العرب",
    url: "https://chefalarab.com",
    logo: "https://chefalarab.com/favicon.webp",
    description:
      "موقع وصفات الطبخ العربية والعالمية. وصفات واضحة ومجرّبة، نصائح عملية، وتجربة استخدام سريعة.",
    sameAs: [
      "https://www.facebook.com/chefalarab",
      "https://www.instagram.com/chefalarab",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://chefalarab.com/contact_us",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutUsClient />
    </>
  );
}