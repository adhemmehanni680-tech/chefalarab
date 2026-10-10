import TermsConditionsClient from "./TermsConditionsClient";

export const metadata = {
  title: "الشروط والأحكام | شيف العرب",
  description:
    "تعرف على الشروط والأحكام الخاصة بموقع شيف العرب، مع توضيح حقوق الملكية، الروابط الخارجية، ملفات تعريف الارتباط، والإعلانات.",
  alternates: {
    canonical: "https://chefalarab.com/terms_conditions",
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
    title: "الشروط والأحكام | شيف العرب",
    description:
      "تعرف على الشروط والأحكام الخاصة بموقع شيف العرب، مع توضيح حقوق الملكية، الروابط الخارجية، ملفات تعريف الارتباط، والإعلانات.",
    url: "https://chefalarab.com/terms_conditions",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "الشروط والأحكام | شيف العرب",
    description:
      "تعرف على الشروط والأحكام الخاصة بموقع شيف العرب، مع توضيح حقوق الملكية، الروابط الخارجية، ملفات تعريف الارتباط، والإعلانات.",
  },
};

export default function Page() {
  return <TermsConditionsClient />;
}