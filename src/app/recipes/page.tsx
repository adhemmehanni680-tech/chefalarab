import type { Metadata } from "next";
import RecipesClient from "./RecipesClient";
import { getPublishedRecipes } from "@/lib/recipesData";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  status?: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;
  excerpt?: string;
  cookingTimeMinutes?: number | null;
  contentFlags?: unknown;
  img: {
    url?: string;
    "url-card"?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

type PageProps = {
  searchParams: Promise<{
    category?: string | string[];
    country?: string | string[];
    tag?: string | string[];
    discover?: string | string[];
    view?: string | string[];
    group?: string | string[];
    page?: string | string[];
  }>;
};

const SITE_URL = "https://chefalarab.com";
const RECIPES_PATH = "/recipes";
const SEO_PAGE_SIZE = 12;

const BASE_TITLE = "وصفات طبخ عربية وعالمية سهلة";

const BASE_DESCRIPTION =
  "اكتشف أكثر من ألف وصفة طبخ عربية وعالمية سهلة، بمقادير دقيقة وخطوات واضحة ونصائح عملية للأطباق الرئيسية والحلويات والمشروبات.";

/* =========================================================
   HELPERS
========================================================= */

function firstParam(
  value?: string | string[],
): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function positivePage(
  value?: string | string[],
): number {
  const parsed = Number.parseInt(
    firstParam(value) || "1",
    10,
  );

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : 1;
}

function readableFilter(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function serializeJsonLd(
  value: unknown,
): string {
  return JSON.stringify(value).replace(
    /</g,
    "\\u003c",
  );
}

function getFilterTitle(
  params: Awaited<PageProps["searchParams"]>,
): string | null {
  const tag = firstParam(params.tag);
  const country = firstParam(params.country);
  const category = firstParam(params.category);
  const group = firstParam(params.group);
  const discover = firstParam(params.discover);

  if (tag) {
    return readableFilter(tag);
  }

  if (country) {
    return readableFilter(country);
  }

  if (category) {
    return readableFilter(category);
  }

  if (group === "desserts") {
    return "الحلويات الشرقية والعالمية";
  }

  if (group === "drinks") {
    return "المشروبات الساخنة والعصائر";
  }

  if (group === "birthdays") {
    return "حلويات وكيكات أعياد الميلاد";
  }

  if (discover === "latest") {
    return "أحدث الوصفات";
  }

  if (discover === "quick") {
    return "وصفات سريعة التحضير";
  }

  if (discover === "family") {
    return "وصفات عائلية";
  }

  return null;
}

function numericValue(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /\d+(?:[.,]\d+)?/,
  );

  if (!match) {
    return null;
  }

  const parsed = Number(
    match[0].replace(",", "."),
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function getCategories(
  recipes: Recipe[],
): string[] {
  const categories = new Set<string>();

  for (const recipe of recipes) {
    const values = Array.isArray(
      recipe.category,
    )
      ? recipe.category
      : recipe.category
        ? [recipe.category]
        : [];

    for (const category of values) {
      if (category) {
        categories.add(category);
      }
    }
  }

  return Array.from(categories).sort(
    (a, b) =>
      a.localeCompare(
        b,
        "ar",
      ),
  );
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;

  const page = positivePage(params.page);

  const filterTitle =
    getFilterTitle(params);

  const hasFacet = Boolean(
    firstParam(params.category) ||
      firstParam(params.country) ||
      firstParam(params.tag) ||
      firstParam(params.discover) ||
      firstParam(params.view) ||
      firstParam(params.group),
  );

  const totalRecipes =
    getPublishedRecipes().length;

  const maxPage = Math.max(
    1,
    Math.ceil(
      totalRecipes /
        SEO_PAGE_SIZE,
    ),
  );

  const validPage =
    page <= maxPage;

  const shouldIndex =
    !hasFacet && validPage;

  const pageSuffix =
    page > 1
      ? ` – الصفحة ${page}`
      : "";

  const title = filterTitle
    ? `وصفات ${filterTitle}`
    : `${BASE_TITLE}${pageSuffix}`;

  const description = filterTitle
    ? `تصفح وصفات ${filterTitle} على شيف العرب، مع مقادير واضحة وخطوات سهلة ونصائح عملية لنتيجة ناجحة.`
    : BASE_DESCRIPTION;

  const canonical =
    !hasFacet && page > 1
      ? `${RECIPES_PATH}?page=${page}`
      : RECIPES_PATH;

  return {
    title,
    description,

    keywords: [
      "وصفات طبخ",
      "وصفات عربية",
      "أكلات سهلة",
      "أكلات سريعة",
      "وصفات مجربة",
      "طبخ عربي",
      "حلويات",
      "أطباق رئيسية",
      "شيف العرب",
    ],

    authors: [
      {
        name: "شيف العرب",
        url: SITE_URL,
      },
    ],

    creator: "شيف العرب",
    publisher: "شيف العرب",
    category: "الطبخ والوصفات",

    alternates: {
      canonical,
      languages: {
        "ar-EG": canonical,
        ar: canonical,
      },
    },

    robots: {
      index: shouldIndex,
      follow: true,

      googleBot: {
        index: shouldIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "شيف العرب",
      type: "website",
      locale: "ar_AR",

      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "مجموعة وصفات شيف العرب العربية والعالمية",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function RecipesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const categoryParam =
    params.category;

  const countryParam =
    params.country;

  const tagParam =
    params.tag;

  const discoverParam =
    params.discover;

  const viewParam =
    params.view;

  const groupParam =
    params.group;

  const pageParam =
    params.page;

  /* =======================================================
     INITIAL CATEGORY
  ======================================================= */

  const initialCategory =
    Array.isArray(categoryParam)
      ? categoryParam[0] || null
      : categoryParam || null;

  /* =======================================================
     INITIAL COUNTRY
  ======================================================= */

  const initialCountry =
    Array.isArray(countryParam)
      ? countryParam[0] || null
      : countryParam || null;

  /* =======================================================
     INITIAL TAG
  ======================================================= */

  const initialTag =
    Array.isArray(tagParam)
      ? tagParam[0] || null
      : tagParam || null;

  /* =======================================================
     INITIAL DISCOVER
  ======================================================= */

  const rawDiscover =
    Array.isArray(discoverParam)
      ? discoverParam[0]
      : discoverParam;

  const discoverValues = [
    "latest",
    "quick",
    "family",
  ] as const;

  const initialDiscover =
    discoverValues.includes(
      rawDiscover as
        (typeof discoverValues)[number],
    )
      ? (rawDiscover as
          (typeof discoverValues)[number])
      : null;

  /* =======================================================
     INITIAL VIEW
  ======================================================= */

  const rawView =
    Array.isArray(viewParam)
      ? viewParam[0]
      : viewParam;

  const initialShowAllTags =
    rawView === "tags";

  /* =======================================================
     INITIAL GROUP
  ======================================================= */

  const rawGroup =
    Array.isArray(groupParam)
      ? groupParam[0]
      : groupParam;

  const groupValues = [
    "desserts",
    "drinks",
    "birthdays",
  ] as const;

  const initialGroup =
    groupValues.includes(
      rawGroup as
        (typeof groupValues)[number],
    )
      ? (rawGroup as
          (typeof groupValues)[number])
      : null;

  /* =======================================================
     INITIAL PAGE
  ======================================================= */

  const rawPage =
    Array.isArray(pageParam)
      ? pageParam[0]
      : pageParam;

  const parsedPage =
    Number.parseInt(
      rawPage || "1",
      10,
    );

  const initialPage =
    Number.isFinite(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  /* =======================================================
     RECIPES DATA
  ======================================================= */

  const recipes: Recipe[] =
    getPublishedRecipes().map(
      (recipe) => {
        const source =
          recipe as Record<
            string,
            any
          >;

        const box =
          source.data_box ?? {};

        return {
          id: Number(source.id),

          title: String(
            source.title ?? "",
          ),

          slug: String(
            source.slug ?? "",
          ),

          country:
            source.country,

          category:
            source.category,

          tags:
            source.tags,

          excerpt:
            String(
              source.intro ??
                source.description ??
                "",
            )
              .replace(
                /\s+/g,
                " ",
              )
              .trim()
              .slice(
                0,
                160,
              ),

          img:
            source.img,

          cookingTimeMinutes:
            numericValue(
              source.cooking_time ??
                source.cook_time ??
                box.total_time_minutes ??
                box.cook_time_minutes,
            ),

          contentFlags:
            source.content_flags ??
            null,
        };
      },
    );

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories =
    getCategories(recipes);

  /* =======================================================
     SEO FACETS
  ======================================================= */

  const hasSeoFacet = Boolean(
    initialCategory ||
      initialCountry ||
      initialTag ||
      initialDiscover ||
      initialShowAllTags ||
      initialGroup,
  );

  /* =======================================================
     CANONICAL
  ======================================================= */

  const seoCanonical =
    !hasSeoFacet &&
    initialPage > 1
      ? `${SITE_URL}${RECIPES_PATH}?page=${initialPage}`
      : `${SITE_URL}${RECIPES_PATH}`;

  /* =======================================================
     SEO PAGE RECIPES
  ======================================================= */

  const seoPageRecipes =
    !hasSeoFacet
      ? recipes.slice(
          (initialPage - 1) *
            SEO_PAGE_SIZE,

          initialPage *
            SEO_PAGE_SIZE,
        )
      : [];

  /* =======================================================
     STRUCTURED DATA IDS
  ======================================================= */

  const collectionId =
    `${SITE_URL}${RECIPES_PATH}#collection`;

  const itemListId =
    `${seoCanonical}#recipe-list`;

  /* =======================================================
     STRUCTURED GRAPH
  ======================================================= */

  const structuredGraph: Record<
    string,
    unknown
  >[] = [
    {
      "@type":
        "CollectionPage",

      "@id":
        collectionId,

      url:
        seoCanonical,

      name:
        initialPage > 1 &&
        !hasSeoFacet
          ? `${BASE_TITLE} – الصفحة ${initialPage}`
          : BASE_TITLE,

      description:
        BASE_DESCRIPTION,

      inLanguage:
        "ar",

      isPartOf: {
        "@type":
          "WebSite",

        "@id":
          `${SITE_URL}/#website`,

        url:
          SITE_URL,

        name:
          "شيف العرب",

        inLanguage:
          "ar",
      },

      primaryImageOfPage: {
        "@type":
          "ImageObject",

        url:
          `${SITE_URL}/og-image.jpg`,

        width: 1200,
        height: 630,
      },

      breadcrumb: {
        "@id":
          `${SITE_URL}${RECIPES_PATH}#breadcrumb`,
      },

      ...(seoPageRecipes.length >
      0
        ? {
            mainEntity: {
              "@id":
                itemListId,
            },
          }
        : {}),
    },

    /* ==========================================
       BREADCRUMB
    ========================================== */

    {
      "@type":
        "BreadcrumbList",

      "@id":
        `${SITE_URL}${RECIPES_PATH}#breadcrumb`,

      itemListElement: [
        {
          "@type":
            "ListItem",

          position: 1,

          name:
            "الرئيسية",

          item:
            SITE_URL,
        },

        {
          "@type":
            "ListItem",

          position: 2,

          name:
            "الوصفات",

          item:
            `${SITE_URL}${RECIPES_PATH}`,
        },
      ],
    },
  ];

  /* =======================================================
     ITEM LIST
  ======================================================= */

  if (
    seoPageRecipes.length >
    0
  ) {
    structuredGraph.push({
      "@type":
        "ItemList",

      "@id":
        itemListId,

      name:
        initialPage > 1
          ? `وصفات شيف العرب – الصفحة ${initialPage}`
          : "أحدث وصفات شيف العرب",

      numberOfItems:
        seoPageRecipes.length,

      itemListOrder:
        "https://schema.org/ItemListOrderDescending",

      itemListElement:
        seoPageRecipes.map(
          (
            recipe,
            index,
          ) => {
            const recipeUrl =
              `${SITE_URL}/recipe/${encodeURIComponent(
                recipe.slug,
              )}`;

            const imagePath =
              recipe.img?.[
                "url-card"
              ] ||
              recipe.img?.url;

            const absoluteImageUrl =
              imagePath
                ? imagePath.startsWith(
                    "http://",
                  ) ||
                  imagePath.startsWith(
                    "https://",
                  )
                  ? imagePath
                  : `${SITE_URL}${
                      imagePath.startsWith(
                        "/",
                      )
                        ? ""
                        : "/"
                    }${imagePath}`
                : undefined;

            return {
              "@type":
                "ListItem",

              position:
                (initialPage -
                  1) *
                  SEO_PAGE_SIZE +
                index +
                1,

              url:
                recipeUrl,

              item: {
                "@type":
                  "Thing",

                "@id":
                  recipeUrl,

                url:
                  recipeUrl,

                name:
                  recipe.title,

                ...(absoluteImageUrl
                  ? {
                      image:
                        absoluteImageUrl,
                    }
                  : {}),
              },
            };
          },
        ),
    });
  }

  /* =======================================================
     JSON-LD
  ======================================================= */

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@graph":
      structuredGraph,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            serializeJsonLd(
              jsonLd,
            ),
        }}
      />

      <RecipesClient
        recipes={recipes}
        categories={categories}
        initialCategory={
          initialCategory
        }
        initialCountry={
          initialCountry
        }
        initialTag={
          initialTag
        }
        initialDiscover={
          initialDiscover
        }
        initialShowAllTags={
          initialShowAllTags
        }
        initialGroup={
          initialGroup
        }
        initialPage={
          initialPage
        }
      />
    </>
  );
}