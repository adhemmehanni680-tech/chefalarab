import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Beef,
  ChefHat,
  Coffee,
  Cookie,
  CookingPot,
  Croissant,
  CupSoda,
  Drumstick,
  Fish,
  GlassWater,
  Globe2,
  IceCreamCone,
  Leaf,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { adsEnabled } from "@/lib/ads";

import AdSenseBanner from "./Components/AdSenseBanner";

/* =============================== */
/* Types */
/* =============================== */

type RecipeImage = {
  url?: string;
  "url-card"?: string;
  alt?: string;
  width?: number;
  height?: number;
};

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;
  img?: RecipeImage;
  intro?: string;
  description?: string;
};

type HomeSection = {
  cat: string;
  items: Recipe[];
  meta: {
    eyebrow: string;
    description: string;
  };
};

type HomeClientProps = {
  sectionsData: HomeSection[];
};

/* =============================== */
/* Constants */
/* =============================== */

const FALLBACK_IMAGE = "/Heeder.webp";
const NEXT_IMAGE_QUALITY = 72;

const IMAGE_BLUR_DATA =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23121b29'/%3E%3Crect x='0' y='6' width='16' height='3' fill='%23f97316'/%3E%3C/svg%3E";

/*
  الأقسام الموجودة في الشريط العلوي.

  الشريط يعتمد على هذه القائمة مباشرة،
  لذلك ستظهر مشروبات-ساخنة دائمًا حتى لو
  لم يكن هناك سكشن وصفات مطابق مؤقتًا.
*/
const HOME_NAV_CATEGORIES = [
  "المطبخ-العربي",
  "المطبخ-الآسيوي",
  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني",
  "المطبخ-الأفريقي",
  "السلطات",
  "مخللات",
  "حلويات",
  "مثلجات",
  "عصائر",
  "مشروبات-ساخنة",
];

/*
  الاسم الكامل المستخدم داخل عنوان السكشن
  وزر عرض جميع الوصفات.
*/
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  "المطبخ-العربي": "المطبخ العربي",

  "المطبخ-الآسيوي": "المطبخ الآسيوي",

  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني":
    "المطبخ الأمريكي والأوروبي واللاتيني",

  "المطبخ-الأفريقي": "المطبخ الأفريقي",

  السلطات: "السلطات",

  مخللات: "المخللات",

  حلويات: "الحلويات",

  مثلجات: "المثلجات",

  عصائر: "العصائر",

  "مشروبات-ساخنة": "المشروبات الساخنة",
};

/*
  الاسم المختصر المستخدم داخل شريط الأقسام
  وأعلى كارت الوصفة.
*/
const CATEGORY_NAV_NAMES: Record<string, string> = {
  "المطبخ-العربي": "المطبخ العربي",

  "المطبخ-الآسيوي": "المطبخ الآسيوي",

  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني":
    "أمريكي وأوروبي ولاتيني",

  "المطبخ-الأفريقي": "المطبخ الأفريقي",

  السلطات: "السلطات",

  مخللات: "المخللات",

  حلويات: "الحلويات",

  مثلجات: "المثلجات",

  عصائر: "العصائر",

  "مشروبات-ساخنة": "مشروبات-ساخنة",
};

/*
  الجمل القديمة العامة التي لا نريد تكرارها.

  لو كانت intro أو description مساوية لإحدى
  هذه الجمل، سيتم تجاهلها وإنشاء وصف مناسب
  للقسم والوصفة بدلًا منها.
*/
const GENERIC_RECIPE_EXCERPTS = [
  "تعرف على مكونات الوصفة وخطوات تحضيرها بطريقة سهلة للحصول على طبق شهي ومميز.",

  "وصفة مرتبة بمكونات واضحة وخطوات تساعدك على الوصول لنتيجة شهية.",

  "وصفة مرتبة بمكونات واضحة وخطوات تساعدك على الوصول إلى نتيجة شهية.",

  "وصفة سهلة بمكونات بسيطة وخطوات واضحة للحصول على نتيجة شهية.",
];

