import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

export type RecipeData = any;

export const getAllRecipes = cache((): RecipeData[] => {
  const recipesPath = path.join(process.cwd(), "src", "data", "recipes.json");
  return JSON.parse(readFileSync(recipesPath, "utf8")) as RecipeData[];
});
