"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import {
  ChefHat,
  ChevronDown,
  Clock3,
  Gauge,
  ListTree,
  MapPin,
  Tag,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import AdSenseBanner from "@/app/Components/AdSenseBanner";
import { adsEnabled } from "@/lib/ads";
import type { RecipeData } from "@/lib/recipesData";

type RelatedRecipe = {
  id?: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;

  img?:
    | string
    | {
        url?: string;
        "url-card"?: string;
        alt?: string;
        width?: number;
        height?: number;
      };
};

type IngredientGroup = {
  title: string;
  items: string[];
};

type GuideItem = {
  id: string;
  label: string;
  icon: string;
  show: boolean;
};

type FaqItem = {
  question: string;
  answer: string;
};

const FALLBACK_IMAGE = "/Heeder.webp";

const IMAGE_QUALITY = 72;

const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'%3E%3Crect width='16' height='10' fill='%23121b29'/%3E%3Crect x='0' y='8' width='16' height='2' fill='%23f97316'/%3E%3C/svg%3E";

/* =========================================================
   BASIC HELPERS
========================================================= */

function asString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => asString(item))
      .filter(Boolean);
  }

  const single = asString(value);

  return single ? [single] : [];
}

/* =========================================================
   IMAGE HELPERS
========================================================= */

/**
 * Normalize every possible image format.
 *
 * Examples:
 *
 * https://chefalarab.com/image.jpg
 * http://chefalarab.com/image.jpg
 * //chefalarab.com/image.jpg
 * /images/image.jpg
 * images/image.jpg
 * ./images/image.jpg
 */
function normalizeImageUrl(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  let clean = value.trim();

  if (!clean) {
    return null;
  }

  // Convert backslashes
  clean = clean.replace(/\\/g, "/");

  // External URL
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // Protocol-relative URL
  if (clean.startsWith("//")) {
    return `https:${clean}`;
  }

  // Local absolute path
  if (clean.startsWith("/")) {
    return clean;
  }

  // Relative path
  clean = clean.replace(/^\.\/+/, "");

  return `/${clean}`;
}

/**
 * Get main recipe image.
 *
 * Priority:
 *
 * 1. url-card
 * 2. url
 * 3. fallback
 */
function recipeImage(
  recipe: RecipeData,
): {
  src: string;
  alt: string;
} {
  const img = recipe.img;

  if (typeof img === "string") {
    return {
      src:
        normalizeImageUrl(img) ||
        FALLBACK_IMAGE,

      alt: recipe.title,
    };
  }

  if (!img || typeof img !== "object") {
    return {
      src: FALLBACK_IMAGE,
      alt: recipe.title,
    };
  }

  const cardImage =
    normalizeImageUrl(
      img["url-card"],
    );

  const mainImage =
    normalizeImageUrl(img.url);

  return {
    src:
      cardImage ||
      mainImage ||
      FALLBACK_IMAGE,

    alt:
      asString(img.alt) ||
      `صورة وصفة ${recipe.title}`,
  };
}

/**
 * Get related recipe image.
 */
function relatedImage(
  recipe: RelatedRecipe,
): {
  src: string;
  alt: string;
} {
  const img = recipe.img;

  if (typeof img === "string") {
    return {
      src:
        normalizeImageUrl(img) ||
        FALLBACK_IMAGE,

      alt: recipe.title,
    };
  }

  if (!img || typeof img !== "object") {
    return {
      src: FALLBACK_IMAGE,
      alt: recipe.title,
    };
  }

  const cardImage =
    normalizeImageUrl(
      img["url-card"],
    );

  const mainImage =
    normalizeImageUrl(img.url);

  return {
    src:
      cardImage ||
      mainImage ||
      FALLBACK_IMAGE,

    alt:
      asString(img.alt) ||
      `صورة وصفة ${recipe.title}`,
  };
}

/* =========================================================
   INGREDIENT HELPERS
========================================================= */

function ingredientItemText(
  value: unknown,
): string | null {
  if (typeof value === "string") {
    const text = value.trim();

    return text || null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  const main =
    asString(record.text) ||
    asString(record.item) ||
    asString(record.ingredient) ||
    asString(record.name);

  if (!main) {
    return null;
  }

  const amount =
    asString(record.amount) ||
    asString(record.quantity);

  const unit =
    asString(record.unit);

  const note =
    asString(record.note) ||
    asString(record.notes);

  const quantity =
    [amount, unit]
      .filter(Boolean)
      .join(" ");

  return [
    quantity,
    main,
    note ? `(${note})` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function ingredientItems(
  value: unknown,
): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      ingredientItems(item),
    );
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const record =
      value as Record<string, unknown>;

    const nested =
      record.items ??
      record.ingredients ??
      record.values ??
      record.list;

    if (nested !== undefined) {
      return ingredientItems(nested);
    }

    const direct =
      ingredientItemText(value);

    if (direct) {
      return [direct];
    }

    return Object.values(record).flatMap(
      (item) => ingredientItems(item),
    );
  }

  const single =
    ingredientItemText(value);

  return single ? [single] : [];
}

