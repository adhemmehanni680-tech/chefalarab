import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import recipesData from "@/data/recipes-catalog.json";

/*
  عدد الوصفات داخل كل قسم
*/
const ITEMS_PER_SECTION = 4;

/*
  ترتيب الأقسام
*/
const HOME_CATEGORIES = [
  "المطبخ-العربي",
  "المطبخ-الآسيوي",
  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني",
  "المطبخ-الأفريقي",
  "السلطات",
  "مخللات",
  "حلويات",
  "مثلجات",
  "عصائر",
  "مشروبات ساخنة",
];

/*
  الاختلافات المحتملة في أسماء التصنيفات
*/
const CATEGORY_ALIASES: Record<string, string[]> = {
  "المطبخ-العربي": [
    "المطبخ-العربي",
    "المطبخ العربي",
  ],

  "المطبخ-الآسيوي": [
    "المطبخ-الآسيوي",
    "المطبخ الآسيوي",
  ],

  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني": [
    "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني",
    "المطبخ الأمريكي والأوروبي واللاتيني",
    "المطبخ الأمريكي و الأوروبي و اللاتيني",
    "المطبخ-الأمريكي-والأوروبي-واللاتيني",
    "أمريكي وأوروبي ولاتيني",
  ],

  "المطبخ-الأفريقي": [
    "المطبخ-الأفريقي",
    "المطبخ الأفريقي",
    "المطبخ الافريقي",
  ],

  السلطات: [
    "السلطات",
    "سلطات",
  ],

  مخللات: [
    "مخللات",
    "المخللات",
  ],

  حلويات: [
    "حلويات",
    "الحلويات",
  ],

  مثلجات: [
    "مثلجات",
    "المثلجات",
    "آيس كريم",
    "ايس كريم",
    "آيس-كريم",
    "ايس-كريم",
  ],

  عصائر: [
    "عصائر",
    "العصائر",
  ],

  "مشروبات ساخنة": [
    "مشروبات ساخنة",
    "مشروبات-ساخنة",
    "المشروبات الساخنة",
    "المشروبات-الساخنة",
    "مشروبات ساخنه",
    "مشروبات-ساخنه",
    "المشروبات الساخنه",
    "المشروبات-الساخنه",
    "مشروب ساخن",
    "مشروبات حارة",
  ],
};

/*
  بيانات الأقسام
*/
const CATEGORY_META: Record<
  string,
  {
    eyebrow: string;
    description: string;
  }
> = {
  "المطبخ-العربي": {
    eyebrow: "من قلب المائدة العربية",
    description:
      "وصفات عربية أصيلة من بلدان مختلفة، تشمل الأطباق اليومية وأكلات العزومات والمناسبات.",
  },

  "المطبخ-الآسيوي": {
    eyebrow: "نكهات متنوعة من آسيا",
    description:
      "أطباق آسيوية تجمع بين الصوصات والتوابل والخضروات، مع طرق مناسبة للتحضير في المنزل.",
  },

  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني": {
    eyebrow:
      "وصفات من أمريكا وأوروبا وأمريكا اللاتينية",
    description:
      "مجموعة من الأطباق الأمريكية والأوروبية واللاتينية، من الوجبات المنزلية إلى المخبوزات والأطباق المعروفة عالميًا.",
  },

  "المطبخ-الأفريقي": {
    eyebrow: "وصفات من مطابخ أفريقيا",
    description:
      "أطباق أفريقية متنوعة تعتمد على الحبوب واللحوم والخضروات والتوابل الدافئة التي تميز كل منطقة.",
  },

  السلطات: {
    eyebrow: "أطباق طازجة وخفيفة",
    description:
      "سلطات بالخضروات والحبوب والبروتينات، مناسبة كمقبلات أو أطباق جانبية أو وجبات خفيفة.",
  },

  مخللات: {
    eyebrow: "إضافات منزلية للمائدة",
    description:
      "طرق تخليل متنوعة للخضروات بمقادير واضحة، مع الاهتمام بتوازن الملوحة والحموضة والقوام.",
  },

  حلويات: {
    eyebrow: "حلويات للضيافة والمناسبات",
    description:
      "حلويات شرقية وعالمية تشمل الكيك والبسكويت والحلويات الكريمية والوصفات المناسبة للتجمعات العائلية.",
  },

  مثلجات: {
    eyebrow: "حلويات باردة ومنعشة",
    description:
      "وصفات للآيس كريم والحلويات المجمدة بنكهات الفواكه والشوكولاتة والمكونات الكريمية.",
  },

  عصائر: {
    eyebrow: "مشروبات فاكهة منعشة",
    description:
      "عصائر طبيعية وخلطات فواكه مناسبة للتقديم اليومي وفي المناسبات وأيام الصيف.",
  },

  "مشروبات ساخنة": {
    eyebrow: "دفء ونكهة في كل كوب",
    description:
      "مشروبات ساخنة بالقهوة والشاي والحليب والتوابل، مناسبة للصباح والجلسات المسائية.",
  },
};