/*
  هذه الجمل تستخدم فقط إذا لم يوجد داخل الوصفة
  intro أو description حقيقي.

  يتم اختيار نص مختلف حسب:
  - القسم
  - عنوان الوصفة
  - التاج الأول
  - رقم الوصفة
*/
const CATEGORY_EXCERPT_TEMPLATES: Record<string, string[]> = {
  "المطبخ-العربي": [
    "وصفة [title] بطابع عربي واضح، تجمع بين [focus] والمكونات المنزلية المألوفة في طبق مناسب للغداء أو العزومات.",

    "حضّر [title] بنكهة عربية متوازنة، مع إبراز مذاق [focus] وطريقة تقديم تناسب المائدة العائلية.",

    "طبق [title] من وصفات المطبخ العربي، يعتمد على [focus] وتناسق التوابل للحصول على مذاق غني.",

    "اكتشف طريقة إعداد [title] بأسلوب منزلي يحافظ على طعم المكونات ويبرز نكهة [focus].",
  ],

  "المطبخ-الآسيوي": [
    "وصفة [title] بنكهات آسيوية واضحة، تجمع بين [focus] والتوابل والصوصات المتوازنة.",

    "حضّر [title] بأسلوب مستوحى من المطبخ الآسيوي، مع الحفاظ على قوام المكونات ومذاق [focus].",

    "طبق [title] يقدم مزيجًا من النكهات الآسيوية، ويعتمد على [focus] وطريقة طهي مناسبة للمنزل.",

    "اكتشف تفاصيل إعداد [title] مع صوص متوازن ومكونات تبرز مذاق [focus].",
  ],

  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني": [
    "وصفة [title] مستوحاة من المطابخ الأمريكية والأوروبية واللاتينية، مع مذاق [focus] وطريقة تحضير منزلية.",

    "حضّر [title] بمكونات متناسقة تعكس نكهات المطابخ الغربية واللاتينية وتبرز طعم [focus].",

    "طبق [title] يقدم فكرة مختلفة للمائدة، مع قوام متوازن ولمسة واضحة من [focus].",

    "اكتشف طريقة إعداد [title] بأسلوب عملي يجمع بين المكونات المتاحة ونكهة [focus].",
  ],

  "المطبخ-الأفريقي": [
    "وصفة [title] مستوحاة من مطابخ أفريقيا، تجمع بين [focus] والتوابل الدافئة ذات النكهة الواضحة.",

    "حضّر [title] بمكونات تعكس تنوع المطبخ الأفريقي وتبرز مذاق [focus] عند التقديم.",

    "طبق [title] يقدم نكهة أفريقية غنية، مع توازن بين [focus] والخضروات أو الحبوب المستخدمة.",

    "اكتشف طريقة إعداد [title] باستخدام توابل عطرية ومكونات منزلية يبرز بينها [focus].",
  ],

  السلطات: [
    "سلطة [title] تجمع بين المكونات الطازجة ومذاق [focus] في طبق خفيف يصلح للتقديم الجانبي.",

    "حضّر [title] بتتبيلة متوازنة تبرز نكهة [focus] وتحافظ على قوام الخضروات الطازج.",

    "طبق [title] يقدم مزيجًا منعشًا من المكونات، مع حضور واضح لمذاق [focus].",

    "اكتشف طريقة إعداد [title] مع نصائح للحفاظ على طزاجة المكونات حتى وقت التقديم.",
  ],

  مخللات: [
    "طريقة إعداد [title] بمقادير تساعد على تحقيق توازن مناسب بين الملوحة والحموضة ونكهة [focus].",

    "حضّر [title] منزليًا مع الاهتمام بمدة التخليل والحفظ للوصول إلى قوام مقرمش.",

    "وصفة [title] تعتمد على [focus] ومحلول تخليل متوازن يمنح المكونات مذاقًا متجانسًا.",

    "اكتشف خطوات تجهيز [title] وحفظه بطريقة تساعد على ثبات النكهة والقوام.",
  ],

  حلويات: [
    "حلوى [title] تجمع بين مذاق [focus] وقوام مناسب للضيافة والمناسبات العائلية.",

    "حضّر [title] بطريقة تساعد على ضبط الحلاوة والقوام مع إبراز نكهة [focus].",

    "وصفة [title] تقدم حلوى منزلية بتفاصيل واضحة للحشوة أو الطبقات والتزيين.",

    "اكتشف طريقة إعداد [title] مع تناسق بين [focus] وبقية المكونات للحصول على حلوى متوازنة.",
  ],

  مثلجات: [
    "وصفة [title] الباردة تجمع بين قوام ناعم ونكهة [focus] المنعشة.",

    "حضّر [title] منزليًا مع خطوات تساعد على تقليل التبلور والحفاظ على القوام الكريمي.",

    "مثلجات [title] مناسبة لأيام الصيف، تعتمد على [focus] وطريقة تجميد منظمة.",

    "اكتشف طريقة تقديم [title] بقوام متماسك ومذاق واضح يبرز نكهة [focus].",
  ],

  عصائر: [
    "مشروب [title] يجمع بين نكهة [focus] والانتعاش، ويصلح للتقديم اليومي أو مع الوجبات.",

    "حضّر [title] بمقادير متوازنة تحافظ على مذاق [focus] الطبيعي دون تحلية زائدة.",

    "وصفة [title] توضح طريقة الخلط والتصفية للوصول إلى قوام مناسب ومذاق منعش.",

    "اكتشف طريقة إعداد [title] مع أفكار للتقديم والحفاظ على نكهة [focus] الطازجة.",
  ],

  "مشروبات-ساخنة": [
    "مشروب [title] يقدم مذاقًا دافئًا يجمع بين [focus] والرائحة الغنية المناسبة للصباح والمساء.",

    "حضّر [title] مع ضبط درجة التسخين ومدة التحضير للحفاظ على نكهة [focus].",

    "وصفة [title] لمشروب ساخن بمقادير واضحة وتوازن مناسب بين [focus] وبقية الإضافات.",

    "اكتشف طريقة إعداد [title] وتقديمه ساخنًا مع الحفاظ على قوة النكهة والرائحة.",
  ],
};

