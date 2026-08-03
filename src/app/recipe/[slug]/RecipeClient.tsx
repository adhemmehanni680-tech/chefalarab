"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ListTree,
  X,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion";
import AdSenseBanner from "@/app/Components/AdSenseBanner";

/* =============================== */
/* Types                           */
/* =============================== */

interface RecipeImage {
  url: string;
  "url-card"?: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface RecipeFAQ {
  question: string;
  answer: string;
}

interface Recipe {
  id?: number;
  title: string;
  slug: string;
  status?: string;
  country?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  category?: string[];
  img?: string | RecipeImage;
  intro?: string;
  description?: string;

  data_box?: {
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    total_time_minutes?: number;
    servings?: number | string;
    meal_type?: string;
    difficulty?: string;
    dish_type?: string;
    [key: string]: unknown;
  };

  ingredients?: unknown;
  steps?: string[];
  tips?: string[];
  common_mistakes?: string[];
  nutrition?: Record<string, string | number>;

  faq?: RecipeFAQ[];

  internal_links?: {
    title: string;
    slug: string;
    anchor_text: string;
  }[];

  seo?: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
    og_title?: string;
    og_description?: string;
    og_image?: string;
  };

  schema?: Record<string, unknown>;
  faq_schema?: Record<string, unknown>;

  content_flags?: {
    has_video?: boolean;
    has_images?: boolean;
    has_faq?: boolean;
    is_long_form?: boolean;
  };

  cooking_tips?: string[];
}

type Props = {
  recipe: Recipe;
  relatedRecipes?: Recipe[];
};

type IngredientSection = {
  title?: string;
  items: string[];
};

type DataBoxItem = {
  icon: string;
  label: string;
  value: string;
};

type SectionKey =
  | "intro"
  | "description"
  | "data"
  | "ingredients"
  | null;

type GuideSectionId =
  | "intro"
  | "description"
  | "data"
  | "ingredients"
  | "steps"
  | "tips"
  | "mistakes"
  | "nutrition"
  | "faq"
  | "related";

type GuideSection = {
  id: GuideSectionId;
  title: string;
  icon: string;
  available: boolean;
};

/* =============================== */
/* Helpers                         */
/* =============================== */

function normalizeImageUrl(url: unknown): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const cleanUrl = url.trim().replace(/\\/g, "/");

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
  url?: string | null,
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
  sources: Array<string | null | undefined>,
): string[] {
  const seen = new Set<string>();

  return sources
    .map(normalizeImageUrl)
    .filter(
      (source): source is string =>
        Boolean(source),
    )
    .filter((source) => {
      if (seen.has(source)) {
        return false;
      }

      seen.add(source);

      return true;
    });
}

function getMainImageSources(
  recipe: Recipe,
): string[] {
  const mainUrl =
    typeof recipe.img === "string"
      ? recipe.img
      : recipe.img?.url;

  const cardUrl =
    typeof recipe.img === "string"
      ? null
      : recipe.img?.["url-card"];

  const main = normalizeImageUrl(mainUrl);
  const card = normalizeImageUrl(cardUrl);

  const fileName = getImageFileName(
    main || card,
  );

  const sources: Array<string | null> = [];

  if (main) {
    sources.push(main);
  } else if (fileName) {
    sources.push(`/uploads/${fileName}`);
  }

  if (card) {
    sources.push(card);
  } else if (fileName) {
    sources.push(`/card/${fileName}`);
  }

  sources.push("/Heeder.webp");

  return uniqueImageSources(sources);
}

function getRelatedImageSources(
  recipe: Recipe,
): string[] {
  const mainUrl =
    typeof recipe.img === "string"
      ? recipe.img
      : recipe.img?.url;

  const cardUrl =
    typeof recipe.img === "string"
      ? null
      : recipe.img?.["url-card"];

  const main = normalizeImageUrl(mainUrl);
  const card = normalizeImageUrl(cardUrl);

  const fileName = getImageFileName(
    card || main,
  );

  const sources: Array<string | null> = [];

  if (card) {
    sources.push(card);
  } else if (fileName) {
    sources.push(`/card/${fileName}`);
  }

  if (main) {
    sources.push(main);
  } else if (fileName) {
    sources.push(`/uploads/${fileName}`);
  }

  sources.push("/Heeder.webp");

  return uniqueImageSources(sources);
}

function getImageAlt(recipe: Recipe): string {
  if (typeof recipe.img === "string") {
    return recipe.title;
  }

  return (
    recipe.img?.alt ||
    recipe.title ||
    "صورة الوصفة"
  );
}

function normalizeDataBox(
  data?: Recipe["data_box"],
): DataBoxItem[] {
  if (!data) {
    return [];
  }

  const items: Array<{
    key: keyof NonNullable<
      Recipe["data_box"]
    >;
    icon: string;
    label: string;
    suffix?: string;
  }> = [
    {
      key: "prep_time_minutes",
      icon: "⏱️",
      label: "وقت التحضير",
      suffix: "دقيقة",
    },
    {
      key: "cook_time_minutes",
      icon: "🔥",
      label: "وقت الطبخ",
      suffix: "دقيقة",
    },
    {
      key: "total_time_minutes",
      icon: "⌛",
      label: "الوقت الكلي",
      suffix: "دقيقة",
    },
    {
      key: "servings",
      icon: "👨‍👩‍👧‍👦",
      label: "عدد الأشخاص",
    },
    {
      key: "meal_type",
      icon: "🍽️",
      label: "الوجبة",
    },
    {
      key: "difficulty",
      icon: "⭐",
      label: "المستوى",
    },
    {
      key: "dish_type",
      icon: "🍲",
      label: "نوع الطبق",
    },
  ];

  return items
    .map(
      ({
        key,
        icon,
        label,
        suffix,
      }) => {
        const value = data[key];

        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return null;
        }

        return {
          icon,
          label,
          value: suffix
            ? `${String(value)} ${suffix}`
            : String(value),
        };
      },
    )
    .filter(
      (item): item is DataBoxItem =>
        Boolean(item),
    );
}

