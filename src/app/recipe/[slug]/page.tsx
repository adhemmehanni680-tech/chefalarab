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

/**
 * Decode slug safely
 */
function safelyDecodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/**
 * Normalize slug for comparison
 */
function normalizeSlug(slug: string): string {
  return safelyDecodeSlug(slug)
    .normalize("NFD")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/**
 * Convert an image URL to an absolute URL.
 * Used for SEO / OpenGraph only.
 */
function absoluteUrl(value?: string | null): string | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  const clean = value.trim();

  if (!clean) {
    return undefined;
  }

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  if (clean.startsWith("//")) {
    return `https:${clean}`;
  }

  return `${BASE_URL}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

/**
 * Normalize image URL for the frontend.
 *
 * Supported:
 * https://example.com/image.jpg
 * http://example.com/image.jpg
 * //example.com/image.jpg
 * /images/image.jpg
 * images/image.jpg
 * ./images/image.jpg
 */
function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  let url = value.trim();

  if (!url) {
    return null;
  }

  // Convert Windows-style paths
  url = url.replace(/\\/g, "/");

  // Protocol-relative URL
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  // External URL
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Local URL
  if (url.startsWith("/")) {
    return url;
  }

  // Remove ./ from relative path
  url = url.replace(/^\.\/+/, "");

  return `/${url}`;
}

/**
 * Get the image that will be sent to related recipes.
 *
 * IMPORTANT:
 * We do NOT create /card/filename anymore.
 */
function getCardImageUrl(recipe: RecipeData): string | null {
  const image = recipe?.img;

  // img is directly a string
  if (typeof image === "string") {
    return normalizeImageUrl(image);
  }

  // No image
  if (!image || typeof image !== "object") {
    return null;
  }

  // First try url-card
  const cardUrl = normalizeImageUrl(image["url-card"]);

  if (cardUrl) {
    return cardUrl;
  }

  // Then try main image
  return normalizeImageUrl(image.url);
}

/**
 * Find related recipes
 */
function getRelatedRecipes(currentRecipe: RecipeData) {
  const currentCategories = Array.isArray(currentRecipe.category)
    ? currentRecipe.category
    : [];

  const currentTags = Array.isArray(currentRecipe.tags)
    ? currentRecipe.tags
    : [];

  const scoreRecipe = (candidate: RecipeData): number => {
    let score = 0;

    const candidateCategories = Array.isArray(candidate.category)
      ? candidate.category
      : [];

    const candidateTags = Array.isArray(candidate.tags)
      ? candidate.tags
      : [];

    score +=
      currentCategories.filter((category: string) =>
        candidateCategories.includes(category),
      ).length * 4;

    score +=
      currentTags.filter((tag: string) =>
        candidateTags.includes(tag),
      ).length * 3;

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

    if (
      currentRecipe.country &&
      currentRecipe.country === candidate.country
    ) {
      score += 2;
    }

    if (
      currentRecipe.data_box?.difficulty &&
      currentRecipe.data_box.difficulty ===
        candidate.data_box?.difficulty
    ) {
      score += 1;
    }

    return score;
  };

  return getAllRecipes()
    .filter(
      (recipe) =>
        recipe.status === "published" &&
        recipe.slug !== currentRecipe.slug,
    )
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.recipe.id) - Number(a.recipe.id),
    )
    .slice(0, 8)
    .map(({ recipe }) => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      country: recipe.country,
      category: recipe.category || [],
      tags: recipe.tags || [],

      img: {
        // Original image
        url:
          typeof recipe.img === "string"
            ? normalizeImageUrl(recipe.img) || undefined
            : normalizeImageUrl(recipe.img?.url) || undefined,

        // Card image
        "url-card": getCardImageUrl(recipe) || undefined,

        alt:
          typeof recipe.img === "string"
            ? recipe.title
            : recipe.img?.alt || recipe.title,

        width:
          typeof recipe.img === "string"
            ? undefined
            : recipe.img?.width,

        height:
          typeof recipe.img === "string"
            ? undefined
            : recipe.img?.height,
      },
    }));
}

/**
 * Find recipe by slug
 */
function findRecipe(slug: string): RecipeData | undefined {
  const normalized = normalizeSlug(slug);

  return getAllRecipes().find(
    (recipe) =>
      recipe.status === "published" &&
      normalizeSlug(String(recipe.slug || "")) === normalized,
  );
}

/**
 * Safe JSON-LD serialization
 */
function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * SEO Metadata
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const recipe = findRecipe(slug);

  if (!recipe) {
    return {
      title: "وصفة غير موجودة",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    recipe.seo?.meta_title ||
    generateSeoTitle(recipe.title);

  const baseDescription =
    recipe.seo?.meta_description ||
    recipe.description ||
    recipe.intro ||
    "";

  const description = baseDescription.trim().slice(0, 160);

  const url =
    `${BASE_URL}/recipe/${encodeURIComponent(
      String(recipe.slug),
    )}`;

  const imageValue =
    recipe.seo?.og_image ||
    (typeof recipe.img === "string"
      ? recipe.img
      : recipe.img?.url);

  const imageUrl = absoluteUrl(imageValue);

  const imageAlt =
    typeof recipe.img === "string"
      ? recipe.title
      : recipe.img?.alt || recipe.title;

  return {
    title,
    description,

    alternates: {
      canonical: url,
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

/**
 * Recipe Page
 */
export default async function RecipePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const recipe = findRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const jsonLd = buildRecipeJsonLd(recipe);

  const relatedRecipes =
    getRelatedRecipes(recipe);

  return (
    <>
      <script
        id="recipe-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <RecipeView
        recipe={recipe}
        relatedRecipes={relatedRecipes}
      />
    </>
  );
}