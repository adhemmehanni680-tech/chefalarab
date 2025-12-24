//src/app/sitemap
import { MetadataRoute } from "next";
import recipes from "../../public/recipes.json";

const SITE_URL = "https://chefalarab.com";

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
    .filter((r: any) => r.status === "published")
    .map((recipe: any) => {
      const url = `${SITE_URL}/recipes/${encodeURIComponent(recipe.slug)}`;
      const lastModified = recipe.updated_at ? new Date(recipe.updated_at) : new Date();

      // لو الصورة موجودة، نخليها ضمن sitemap
      const images = recipe.img
        ? [
            {
              url: recipe.img.url.startsWith("http") ? recipe.img.url : `${SITE_URL}${recipe.img.url}`,
              title: recipe.title,
              caption: recipe.alt || recipe.title,
            },
          ]
        : undefined;

      return {
        url,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
        images,
      };
    });

  return [...staticPages, ...recipePages];
}