function normalizeIngredients(
  data: unknown,
): IngredientSection[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    const sections: IngredientSection[] = [];

    let currentTitle:
      | string
      | undefined;

    let currentItems: string[] = [];

    data.forEach((line) => {
      const lineString =
        String(line).trim();

      if (!lineString) {
        return;
      }

      const isTitle =
        lineString.endsWith(":") ||
        lineString.endsWith("：");

      if (isTitle) {
        if (currentItems.length > 0) {
          sections.push({
            title: currentTitle,
            items: currentItems,
          });
        }

        currentTitle =
          lineString.replace(
            /[:：]\s*$/,
            "",
          );

        currentItems = [];
      } else {
        currentItems.push(lineString);
      }
    });

    if (currentItems.length > 0) {
      sections.push({
        title: currentTitle,
        items: currentItems,
      });
    }

    return sections.length > 0
      ? sections
      : [
          {
            items: data
              .map((item) =>
                String(item).trim(),
              )
              .filter(Boolean),
          },
        ];
  }

  if (typeof data === "object") {
    return Object.entries(
      data as Record<string, unknown>,
    )
      .map(([key, value]) => {
        const items = Array.isArray(value)
          ? value
              .map((item) =>
                String(item).trim(),
              )
              .filter(Boolean)
          : [String(value).trim()].filter(
              Boolean,
            );

        return {
          title: key,
          items,
        };
      })
      .filter(
        (section) =>
          section.items.length > 0,
      );
  }

  return [
    {
      items: [String(data).trim()].filter(
        Boolean,
      ),
    },
  ];
}

function getRelativeDateArabic(
  dateString?: string,
): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffInMs =
    Date.now() - date.getTime();

  const diffInDays = Math.max(
    0,
    Math.floor(
      diffInMs /
        (1000 * 60 * 60 * 24),
    ),
  );

  if (diffInDays === 0) {
    return "اليوم";
  }

  if (diffInDays === 1) {
    return "منذ يوم";
  }

  if (diffInDays === 2) {
    return "منذ يومين";
  }

  if (diffInDays <= 10) {
    return `منذ ${diffInDays} أيام`;
  }

  return `منذ ${diffInDays} يومًا`;
}

function cleanStepNumber(step: string): string {
  return step
    .replace(/^\s*[٠-٩0-9]+\s*[.\-:)،]?\s*/, "")
    .trim();
}

function getInitialOpenSection(
  recipe: Recipe,
): SectionKey {
  if (recipe.ingredients) {
    return "ingredients";
  }

  if (recipe.intro) {
    return "intro";
  }

  if (recipe.description) {
    return "description";
  }

  if (recipe.data_box) {
    return "data";
  }

  return null;
}

/* =============================== */
/* Footer detection                */
/* =============================== */

