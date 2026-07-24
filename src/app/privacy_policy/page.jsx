import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata = {
  title: "سياسة الخصوصية",
  description:
    "سياسة الخصوصية لموقع شيف العرب: كيفية جمع واستخدام وحماية البيانات، ملفات تعريف الارتباط (الكوكيز)، الإعلانات (Google AdSense)، الروابط الخارجية وخصوصية الأطفال.",
  alternates: {
    canonical: "https://chefalarab.com/privacy_policy",
  },
  openGraph: {
    title: "سياسة الخصوصية | شيف العرب",
    description:
      "تعرف على سياسة الخصوصية لموقع شيف العرب: البيانات، الكوكيز، الإعلانات (Google AdSense)، الأمان، الروابط الخارجية وخصوصية الأطفال.",
    url: "https://chefalarab.com/privacy_policy",
    siteName: "شيف العرب",
    type: "article",
    locale: "ar_AR",
    images: [
      {
        url: "https://chefalarab.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "سياسة الخصوصية | شيف العرب",
      },
    ],
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

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