const DEFAULT_EXCERPT_TEMPLATES = [
  "اكتشف طريقة إعداد [title] ضمن وصفات [category] مع التركيز على مذاق [focus] وطريقة التقديم.",

  "وصفة [title] تعتمد على [focus] ومكونات متناسقة تناسب التحضير داخل المطبخ المنزلي.",

  "حضّر [title] بخطوات منظمة تساعد على ضبط النكهة والقوام النهائي للطبق.",

  "تعرّف على مكونات [title] وطريقة التعامل مع [focus] أثناء التحضير والتقديم.",
];

/* =============================== */
/* Helpers */
/* =============================== */

function normalizeImageUrl(
  url: unknown
): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const cleanUrl = url
    .trim()
    .replace(/\\/g, "/");

  if (!cleanUrl) {
    return null;
  }

  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://")
  ) {
    return cleanUrl;
  }

  return cleanUrl.startsWith("/")
    ? cleanUrl
    : `/${cleanUrl}`;
}

function getImageFileName(
  url?: string | null
): string | null {
  if (!url) {
    return null;
  }

  const cleanUrl = url
    .split("?")[0]
    .split("#")[0];

  const fileName = cleanUrl
    .split("/")
    .filter(Boolean)
    .pop();

  return fileName || null;
}

function uniqueImageSources(
  sources: Array<
    string | null | undefined
  >
): string[] {
  const seen = new Set<string>();

  return sources
    .map(normalizeImageUrl)
    .filter(
      (
        source
      ): source is string =>
        Boolean(source)
    )
    .filter((source) => {
      if (seen.has(source)) {
        return false;
      }

      seen.add(source);

      return true;
    });
}

