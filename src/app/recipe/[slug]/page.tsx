// app/recipe/[slug]/page.tsx
import Script from "next/script";
import { notFound } from "next/navigation";
import { getAllRecipes } from "@/lib/recipesData";
import RecipeClient from "./RecipeClient";
import { buildRecipeJsonLd } from "@/lib/buildRecipeJsonLd";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = "https://chefalarab.com";

function generateSeoTitle(title: string) {
  return `طريقة عمل ${title}`;
}

function normalizeSlug(slug: string) {
  return slug
    .normalize("NFD")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .trim();
}

function getCardImageUrl(recipe: any) {
  if (!recipe?.img || typeof recipe.img === "string") return null;
  return recipe.img["url-card"] || recipe.img.url || null;
}

function getRelatedRecipes(currentRecipe: any) {
  const scoreRecipe = (candidate: any) => {
    let score = 0;

    const categoriesA = currentRecipe.category || [];
    const categoriesB = candidate.category || [];
    score += categoriesA.filter((cat: string) => categoriesB.includes(cat)).length * 4;

    const tagsA = currentRecipe.tags || [];
    const tagsB = candidate.tags || [];
    score += tagsA.filter((tag: string) => tagsB.includes(tag)).length * 3;

    if (currentRecipe.data_box?.meal_type && currentRecipe.data_box.meal_type === candidate.data_box?.meal_type) score += 5;
    if (currentRecipe.data_box?.dish_type && currentRecipe.data_box.dish_type === candidate.data_box?.dish_type) score += 5;
    if (currentRecipe.country && currentRecipe.country === candidate.country) score += 2;
    if (currentRecipe.data_box?.difficulty && currentRecipe.data_box.difficulty === candidate.data_box?.difficulty) score += 1;

    return score;
  };

  return getAllRecipes()
    .filter((recipe) => recipe.status === "published" && recipe.slug !== currentRecipe.slug)
    .map((recipe) => ({ recipe, score: scoreRecipe(recipe) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ recipe }) => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      country: recipe.country,
      category: recipe.category || [],
      tags: recipe.tags || [],
      img: {
        url: recipe.img?.url,
        "url-card": getCardImageUrl(recipe),
        alt: recipe.img?.alt,
        width: recipe.img?.width,
        height: recipe.img?.height,
      },
    }));
}

function findRecipe(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const normalized = normalizeSlug(decodedSlug);

  return getAllRecipes().find(
    (recipe) =>
      recipe.status === "published" &&
      normalizeSlug(String(recipe.slug || "")) === normalized
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const recipe = findRecipe(slug);

  if (!recipe) {
    return {
      title: "وصفة غير موجودة | شيف العرب",
      robots: { index: false, follow: false },
    };
  }

  const seoTitle = generateSeoTitle(recipe.title);
  const title = `${seoTitle} | شيف العرب`;
  const description = `طريقة عمل ${recipe.title} بسهولة في المنزل، تعرف أيضًا على طريقة عمل ${recipe.title} بخطوات احترافية وأسرار نجاح الوصفة. ${
    (recipe.description || recipe.intro || "").slice(0, 120)
  }`;
  const url = `${BASE_URL}/recipe/${encodeURIComponent(recipe.slug)}`;
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
  const recipe = findRecipe(slug);

  if (!recipe) notFound();

  const jsonLd = buildRecipeJsonLd(recipe);
  const relatedRecipes = getRelatedRecipes(recipe);

  return (
    <>
      <Script
        id="recipe-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <RecipeClient recipe={recipe} relatedRecipes={relatedRecipes} />
    </>
  );
}
