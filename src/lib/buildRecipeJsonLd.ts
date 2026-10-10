type DataBoxObject = {
  info?: string;
  prep_time_minutes?: number | string;
  cook_time_minutes?: number | string;
  total_time_minutes?: number | string;
  servings?: number | string;
  meal_type?: string;
  difficulty?: string;
  dish_type?: string;
};

type DataBox = DataBoxObject | string[];

type RecipeImage = {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
};

type FAQItem = {
  "@type"?: string;
  name?: string;
  acceptedAnswer?: {
    "@type"?: string;
    text?: string;
  };
};

type FAQSchema = {
  "@context"?: string;
  "@type"?: string;
  mainEntity?: FAQItem[];
};

export type RecipeInput = {
  title: string;
  alt?: string;
  slug: string;
  country?: string;
  language?: string;
  img?: RecipeImage | string;
  category?: string[];
  tags?: string[];
  description?: string;
  intro?: string;
  steps?: string[] | string;
  ingredients?: unknown;
  data_box?: DataBox;
  faq_schema?: FAQSchema;
  created_at?: string;
  updated_at?: string;
};

const SITE_URL = "https://chefalarab.com";

function toAbsolute(url?: string): string | undefined {
  if (!url) return undefined;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function findNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const match = String(value ?? "").match(/([0-9٠-٩]+)/);

  if (!match) {
    return undefined;
  }

  const normalized = match[1].replace(/[٠-٩]/g, (digit) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
  );

  const parsed = Number.parseInt(normalized, 10);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function minutesToISO(value: unknown): string | undefined {
  const minutes = findNumber(value);

  if (!minutes || minutes <= 0) {
    return undefined;
  }

  return `PT${minutes}M`;
}

function isISODate(value?: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function parseDataBox(data?: DataBox) {
  if (data && !Array.isArray(data)) {
    const prep = findNumber(data.prep_time_minutes);
    const cook = findNumber(data.cook_time_minutes);
    const explicitTotal = findNumber(data.total_time_minutes);

    return {
      prep,
      cook,
      total:
        explicitTotal ??
        (prep || cook ? (prep || 0) + (cook || 0) : undefined),
      servings: data.servings,
      dishType: data.dish_type,
      mealType: data.meal_type,
      difficulty: data.difficulty,
    };
  }

  if (Array.isArray(data)) {
    const prepRow = data.find((item) =>
      item.includes("وقت التحضير"),
    );

    const cookRow = data.find((item) =>
      item.includes("وقت الطبخ"),
    );

    const totalRow = data.find((item) =>
      item.includes("الوقت الكلي"),
    );

    const servingsRow = data.find(
      (item) =>
        item.includes("عدد الأشخاص") ||
        item.includes("عدد الافراد"),
    );

    const prep = findNumber(prepRow);
    const cook = findNumber(cookRow);

    return {
      prep,
      cook,
      total:
        findNumber(totalRow) ??
        (prep || cook ? (prep || 0) + (cook || 0) : undefined),
      servings: findNumber(servingsRow),
      dishType: undefined,
      mealType: undefined,
      difficulty: undefined,
    };
  }

  return {};
}

function normalizeCuisine(country?: string): string | undefined {
  if (!country) {
    return undefined;
  }

  return (
    country
      .replace(
        /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F]/gu,
        "",
      )
      .replace(/المطبخ/g, "")
      .replace(/\s+/g, " ")
      .trim() || undefined
  );
}

function normalizeIngredients(
  value: unknown,
): string[] | undefined {
  const items: string[] = [];

  const visit = (input: unknown) => {
    if (input === null || input === undefined) {
      return;
    }

    if (Array.isArray(input)) {
      for (const item of input) {
        visit(item);
      }

      return;
    }

    if (typeof input === "object") {
      for (const nested of Object.values(
        input as Record<string, unknown>,
      )) {
        visit(nested);
      }

      return;
    }

    const text = String(input).trim();

    if (!text || /[:：]\s*$/.test(text)) {
      return;
    }

    items.push(text);
  };

  visit(value);

  return items.length > 0
    ? Array.from(new Set(items))
    : undefined;
}

function cleanStepNumber(step: string): string {
  return step
    .replace(/^\s*[٠-٩0-9]+\s*[.\-:)،]?\s*/, "")
    .trim();
}

function normalizeInstructions(
  value: RecipeInput["steps"],
) {
  const steps = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const cleaned = steps
    .map(cleanStepNumber)
    .filter(Boolean);

  return cleaned.length > 0
    ? cleaned.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        text: step,
      }))
    : undefined;
}