function useFooterVisibility(): boolean {
  const [
    isFooterVisible,
    setIsFooterVisible,
  ] = useState(false);

  useEffect(() => {
    let observer:
      | IntersectionObserver
      | null = null;

    let retryTimer:
      | number
      | null = null;

    let isCancelled = false;

    const observeFooter = () => {
      if (isCancelled) {
        return;
      }

      const footer =
        document.getElementById(
          "site-footer",
        ) ||
        document.querySelector("footer");

      if (!footer) {
        retryTimer = window.setTimeout(
          observeFooter,
          500,
        );

        return;
      }

      observer =
        new IntersectionObserver(
          ([entry]) => {
            setIsFooterVisible(
              entry.isIntersecting,
            );
          },
          {
            threshold: 0.01,
            rootMargin:
              "0px 0px 80px 0px",
          },
        );

      observer.observe(footer);
    };

    observeFooter();

    return () => {
      isCancelled = true;

      observer?.disconnect();

      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  return isFooterVisible;
}

/* =============================== */
/* Motion                          */
/* =============================== */

const fadeUp = {
  initial: {
    opacity: 0,
    y: 14,
  },
  whileInView: {
    opacity: 1,
    y: 0,
  },
  viewport: {
    once: true,
    amount: 0.1,
  },
  transition: {
    duration: 0.3,
  },
};

/* =============================== */
/* Image components                */
/* =============================== */

const IMAGE_BLUR_DATA =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%231a2637'/%3E%3Crect x='0' y='6' width='16' height='3' fill='%233a2a1d'/%3E%3C/svg%3E";

const NEXT_IMAGE_QUALITY = 72;

function InlineImageFallback({
  alt,
}: {
  alt: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1f2b3b] via-[#172235] to-[#2a211c] p-4 text-center text-white">
      <span className="mb-2 text-4xl">
        🍽️
      </span>

      <span className="text-sm font-black leading-relaxed sm:text-base">
        {alt || "صورة الوصفة"}
      </span>

      <span className="mt-2 text-xs font-medium text-white/60">
        الصورة غير متاحة حاليًا
      </span>
    </div>
  );
}

type SmartImageProps = {
  sources: string[];
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
};

function SmartRecipeImage({
  sources,
  alt,
  className = "object-cover",
  sizes,
  priority = false,
  quality = NEXT_IMAGE_QUALITY,
}: SmartImageProps) {
  const sourcesKey = sources.join("|");

  const stableSources = useMemo(
    () => sources.filter(Boolean),
    [sources],
  );

  const [sourceIndex, setSourceIndex] =
    useState(0);

  const [hasFailed, setHasFailed] =
    useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setHasFailed(false);
  }, [sourcesKey]);

  const currentSource =
    stableSources[sourceIndex];

  if (!currentSource || hasFailed) {
    return (
      <InlineImageFallback alt={alt} />
    );
  }

  const isRemote =
    currentSource.startsWith(
      "http://",
    ) ||
    currentSource.startsWith(
      "https://",
    );

  return (
    <Image
      key={currentSource}
      src={currentSource}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      preload={priority}
      loading={priority ? undefined : "lazy"}
      placeholder="blur"
      blurDataURL={IMAGE_BLUR_DATA}
      decoding="async"
      draggable={false}
      unoptimized={isRemote}
      className={`${className} transition-opacity duration-300`}
      onError={() => {
        setSourceIndex(
          (currentIndex) => {
            if (
              currentIndex <
              stableSources.length - 1
            ) {
              return currentIndex + 1;
            }

            setHasFailed(true);

            return currentIndex;
          },
        );
      }}
    />
  );
}

/* =============================== */
/* Shared UI                       */
/* =============================== */

function AdBlock() {
  return (
    <div className="my-3 min-h-[78px] overflow-hidden rounded-xl border border-white/[0.03] bg-[#151f30] sm:my-4 sm:min-h-[90px]">
      <AdSenseBanner adSlot="2901613977" />
    </div>
  );
}

function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-500 text-xl text-white shadow-md shadow-orange-500/20">
        {icon}
      </span>

      <h2 className="text-base font-black text-gray-900 dark:text-white sm:text-lg">
        {children}
      </h2>
    </div>
  );
}

/* =============================== */
/* Desktop guide                   */
/* =============================== */

function RecipeSectionGuide({
  sections,
  activeSection,
  onNavigate,
  isFooterVisible,
}: {
  sections: GuideSection[];
  activeSection:
    | GuideSectionId
    | null;
  onNavigate: (
    id: GuideSectionId,
  ) => void;
  isFooterVisible: boolean;
}) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <aside
      className={`fixed bottom-5 left-0 top-28 z-30 hidden w-[225px] transition-all duration-300 ease-out xl:block ${
        isFooterVisible
          ? "pointer-events-none -translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
      }`}
      aria-label="دليل أقسام الوصفة"
      aria-hidden={isFooterVisible}
    >
      <div className="flex h-full max-h-[calc(100vh-8.25rem)] flex-col overflow-hidden rounded-r-3xl border border-l-0 border-white/10 bg-[#162235]/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex shrink-0 items-center justify-center gap-2 bg-orange-500 px-4 py-3 text-white">
          <ListTree size={17} />

          <span className="text-sm font-black">
            دليل أقسام الوصفة
          </span>
        </div>

        <nav className="custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
          {sections.map(
            (section, index) => {
              const isActive =
                activeSection ===
                section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    onNavigate(
                      section.id,
                    )
                  }
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                  className={`flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-right text-xs font-black transition-all duration-200 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-[#1d2a3c] text-slate-200 hover:-translate-y-0.5 hover:bg-[#26364b] hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg ${
                      isActive
                        ? "bg-white/20"
                        : "bg-[#101827]"
                    }`}
                  >
                    {section.icon}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-[15px]">
                    {section.title}
                  </span>

                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${
                      isActive
                        ? "bg-white font-black text-orange-500"
                        : "bg-[#2c3c51] text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                </button>
              );
            },
          )}
        </nav>
      </div>
    </aside>
  );
}

/* =============================== */
/* Mobile floating guide           */
/* =============================== */