function getRecipeImageSources(
  recipe: Recipe
): string[] {
  const card = normalizeImageUrl(
    recipe.img?.["url-card"]
  );

  const main = normalizeImageUrl(
    recipe.img?.url
  );

  const fileName = getImageFileName(
    card || main
  );

  return uniqueImageSources([
    card,

    fileName
      ? `/card/${fileName}`
      : null,

    main,

    fileName
      ? `/uploads/${fileName}`
      : null,

    FALLBACK_IMAGE,
  ]);
}

function getRecipeAlt(
  recipe: Recipe
): string {
  return (
    recipe.img?.alt ||
    recipe.title ||
    "صورة وصفة من شيف العرب"
  );
}

function formatLabel(
  value?: string
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCategoryDisplayLabel(
  category: string
): string {
  return (
    CATEGORY_DISPLAY_NAMES[
      category
    ] || formatLabel(category)
  );
}

function getCategoryNavLabel(
  category: string
): string {
  return (
    CATEGORY_NAV_NAMES[
      category
    ] || formatLabel(category)
  );
}

function normalizeList(
  value?: string[] | string
): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
}

function getShortRecipeTitle(
  title: string
): string {
  const cleanTitle = title
    .split(":")[0]
    .split("؛")[0]
    .replace(/\s+/g, " ")
    .trim();

  return cleanTitle || title.trim();
}

function normalizeComparableText(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.،؛!?؟]+$/g, "")
    .toLowerCase();
}

function isGenericRecipeExcerpt(
  value?: string
): boolean {
  if (!value?.trim()) {
    return true;
  }

  const normalizedValue =
    normalizeComparableText(value);

  return GENERIC_RECIPE_EXCERPTS.some(
    (genericText) =>
      normalizeComparableText(
        genericText
      ) === normalizedValue
  );
}

function createStableHash(
  value: string
): number {
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(index)) >>>
      0;
  }

  return hash;
}

function getStableTemplateIndex(
  recipe: Recipe,
  templatesLength: number
): number {
  if (templatesLength <= 1) {
    return 0;
  }

  const identity = [
    recipe.id,
    recipe.slug,
    recipe.title,
  ].join("|");

  return (
    createStableHash(identity) %
    templatesLength
  );
}

function fillExcerptTemplate({
  template,
  recipe,
  sectionCategory,
}: {
  template: string;
  recipe: Recipe;
  sectionCategory: string;
}): string {
  const title =
    getShortRecipeTitle(
      recipe.title
    );

  const category =
    getCategoryDisplayLabel(
      sectionCategory
    );

  const firstTag = normalizeList(
    recipe.tags
  )
    .map(formatLabel)
    .find(Boolean);

  const focus =
    firstTag || category;

  return template
    .replace(
      /\[title\]/g,
      title
    )
    .replace(
      /\[focus\]/g,
      focus
    )
    .replace(
      /\[category\]/g,
      category
    );
}

function getRecipeExcerpt(
  recipe: Recipe,
  sectionCategory: string
): string {
  const possibleTexts = [
    recipe.intro,
    recipe.description,
  ];

  const savedText =
    possibleTexts.find(
      (value) =>
        value?.trim() &&
        !isGenericRecipeExcerpt(
          value
        )
    );

  if (savedText?.trim()) {
    return savedText.trim();
  }

  const templates =
    CATEGORY_EXCERPT_TEMPLATES[
      sectionCategory
    ] ||
    DEFAULT_EXCERPT_TEMPLATES;

  const templateIndex =
    getStableTemplateIndex(
      recipe,
      templates.length
    );

  return fillExcerptTemplate({
    template:
      templates[templateIndex],

    recipe,

    sectionCategory,
  });
}

function normalizeCategoryForIcon(
  category: string
): string {
  return formatLabel(category)
    .toLowerCase();
}

