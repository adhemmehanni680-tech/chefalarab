import { MetadataRoute } from "next";
import recipesData from "@/data/recipes.json";

const SITE_URL = "https://chefalarab.com";

// تعريف نوع البيانات للوصفات
interface RecipeImage {
  url: string;
  alt?: string;
}

interface Recipe {
  id: string | number;
  title: string;
  slug: string;
  status: string;
  updated_at?: string;
  img?: RecipeImage;
  alt?: string;
}

const recipes: Recipe[] = recipesData as Recipe[];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/recipes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about_us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact_us`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy_policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/cookie_policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terms_conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const recipePages: MetadataRoute.Sitemap = recipes
    .filter((recipe) => recipe.status === "published")
    .map((recipe) => {
      const url = `${SITE_URL}/recipes/${encodeURIComponent(recipe.slug)}`;
      const lastModified = recipe.updated_at ? new Date(recipe.updated_at) : new Date();

      // الصورة كـ string array
      const images = recipe.img
        ? [recipe.img.url.startsWith("http") ? recipe.img.url : `${SITE_URL}${recipe.img.url}`]
        : undefined;

      return {
        url,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images,
      };
    });

  return [...staticPages, ...recipePages];
}