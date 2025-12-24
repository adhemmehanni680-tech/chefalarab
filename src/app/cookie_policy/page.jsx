//cookie policy page
import CookiePolicyClient from "./CookiePolicyClient";

export const metadata = {
  title: "سياسة ملفات الارتباط (الكوكيز) | شيف العرب",
  description:
    "تعرف على سياسة ملفات الارتباط (Cookies) في موقع شيف العرب (chefalarab.com) وكيفية استخدامها لتحسين التجربة وقياس الأداء وعلاقتها بإعلانات Google AdSense.",
  alternates: {
   canonical: "https://chefalarab.com/cookie_policy",  
   url: "https://chefalarab.com/cookie_policy"
 
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    images: [
    {
      url: "https://chefalarab.com/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "سياسة ملفات الارتباط | شيف العرب"
    }
  ],
    title: "سياسة ملفات الارتباط (الكوكيز) | شيف العرب",
    description:
      "سياسة الكوكيز لموقع شيف العرب: لماذا نستخدم الكوكيز وكيفية إدارتها وعلاقتها بإعلانات Google.",
    url: "https://www.chefalarab.com/cookie_policy",
    siteName: "شيف العرب",
    type: "article",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary",
    title: "سياسة ملفات الارتباط (الكوكيز) | شيف العرب",
    description:
      "سياسة الكوكيز لموقع شيف العرب وكيفية إدارة ملفات الارتباط.",
  },
};

export default function Page() {
  return <CookiePolicyClient />;
}
