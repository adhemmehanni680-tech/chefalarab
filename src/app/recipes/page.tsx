// app/recipes/page.jsx
import React from "react";
import RecipesClient from "./RecipesClient";
import recipesData from "@/data/recipes.json";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;
  img: {
    url: string;
    alt?: string;
  };
};

const hasCategory = (recipe: Recipe, category: string): boolean => {
  if (!recipe.category) return false;
  return Array.isArray(recipe.category)
    ? recipe.category.includes(category)
    : recipe.category === category;
};

const getCategories = (recipes: Recipe[]): string[] => {
  const set = new Set<string>();
  recipes.forEach((recipe) => {
    if (!recipe.category) return;
    const cats = Array.isArray(recipe.category) ? recipe.category : [recipe.category];
    cats.forEach((c) => set.add(c));
  });
  return Array.from(set);
};

const RecipesPageSkeleton = () => (
  <div className="dark:bg-gray-900 min-h-screen text-white pb-24 pt-16 mt-16">
    <h1 className="text-center font-bold text-3xl mb-6 animate-pulse bg-gray-700 h-12 w-3/4 mx-auto rounded"></h1>
    <div className="max-w-[1500px] mx-auto flex gap-6 px-3">
      <aside className="hidden lg:block w-[220px]">
        <div className="sticky top-24 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-60 bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </aside>
      <main className="flex-1">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-[#111827] rounded-2xl overflow-hidden border border-gray-700 animate-pulse">
              <div className="h-56 bg-gray-700"></div>
              <div className="p-4 text-center space-y-2">
                <div className="h-6 bg-gray-600 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-500 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <aside className="hidden lg:block w-[295px]">
        <div className="sticky top-24 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </aside>
    </div>
  </div>
);

export const metadata = {
  title: "الوصفات | شيف العرب",
  description:
    "تصفح جميع وصفات شيف العرب: أطباق عربية وغربية، سلطات، حلويات، ومشروبات. اختر التصنيف واستكشف وصفات مجربة وسهلة.",
  alternates: {
    canonical: "https://chefalarab.com/recipe",
    url: "https://chefalarab.com/recipe",
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
    title: "الوصفات | شيف العرب",
    description:
      "تصفح جميع وصفات شيف العرب حسب التصنيف: العربي، الغربي، سلطات، حلويات، ومشروبات.",
    url: "https://www.chefalarab.com/recipe",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "الوصفات | شيف العرب",
    description:
      "تصفح جميع وصفات شيف العرب حسب التصنيف: العربي، الغربي، سلطات، حلويات، ومشروبات.",
  },
};

export default async function Page({ searchParams }: { searchParams?: { category?: string } }) {
  const recipes = recipesData as Recipe[];
  const categories = getCategories(recipes);
  // انتظر searchParams قبل استخدام خصائصه
  const params = await searchParams;
  const initialCategory = params?.category || null;

  return (
    <React.Suspense fallback={<RecipesPageSkeleton />}>
      <RecipesClient
        recipes={recipes}
        categories={categories}
        initialCategory={initialCategory}
      />
    </React.Suspense>
  );
}