function RecipeFloatingGuide({
  sections,
  activeSection,
  onNavigate,
  isFooterVisible,
}: {
  sections: GuideSection[];
  activeSection:
    | GuideSectionId
    | null;
  onNavigate: (
    id: GuideSectionId,
  ) => void;
  isFooterVisible: boolean;
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const [isOpen, setIsOpen] =
    useState(false);

  useEffect(() => {
    if (isFooterVisible) {
      setIsOpen(false);
    }
  }, [isFooterVisible]);

  if (sections.length === 0) {
    return null;
  }

  const activeSectionData =
    sections.find(
      (section) =>
        section.id === activeSection,
    ) ?? sections[0];

  return (
    <div
      className={`fixed left-3 z-[70] flex w-[calc(100vw-5.25rem)] max-w-[340px] min-w-0 flex-col items-start gap-2 transition-all duration-300 xl:hidden ${
        isFooterVisible
          ? "pointer-events-none translate-y-24 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
      style={{
        bottom:
          "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
      aria-hidden={isFooterVisible}
    >
      <AnimatePresence initial={false}>
        {isOpen &&
          !isFooterVisible && (
            <m.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 14,
                      scale: 0.97,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: 12,
                      scale: 0.97,
                    }
              }
              transition={{
                duration: 0.2,
              }}
              className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#162235]/98 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2 bg-orange-500 px-3 py-2.5 text-white">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15">
                    <ListTree
                      size={15}
                    />
                  </span>

                  <div className="min-w-0">
                    <span className="block truncate text-xs font-black">
                      دليل أقسام الوصفة
                    </span>

                    {activeSectionData && (
                      <span className="block max-w-[180px] truncate text-[9px] font-bold text-white/80">
                        القسم الحالي:{" "}
                        {
                          activeSectionData.title
                        }
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsOpen(false)
                  }
                  aria-label="إغلاق دليل الوصفة"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
                >
                  <X size={15} />
                </button>
              </div>

              <nav className="recipe-guide-scrollbar grid max-h-[55vh] grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain p-2">
                {sections.map(
                  (
                    section,
                    index,
                  ) => {
                    const isActive =
                      activeSection ===
                      section.id;

                    return (
                      <button
                        key={
                          section.id
                        }
                        type="button"
                        onClick={() => {
                          onNavigate(
                            section.id,
                          );

                          setIsOpen(
                            false,
                          );
                        }}
                        aria-current={
                          isActive
                            ? "true"
                            : undefined
                        }
                        className={`flex min-w-0 items-center gap-1.5 rounded-xl border px-2 py-2 text-right text-[10px] font-black transition ${
                          isActive
                            ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20"
                            : "border-white/[0.07] bg-[#1e2b3d] text-slate-100 hover:border-orange-500/40 hover:bg-[#29394e]"
                        }`}
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${
                            isActive
                              ? "bg-white/20"
                              : "bg-[#101827]"
                          }`}
                        >
                          {
                            section.icon
                          }
                        </span>

                        <span className="min-w-0 flex-1 truncate text-[12px]">
                          {
                            section.title
                          }
                        </span>

                        <span
                          className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${
                            isActive
                              ? "bg-white text-orange-500"
                              : "bg-[#304158] text-slate-300"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </button>
                    );
                  },
                )}
              </nav>
            </m.div>
          )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
        aria-label={
          isOpen
            ? "إغلاق دليل الوصفة"
            : "فتح دليل الوصفة"
        }
        aria-expanded={isOpen}
        className={`flex h-11 max-w-[190px] items-center gap-2 rounded-full border border-white/10 px-2.5 text-white shadow-xl shadow-black/30 transition hover:-translate-y-0.5 active:scale-95 ${
          isOpen
            ? "bg-[#162235] hover:bg-[#1e2b3d]"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
            isOpen
              ? "bg-orange-500"
              : "bg-white/15"
          }`}
        >
          {isOpen ? (
            <X size={15} />
          ) : (
            <ListTree size={16} />
          )}
        </span>

        <span className="min-w-0 text-right">
          <span className="block truncate text-[11px] font-black">
            دليل الوصفة
          </span>

          {!isOpen &&
            activeSectionData && (
              <span className="block max-w-[120px] truncate text-[9px] font-bold text-white/80">
                {
                  activeSectionData.icon
                }{" "}
                {
                  activeSectionData.title
                }
              </span>
            )}
        </span>
      </button>
    </div>
  );
}

/* =============================== */
/* Collapsible section             */
/* =============================== */

function CollapsibleSection({
  title,
  icon,
  children,
  isOpen,
  onToggle,
  sectionId,
}: {
  title: string;
  icon: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  sectionId: GuideSectionId;
}) {
  const contentRef =
    useRef<HTMLDivElement>(null);

  const shouldReduceMotion =
    useReducedMotion();

  const [
    isOverflowing,
    setIsOverflowing,
  ] = useState(false);

  useEffect(() => {
    if (
      !isOpen ||
      !contentRef.current
    ) {
      setIsOverflowing(false);
      return;
    }

    const timer = window.setTimeout(
      () => {
        if (!contentRef.current) {
          return;
        }

        const maxHeight =
          window.innerHeight * 0.64;

        setIsOverflowing(
          contentRef.current
            .scrollHeight > maxHeight,
        );
      },
      120,
    );

    return () =>
      window.clearTimeout(timer);
  }, [children, isOpen]);

  return (
    <m.section
      id={`recipe-section-${sectionId}`}
      {...fadeUp}
      className="mb-2.5 scroll-mt-24 overflow-hidden rounded-xl border border-white/[0.06] bg-[#1c293a] shadow-sm shadow-black/10"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-right transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-500 text-sm text-white">
            {icon}
          </span>

          <span className="truncate text-sm font-black text-orange-400 sm:text-base">
            {title}
          </span>
        </div>

        <m.span
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: isOpen
                    ? 180
                    : 0,
                }
          }
          transition={{
            duration: 0.18,
          }}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0f1725] text-slate-300"
        >
          <ChevronDown size={15} />
        </m.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    height: 0,
                    opacity: 0,
                  }
            }
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={
              shouldReduceMotion
                ? undefined
                : {
                    height: 0,
                    opacity: 0,
                  }
            }
            transition={{
              duration: 0.22,
            }}
            className="overflow-hidden"
          >
            <div
              ref={contentRef}
              className="custom-scrollbar relative max-h-[64vh] overflow-y-auto border-t border-white/[0.05] px-3 pb-3 pt-2.5"
            >
              {children}

              {isOverflowing && (
                <div className="pointer-events-none sticky bottom-0 h-10 bg-gradient-to-t from-[#1c293a] to-transparent" />
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.section>
  );
}