function getCategoryIcon(
  category: string
): LucideIcon {
  const name =
    normalizeCategoryForIcon(
      category
    );

  if (
    name.includes("العربي") ||
    name.includes("شرقي") ||
    name.includes("رمضان")
  ) {
    return ChefHat;
  }

  if (
    name.includes("الآسيوي") ||
    name.includes("آسيوي")
  ) {
    return CookingPot;
  }

  if (
    name.includes("الأمريكي") ||
    name.includes("الأوروبي") ||
    name.includes("اللاتيني") ||
    name.includes("عالمي")
  ) {
    return Globe2;
  }

  if (
    name.includes("الأفريقي") ||
    name.includes("أفريقي")
  ) {
    return Globe2;
  }

  if (
    name.includes("سلطات") ||
    name.includes("السلطات")
  ) {
    return Salad;
  }

  if (
    name.includes("مخللات") ||
    name.includes("المخللات")
  ) {
    return Leaf;
  }

  if (
    name.includes("حلويات") ||
    name.includes("الحلويات") ||
    name.includes("حلوى")
  ) {
    return Cookie;
  }

  if (
    name.includes("مثلجات") ||
    name.includes("آيس كريم")
  ) {
    return IceCreamCone;
  }

  if (
    name.includes("عصائر") ||
    name.includes("العصائر")
  ) {
    return CupSoda;
  }

  if (
    name.includes("مشروبات-ساخنة") ||
    name.includes(
      "المشروبات الساخنة"
    )
  ) {
    return Coffee;
  }

  if (
    name.includes("مشروبات")
  ) {
    return GlassWater;
  }

  if (
    name.includes("لحوم") ||
    name.includes("لحم")
  ) {
    return Beef;
  }

  if (
    name.includes("دجاج")
  ) {
    return Drumstick;
  }

  if (
    name.includes("بحري") ||
    name.includes("سمك")
  ) {
    return Fish;
  }

  if (
    name.includes("شوربة")
  ) {
    return Soup;
  }

  if (
    name.includes("معجنات") ||
    name.includes("مخبوزات")
  ) {
    return Croissant;
  }

  if (
    name.includes("سندويشات") ||
    name.includes(
      "وجبات سريعة"
    )
  ) {
    return Sandwich;
  }

  return UtensilsCrossed;
}

/* =============================== */
/* Ad Box */
/* =============================== */

