//recipeSchema

/* =========================
   Types
========================= */

type DataBoxObject = {
  info?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  servings?: number;
  meal_type?: string;
  difficulty?: string;
  dish_type?: string;
};

type DataBox = DataBoxObject | string[];

export type RecipeInput = {
  title: string;
  alt?: string;
  slug: string;
  country?: string;
  language?: string;
  img?: { url: string; alt?: string } | string;
  category?: string[];
  tags?: string[];
  description?: string;
  intro?: string;
  steps?: string[] | string;
  ingredients?: string[];
  data_box?: DataBox;
  created_at?: string;
  updated_at?: string;
  nutrition?: Record<string, string>;
};

/* =========================
   Helpers
========================= */

const SITE_URL = "https://chefalarab.com";

function toAbsolute(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function findNumber(text: string) {
  const m = text.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : undefined;
}

function minutesToISO(min?: number) {
  if (!min || min <= 0) return undefined;
  return `PT${min}M`;
}

function isISODate(value?: string) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}([T ].+)?$/.test(value);
}

/* =========================
   DataBox Parser
========================= */

function parseDataBox(data?: DataBox) {
  if (data && !Array.isArray(data)) {
    const prep = data.prep_time_minutes;
    const cook = data.cook_time_minutes;
    const total = data.total_time_minutes ?? (prep && cook ? prep + cook : undefined);

    return {
      prep,
      cook,
      total,
      servings: data.servings,
      dishType: data.dish_type,
      mealType: data.meal_type,
      difficulty: data.difficulty,
    };
  }

  if (Array.isArray(data)) {
    const prepRow = data.find((x) => x.includes("وقت التحضير"));
    const cookRow = data.find((x) => x.includes("وقت الطبخ"));
    const servingsRow = data.find((x) => x.includes("عدد الأشخاص") || x.includes("عدد الافراد"));

    const prep = prepRow ? findNumber(prepRow) : undefined;
    const cook = cookRow ? findNumber(cookRow) : undefined;

    return {
      prep,
      cook,
      total: prep || cook ? (prep || 0) + (cook || 0) : undefined,
      servings: servingsRow ? findNumber(servingsRow) : undefined,
      dishType: undefined,
      mealType: undefined,
      difficulty: undefined,
    };
  }

  return {};
}

function normalizeCuisine(country?: string) {
  if (!country) return undefined;
  const c = country.trim();
  if (c.includes("المطبخ")) return c.replace("المطبخ", "").trim();
  return c;
}

/* =========================
   Recipe JSON-LD Builder
========================= */

export function buildRecipeJsonLd(recipe: RecipeInput) {
  const data = parseDataBox(recipe.data_box);

  const imageUrl = typeof recipe.img === "string" ? recipe.img : recipe.img?.url;
  const imageAlt = recipe.img && typeof recipe.img !== "string"
    ? recipe.img.alt || recipe.alt || recipe.title
    : recipe.alt || recipe.title;

  const fullDescription = [recipe.intro, recipe.description].filter(Boolean).join(" ").trim();
  const pageUrl = `${SITE_URL}/recipes/${encodeURIComponent(recipe.slug)}`;

  const image = imageUrl
    ? [{ "@type": "ImageObject", url: toAbsolute(imageUrl), caption: imageAlt, description: imageAlt }]
    : undefined;

  const recipeCategory = data.dishType || (recipe.category?.length ? recipe.category : undefined);
  const recipeCuisine = normalizeCuisine(recipe.country) || "عام";
  const keywords = [...(recipe.tags || []), ...(recipe.category || [])].join(", ") || undefined;

  const instructions =
    Array.isArray(recipe.steps)
      ? recipe.steps.map((step) => ({ "@type": "HowToStep", text: step }))
      : recipe.steps
      ? [{ "@type": "HowToStep", text: recipe.steps }]
      : undefined;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    inLanguage: recipe.language || "ar",
    name: recipe.title,
    description: fullDescription || recipe.title,
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    image,
    recipeCuisine,
    recipeCategory,
    keywords,
    prepTime: minutesToISO(data.prep),
    cookTime: minutesToISO(data.cook),
    totalTime: minutesToISO(data.total),
    recipeYield: data.servings ? `${data.servings} حصص` : undefined,
    recipeIngredient: recipe.ingredients?.length ? recipe.ingredients : undefined,
    recipeInstructions: instructions,
    author: { "@type": "Organization", name: "شيف العرب", url: SITE_URL },
    publisher: { "@type": "Organization", name: "شيف العرب", url: SITE_URL },
  };

  if (isISODate(recipe.created_at)) jsonLd.datePublished = recipe.created_at;
  if (isISODate(recipe.updated_at)) jsonLd.dateModified = recipe.updated_at;

  return JSON.parse(JSON.stringify(jsonLd, (_k, v) => (v === undefined ? undefined : v)));
}