/* =============================== */
/* Helpers */
/* =============================== */

function normalizeCategories(
  value: unknown,
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  const single = String(value).trim();

  return single ? [single] : [];
}

function normalizeCategoryValue(
  value: unknown,
): string {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();
}

function formatCategoryName(
  category: string,
): string {
  return String(category || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryMatches(
  recipeCategory: string,
  canonicalCategory: string,
): boolean {
  const normalizedRecipeCategory =
    normalizeCategoryValue(recipeCategory);

  const aliases =
    CATEGORY_ALIASES[canonicalCategory] || [
      canonicalCategory,
    ];

  return aliases.some(
    (alias) =>
      normalizeCategoryValue(alias) ===
      normalizedRecipeCategory,
  );
}

function pickByCategory(
  allRecipes: any[],
  category: string,
  limit: number,
) {
  return allRecipes
    .filter((recipe) => {
      const recipeCategories =
        normalizeCategories(recipe.category);

      return recipeCategories.some(
        (recipeCategory) =>
          categoryMatches(
            recipeCategory,
            category,
          ),
      );
    })
    .sort(
      (firstRecipe, secondRecipe) =>
        Number(secondRecipe.id || 0) -
        Number(firstRecipe.id || 0),
    )
    .slice(0, limit);
}

function getCategoryMeta(
  category: string,
) {
  const savedMeta =
    CATEGORY_META[category];

  if (savedMeta) {
    return savedMeta;
  }

  const categoryName =
    formatCategoryName(category);

  return {
    eyebrow:
      "اختيارات من شيف العرب",

    description:
      `مجموعة من وصفات ${categoryName} بمكونات متنوعة وطرق تحضير مناسبة للمطبخ المنزلي.`,
  };
}

function buildHomeSections() {
  const recipes = Array.isArray(recipesData)
    ? recipesData
    : [];

  return HOME_CATEGORIES
    .map((category) => {
      const items = pickByCategory(
        recipes,
        category,
        ITEMS_PER_SECTION,
      );

      return {
        cat: category,
        items,
        meta: getCategoryMeta(category),
      };
    })
    .filter(
      (section) =>
        section.items.length > 0,
    );
}

/* =============================== */
/* Metadata */
/* =============================== */

export function generateMetadata(): Metadata {
  const title =
    "شيف العرب | وصفات طبخ عربية وعالمية خطوة بخطوة";

  const description =
    "اكتشف وصفات طبخ عربية وعالمية سهلة ومجربة في شيف العرب، مع مقادير دقيقة وخطوات واضحة للحلويات والسلطات والعصائر والمشروبات الساخنة والأطباق الرئيسية.";

  return {
    title: {
      absolute: title,
    },

    description,

    alternates: {
      canonical:
        "https://chefalarab.com/",
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: "https://chefalarab.com/",
      siteName: "شيف العرب",
      type: "website",
      locale: "ar_AR",

      images: [
        {
          url: "https://chefalarab.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt:
            "شيف العرب – وصفات طبخ عربية وعالمية سهلة",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        "https://chefalarab.com/og-image.jpg",
      ],
    },
  };
}

/* =============================== */
/* Page */
/* =============================== */

export default function Page() {
  const sectionsData =
    buildHomeSections();

  return (
    <HomeClient
      sectionsData={sectionsData}
    />
  );
}