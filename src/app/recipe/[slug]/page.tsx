import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllRecipes, type RecipeData } from "@/lib/recipesData";
import RecipeView from "./RecipeView";
import { buildRecipeJsonLd } from "@/lib/buildRecipeJsonLd";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = "https://chefalarab.com";

function generateSeoTitle(title: string): string {
  return title.startsWith("طريقة عمل") ? title : `طريقة عمل ${title}`;
}

function safelyDecodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function normalizeSlug(slug: string): string {
  return safelyDecodeSlug(slug)
    .normalize("NFD")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function absoluteUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function getCardImageUrl(recipe: RecipeData): string | null {
  const image = recipe?.img;
  const explicit =
    image && typeof image === "object" ? image["url-card"] : undefined;

  if (typeof explicit === "string" && explicit.trim()) {
    return explicit;
  }

  const main =
    typeof image === "string"
      ? image
      : image && typeof image === "object"
        ? image.url
        : undefined;

  if (typeof main !== "string" || !main.trim()) return null;
  if (/^https?:\/\//i.test(main)) return main;

  const fileName = main.split("?")[0].split("#")[0].split("/").filter(Boolean).pop();
  return fileName ? `/card/${fileName}` : main;
}

function getRelatedRecipes(currentRecipe: RecipeData) {
  const currentCategories = Array.isArray(currentRecipe.category)
    ? currentRecipe.category
    : [];
  const currentTags = Array.isArray(currentRecipe.tags) ? currentRecipe.tags : [];

  const scoreRecipe = (candidate: RecipeData): number => {
    let score = 0;
    const candidateCategories = Array.isArray(candidate.category)
      ? candidate.category
      : [];
    const candidateTags = Array.isArray(candidate.tags) ? candidate.tags : [];

    score +=
      currentCategories.filter((category: string) =>
        candidateCategories.includes(category),
      ).length * 4;
    score +=
      currentTags.filter((tag: string) => candidateTags.includes(tag)).length * 3;

    if (
      currentRecipe.data_box?.meal_type &&
      currentRecipe.data_box.meal_type === candidate.data_box?.meal_type
    ) {
      score += 5;
    }

    if (
      currentRecipe.data_box?.dish_type &&
      currentRecipe.data_box.dish_type === candidate.data_box?.dish_type
    ) {
      score += 5;
    }

    if (currentRecipe.country && currentRecipe.country === candidate.country) {
      score += 2;
    }

    if (
      currentRecipe.data_box?.difficulty &&
      currentRecipe.data_box.difficulty === candidate.data_box?.difficulty
    ) {
      score += 1;
    }

    return score;
  };

  return getAllRecipes()
    .filter(
      (recipe) =>
        recipe.status === "published" && recipe.slug !== currentRecipe.slug,
    )
    .map((recipe) => ({ recipe, score: scoreRecipe(recipe) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.recipe.id) - Number(a.recipe.id))
    .slice(0, 8)
    .map(({ recipe }) => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      country: recipe.country,
      category: recipe.category || [],
      tags: recipe.tags || [],
      img: {
        url: typeof recipe.img === "string" ? recipe.img : recipe.img?.url,
        "url-card": getCardImageUrl(recipe) || undefined,
        alt: typeof recipe.img === "string" ? recipe.title : recipe.img?.alt,
        width: typeof recipe.img === "string" ? undefined : recipe.img?.width,
        height: typeof recipe.img === "string" ? undefined : recipe.img?.height,
      },
    }));
}

function findRecipe(slug: string): RecipeData | undefined {
  const normalized = normalizeSlug(slug);

  return getAllRecipes().find(
    (recipe) =>
      recipe.status === "published" &&
      normalizeSlug(String(recipe.slug || "")) === normalized,
  );
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = findRecipe(slug);

  if (!recipe) {
    return {
      title: "وصفة غير موجودة",
      robots: { index: false, follow: false },
    };
  }

  const title = recipe.seo?.meta_title || generateSeoTitle(recipe.title);
  const baseDescription =
    recipe.seo?.meta_description || recipe.description || recipe.intro || "";
  const description = baseDescription.trim().slice(0, 160);
  const url = `${BASE_URL}/recipe/${encodeURIComponent(String(recipe.slug))}`;
  const imageValue =
    recipe.seo?.og_image ||
    (typeof recipe.img === "string" ? recipe.img : recipe.img?.url);
  const imageUrl = absoluteUrl(imageValue);
  const imageAlt =
    typeof recipe.img === "string"
      ? recipe.title
      : recipe.img?.alt || recipe.title;

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
              height: 800,
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

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = findRecipe(slug);

  if (!recipe) notFound();

  const jsonLd = buildRecipeJsonLd(recipe);
  const relatedRecipes = getRelatedRecipes(recipe);

  return (
    <>
      <script
        id="recipe-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <RecipeView recipe={recipe} relatedRecipes={relatedRecipes} />
    </>
  );
}
