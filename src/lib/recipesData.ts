import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

export type RecipeData = {
  id?: number;
  title: string;
  slug: string;
  status?: string;
  [key: string]: any;
};

function resolveRecipesPath(): string {
  return path.join(process.cwd(), "src", "data", "recipes.json");
}

export const getAllRecipes = cache((): RecipeData[] => {
  const file = readFileSync(resolveRecipesPath(), "utf8");
  const parsed: unknown = JSON.parse(file);

  if (!Array.isArray(parsed)) {
    throw new Error("src/data/recipes.json must contain a JSON array.");
  }

  return parsed as RecipeData[];
});

export const getPublishedRecipes = cache((): RecipeData[] =>
  getAllRecipes().filter((recipe) => recipe.status === "published"),
);
