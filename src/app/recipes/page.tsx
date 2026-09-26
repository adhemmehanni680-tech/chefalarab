//page 
import type { Metadata } from "next";
import RecipesClient from "./RecipesClient";
import recipesData from "@/data/recipes-catalog.json";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  status?: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;

  img: {
    url?: string;
    "url-card"?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

type PageProps = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
};

function getCategories(recipes: Recipe[]): string[] {
  const categories = new Set<string>();

  for (const recipe of recipes) {
    const values = Array.isArray(recipe.category)
      ? recipe.category
      : recipe.category
        ? [recipe.category]
        : [];

    for (const category of values) {
      if (category) {
        categories.add(category);
      }
    }
  }

  return Array.from(categories).sort((a, b) =>
    a.localeCompare(b, "ar"),
  );
}

export const metadata: Metadata = {
  title: "الوصفات",

  description:
    "تصفح جميع وصفات شيف العرب: أطباق عربية وعالمية، سلطات، حلويات ومشروبات مع تصنيفات واضحة وخطوات سهلة.",

  alternates: {
    canonical: "/recipes",
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
    title: "الوصفات",

    description:
      "تصفح وصفات شيف العرب حسب التصنيف والدولة ونوع الوجبة.",

    url: "/recipes",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "وصفات شيف العرب",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "الوصفات",
    description: "تصفح جميع وصفات شيف العرب بسهولة.",
    images: ["/og-image.jpg"],
  },
};

export default async function RecipesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const categoryParam = params.category;
  const pageParam = params.page;

  const initialCategory = Array.isArray(categoryParam)
    ? categoryParam[0] || null
    : categoryParam || null;

  const rawPage = Array.isArray(pageParam)
    ? pageParam[0]
    : pageParam;

  const parsedPage = Number.parseInt(
    rawPage || "1",
    10,
  );

  const initialPage =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const recipes = (recipesData as Recipe[]).filter(
    (recipe) =>
      !recipe.status || recipe.status === "published",
  );

  const categories = getCategories(recipes);

  return (
    <RecipesClient
      recipes={recipes}
      categories={categories}
      initialCategory={initialCategory}
      initialPage={initialPage}
    />
  );
}