function normalizeIngredients(
  value: unknown,
): IngredientGroup[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    const groups: IngredientGroup[] =
      [];

    let currentTitle =
      "المكونات الأساسية";

    let currentItems: string[] = [];

    const flush = () => {
      if (!currentItems.length) {
        return;
      }

      groups.push({
        title: currentTitle,
        items: currentItems,
      });

      currentItems = [];
    };

    for (const entry of value) {
      if (typeof entry === "string") {
        const text = entry.trim();

        if (!text) {
          continue;
        }

        if (/[:：]\s*$/.test(text)) {
          flush();

          currentTitle =
            text
              .replace(/[:：]\s*$/, "")
              .trim() ||
            "المكونات الأساسية";

          continue;
        }

        currentItems.push(text);

        continue;
      }

      if (
        entry &&
        typeof entry === "object"
      ) {
        const record =
          entry as Record<string, unknown>;

        const nestedTitle =
          asString(record.title) ||
          asString(record.name) ||
          asString(record.group) ||
          asString(record.label);

        const nestedItems =
          ingredientItems(
            record.items ??
              record.ingredients ??
              record.values ??
              record.list,
          );

        if (nestedItems.length) {
          flush();

          groups.push({
            title:
              nestedTitle ||
              "المكونات الأساسية",

            items: nestedItems,
          });
        }
      }
    }

    flush();

    return groups;
  }

  if (
    typeof value === "object"
  ) {
    const groups =
      Object.entries(
        value as Record<string, unknown>,
      )
        .map(([title, groupValue]) => ({
          title:
            title.trim() ||
            "المكونات الأساسية",

          items:
            ingredientItems(groupValue),
        }))
        .filter(
          (group) =>
            group.items.length > 0,
        );

    const preferredOrder = [
      "المكونات الأساسية",
      "إضافات احترافية اختيارية",
      "خيارات بديلة",
    ];

    return groups.sort((a, b) => {
      const aIndex =
        preferredOrder.indexOf(a.title);

      const bIndex =
        preferredOrder.indexOf(b.title);

      if (
        aIndex === -1 &&
        bIndex === -1
      ) {
        return 0;
      }

      if (aIndex === -1) {
        return 1;
      }

      if (bIndex === -1) {
        return -1;
      }

      return aIndex - bIndex;
    });
  }

  const single =
    ingredientItemText(value);

  return single
    ? [
        {
          title: "المكونات الأساسية",
          items: [single],
        },
      ]
    : [];
}

function normalizeRecipeIngredients(
  recipe: RecipeData,
): IngredientGroup[] {
  const groups =
    normalizeIngredients(
      recipe.ingredients,
    );

  const titles = new Set(
    groups.map(
      (group) => group.title,
    ),
  );

  const extraSources: Array<
    [string, unknown]
  > = [
    [
      "المكونات الأساسية",
      recipe["المكونات الأساسية"] ??
        recipe.basic_ingredients ??
        recipe.main_ingredients ??
        recipe.ingredients_basic,
    ],

    [
      "إضافات احترافية اختيارية",
      recipe[
        "إضافات احترافية اختيارية"
      ] ??
        recipe.optional_additions ??
        recipe.professional_additions ??
        recipe.ingredient_additions,
    ],

    [
      "خيارات بديلة",
      recipe["خيارات بديلة"] ??
        recipe.alternative_ingredients ??
        recipe.ingredient_alternatives ??
        recipe.substitutions,
    ],
  ];

  for (const [
    title,
    source,
  ] of extraSources) {
    if (titles.has(title)) {
      continue;
    }

    const items =
      ingredientItems(source);

    if (!items.length) {
      continue;
    }

    groups.push({
      title,
      items,
    });

    titles.add(title);
  }

  const preferredOrder = [
    "المكونات الأساسية",
    "إضافات احترافية اختيارية",
    "خيارات بديلة",
  ];

  return groups.sort((a, b) => {
    const aIndex =
      preferredOrder.indexOf(a.title);

    const bIndex =
      preferredOrder.indexOf(b.title);

    if (
      aIndex === -1 &&
      bIndex === -1
    ) {
      return 0;
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });
}

/* =========================================================
   OTHER HELPERS
========================================================= */

function normalizeFaq(
  value: unknown,
): FaqItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !item ||
      typeof item !== "object"
    ) {
      return [];
    }

    const record =
      item as Record<string, unknown>;

    const question =
      asString(record.question);

    const answer =
      asString(record.answer);

    return question && answer
      ? [
          {
            question,
            answer,
          },
        ]
      : [];
  });
}