function AdBox({
  type = "auto",
}: {
  type?: "auto" | "fluid";
}) {
  if (!adsEnabled) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
      <div className="overflow-hidden rounded-[28px] border border-gray-700 bg-[#121b29] p-3 shadow-lg shadow-black/10 sm:p-4">
        <div className="flex min-h-[90px] items-center justify-center overflow-hidden rounded-2xl bg-gray-800">
          {type === "fluid" ? (
            <AdSenseBanner
              adSlot="2901613977"
              adFormat="fluid"
              layoutKey="-fc+5g+70-cl-1m"
              style={{
                display: "block",
                width: "100%",
              }}
            />
          ) : (
            <AdSenseBanner
              adSlot="2901613977"
              adFormat="auto"
              style={{
                display: "block",
                width: "100%",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================== */
/* Category Navigation */
/* =============================== */

function CategoryNavigation() {
  return (
    <section
      aria-label="أقسام وصفات شيف العرب"
      className="relative z-20 py-8 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <nav className="overflow-hidden rounded-[30px] border border-gray-700 bg-[#121b29] shadow-xl shadow-black/20">
          <div
            className="
              flex items-stretch gap-2
              overflow-x-auto px-4 py-4

              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden

              lg:grid
              lg:grid-cols-5
              lg:gap-2
              lg:overflow-visible

              xl:grid-cols-10
              xl:gap-1
              xl:px-3
            "
          >
            {HOME_NAV_CATEGORIES.map(
              (category) => {
                const Icon =
                  getCategoryIcon(
                    category
                  );

                const label =
                  getCategoryNavLabel(
                    category
                  );

                const fullLabel =
                  getCategoryDisplayLabel(
                    category
                  );

                return (
                  <Link
                    key={category}
                    href={`/recipes?category=${encodeURIComponent(
                      category
                    )}`}
                    prefetch={false}
                    title={fullLabel}
                    aria-label={`عرض وصفات ${fullLabel}`}
                    className="
                      group flex min-h-[54px]
                      min-w-max shrink-0
                      items-center justify-center
                      gap-2 rounded-2xl
                      px-3 py-2.5
                      text-center text-xs
                      font-black leading-5
                      text-gray-200
                      transition duration-300

                      hover:bg-white/5
                      hover:text-orange-500

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-orange-500

                      sm:text-sm

                      lg:min-w-0
                      lg:px-2
                      lg:text-xs

                      xl:px-1
                      xl:text-[10px]

                      2xl:px-2
                      2xl:text-[11px]
                    "
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="
                        shrink-0
                        transition-transform
                        duration-300

                        group-hover:-rotate-6
                        group-hover:scale-110
                      "
                    />

                    <span
                      className="
                        whitespace-nowrap

                        lg:whitespace-normal
                        lg:text-center
                        lg:leading-5

                        xl:leading-4
                      "
                    >
                      {label}
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </nav>
      </div>
    </section>
  );
}

/* =============================== */
/* Recipe Image */
/* =============================== */

function RecipeCardImage({
  recipe,
  priority = false,
}: {
  recipe: Recipe;
  priority?: boolean;
}) {
  const currentSource =
    getRecipeImageSources(recipe)[0] ||
    FALLBACK_IMAGE;

  const isRemote =
    currentSource.startsWith("http://") ||
    currentSource.startsWith("https://");

  return (
    <Image
      src={currentSource}
      alt={getRecipeAlt(recipe)}
      fill
      sizes="(max-width: 640px) 92vw, (max-width: 768px) 46vw, (max-width: 1024px) 31vw, 300px"
      quality={NEXT_IMAGE_QUALITY}
      placeholder="blur"
      blurDataURL={IMAGE_BLUR_DATA}
      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      preload={priority}
      loading={priority ? undefined : "lazy"}
      decoding="async"
      draggable={false}
      unoptimized={isRemote}
    />
  );
}

/* =============================== */
/* Recipe Card */
/* =============================== */

function RecipeCard({
    recipe,
    sectionCategory,
    priority = false,
}: {
  recipe: Recipe;
  sectionCategory: string;
  priority?: boolean;
}) {
    const recipeUrl =
      `/recipe/${encodeURIComponent(
        String(recipe.slug)
      )}`;

    const tags = normalizeList(
      recipe.tags
    )
      .map((tag) =>
        tag.trim()
      )
      .filter(Boolean)
      .slice(0, 2);

    const excerpt =
      getRecipeExcerpt(
        recipe,
        sectionCategory
      );

    return (
      <article
        className="
          group h-full
          overflow-hidden
          rounded-[28px]
          border border-gray-700
          bg-gray-900
          shadow-lg shadow-black/10
          transition duration-500

          hover:-translate-y-1.5
          hover:border-orange-500/70
          hover:shadow-2xl
          hover:shadow-black/30
        "
      >
        <Link
          href={recipeUrl}
          prefetch={false}
          aria-label={`فتح وصفة ${recipe.title}`}
          className="
            flex h-full flex-col

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-inset
            focus-visible:ring-orange-500
          "
        >
          <div className="relative aspect-[16/11] w-full overflow-hidden bg-gray-800">
            <RecipeCardImage
              recipe={recipe}
              priority={priority}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />

            {recipe.country && (
              <span
                className="
                  absolute bottom-3
                  right-3 max-w-[78%]
                  truncate rounded-full
                  border border-white/10
                  bg-black/65
                  px-3 py-1.5
                  text-[10px]
                  font-black text-white
                  shadow-lg
                  backdrop-blur-md

                  sm:text-[11px]
                "
              >
                {recipe.country}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <p className="text-xs font-black text-orange-500">
              {getCategoryNavLabel(
                sectionCategory
              )}
            </p>

            <h3 className="mt-4 line-clamp-2 min-h-[58px] text-base font-black leading-8 text-white transition-colors duration-300 group-hover:text-orange-400">
              {recipe.title}
            </h3>

            <p className="mt-4 line-clamp-2 min-h-[56px] text-sm font-bold leading-7 text-gray-400">
              {excerpt}
            </p>

            <div className="mt-auto flex items-end justify-between gap-3 pt-6">
              <div className="flex min-w-0 flex-wrap gap-2">
                {tags.map(
                  (
                    tag,
                    index
                  ) => (
                    <span
                      key={`${recipe.id}-${tag}-${index}`}
                      className="
                        max-w-[110px]
                        truncate
                        rounded-full
                        bg-gray-800
                        px-3 py-1.5
                        text-[10px]
                        font-bold
                        text-gray-400
                        transition
                        duration-300

                        group-hover:bg-orange-500/10
                        group-hover:text-orange-300
                      "
                    >
                      {formatLabel(
                        tag
                      )}
                    </span>
                  )
                )}
              </div>

              <span
                className="
                  grid h-10 w-10
                  shrink-0
                  place-items-center
                  rounded-full
                  bg-white
                  text-gray-900
                  shadow-md
                  transition
                  duration-300

                  group-hover:-translate-x-1
                  group-hover:bg-orange-500
                  group-hover:text-white
                "
                aria-hidden="true"
              >
                <ArrowLeft
                  size={19}
                  strokeWidth={2.2}
                />
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
}

/* =============================== */
/* Category Section */
/* =============================== */

function HomeCategorySection({
  section,
  sectionIndex,
}: {
  section: HomeSection;
  sectionIndex: number;
}) {
  const Icon =
    getCategoryIcon(
      section.cat
    );

  const categoryLabel =
    getCategoryDisplayLabel(
      section.cat
    );

  const sectionNumber =
    String(
      sectionIndex + 1
    ).padStart(2, "0");

  return (
    <section
      aria-labelledby={`home-section-title-${sectionIndex}`}
      className="
        content-visibility-auto
        overflow-hidden
        rounded-[36px]
        border border-gray-700
        bg-[#121b29]
        px-4 py-8
        shadow-2xl
        shadow-black/20

        sm:px-7
        sm:py-10

        lg:px-10
      "
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 pr-16 sm:pr-20 lg:pr-24">
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -top-1
              right-0
              select-none
              font-mono
              text-5xl
              font-black
              leading-none
              text-orange-500/20

              sm:text-6xl
              lg:text-7xl
            "
          >
            {sectionNumber}
          </span>

          <p className="inline-flex items-center gap-2 text-xs font-black text-orange-500 sm:text-sm">
            <Icon
              size={17}
              strokeWidth={1.9}
            />

            <span>
              {
                section.meta
                  .eyebrow
              }
            </span>
          </p>

          <h2
            id={`home-section-title-${sectionIndex}`}
            className="mt-3 text-2xl font-black leading-relaxed text-white sm:text-3xl lg:text-4xl"
          >
            {categoryLabel}
          </h2>

          <p className="mt-3 max-w-3xl text-sm font-bold leading-8 text-gray-300 sm:text-base">
            {
              section.meta
                .description
            }
          </p>
        </div>

        <Link
          href={`/recipes?category=${encodeURIComponent(
            section.cat
          )}`}
          prefetch={false}
          className="
            inline-flex w-fit
            shrink-0 items-center
            justify-center gap-3
            rounded-2xl
            bg-white
            px-5 py-3.5
            text-sm font-black
            text-gray-900
            shadow-lg
            transition
            duration-300

            hover:-translate-y-0.5
            hover:bg-orange-500
            hover:text-white

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-orange-400
          "
        >
          <span>
            كل وصفات{" "}
            {categoryLabel}
          </span>

          <ArrowLeft
            size={18}
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {section.items.map((recipe) => (
          <RecipeCard
            key={recipe.slug || recipe.id}
            recipe={recipe}
            sectionCategory={section.cat}
            priority={false}
          />
        ))}
      </div>
    </section>
  );
}

/* =============================== */
/* Hero */
/* =============================== */

function HomeHero() {
  return (
    <header className="relative w-full overflow-hidden">
      <div className="relative min-h-[520px] w-full sm:min-h-[560px] lg:min-h-[640px]">
        <Image
          src="/Heeder.webp"
          alt="شيف العرب – وصفات طبخ عربية وعالمية"
          preload
          fill
          sizes="100vw"
          quality={72}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA}
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/90 via-gray-950/55 to-orange-50 dark:to-gray-950" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.25),transparent_46%)]" />

        <div className="absolute inset-0 flex items-center justify-center px-4 pt-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#121b29]/70 px-4 py-2 text-sm font-black text-white shadow-lg backdrop-blur">
              <UtensilsCrossed
                size={18}
              />

              وصفات عربية وعالمية سهلة
            </div>

            <h1 className="font-heading text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              شيف العرب – وصفات طبخ سهلة
              بطعم بيتي أصيل
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-8 text-white/90 sm:text-xl">
             اكتشف وصفات طبخ متنوعة بمقادير دقيقة وخطوات واضحة لتحضير أشهى الأكلات العربية والعالمية، من الوجبات اليومية إلى المناسبات العائلية.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/recipes"
                prefetch={false}
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-2xl
                  bg-orange-500
                  px-6 py-3
                  text-sm
                  font-black
                  text-white
                  shadow-lg
                  shadow-orange-500/25
                  transition

                  hover:bg-orange-600

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-orange-300

                  sm:text-base
                "
              >
                المزيد من الوصفات
              </Link>

              <a
                href="#sections"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/20
                  bg-[#121b29]/70
                  px-6 py-3
                  text-sm
                  font-black
                  text-white
                  shadow-lg
                  backdrop-blur
                  transition

                  hover:bg-[#121b29]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white

                  sm:text-base
                "
              >
                تصفح الأقسام
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =============================== */
/* Empty State */
/* =============================== */

function EmptyHomeState() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-500/10 text-orange-500">
        <UtensilsCrossed
          size={34}
        />
      </div>

      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
        لا توجد وصفات للعرض حاليًا
      </h2>

      <p className="mt-3 text-sm font-bold leading-7 text-gray-500 dark:text-gray-400">
        تأكد من وجود التصنيفات الصحيحة
        داخل ملف الوصفات.
      </p>
    </section>
  );
}

/* =============================== */
/* Main Component */
/* =============================== */

export default function HomeClient({
  sectionsData,
}: HomeClientProps) {
  const safeSections = (sectionsData || []).filter(
    (section) =>
      section?.cat &&
      Array.isArray(section.items) &&
      section.items.length > 0,
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-orange-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white"
    >
      <HomeHero />

      <CategoryNavigation />

      <section
        id="sections"
        className="pb-14 pt-2 sm:pb-16"
      >
        <div className="mx-auto max-w-7xl space-y-10 px-3 sm:space-y-12 sm:px-4">
          {safeSections.length ===
            0 && (
            <EmptyHomeState />
          )}

          {safeSections.map(
            (
              section,
              sectionIndex
            ) => (
              <div
                key={section.cat}
              >
                <HomeCategorySection
                  section={section}
                  sectionIndex={
                    sectionIndex
                  }
                />

                {adsEnabled &&
                  sectionIndex ===
                    1 && (
                    <div className="mt-10">
                      <AdBox type="fluid" />
                    </div>
                  )}
              </div>
            )
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-orange-400/30
              bg-gradient-to-br
              from-orange-600
              to-amber-500
              p-7
              text-center
              shadow-2xl
              shadow-orange-950/20

              sm:p-10
            "
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_38%)]" />

            <div className="relative">
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                اكتشف كل وصفات شيف العرب
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-7 text-white/90 sm:text-base">
                تصفح مئات الوصفات العربية
                والعالمية حسب المطبخ أو نوع
                الطبق أو المناسبة.
              </p>

              <Link
                href="/recipes"
                prefetch={false}
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-white
                  px-6 py-3
                  text-sm
                  font-black
                  text-orange-600
                  shadow-lg
                  transition

                  hover:-translate-y-0.5
                  hover:bg-[#121b29]
                  hover:text-white

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                "
              >
                الذهاب إلى صفحة الوصفات

                <ArrowLeft
                  size={18}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}