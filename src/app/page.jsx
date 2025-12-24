// page-Home
import HomeClient from "./HomeClient";

export const metadata = {
  title: "شيف العرب | وصفات طبخ عربية وعالمية خطوة بخطوة",
  description:
    "اكتشف أفضل وصفات الطبخ العربية والعالمية في شيف العرب: وصفات سهلة ومجربة، سلطات، حلويات، ومشروبات، مع تصفح سريع وتصنيفات واضحة.",
  alternates: {
   canonical: "https://www.chefalarab.com/",
  },
  robots: {
    index: true,
    follow: true,
    // مهم للسيو/Discover إن أمكن (اختياري لكن مفيد)
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "شيف العرب | وصفات طبخ عربية وعالمية",
    description:
      "وصفات سهلة ومجربة: أطباق عربية وغربية، سلطات، حلويات، ومشروبات. تصفح وصفات شيف العرب الآن.",
    url: "https://www.chefalarab.com/",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "شيف العرب | وصفات طبخ عربية وعالمية",
    description:
      "وصفات سهلة ومجربة: أطباق عربية وغربية، سلطات، حلويات، ومشروبات.",
  },
};

export default function Page() {
  return <HomeClient />;
}
