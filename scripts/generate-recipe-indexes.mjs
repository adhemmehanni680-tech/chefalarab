import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dataDir = join(root, "src", "data");
const sourcePath = join(dataDir, "recipes.json");
const catalogPath = join(dataDir, "recipes-catalog.json");

const recipes = JSON.parse(readFileSync(sourcePath, "utf8"));

if (!Array.isArray(recipes)) {
  throw new Error("src/data/recipes.json must contain a JSON array.");
}

const published = recipes.filter(
  (recipe) => !recipe?.status || recipe.status === "published",
);

const normalizeList = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
};

const toCardPath = (value) => {
  if (typeof value !== "string" || !value) return null;

  const clean = value.split("?")[0].split("#")[0].replace(/\\/g, "/");
  const fileName = clean.split("/").filter(Boolean).pop();

  if (!fileName || /^https?:\/\//i.test(clean)) return null;
  return `/card/${fileName}`;
};

const catalog = published.map((recipe) => {
  const rawImage = recipe?.img;
  const mainUrl =
    typeof rawImage === "string"
      ? rawImage
      : rawImage && typeof rawImage === "object"
        ? rawImage.url || rawImage["url-card"]
        : null;
  const explicitCard =
    rawImage && typeof rawImage === "object" ? rawImage["url-card"] : null;
  const cardUrl = explicitCard || toCardPath(mainUrl) || mainUrl || "/Heeder.webp";

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    country: recipe.country || "",
    category: normalizeList(recipe.category),
    tags: normalizeList(recipe.tags),
    img: {
      "url-card": cardUrl,
    },
  };
});

writeFileSync(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");

console.log(
  `Recipe catalog generated: ${published.length} published recipes.`,
);
