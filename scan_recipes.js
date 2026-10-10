const fs = require("fs");

const path = "src/data/recipes.json";

const data = JSON.parse(
  fs.readFileSync(path, "utf8"),
);

const terms = [
  { key: "خنزير", label: "لحم خنزير" },
  { key: "خمر", label: "خمر" },
  { key: "خمور", label: "خمور" },
  { key: "كحول", label: "كحول" },
  { key: "نبيذ", label: "نبيذ" },
  { key: "بيرة", label: "بيرة" },
  { key: "فودكا", label: "فودكا" },
  { key: "روم", label: "روم" },
  { key: "ويسكي", label: "ويسكي" },
  { key: "براندي", label: "براندي" },
  { key: "شامبانيا", label: "شامبانيا" },
];

const regexes = terms.map((term) => ({
  label: term.label,
  re: new RegExp(
    `(?:^|[^\\u0600-\\u06FF])${term.key}(?:[^\\u0600-\\u06FF]|$)`,
    "iu",
  ),
}));

const normalizeField = (value) => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map(normalizeField)
      .join(" ");
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.values(value)
      .map(normalizeField)
      .join(" ");
  }

  return "";
};

const matches = [];

for (
  let index = 0;
  index < data.length;
  index += 1
) {
  const recipe = data[index];

  const text = [
    recipe.title,
    recipe.slug,
    recipe.intro,
    recipe.description,
    normalizeField(recipe.ingredients),
    normalizeField(recipe.steps),
    normalizeField(recipe.tags),
    normalizeField(recipe.category),
    recipe.img?.alt,
  ]
    .join(" ")
    .toLowerCase();

  const found = regexes
    .filter(({ re }) => re.test(text))
    .map(({ label }) => label);

  if (found.length > 0) {
    matches.push({
      index,
      id: recipe.id,
      title: recipe.title,
      reasons: [...new Set(found)],
    });
  }
}

const titleMap = new Map();
const slugMap = new Map();

for (
  let index = 0;
  index < data.length;
  index += 1
) {
  const recipe = data[index];

  const title = recipe.title.trim();
  const slug = recipe.slug.trim();

  if (!titleMap.has(title)) {
    titleMap.set(title, []);
  }

  titleMap.get(title).push({
    index,
    id: recipe.id,
  });

  if (!slugMap.has(slug)) {
    slugMap.set(slug, []);
  }

  slugMap.get(slug).push({
    index,
    id: recipe.id,
  });
}

const duplicateTitles =
  Array.from(
    titleMap.entries(),
  ).filter(
    ([, items]) => items.length > 1,
  );

const duplicateSlugs =
  Array.from(
    slugMap.entries(),
  ).filter(
    ([, items]) => items.length > 1,
  );

console.log(
  "FOUND_MATCHES",
  matches.length,
);

for (const match of matches) {
  console.log(
    `${match.id}|${match.title}|${match.reasons.join(",")}`,
  );
}

console.log(
  "FOUND_DUP_TITLES",
  duplicateTitles.length,
);

for (
  const [title, items] of duplicateTitles
) {
  console.log(
    "DUP_TITLE",
    title,
  );

  items.forEach((item) => {
    console.log(
      `  ${item.id}`,
    );
  });
}

console.log(
  "FOUND_DUP_SLUGS",
  duplicateSlugs.length,
);

for (
  const [slug, items] of duplicateSlugs
) {
  console.log(
    "DUP_SLUG",
    slug,
  );

  items.forEach((item) => {
    console.log(
      `  ${item.id}`,
    );
  });
}