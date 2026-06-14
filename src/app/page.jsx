//Page.jsx
import HomeClient from "./HomeClient";
import ChefImage from "../../public/Heeder.webp";

export async function generateMetadata() {
  const title = "شيف العرب | وصفات طبخ عربية وعالمية خطوة بخطوة";
  const description =
    "اكتشف أفضل وصفات الطبخ العربية والعالمية في شيف العرب: وصفات سهلة، مجربة، مجمعة لكل المناسبات، سلطات، حلويات، ومشروبات، مع تصفح سريع وتصنيفات واضحة وأفكار مبتكرة للطبخ.";
  
  return {
    title,
    description,
    alternates: { canonical: "https://www.chefalarab.com/" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "https://www.chefalarab.com/",
      siteName: "شيف العرب",
      type: "website",
      locale: "ar_AR",
      images: [
        { url: ChefImage.src, width: 1200, height: 630, alt: "شيف العرب – وصفات طبخ عربية وعالمية سهلة" }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ChefImage.src]
    }
  };
}

export default function Page() {
  return <HomeClient />;
}