/**
 * بناء Breadcrumb Schema تلقائي لكل وصفة
 */
function buildBreadcrumbJsonLd(recipe: RecipeInput) {
  const pageUrl = `${SITE_URL}/recipe/${encodeURIComponent(
    recipe.slug,
  )}`;

  const items: Array<Record<string, unknown>> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "الوصفات",
      item: `${SITE_URL}/recipes`,
    },
  ];

  const category = recipe.category?.[0]?.trim();

  if (category) {
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: category,
      item: `${SITE_URL}/recipes`,
    });
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: recipe.title,
    item: pageUrl,
  });

  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/**
 * بناء FAQ Schema من faq_schema الموجود داخل الوصفة
 */
function buildFaqJsonLd(recipe: RecipeInput) {
  const faq = recipe.faq_schema;

  if (
    !faq ||
    !Array.isArray(faq.mainEntity) ||
    faq.mainEntity.length === 0
  ) {
    return undefined;
  }

  const mainEntity = faq.mainEntity
    .filter(
      (item) =>
        item &&
        typeof item.name === "string" &&
        item.name.trim() &&
        item.acceptedAnswer &&
        typeof item.acceptedAnswer.text === "string" &&
        item.acceptedAnswer.text.trim(),
    )
    .map((item) => ({
      "@type": "Question",
      name: item.name!.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.acceptedAnswer!.text!.trim(),
      },
    }));

  if (mainEntity.length === 0) {
    return undefined;
  }

  return {
    "@type": "FAQPage",
    mainEntity,
  };
}

export function buildRecipeJsonLd(
  recipe: RecipeInput,
) {
  const data = parseDataBox(recipe.data_box);

  const imageUrl =
    typeof recipe.img === "string"
      ? recipe.img
      : recipe.img?.url;

  const imageAlt =
    typeof recipe.img === "string"
      ? recipe.alt || recipe.title
      : recipe.img?.alt ||
        recipe.alt ||
        recipe.title;

  const fullDescription = [
    recipe.intro,
    recipe.description,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const pageUrl = `${SITE_URL}/recipe/${encodeURIComponent(
    recipe.slug,
  )}`;

  const absoluteImage = toAbsolute(imageUrl);

  /**
   * Recipe Schema
   */
  const recipeJsonLd: Record<string, unknown> = {
    "@type": "Recipe",

    inLanguage: recipe.language || "ar",

    name: recipe.title,

    description:
      fullDescription || recipe.title,

    url: pageUrl,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },

    image: absoluteImage
      ? [
          {
            "@type": "ImageObject",
            url: absoluteImage,
            caption: imageAlt,
            description: imageAlt,
          },
        ]
      : undefined,

    recipeCuisine:
      normalizeCuisine(recipe.country),

    recipeCategory:
      data.dishType ||
      recipe.category?.[0],

    keywords:
      [
        ...(recipe.tags || []),
        ...(recipe.category || []),
      ]
        .filter(Boolean)
        .join(", ") || undefined,

    prepTime:
      minutesToISO(data.prep),

    cookTime:
      minutesToISO(data.cook),

    totalTime:
      minutesToISO(data.total),

    recipeYield:
      data.servings !== undefined &&
      data.servings !== null
        ? String(data.servings)
        : undefined,

    recipeIngredient:
      normalizeIngredients(recipe.ingredients),

    recipeInstructions:
      normalizeInstructions(recipe.steps),

    author: {
      "@type": "Organization",
      name: "شيف العرب",
      url: SITE_URL,
    },

    publisher: {
      "@type": "Organization",
      name: "شيف العرب",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.webp`,
      },
    },
  };

  if (isISODate(recipe.created_at)) {
    recipeJsonLd.datePublished =
      recipe.created_at;
  }

  if (isISODate(recipe.updated_at)) {
    recipeJsonLd.dateModified =
      recipe.updated_at;
  }

  /**
   * Breadcrumb Schema
   */
  const breadcrumbJsonLd =
    buildBreadcrumbJsonLd(recipe);

  /**
   * FAQ Schema
   */
  const faqJsonLd =
    buildFaqJsonLd(recipe);

  /**
   * جمع كل الـ Structured Data
   */
  const graph = [
    recipeJsonLd,
    breadcrumbJsonLd,
    ...(faqJsonLd
      ? [faqJsonLd]
      : []),
  ];

  /**
   * تنظيف القيم undefined والفارغة
   */
  return JSON.parse(
    JSON.stringify(
      {
        "@context": "https://schema.org",
        "@graph": graph,
      },
      (_key, value) =>
        value === undefined ||
        value === ""
          ? undefined
          : value,
    ),
  );
}