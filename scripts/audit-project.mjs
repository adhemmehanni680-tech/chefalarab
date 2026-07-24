import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const strictAssets = process.argv.includes("--strict-assets");
const root = process.cwd();
const recipesPath = join(root, "src", "data", "recipes.json");
const recipes = JSON.parse(readFileSync(recipesPath, "utf8"));

if (!Array.isArray(recipes)) {
  throw new Error("src/data/recipes.json must contain a JSON array.");
}

const idCounts = new Map();
const slugCounts = new Map();
const invalidRecipes = [];
const missingAssets = [];

for (const recipe of recipes) {
  if (!recipe?.title || !recipe?.slug) {
    invalidRecipes.push(recipe?.id ?? "unknown");
  }

  idCounts.set(recipe?.id, (idCounts.get(recipe?.id) || 0) + 1);
  slugCounts.set(recipe?.slug, (slugCounts.get(recipe?.slug) || 0) + 1);

  const imageValues =
    typeof recipe?.img === "string"
      ? [recipe.img]
      : [recipe?.img?.url, recipe?.img?.["url-card"]];

  for (const imagePath of imageValues) {
    if (typeof imagePath !== "string" || !imagePath.startsWith("/")) continue;
    if (!existsSync(join(root, "public", imagePath.slice(1)))) {
      missingAssets.push(imagePath);
    }
  }
}

const duplicateIds = [...idCounts].filter(([, count]) => count > 1);
const duplicateSlugs = [...slugCounts].filter(([, count]) => count > 1);
const structuralErrors =
  invalidRecipes.length + duplicateIds.length + duplicateSlugs.length;

console.log(`Recipes: ${recipes.length}`);
console.log(`Invalid required fields: ${invalidRecipes.length}`);
console.log(`Duplicate IDs: ${duplicateIds.length}`);
console.log(`Duplicate slugs: ${duplicateSlugs.length}`);
console.log(`Missing local image files: ${missingAssets.length}`);

if (missingAssets.length > 0) {
  console.warn(
    "Restore public/uploads and public/card before production deployment.",
  );
}

if (structuralErrors > 0 || (strictAssets && missingAssets.length > 0)) {
  process.exitCode = 1;
}
