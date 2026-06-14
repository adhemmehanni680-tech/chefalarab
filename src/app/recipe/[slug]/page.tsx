// app/recipes/[slug]/page.tsx
import Script from "next/script";
import { notFound } from "next/navigation";
import recipes from "@/data/recipes.json"
import RecipeClient from "./RecipeClient";
import { buildRecipeJsonLd } from "@/lib/buildRecipeJsonLd";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = "https://chefalarab.com";

/* ===============================
   ✅ SEO Title Generator
================================ */
function generateSeoTitle(title: string) {
  return `طريقة عمل ${title}`;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const recipe = (recipes as any[]).find(r => r.slug === decodedSlug);

  if (!recipe) {
    return {
      title: "وصفة غير موجودة | شيف العرب",
      robots: { index: false, follow: false },
    };
  }

  const seoTitle = generateSeoTitle(recipe.title);

  const title = `${seoTitle} | شيف العرب`;

  const description = `طريقة عمل ${recipe.title} بسهولة في المنزل، تعرف أيضًا على طريقه عمل ${recipe.title} بخطوات احترافية وأسرار نجاح الوصفة. ${
    (recipe.description || recipe.intro || "").slice(0, 120)
  }`;

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
        ? [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }]
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

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const recipe = (recipes as any[]).find(r => r.slug === decodedSlug);

  if (!recipe) notFound();

  const jsonLd = buildRecipeJsonLd(recipe);

  return (
    <>
      {/* ✅ Schema JSON-LD */}
      <Script
        id="recipe-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ✅ Client Component */}
      <RecipeClient params={{ slug }} />
    </>
  );
}