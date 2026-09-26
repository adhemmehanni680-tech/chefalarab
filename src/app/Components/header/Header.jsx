import { getPublishedRecipes } from "@/lib/recipesData";
import HeaderClient from "./HeaderClient";
import { Suspense } from "react";

const normalize = (value) =>
  typeof value === "string" ? value.trim() : "";

const uniqueSorted = (values) =>
  [...new Set(values.map(normalize).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "ar"),
  );

export default function Header() {
  const recipes = getPublishedRecipes();

  // لا نرسل الوصفات الكاملة للمتصفح؛ فقط بيانات القوائم الخفيفة.
  const categories = uniqueSorted(
    recipes.flatMap((recipe) =>
      Array.isArray(recipe.category) ? recipe.category : [],
    ),
  );

  const recipesByKitchen = new Map();
  [...recipes]
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
    .forEach((recipe) => {
      const kitchen = normalize(recipe.country);
      if (!kitchen) return;

      const current = recipesByKitchen.get(kitchen) ?? [];
      if (current.length < 3) {
        current.push({ title: recipe.title, slug: recipe.slug });
        recipesByKitchen.set(kitchen, current);
      }
    });

  const kitchens = [...recipesByKitchen.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ar"))
    .map(([title, kitchenRecipes]) => ({
      title,
      recipes: kitchenRecipes,
    }));

  return (
    <Suspense fallback={<div aria-hidden="true" className="h-[72px] w-full" />}>
      <HeaderClient kitchens={kitchens} categories={categories} />
    </Suspense>
  );
}
