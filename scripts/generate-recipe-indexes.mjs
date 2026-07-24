import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dataDir = join(root, "src", "data");
const sourcePath = join(dataDir, "recipes.json");

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

const normalizeImage = (image) => {
  if (typeof image === "string") {
    return { url: image, "url-card": image };
  }

  if (!image || typeof image !== "object") {
    return { url: "/Heeder.webp", "url-card": "/Heeder.webp" };
  }

  return {
    url: image.url || image["url-card"] || "/Heeder.webp",
    "url-card": image["url-card"] || image.url || "/Heeder.webp",
    alt: image.alt || undefined,
    width: image.width || undefined,
    height: image.height || undefined,
  };
};

const index = published.map((recipe) => ({
  id: recipe.id,
  title: recipe.title,
  slug: recipe.slug,
  status: recipe.status || "published",
  country: recipe.country || "",
  category: normalizeList(recipe.category),
  tags: normalizeList(recipe.tags),
  img: normalizeImage(recipe.img),
}));

// This compact catalogue is serialized to the /recipes Client Component.
// Keep only fields that filtering and recipe cards actually need.
const catalog = index.map((recipe) => ({
  id: recipe.id,
  title: recipe.title,
  slug: recipe.slug,
  country: recipe.country,
  category: recipe.category,
  tags: recipe.tags,
  img: {
    "url-card": recipe.img["url-card"] || recipe.img.url,
  },
}));

const search = index.map((recipe) => ({
  id: recipe.id,
  title: recipe.title,
  slug: recipe.slug,
  status: recipe.status,
}));

const writeJson = (name, value) => {
  writeFileSync(
    join(dataDir, name),
    `${JSON.stringify(value)}\n`,
    "utf8",
  );
};

writeJson("recipes-index.json", index);
writeJson("recipes-catalog.json", catalog);
writeJson("recipes-search.json", search);

console.log(
  `Recipe indexes generated: ${published.length} published recipes.`,
);
