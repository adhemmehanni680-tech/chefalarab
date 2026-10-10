import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const strictAssets = process.argv.includes("--strict-assets");
const root = process.cwd();
const recipesPath = join(root, "src", "data", "recipes.json");
const recipes = JSON.parse(readFileSync(recipesPath, "utf8"));

if (!Array.isArray(recipes)) {
  throw new Error("src/data/recipes.json must contain a JSON array.");
}

const REQUIRED_PUBLIC_ASSETS = [
  "/Heeder.webp",
  "/favicon.ico",
  "/favicon.webp",
  "/apple-touch-icon.png",
  "/og-image.jpg",
  "/manifest.webmanifest",
  "/sw.js",
  "/ads.txt",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];

const PROHIBITED_PATTERNS = [
  {
    label: "خنزير",
    pattern: /(?<![\w\u0600-\u06ff])خنزير(?![\w\u0600-\u06ff])/iu,
  },
  {
    label: "لحم خنزير",
    pattern: /لحم\s+خنزير/iu,
  },
  {
    label: "pork",
    pattern: /\bpork\b/iu,
  },
  {
    label: "bacon",
    pattern: /\bbacon\b/iu,
  },
  {
    label: "كحول",
    pattern: /(?<![\w\u0600-\u06ff])كحول(?:ي|ية)?(?![\w\u0600-\u06ff])/iu,
  },
  {
    label: "نبيذ",
    pattern: /(?<![\w\u0600-\u06ff])نبيذ(?![\w\u0600-\u06ff])/iu,
  },
  {
    label: "خمر",
    pattern: /(?<![\w\u0600-\u06ff])خمر(?![\w\u0600-\u06ff])/iu,
  },
  {
    label: "wine/vodka/beer",
    pattern: /\b(?:wine|vodka|beer)\b/iu,
  },
  {
    label: "جيلاتين الخنزير",
    pattern: /جيلاتين\s+(?:من\s+)?الخنزير/iu,
  },
];

const idCounts = new Map();
const slugCounts = new Map();
const invalidRecipes = [];
const missingAssets = new Map();
const missingByArea = new Map();
const prohibitedHits = [];

function textPreview(value, limit = 180) {
  const compact = String(value).replace(/\s+/g, " ").trim();

  return compact.length > limit
    ? `${compact.slice(0, limit - 1)}…`
    : compact;
}

function walkStrings(value, path, visitor) {
  if (typeof value === "string") {
    visitor(value, path || "(root)");
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkStrings(item, `${path}[${index}]`, visitor);
    });

    return;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      walkStrings(
        item,
        path ? `${path}.${key}` : key,
        visitor,
      );
    }
  }
}

function recordMissing(
  imagePath,
  recipe,
  field,
) {
  const existing =
    missingAssets.get(imagePath);

  if (existing) {
    existing.references.push({
      id: recipe?.id ?? "unknown",
      title:
        recipe?.title ?? "Untitled",
      field,
    });

    return;
  }

  missingAssets.set(imagePath, {
    path: imagePath,

    references: [
      {
        id:
          recipe?.id ??
          "unknown",

        title:
          recipe?.title ??
          "Untitled",

        field,
      },
    ],
  });

  const area =
    imagePath
      .split("/")
      .filter(Boolean)[0] ||
    "root";

  missingByArea.set(
    area,
    (missingByArea.get(area) || 0) + 1,
  );
}

for (const recipe of recipes) {
  if (
    !recipe?.id ||
    !recipe?.title ||
    !recipe?.slug
  ) {
    invalidRecipes.push(
      recipe?.id ?? "unknown",
    );
  }

  idCounts.set(
    recipe?.id,
    (idCounts.get(recipe?.id) || 0) + 1,
  );

  slugCounts.set(
    recipe?.slug,
    (slugCounts.get(recipe?.slug) ||
      0) + 1,
  );

  const imageValues =
    typeof recipe?.img === "string"
      ? [
          {
            field: "img",
            value: recipe.img,
          },
        ]
      : [
          {
            field: "img.url",
            value:
              recipe?.img?.url,
          },
          {
            field: "img.url-card",
            value:
              recipe?.img?.[
                "url-card"
              ],
          },
        ];

  for (const {
    field,
    value: imagePath,
  } of imageValues) {
    if (
      typeof imagePath !==
        "string" ||
      !imagePath.startsWith("/")
    ) {
      continue;
    }

    if (
      !existsSync(
        join(
          root,
          "public",
          imagePath.slice(1),
        ),
      )
    ) {
      recordMissing(
        imagePath,
        recipe,
        field,
      );
    }
  }

  walkStrings(
    recipe,
    "",
    (text, field) => {
      for (const {
        label,
        pattern,
      } of PROHIBITED_PATTERNS) {
        const match =
          text.match(pattern);

        if (!match) {
          continue;
        }

        prohibitedHits.push({
          id: recipe.id,
          title: recipe.title,
          field,
          term: match[0],
          label,
          preview:
            textPreview(text),
        });
      }
    },
  );
}