/* =============================== */
/* Related recipe card             */
/* =============================== */

const RelatedRecipeCard = memo(
  function RelatedRecipeCard({
    recipe,
    index,
  }: {
    recipe: Recipe;
    index: number;
  }) {
    const shouldReduceMotion =
      useReducedMotion();

    const relatedImageSources =
      useMemo(
        () =>
          getRelatedImageSources(
            recipe,
          ),
        [recipe],
      );

    const imageAlt =
      getImageAlt(recipe);

    return (
      <m.article
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 12,
              }
        }
        whileInView={
          shouldReduceMotion
            ? undefined
            : {
                opacity: 1,
                y: 0,
              }
        }
        viewport={{
          once: true,
          amount: 0.12,
        }}
        transition={{
          duration: 0.25,
          delay: Math.min(
            index * 0.025,
            0.1,
          ),
        }}
        className="group overflow-hidden rounded-xl border border-white/[0.06] bg-[#1b2839] shadow-sm shadow-black/20 transition hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl"
      >
        <Link
          href={`/recipe/${encodeURIComponent(recipe.slug)}`}
          prefetch={false}
          className="block"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#263449]">
            <SmartRecipeImage
              sources={
                relatedImageSources
              }
              alt={imageAlt}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 23vw, 180px"
            quality={70}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="p-2">
            <h3 className="line-clamp-2 text-[11px] font-black leading-5 text-white sm:text-xs">
              {recipe.title}
            </h3>
          </div>
        </Link>
      </m.article>
    );
  },
);

/* =============================== */
/* Main component                  */
/* =============================== */

