import type { MetadataRoute } from "next";
import { getAllRecipes } from "@/lib/recipesData";

const SITE_URL = "https://chefalarab.com";

type RecipeImage = {
  url?: string;
};

type Recipe = {
  slug?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  img?: RecipeImage | string;
};

function validDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function absoluteImageUrl(image: Recipe["img"]): string | undefined {
  const value = typeof image === "string" ? image : image?.url;
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/recipes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about_us`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact_us`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy_policy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/cookie_policy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terms_conditions`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const recipePages: MetadataRoute.Sitemap = (getAllRecipes() as Recipe[])
    .filter(
      (recipe) => recipe.status === "published" && Boolean(recipe.slug?.trim()),
    )
    .map((recipe) => {
      const image = absoluteImageUrl(recipe.img);
      const lastModified =
        validDate(recipe.updated_at) || validDate(recipe.created_at);

      return {
        url: `${SITE_URL}/recipe/${encodeURIComponent(recipe.slug!.trim())}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        ...(image ? { images: [image] } : {}),
      };
    });

  return [...staticPages, ...recipePages];
}