const missingRequiredAssets =
  REQUIRED_PUBLIC_ASSETS.filter(
    (asset) =>
      !existsSync(
        join(
          root,
          "public",
          asset.slice(1),
        ),
      ),
  );

const duplicateIds =
  [...idCounts].filter(
    ([, count]) =>
      count > 1,
  );

const duplicateSlugs =
  [...slugCounts].filter(
    ([, count]) =>
      count > 1,
  );

const prohibitedRecipeIds =
  new Set(
    prohibitedHits.map(
      (item) =>
        item.id,
    ),
  );

const structuralErrors =
  invalidRecipes.length +
  duplicateIds.length +
  duplicateSlugs.length +
  missingRequiredAssets.length +
  prohibitedRecipeIds.size;

console.log(
  `Recipes: ${recipes.length}`,
);

console.log(
  `Invalid required fields: ${invalidRecipes.length}`,
);

console.log(
  `Duplicate IDs: ${duplicateIds.length}`,
);

console.log(
  `Duplicate slugs: ${duplicateSlugs.length}`,
);

console.log(
  `Recipes with prohibited pork/alcohol terms: ${prohibitedRecipeIds.size}`,
);

console.log(
  `Detailed prohibited matches: ${prohibitedHits.length}`,
);

console.log(
  `Missing required public assets: ${missingRequiredAssets.length}`,
);

console.log(
  `Missing local recipe images: ${missingAssets.size}`,
);

for (const [area, count] of [
  ...missingByArea,
].sort()) {
  console.log(
    `  - /${area}/: ${count}`,
  );
}

if (invalidRecipes.length) {
  console.error(
    `Invalid recipe IDs: ${invalidRecipes.join(
      ", ",
    )}`,
  );
}

if (duplicateIds.length) {
  console.error(
    `Duplicate IDs: ${duplicateIds
      .map(
        ([id, count]) =>
          `${id} (${count}x)`,
      )
      .join(", ")}`,
  );
}

if (duplicateSlugs.length) {
  console.error(
    `Duplicate slugs: ${duplicateSlugs
      .map(
        ([slug, count]) =>
          `${slug} (${count}x)`,
      )
      .join(", ")}`,
  );
}

if (
  missingRequiredAssets.length
) {
  console.error(
    `Missing required assets: ${missingRequiredAssets.join(
      ", ",
    )}`,
  );
}

if (prohibitedHits.length) {
  console.error(
    "\nProhibited content details:",
  );

  for (const item of prohibitedHits.slice(
    0,
    50,
  )) {
    console.error(
      `  ID ${item.id} | ${item.title}\n` +
        `    field: ${item.field}\n` +
        `    term: ${JSON.stringify(
          item.term,
        )} (${item.label})\n` +
        `    text: ${item.preview}`,
    );
  }

  if (
    prohibitedHits.length >
    50
  ) {
    console.error(
      `  ... ${
        prohibitedHits.length -
        50
      } more matches omitted.`,
    );
  }
}

if (missingAssets.size > 0) {
  console.warn(
    "\nMissing recipe image details:",
  );

  for (const item of [
    ...missingAssets.values(),
  ].slice(0, 50)) {
    const refs =
      item.references
        .slice(0, 5)
        .map(
          (ref) =>
            `${ref.id}:${ref.title} [${ref.field}]`,
        )
        .join(" | ");

    console.warn(
      `  ${item.path} <- ${refs}`,
    );

    if (
      item.references.length >
      5
    ) {
      console.warn(
        `    ... ${
          item.references
            .length - 5
        } more references`,
      );
    }
  }

  if (
    missingAssets.size >
    50
  ) {
    console.warn(
      `  ... ${
        missingAssets.size -
        50
      } more missing paths omitted.`,
    );
  }

  const onlyUploadsMissing =
    [
      ...missingAssets.keys(),
    ].every((asset) =>
      asset.startsWith(
        "/uploads/",
      ),
    );

  if (onlyUploadsMissing) {
    console.warn(
      "Only public/uploads recipe images are missing from this working package. Restore the site's existing public/uploads folder before deployment.",
    );
  } else {
    console.warn(
      "Some local recipe assets outside public/uploads are missing; inspect the details above before deployment.",
    );
  }
}

if (
  structuralErrors > 0 ||
  (
    strictAssets &&
    missingAssets.size > 0
  )
) {
  process.exitCode = 1;
}