export default function RecipeClient({
  recipe,
  relatedRecipes = [],
}: Props) {
  const shouldReduceMotion =
    useReducedMotion();

  const isFooterVisible =
    useFooterVisibility();

  const [
    openFaqIndex,
    setOpenFaqIndex,
  ] = useState<number | null>(0);

  const [
    openSection,
    setOpenSection,
  ] = useState<SectionKey>(() =>
    getInitialOpenSection(recipe),
  );

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<GuideSectionId | null>(
      null,
    );

  useEffect(() => {
    setOpenSection(
      getInitialOpenSection(recipe),
    );

    setOpenFaqIndex(0);
  }, [recipe.slug]);

  const toggleSection =
    useCallback(
      (
        section: Exclude<
          SectionKey,
          null
        >,
      ) => {
        setOpenSection((current) =>
          current === section
            ? null
            : section,
        );
      },
      [],
    );

  const dataBoxItems = useMemo(
    () =>
      normalizeDataBox(
        recipe.data_box,
      ),
    [recipe.data_box],
  );

  const ingredientSections =
    useMemo(
      () =>
        normalizeIngredients(
          recipe.ingredients,
        ),
      [recipe.ingredients],
    );

  const steps = recipe.steps ?? [];

  const tips =
    recipe.tips &&
    recipe.tips.length > 0
      ? recipe.tips
      : recipe.cooking_tips ?? [];

  const commonMistakes =
    recipe.common_mistakes ?? [];

  const faq = recipe.faq ?? [];

  const nutritionEntries =
    useMemo(
      () =>
        Object.entries(
          recipe.nutrition ?? {},
        ),
      [recipe.nutrition],
    );

  const imageAlt =
    getImageAlt(recipe);

  const mainImageSources =
    useMemo(
      () =>
        getMainImageSources(
          recipe,
        ),
      [recipe],
    );

  const createdAt =
    recipe.created_at
      ? new Date(
          recipe.created_at,
        ).toLocaleDateString("ar-EG", {
          timeZone: "UTC",
        })
      : "";

  const updatedAtRelative =
    getRelativeDateArabic(
      recipe.updated_at,
    );

  const visibleRelatedRecipes =
    useMemo(
      () =>
        relatedRecipes
          .filter(Boolean)
          .slice(0, 8),
      [relatedRecipes],
    );

  const guideSections =
    useMemo<GuideSection[]>(
      () => {
        const sections: GuideSection[] =
          [
            {
              id: "intro",
              title: "المقدمة",
              icon: "📖",
              available: Boolean(
                recipe.intro,
              ),
            },
            {
              id: "description",
              title: "الوصف",
              icon: "🍽️",
              available: Boolean(
                recipe.description,
              ),
            },
            {
              id: "data",
              title: "المعلومات",
              icon: "📊",
              available:
                dataBoxItems.length > 0,
            },
            {
              id: "ingredients",
              title: "المكونات",
              icon: "🧂",
              available:
                ingredientSections.length >
                0,
            },
            {
              id: "steps",
              title: "الخطوات",
              icon: "🍳",
              available:
                steps.length > 0,
            },
            {
              id: "tips",
              title: "النصائح",
              icon: "💡",
              available:
                tips.length > 0,
            },
            {
              id: "mistakes",
              title: "الأخطاء",
              icon: "⚠️",
              available:
                commonMistakes.length >
                0,
            },
            {
              id: "nutrition",
              title:
                "القيمة الغذائية",
              icon: "🍏",
              available:
                nutritionEntries.length >
                0,
            },
            {
              id: "faq",
              title: "الأسئلة",
              icon: "❓",
              available:
                faq.length > 0,
            },
            {
              id: "related",
              title: "وصفات مشابهة",
              icon: "🍽️",
              available:
                visibleRelatedRecipes.length >
                0,
            },
          ];

        return sections.filter(
          (section) =>
            section.available,
        );
      },
      [
        recipe.intro,
        recipe.description,
        dataBoxItems.length,
        ingredientSections.length,
        steps.length,
        tips.length,
        commonMistakes.length,
        nutritionEntries.length,
        faq.length,
        visibleRelatedRecipes.length,
      ],
    );

  const guideIdsKey =
    useMemo(
      () =>
        guideSections
          .map(
            (section) =>
              section.id,
          )
          .join("|"),
      [guideSections],
    );

  useEffect(() => {
    setActiveSection(
      guideSections[0]?.id ??
        null,
    );
  }, [
    recipe.slug,
    guideIdsKey,
    guideSections,
  ]);

  useEffect(() => {
    const sectionIds =
      guideSections.map(
        (section) => section.id,
      );

    if (
      sectionIds.length === 0
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visibleEntry =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting,
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio,
              )[0];

          if (!visibleEntry) {
            return;
          }

          const id =
            visibleEntry.target.id.replace(
              "recipe-section-",
              "",
            ) as GuideSectionId;

          setActiveSection(id);
        },
        {
          root: null,
          rootMargin:
            "-22% 0px -62% 0px",
          threshold: [
            0.08,
            0.2,
            0.45,
            0.7,
          ],
        },
      );

    sectionIds.forEach((id) => {
      const element =
        document.getElementById(
          `recipe-section-${id}`,
        );

      if (element) {
        observer.observe(element);
      }
    });

    return () =>
      observer.disconnect();
  }, [
    guideIdsKey,
    guideSections,
  ]);

  const handleGuideNavigate =
    useCallback(
      (id: GuideSectionId) => {
        if (
          id === "intro" ||
          id === "description" ||
          id === "data" ||
          id === "ingredients"
        ) {
          setOpenSection(id);
        }

        setActiveSection(id);

        window.setTimeout(() => {
          const element =
            document.getElementById(
              `recipe-section-${id}`,
            );

          if (!element) {
            return;
          }

          element.scrollIntoView({
            behavior:
              shouldReduceMotion
                ? "auto"
                : "smooth",
            block: "start",
          });
        }, 40);
      },
      [shouldReduceMotion],
    );

  return (
    <LazyMotion
      features={domAnimation}
    >
      <main
        dir="rtl"
        className="min-h-screen pb-28 pt-20 dark:bg-[#101827] sm:pb-24 sm:pt-24 xl:pb-16"
      >
        <RecipeSectionGuide
          sections={guideSections}
          activeSection={
            activeSection
          }
          onNavigate={
            handleGuideNavigate
          }
          isFooterVisible={
            isFooterVisible
          }
        />

        <RecipeFloatingGuide
          sections={guideSections}
          activeSection={
            activeSection
          }
          onNavigate={
            handleGuideNavigate
          }
          isFooterVisible={
            isFooterVisible
          }
        />

        <div className="mx-auto w-full max-w-[760px] px-3 sm:px-4">
          {/* Header */}

          <header className="mb-3 text-center sm:mb-4">
            <m.h1
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 14,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="mx-auto max-w-[700px] text-balance text-lg font-black leading-8 text-gray-900 dark:text-white sm:text-xl md:text-2xl"
            >
              {recipe.title}
            </m.h1>

            {recipe.country && (
              <m.p
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 8,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.04,
                }}
                className="mt-1.5 text-sm font-black text-orange-500"
              >
                {recipe.country}
              </m.p>
            )}
          </header>

          {/* Main image */}

          <m.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.985,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.38,
            }}
            className="mx-auto mb-3 max-w-[720px] sm:mb-4"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#1d2a3c] shadow-2xl shadow-black/25">
              <SmartRecipeImage
                sources={
                  mainImageSources
                }
                alt={imageAlt}
                priority
                quality={
                  NEXT_IMAGE_QUALITY
                }
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 720px"
                className="object-cover"
              />
            </div>
          </m.div>

          <AdBlock />

          {/* Intro */}

          {recipe.intro && (
            <CollapsibleSection
              sectionId="intro"
              title="مقدمة الوصفة"
              icon="📖"
              isOpen={
                openSection ===
                "intro"
              }
              onToggle={() =>
                toggleSection(
                  "intro",
                )
              }
            >
              <div className="rounded-lg border border-orange-500/25 dark:bg-[#131d2c] bg-white p-3 shadow-inner shadow-black/10">
                <p className="text-[13px] font-bold leading-7 dark:text-slate-100 text-gray-900 sm:text-sm sm:leading-8">
                  {recipe.intro}
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Description */}

          {recipe.description && (
            <CollapsibleSection
              sectionId="description"
              title="وصف الوصفة"
              icon="🍽️"
              isOpen={
                openSection ===
                "description"
              }
              onToggle={() =>
                toggleSection(
                  "description",
                )
              }
            >
              <div className="rounded-lg border border-orange-500/25 dark:bg-[#131d2c] bg-white p-3 shadow-inner shadow-black/10">
                <p className="text-[13px] font-bold leading-7 dark:text-slate-100 text-gray-900 sm:text-sm sm:leading-8">
                  {
                    recipe.description
                  }
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Dates */}

          {(createdAt ||
            updatedAtRelative) && (
            <m.div
              {...fadeUp}
              className="mb-3 flex flex-wrap items-center justify-center gap-2 py-1 text-[11px] font-bold text-slate-200"
            >
              {createdAt && (
                <span className="rounded-full border border-white/[0.07] bg-[#1b2839] px-3 py-1.5">
                  📅 تاريخ النشر:{" "}
                  {createdAt}
                </span>
              )}

              {updatedAtRelative && (
                <span className="rounded-full border border-white/[0.07] bg-[#1b2839] px-3 py-1.5">
                  🔄 تم التحديث: {updatedAtRelative}
                </span>
              )}
            </m.div>
          )}

          <AdBlock />

          {/* Data box */}

          {dataBoxItems.length >
            0 && (
            <CollapsibleSection
              sectionId="data"
              title="معلومات الوصفة"
              icon="📊"
              isOpen={
                openSection ===
                "data"
              }
              onToggle={() =>
                toggleSection("data")
              }
            >

              
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {dataBoxItems.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="rounded-lg border border-white/[0.06] dark:bg-[#121b29] bg-white p-2.5 text-center transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <span className="mb-1 block text-xl">
                        {
                          item.icon
                        }
                      </span>

                      <span className="block text-[10px] font-black dark:text-slate-400 text-gray-900 sm:text-xs">
                        {
                          item.label
                        }
                      </span>

                      <span className="mt-1 block text-xs font-black dark:text-white text-gray-900 sm:text-sm">
                        {
                          item.value
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Ingredients */}

          {ingredientSections.length >
            0 && (
            <CollapsibleSection
              sectionId="ingredients"
              title="المكونات"
              icon="🧂"
              isOpen={
                openSection ===
                "ingredients"
              }
              onToggle={() =>
                toggleSection(
                  "ingredients",
                )
              }
            >
              <div className="space-y-4">
                {ingredientSections.map(
                  (
                    section,
                    sectionIndex,
                  ) => (
                    <div
                      key={`${
                        section.title ||
                        "section"
                      }-${sectionIndex}`}
                    >
                      {section.title && (
                        <h3 className="mb-2 text-sm font-black text-orange-400 sm:text-base">
                          {
                            section.title
                          }
                        </h3>
                      )}

                      <ul className="space-y-1.5">
                        {section.items.map(
                          (
                            item,
                            itemIndex,
                          ) => (
                            <li
                              key={`${item}-${itemIndex}`}
                              className="p-2 hover:dark:bg-orange-500 hover:dark:text-black  hover:bg-orange-500 hover:text-black  rounded-lg border border-white/[0.06]  dark:bg-[#111a28] bg-white   px-3 py-2 text-[12px] font-bold leading-6 dark:text-slate-100 text-gray-900 sm:text-sm"
                            >
                              <span className="ml-1.5 text-orange-500">
                                •
                              </span>

                              {item}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            </CollapsibleSection>
          )}

          <AdBlock />

          {/* Steps */}

          {steps.length > 0 && (
            <m.section
              id="recipe-section-steps"
              {...fadeUp}
              className="mb-7 scroll-mt-24 "
            >
              <SectionTitle icon="🍳">
                خطوات التحضير
              </SectionTitle>

              <ol className="space-y-2  ">
                {steps.map(
                  (
                    step,
                    index,
                  ) => (
                    <li
                      key={`${step}-${index}`}
                      className="relative p-2 hover:dark:bg-orange-500 hover:dark:text-black  hover:bg-orange-500 hover:text-black rounded-xl border dark:border-slate-200 border-gray-900 dark:bg-gray-900  bg-white py-2.5 pl-3 pr-11 text-[12px] font-bold leading-6  shadow-sm  dark:text-white text-gray-900 sm:text-sm sm:leading-7"
                    >
                      <span className="absolute right-2 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-orange-500 text-sm font-black text-white">
                        {index + 1}
                      </span>

                      {cleanStepNumber(step)}
                    </li>
                  ),
                )}
              </ol>
            </m.section>
          )}

          {/* Tips */}

          {tips.length > 0 && (
            <m.section
              id="recipe-section-tips"
              {...fadeUp}
              className="mb-7 scroll-mt-24"
            >
              <SectionTitle icon="💡">
                نصائح
              </SectionTitle>

              <ul className="space-y-2 ">
                {tips.map(
                  (
                    tip,
                    index,
                  ) => (
                    <li
                      key={`${tip}-${index}`}
                      className="relative p-2 hover:dark:bg-orange-500 hover:dark:text-black  hover:bg-orange-500 hover:text-black rounded-xl border dark:border-slate-200 border-gray-900  dark:bg-gray-900 py-2.5 pl-3 pr-11 text-[12px] font-bold leading-6 dark:text-white shadow-sm bg-white text-gray-900 sm:text-sm sm:leading-7"
                    >
                      <span className="absolute right-2 top-2.5 grid h-7 w-7 place-items-center rounded-full text-lg font-black  dark:text-white text-gray-900 ">
                        ✓
                      </span>

                      {tip}
                    </li>
                  ),
                )}
              </ul>
            </m.section>
          )}

          {/* Common mistakes */}

          {commonMistakes.length >
            0 && (
            <m.section
              id="recipe-section-mistakes"
              {...fadeUp}
              className="mb-7 scroll-mt-24"
            >
              <SectionTitle icon="⚠️">
                الأخطاء الشائعة
              </SectionTitle>

              <ul className="space-y-2">
                {commonMistakes.map(
                  (
                    mistake,
                    index,
                  ) => (
                    <li
                      key={`${mistake}-${index}`}
                      className="relative p-2 hover:dark:bg-orange-500 hover:dark:text-black  hover:bg-orange-500 hover:text-black rounded-xl border dark:border-slate-200 border-gray-900 dark:bg-gray-900 py-2.5 pl-3 pr-11 text-[12px] font-bold leading-6 dark:text-white shadow-sm bg-white text-gray-900 sm:text-sm sm:leading-7 "
                    >
                      <span className="absolute right-2 top-2.5 grid h-7 w-7 place-items-center rounded-full text-lg font-black ">
                        ❌
                      </span>

                      {mistake}
                    </li>
                  ),
                )}
              </ul>
            </m.section>
          )}

          {/* Nutrition */}

          {nutritionEntries.length >
            0 && (
            <m.section
              id="recipe-section-nutrition"
              {...fadeUp}
              className="mb-7 scroll-mt-24"
            >
              <SectionTitle icon="🍏">
                القيمة الغذائية
              </SectionTitle>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {nutritionEntries.map(
                  (
                    [key, value],
                    index,
                  ) => (
                    <div
                      key={`${key}-${index}`}
                      className="rounded-xl border  dark:border-slate-200 border-slate-900  px-3 py-3 text-center  dark:bg-gray-900 text-gray-900  dark:text-white bg-white "
                    >
                      <span className="block text-[11px] font-black text-orange-500 sm:text-sm">
                        {key}
                      </span>

                      <span className="mt-1 block text-sm font-black  dark:text-white text-gray-900 ">
                        {String(value)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </m.section>
          )}

          {/* FAQ */}

          {faq.length > 0 && (
            <m.section
              id="recipe-section-faq"
              {...fadeUp}
              className="mb-7 scroll-mt-24"
            >
              <SectionTitle icon="❓">
                أسئلة شائعة
              </SectionTitle>

              <div className="space-y-2">
                {faq.map(
                  (
                    item,
                    index,
                  ) => {
                    const isOpen =
                      openFaqIndex ===
                      index;

                    return (
                      <div
                        key={`${item.question}-${index}`}
                        className="overflow-hidden rounded-xl border dark:border-slate-200 border-slate-900 shadow-sm dark:bg-gray-900  bg-white"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenFaqIndex(
                              isOpen
                                ? null
                                : index,
                            )
                          }
                          aria-expanded={
                            isOpen
                          }
                          className="flex w-full items-center justify-between gap-3 dark:bg-gray-900  bg-white px-3 py-2.5 text-right transition "
                        >
                          <span className="text-[12px] font-black leading-6 dark:text-white text-gray-900 sm:text-base">
                            {
                              item.question
                            }
                          </span>

                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full dark:bg-gray-100 dark:text-gray-900  bg-gray-900 text-gray-100">
                            {isOpen ? (
                              <ChevronUp
                                size={
                                  14
                                }
                              />
                            ) : (
                              <ChevronDown
                                size={
                                  14
                                }
                              />
                            )}
                          </span>
                        </button>

                        <AnimatePresence
                          initial={
                            false
                          }
                        >
                          {isOpen && (
                            <m.div
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      height: 0,
                                      opacity: 0,
                                    }
                              }
                              animate={{
                                height:
                                  "auto",
                                opacity: 1,
                              }}
                              exit={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      height: 0,
                                      opacity: 0,
                                    }
                              }
                              transition={{
                                duration:
                                  0.2,
                              }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-700 px-3 pb-3 pt-2 text-[12px] font-bold leading-6 dark:text-white text-gray-900 dark:border-slate-200   p-2 rounded-lg  hover:bg-orange-500 hover:text-black   sm:text-sm sm:leading-7">
                                {
                                  item.answer
                                }
                              </div>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  },
                )}
              </div>
            </m.section>
          )}

          {/* Related recipes */}

          {visibleRelatedRecipes.length >
            0 && (
            <m.section
              id="recipe-section-related"
              {...fadeUp}
              className="mb-8 scroll-mt-24"
            >
              <SectionTitle icon="🍽️">
                وصفات مشابهة
              </SectionTitle>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {visibleRelatedRecipes.map(
                  (
                    relatedRecipe,
                    index,
                  ) => (
                    <RelatedRecipeCard
                      key={
                        relatedRecipe.slug
                          ? `${relatedRecipe.slug}-${index}`
                          : `related-recipe-${index}`
                      }
                      recipe={
                        relatedRecipe
                      }
                      index={index}
                    />
                  ),
                )}
              </div>
            </m.section>
          )}
        </div>

        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #f97316
              transparent;
            overscroll-behavior: contain;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: #f97316;
          }

          .recipe-guide-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #f97316
              transparent;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }

          .recipe-guide-scrollbar::-webkit-scrollbar {
            width: 5px;
          }

          .recipe-guide-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .recipe-guide-scrollbar::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: #f97316;
          }

          @supports (
            height: 100dvh
          ) {
            .recipe-guide-scrollbar {
              max-height: 55dvh;
            }
          }

          @media (max-width: 360px) {
            .recipe-guide-scrollbar {
              grid-template-columns: minmax(
                0,
                1fr
              );
              max-height: 50vh;
            }
          }

          @media (max-width: 640px) {
            html {
              scroll-behavior: auto;
            }
          }
        `}</style>
      </main>
    </LazyMotion>
  );
}