function cleanStep(
  step: string,
): string {
  return step
    .replace(
      /^\s*[٠-٩0-9]+\s*[.\-:)،]?\s*/,
      "",
    )
    .trim();
}

function formatMinutes(
  value: unknown,
): string | null {
  const minutes = Number(value);

  if (
    !Number.isFinite(minutes) ||
    minutes < 0
  ) {
    return null;
  }

  if (minutes === 0) {
    return "0 دقيقة";
  }

  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }

  const hours =
    Math.floor(minutes / 60);

  const rest =
    minutes % 60;

  return rest
    ? `${hours} س ${rest} د`
    : `${hours} ساعة`;
}

function displayValue(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value);
}

function formatDate(
  value: unknown,
): string | null {
  const text =
    asString(value);

  if (!text) {
    return null;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(date);
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function SectionHeading({
  icon,
  children,
}: {
  icon: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-500 text-xl text-white shadow-md shadow-orange-500/20">
        {icon}
      </span>

      <h2 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
        {children}
      </h2>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400">
        {icon}
        {label}
      </div>

      <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   GUIDE
========================================================= */

function Guide({
  items,
}: {
  items: GuideItem[];
}) {
  const visible =
    items.filter(
      (item) => item.show,
    );

  const guideRef =
    useRef<HTMLElement>(null);

  const [desktopGuideStyle, setDesktopGuideStyle] =
    useState<CSSProperties | undefined>(
      undefined,
    );

  useEffect(() => {
    const updateDesktopGuide = () => {
      const boundary =
        document.getElementById(
          "recipe-content-grid",
        );
      const guide = guideRef.current;

      if (!boundary || !guide) {
        return;
      }

      const isDesktop =
        window.matchMedia("(min-width: 1280px)").matches;

      if (!isDesktop) {
        setDesktopGuideStyle(undefined);
        return;
      }

      const boundaryRect =
        boundary.getBoundingClientRect();
      const column =
        guide.parentElement;
      const columnRect =
        column?.getBoundingClientRect();

      if (!columnRect) {
        return;
      }

      const guideHeight =
        guide.getBoundingClientRect().height;
      const topOffset = 112;
      const scrollY = window.scrollY || window.pageYOffset;

      // Keep the guide in its original grid position until the page
      // actually reaches it. Only then should it start following the
      // viewport. This prevents it from appearing underneath the header
      // while the user is still above the guide's original position.
      const guideStartDocumentY =
        columnRect.top + scrollY;

      if (
        scrollY <
        guideStartDocumentY - topOffset
      ) {
        setDesktopGuideStyle(undefined);
        return;
      }

      // The guide must stop when its bottom reaches the end of the
      // recipe content grid, so it never travels into the footer.
      const bottomDocumentY =
        boundaryRect.bottom + scrollY;
      const maxTop =
        bottomDocumentY - guideHeight - scrollY;

      const calculatedTop = Math.min(
        topOffset,
        maxTop,
      );

      // If the recipe content is already above the viewport, leave the
      // guide at its natural position instead of forcing it to the footer.
      if (calculatedTop < 0) {
        setDesktopGuideStyle(undefined);
        return;
      }

      setDesktopGuideStyle({
        position: "fixed",
        top: `${calculatedTop}px`,
        left: `${columnRect.left}px`,
        width: `${columnRect.width}px`,
        zIndex: 30,
        // Smoothly follow the viewport without changing the guide's design.
        transition: "top 120ms ease-out, left 180ms ease-out, width 180ms ease-out",
      });
    };

    updateDesktopGuide();

    const handleScroll = () => {
      updateDesktopGuide();
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );
    window.addEventListener(
      "resize",
      updateDesktopGuide,
    );

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(
            updateDesktopGuide,
          )
        : null;

    if (resizeObserver) {
      const boundary =
        document.getElementById(
          "recipe-content-grid",
        );

      if (boundary) {
        resizeObserver.observe(boundary);
      }

      if (guideRef.current) {
        resizeObserver.observe(
          guideRef.current,
        );
      }
    }

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
      window.removeEventListener(
        "resize",
        updateDesktopGuide,
      );
      resizeObserver?.disconnect();
    };
  }, [visible.length]);

  if (!visible.length) {
    return null;
  }

  return (
    <>
      {/* Desktop Guide */}
      <div
        className="hidden min-h-[1px] xl:block"
      >
        <aside
          ref={guideRef}
          className="relative hidden xl:block"
          style={desktopGuideStyle}
          aria-label="دليل أقسام الوصفة"
        >
        <div
          id="recipe-desktop-guide"
          className="w-full max-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl border border-slate-700 bg-[#162235] shadow-2xl shadow-slate-950/20"
        >
          <div className="flex items-center justify-center gap-2 bg-orange-500 px-4 py-3.5 text-white">
            <ListTree
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />

            <span className="text-sm font-black">
              دليل أقسام الوصفة
            </span>
          </div>

          <nav className="max-h-[calc(100vh-10.5rem)] space-y-2 overflow-y-auto p-2.5">
            {visible.map(
              (item, index) => (
                <a
                  key={item.id}
                  href={`#recipe-section-${item.id}`}
                  data-recipe-guide-link={
                    item.id
                  }
                  data-active={
                    index === 0
                      ? "true"
                      : "false"
                  }
                  className="group flex w-full items-center gap-2.5 rounded-2xl bg-[#1d2a3c] px-2.5 py-2.5 text-right text-xs font-black text-slate-200 transition-all hover:bg-[#26364b] hover:text-white data-[active=true]:bg-orange-500 data-[active=true]:text-white"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#101827] text-lg">
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-[14px]">
                    {item.label}
                  </span>

                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2c3c51] text-[11px] text-slate-300">
                    {index + 1}
                  </span>
                </a>
              ),
            )}
          </nav>
        </div>
        </aside>
      </div>

      {/* Mobile Guide */}
      <details
        id="recipe-mobile-guide"
        className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[70] xl:hidden"
      >
        <summary
          aria-label="فتح دليل أقسام الوصفة"
          className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-2xl"
        >
          <ListTree
            className="h-5 w-5"
            aria-hidden="true"
          />

          <span>
            دليل الأقسام
          </span>

          <ChevronDown
            className="h-4 w-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="absolute bottom-full left-0 mb-3 w-[min(88vw,330px)] overflow-hidden rounded-3xl border border-slate-700 bg-[#162235] shadow-2xl">
          <div className="flex items-center justify-center gap-2 bg-orange-500 px-4 py-3.5 text-white">
            <ListTree className="h-[18px] w-[18px]" />

            <span className="text-sm font-black">
              دليل أقسام الوصفة
            </span>
          </div>

          <nav className="max-h-[min(66vh,560px)] space-y-2 overflow-y-auto p-2.5">
            {visible.map(
              (item, index) => (
                <a
                  key={item.id}
                  href={`#recipe-section-${item.id}`}
                  data-recipe-mobile-guide-link={
                    item.id
                  }
                  className="flex w-full items-center gap-2.5 rounded-2xl bg-[#1d2a3c] px-2.5 py-2.5 text-right text-xs font-black text-slate-100 transition-colors hover:bg-[#26364b]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#101827] text-lg">
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-[14px]">
                    {item.label}
                  </span>

                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2c3c51] text-[11px] text-slate-200">
                    {index + 1}
                  </span>
                </a>
              ),
            )}
          </nav>
        </div>
      </details>
    </>
  );
}

/* =========================================================
   RELATED CARD
========================================================= */

function RelatedCard({
  recipe,
}: {
  recipe: RelatedRecipe;
}) {
  const image =
    relatedImage(recipe);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Link
        href={`/recipe/${encodeURIComponent(
          String(recipe.slug),
        )}`}
        prefetch={false}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 260px"
            quality={IMAGE_QUALITY}
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            decoding="async"
            unoptimized
            onError={(event) => {
              event.currentTarget.src =
                FALLBACK_IMAGE;
            }}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="p-3">
          {recipe.country && (
            <div className="mb-1 text-xs font-black text-orange-600 dark:text-orange-400">
              {recipe.country}
            </div>
          )}

          <h3 className="line-clamp-2 text-sm font-black leading-6 text-slate-950 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
            {recipe.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   MAIN RECIPE VIEW
========================================================= */

export default function RecipeView({
  recipe,
  relatedRecipes = [],
}: {
  recipe: RecipeData;
  relatedRecipes?: RelatedRecipe[];
}) {
  // FAQ accordion: the first question starts open, and opening
  // another question automatically closes the previously open one.
  const [openFaqIndex, setOpenFaqIndex] =
    useState<number | null>(0);

  // Ingredients accordion: the first group starts open, and opening
  // another group automatically closes the previously open one.
  const [openIngredientGroupIndex, setOpenIngredientGroupIndex] =
    useState<number | null>(0);

  const image =
    recipeImage(recipe);

  const intro =
    asString(recipe.intro);

  const description =
    asString(recipe.description);

  const ingredients =
    normalizeRecipeIngredients(
      recipe,
    );

  const steps =
    asStringList(recipe.steps)
      .map(cleanStep)
      .filter(Boolean);

  const recipeTips =
    asStringList(recipe.tips);

  const tips =
    recipeTips.length > 0
      ? recipeTips
      : asStringList(
          recipe.cooking_tips,
        );

  const mistakes =
    asStringList(
      recipe.common_mistakes,
    );

  const faq =
    normalizeFaq(recipe.faq);

  const nutritionEntries =
    recipe.nutrition &&
    typeof recipe.nutrition ===
      "object"
      ? Object.entries(
          recipe.nutrition,
        ).filter(
          ([, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "",
        )
      : [];

  const categories =
    asStringList(recipe.category);

  const tags =
    asStringList(recipe.tags).slice(
      0,
      8,
    );

  const dataBox =
    recipe.data_box || {};

  const updatedDate =
    formatDate(
      recipe.updated_at ||
        recipe.created_at,
    );

  type RawInfoItem = {
    label: string;
    value: string | null;
    icon: ReactNode;
  };

  type InfoItem = {
    label: string;
    value: string;
    icon: ReactNode;
  };

  const rawInfo: RawInfoItem[] = [
    {
      label: "التحضير",
      value:
        formatMinutes(
          dataBox.prep_time_minutes,
        ),
      icon: (
        <Clock3
          className="h-4 w-4"
          aria-hidden="true"
        />
      ),
    },

    {
      label: "الطهي",
      value:
        formatMinutes(
          dataBox.cook_time_minutes,
        ),
      icon: (
        <ChefHat
          className="h-4 w-4"
          aria-hidden="true"
        />
      ),
    },

    {
      label: "الإجمالي",
      value:
        formatMinutes(
          dataBox.total_time_minutes,
        ),
      icon: (
        <Clock3
          className="h-4 w-4"
          aria-hidden="true"
        />
      ),
    },

    {
      label: "الحصص",
      value:
        displayValue(
          dataBox.servings,
        ),
      icon: (
        <Users
          className="h-4 w-4"
          aria-hidden="true"
        />
      ),
    },

    {
      label: "الصعوبة",
      value:
        displayValue(
          dataBox.difficulty,
        ),
      icon: (
        <Gauge
          className="h-4 w-4"
          aria-hidden="true"
        />
      ),
    },

    {
      label: "نوع الطبق",
      value:
        displayValue(
          dataBox.dish_type ||
            dataBox.meal_type,
        ),
      icon: (
        <UtensilsCrossed
          className="h-4 w-4"
          aria-hidden="true"
        />
      ),
    },
  ];

  const info =
    rawInfo.filter(
      (
        item,
      ): item is InfoItem =>
        item.value !== null,
    );

  const guideItems: GuideItem[] = [
    {
      id: "description",
      label: "وصف الوصفة",
      icon: "🍽️",
      show: Boolean(
        description,
      ),
    },

    {
      id: "data",
      label: "بيانات الوصفة",
      icon: "⏱️",
      show: info.length > 0,
    },

    {
      id: "ingredients",
      label: "المكونات",
      icon: "🥣",
      show:
        ingredients.length > 0,
    },

    {
      id: "steps",
      label: "خطوات التحضير",
      icon: "🍳",
      show: steps.length > 0,
    },

    {
      id: "tips",
      label: "النصائح",
      icon: "💡",
      show: tips.length > 0,
    },

    {
      id: "mistakes",
      label: "الأخطاء الشائعة",
      icon: "⚠️",
      show:
        mistakes.length > 0,
    },

    {
      id: "nutrition",
      label: "القيمة الغذائية",
      icon: "🍏",
      show:
        nutritionEntries.length > 0,
    },

    {
      id: "faq",
      label: "أسئلة شائعة",
      icon: "❓",
      show: faq.length > 0,
    },

    {
      id: "related",
      label: "وصفات مشابهة",
      icon: "🍽️",
      show:
        relatedRecipes.length > 0,
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-orange-50 pb-14 text-slate-900 dark:bg-slate-950 dark:text-white"
    >
      <article>
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-7">
            {/* Breadcrumb */}
            <nav
              aria-label="مسار التنقل"
              className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400"
            >
              <Link
                href="/"
                className="hover:text-orange-600"
              >
                الرئيسية
              </Link>

              <span>/</span>

              <Link
                href="/recipes"
                className="hover:text-orange-600"
              >
                الوصفات
              </Link>

              {categories[0] && (
                <>
                  <span>/</span>

                  <Link
                    href={`/recipes?category=${encodeURIComponent(
                      categories[0],
                    )}`}
                    prefetch={false}
                    className="hover:text-orange-600"
                  >
                    {categories[0].replace(
                      /-/g,
                      " ",
                    )}
                  </Link>
                </>
              )}
            </nav>

            {/* Hero */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-center">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {recipe.country && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                      <MapPin
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />

                      {recipe.country}
                    </span>
                  )}

                  {dataBox.meal_type && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {String(
                        dataBox.meal_type,
                      )}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-black leading-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                  {recipe.title}
                </h1>

                {(description ||
                  intro) && (
                  <p className="mt-4 max-w-3xl text-sm font-bold leading-8 text-slate-600 dark:text-slate-300 sm:text-base">
                    {description ||
                      intro}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {updatedDate && (
                    <span>
                      آخر تحديث:{" "}
                      {updatedDate}
                    </span>
                  )}

                  {tags
                    .slice(0, 4)
                    .map((tag) => (
                      <Link
                        key={tag}
                        href={`/recipes?tag=${encodeURIComponent(
                          tag,
                        )}`}
                        prefetch={false}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 hover:text-orange-600 dark:bg-slate-900 dark:hover:text-orange-400"
                      >
                        <Tag
                          className="h-3 w-3"
                          aria-hidden="true"
                        />

                        {tag}
                      </Link>
                    ))}
                </div>
              </div>

              {/* =================================================
                  MAIN IMAGE
              ================================================= */}

              <div className="relative aspect-[3/2] overflow-hidden rounded-[30px] bg-slate-200 shadow-2xl dark:bg-slate-800">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 94vw, 520px"
                  quality={IMAGE_QUALITY}
                  preload
                  fetchPriority="high"
                  placeholder="blur"
                  blurDataURL={
                    BLUR_DATA_URL
                  }
                  decoding="async"

                  /*
                   * مهم جدًا:
                   * لا نستخدم remoteImage هنا.
                   * unoptimized يجعل Next يعرض الصورة
                   * من المصدر مباشرة.
                   */
                  unoptimized

                  onError={(event) => {
                    const img =
                      event.currentTarget;

                    if (
                      img.src.endsWith(
                        FALLBACK_IMAGE,
                      )
                    ) {
                      return;
                    }

                    img.src =
                      FALLBACK_IMAGE;
                  }}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          dir="ltr"
          id="recipe-content-grid"
          className="mx-auto grid max-w-7xl gap-6 px-3 py-6 sm:px-4 sm:py-8 xl:grid-cols-[225px_minmax(0,1fr)]"
        >
          {/* Guide */}
          <div
            dir="rtl"
            className="relative min-h-0"
          >
            <Guide
              items={guideItems}
            />
          </div>

          {/* Main content */}
          <div
            dir="rtl"
            className="min-w-0"
          >
            {/* Description */}
            {description && (
              <section
                id="recipe-section-description"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="🍽️">
                  وصف الوصفة
                </SectionHeading>

                <p className="text-sm font-bold leading-8 text-slate-700 dark:text-slate-200 sm:text-base">
                  {description}
                </p>
              </section>
            )}

            {/* Recipe Data */}
            {info.length > 0 && (
              <section
                id="recipe-section-data"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="⏱️">
                  بيانات الوصفة
                </SectionHeading>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {info.map(
                    (item) => (
                      <InfoCard
                        key={item.label}
                        icon={item.icon}
                        label={
                          item.label
                        }
                        value={
                          item.value
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}

            {/* Ingredients */}
            {ingredients.length >
              0 && (
              <section
                id="recipe-section-ingredients"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="🥣">
                  المكونات
                </SectionHeading>

                <div className="space-y-4">
                  {ingredients.map(
                    (
                      group,
                      groupIndex,
                    ) => {
                      const title =
                        group.title ||
                        "المكونات";

                      const groupIcon =
                        title.includes(
                          "خيارات بديلة",
                        )
                          ? "↔"
                          : title.includes(
                              "إضافات احترافية اختيارية",
                            )
                            ? "+"
                            : "🥣";

                      return (
                        <details
                          key={`${title}-${groupIndex}`}
                          open={
                            openIngredientGroupIndex ===
                            groupIndex
                          }
                          className="group overflow-hidden rounded-2xl border border-slate-300 bg-slate-50/80 shadow-sm transition-shadow duration-200 open:shadow-md dark:border-slate-700 dark:bg-slate-950/70"
                        >
                          <summary
                            onClick={(event) => {
                              event.preventDefault();
                              setOpenIngredientGroupIndex(
                                (current) =>
                                  current === groupIndex
                                    ? null
                                    : groupIndex,
                              );
                            }}
                            className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-transparent bg-orange-50 px-4 py-3 text-base font-black text-orange-700 transition-colors hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/15 [&::-webkit-details-marker]:hidden"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/10 text-sm text-orange-600 dark:bg-orange-400/10 dark:text-orange-300">
                                {groupIcon}
                              </span>

                              <span className="truncate">
                                {title}
                              </span>

                              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {
                                  group
                                    .items
                                    .length
                                }
                              </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400">
                              <span className="hidden sm:inline">
                                فتح
                              </span>

                              <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                            </span>
                          </summary>

                          <div className="border-t border-slate-200/70 p-3 dark:border-slate-800">
                            <ul className="grid gap-2 sm:grid-cols-2">
                              {group.items.map(
                                (
                                  item,
                                  index,
                                ) => (
                                  <li
                                    key={`${item}-${index}`}
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold leading-7 text-slate-800 transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                  >
                                    <span className="me-2 text-orange-500">
                                      •
                                    </span>

                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </details>
                      );
                    },
                  )}
                </div>
              </section>
            )}

            {/* Advertisement */}
            {adsEnabled &&
              ingredients.length >
                0 &&
              steps.length > 0 && (
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1 text-center text-[10px] font-bold text-slate-400">
                    إعلان
                  </div>

                  <AdSenseBanner
                    adSlot="2901613977"
                    minHeight={90}
                  />
                </div>
              )}

            {/* Steps */}
            {steps.length > 0 && (
              <section
                id="recipe-section-steps"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="🍳">
                  خطوات التحضير
                </SectionHeading>

                <ol className="space-y-3">
                  {steps.map(
                    (
                      step,
                      index,
                    ) => (
                      <li
                        key={`${step}-${index}`}
                        className="relative rounded-2xl border border-slate-300 bg-slate-50 py-3 pe-4 ps-14 text-sm font-bold leading-8 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:text-base"
                      >
                        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-black text-white">
                          {index + 1}
                        </span>

                        {step}
                      </li>
                    ),
                  )}
                </ol>
              </section>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <section
                id="recipe-section-tips"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="💡">
                  نصائح لنجاح الوصفة
                </SectionHeading>

                <ul className="space-y-2">
                  {tips.map(
                    (
                      tip,
                      index,
                    ) => (
                      <li
                        key={`${tip}-${index}`}
                        className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-bold leading-7 text-slate-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-slate-100"
                      >
                        <span className="me-2 text-emerald-600">
                          ✓
                        </span>

                        {tip}
                      </li>
                    ),
                  )}
                </ul>
              </section>
            )}

            {/* Mistakes */}
            {mistakes.length >
              0 && (
              <section
                id="recipe-section-mistakes"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="⚠️">
                  الأخطاء الشائعة
                </SectionHeading>

                <ul className="space-y-2">
                  {mistakes.map(
                    (
                      mistake,
                      index,
                    ) => (
                      <li
                        key={`${mistake}-${index}`}
                        className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm font-bold leading-7 text-slate-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-slate-100"
                      >
                        <span className="me-2">
                          ⚠️
                        </span>

                        {mistake}
                      </li>
                    ),
                  )}
                </ul>
              </section>
            )}

            {/* Nutrition */}
            {nutritionEntries.length >
              0 && (
              <section
                id="recipe-section-nutrition"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="🍏">
                  القيمة الغذائية
                </SectionHeading>

                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {nutritionEntries.map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-950"
                      >
                        <dt className="text-xs font-black text-orange-600 dark:text-orange-400">
                          {key}
                        </dt>

                        <dd className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                          {String(
                            value,
                          )}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </section>
            )}

            {/* FAQ */}
            {faq.length > 0 && (
              <section
                id="recipe-section-faq"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="❓">
                  أسئلة شائعة
                </SectionHeading>

                <div className="space-y-3">
                  {faq.map(
                    (
                      item,
                      index,
                    ) => (
                      <details
                        key={`${item.question}-${index}`}
                        open={openFaqIndex === index}
                        className="group overflow-hidden rounded-2xl border border-slate-300 bg-slate-50 transition-shadow duration-300 open:shadow-md dark:border-slate-700 dark:bg-slate-950"
                      >
                        <summary
                          onClick={(event) => {
                            event.preventDefault();
                            setOpenFaqIndex((current) =>
                              current === index ? null : index,
                            );
                          }}
                          className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-black leading-7 text-slate-900 outline-none transition-colors hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:text-white dark:hover:text-orange-400 sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/10 text-xs font-black text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                              {index + 1}
                            </span>

                            <span>{item.question}</span>
                          </span>

                          <ChevronDown
                            className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 group-open:rotate-180 dark:text-slate-400"
                            aria-hidden="true"
                          />
                        </summary>

                        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                          <div className="min-h-0 overflow-hidden">
                            <div className="border-t border-slate-300 px-4 pb-4 pt-3 text-sm font-bold leading-8 text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:px-5">
                              <span className="font-black text-orange-600 dark:text-orange-400">
                                الإجابة: 
                              </span>
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      </details>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* Related Recipes */}
            {relatedRecipes.length >
              0 && (
              <section
                id="recipe-section-related"
                className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6"
              >
                <SectionHeading icon="🍽️">
                  وصفات مشابهة قد تعجبك
                </SectionHeading>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedRecipes
                    .slice(0, 8)
                    .map(
                      (
                        related,
                      ) => (
                        <RelatedCard
                          key={`${related.id || related.slug}`}
                          recipe={
                            related
                          }
                        />
                      ),
                    )}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>

      {/* =================================================
          SIMPLE SCROLL SPY
      ================================================= */}

      <Script
        id="recipe-guide-scrollspy"
        strategy="afterInteractive"
      >
        {`
          (() => {
            const links = Array.from(
              document.querySelectorAll(
                '[data-recipe-guide-link], [data-recipe-mobile-guide-link]'
              )
            );

            if (!links.length) return;

            const getId = (link) =>
              link.getAttribute(
                'data-recipe-guide-link'
              ) ||
              link.getAttribute(
                'data-recipe-mobile-guide-link'
              );

            const sections = links
              .map((link) => {
                const id = getId(link);

                return {
                  id,
                  element: id
                    ? document.getElementById(
                        'recipe-section-' + id
                      )
                    : null
                };
              })
              .filter(
                (item) => item.element
              );

            if (!sections.length) return;

            let lastActiveId = null;

            const update = () => {
              const probe = 150;
              let active = sections[0];
              let bestDistance = Number.POSITIVE_INFINITY;

              for (const section of sections) {
                const rect =
                  section.element.getBoundingClientRect();

                const distance = Math.abs(rect.top - probe);

                // Prefer the section currently crossing the reading line.
                if (rect.top <= probe && rect.bottom > probe) {
                  active = section;
                  bestDistance = 0;
                  break;
                }

                if (distance < bestDistance) {
                  bestDistance = distance;
                  active = section;
                }
              }

              links.forEach((link) => {
                const activeState =
                  getId(link) === active.id;

                link.dataset.active =
                  activeState
                    ? 'true'
                    : 'false';

                link.setAttribute(
                  'aria-current',
                  activeState ? 'location' : 'false'
                );
              });

              // Keep the active item visible inside the guide itself.
              // Move only the guide's own scroll container so the recipe
              // page never jumps when the active section changes.
              if (active.id !== lastActiveId) {
                lastActiveId = active.id;

                const activeLinks = links.filter(
                  (link) => getId(link) === active.id
                );

                activeLinks.forEach((link) => {
                  const scrollContainer =
                    link.closest('nav');

                  if (!scrollContainer) {
                    return;
                  }

                  const linkRect =
                    link.getBoundingClientRect();
                  const containerRect =
                    scrollContainer.getBoundingClientRect();

                  if (linkRect.top < containerRect.top) {
                    scrollContainer.scrollBy({
                      top: linkRect.top - containerRect.top - 8,
                      behavior: 'smooth',
                    });
                  } else if (
                    linkRect.bottom > containerRect.bottom
                  ) {
                    scrollContainer.scrollBy({
                      top: linkRect.bottom - containerRect.bottom + 8,
                      behavior: 'smooth',
                    });
                  }
                });
              }
            };

            window.addEventListener(
              'scroll',
              update,
              { passive: true }
            );

            window.addEventListener(
              'resize',
              update,
              { passive: true }
            );

            update();
          })();
        `}
      </Script>
    </main>
  );
}