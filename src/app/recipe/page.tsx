import React from "react";
import RecipesClient from "./RecipesClient";

export const metadata = {
  title: "الوصفات | شيف العرب",
  description:
    "تصفح جميع وصفات شيف العرب: أطباق عربية وغربية، سلطات، حلويات، ومشروبات. اختر التصنيف واستكشف وصفات مجربة وسهلة.",
  alternates: {
    canonical: "https://chefalarab.com/recipe",
    url: "https://chefalarab.com/recipe",
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
    title: "الوصفات | شيف العرب",
    description:
      "تصفح جميع وصفات شيف العرب حسب التصنيف: العربي، الغربي، سلطات، حلويات، ومشروبات.",
    url: "https://www.chefalarab.com/recipe",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "الوصفات | شيف العرب",
    description:
      "تصفح جميع وصفات شيف العرب حسب التصنيف: العربي، الغربي، سلطات، حلويات، ومشروبات.",
  },
};

export default function Page() {
  return (
    <React.Suspense fallback={<div className="text-center py-10">جارٍ التحميل...</div>}>
      <RecipesClient />
    </React.Suspense>
  );
}
