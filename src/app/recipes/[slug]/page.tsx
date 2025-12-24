// app/recipes/[slug]/page.tsx
import Script from "next/script";
import { notFound } from "next/navigation";
import recipes from "../../../../public/recipes.json";
import RecipeClient from "./RecipeClient";
import { buildRecipeJsonLd } from "@/lib/buildRecipeJsonLd";

type PageProps = {
  params: { slug: string };
};

const BASE_URL = "https://chefalarab.com"; // ✅ وحّد الدومين هنا مع layout

export async function generateMetadata({ params }: PageProps) {
  const decodedSlug = decodeURIComponent(params.slug);
  const recipe = (recipes as any[]).find((r) => r.slug === decodedSlug);

  if (!recipe) {
    return {
      title: "وصفة غير موجودة | شيف العرب",
      robots: { index: false, follow: false },
    };
  }

  const title = `${recipe.title} | شيف العرب`;
  const description =
    (recipe.description || recipe.intro || "").slice(0, 160) ||
    "وصفة طبخ من شيف العرب بخطوات واضحة ومكونات دقيقة.";

  const url = `${BASE_URL}/recipes/${encodeURIComponent(recipe.slug)}`;

  const imageUrl = recipe.img?.url ? `${BASE_URL}${recipe.img.url}` : undefined;
  const imageAlt = recipe.img?.alt || recipe.title;

  return {
    title,
    description,
    alternates: { canonical: url },
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
      title,
      description,
      url,
      siteName: "شيف العرب",
      type: "article",
      locale: "ar_AR",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: imageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default function Page({ params }: PageProps) {
  const decodedSlug = decodeURIComponent(params.slug);
  const recipe = (recipes as any[]).find((r) => r.slug === decodedSlug);

  // ✅ 404 رسمي (ده مهم جدًا للسيو وأدسنس)
  if (!recipe) notFound();

  const jsonLd = buildRecipeJsonLd(recipe);

  return (
    <>
      {/* ✅ حقن Schema مرة واحدة فقط */}
      <Script
        id="recipe-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <RecipeClient params={params} />
    </>
  );
}
