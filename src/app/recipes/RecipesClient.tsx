"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  ListFilter,
  MapPin,
  Megaphone,
  RotateCcw,
  Tags,
  UtensilsCrossed,
  X,
} from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { adsEnabled } from "@/lib/ads";

const AdSenseBanner = dynamic(
  () => import("@/app/Components/AdSenseBanner"),
  {
    ssr: false,
  },
);

const MOBILE_AD_INTERVAL = 4;
const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_COUNT = 6;

/* =============================== */
/* Types                           */
/* =============================== */

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;

  img: {
    url: string;
    "url-card"?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

type CountryItem = {
  country: string;
  count: number;
};

type TagItem = {
  tag: string;
  count: number;
};

type FooterDockState = {
  isFooterVisible: boolean;
  footerOffset: number;
};

interface RecipesClientProps {
  recipes: Recipe[];
  categories: string[];
  initialCategory?: string | null;
}

interface CategoryNavigationProps {
  categories: string[];
  countriesMap: Record<string, CountryItem[]>;
  availableTags: TagItem[];

  activeCategory: string | null;
  activeCountry: string | null;
  activeTag: string | null;

  expandedCategories: Record<string, boolean>;

  onToggleCategory: (category: string) => void;
  onSelectAll: () => void;

  onSelectCountry: (
    category: string,
    country: string | null,
  ) => void;

  onSelectTag: (tag: string) => void;
  onAfterSelect?: () => void;
}

/* =============================== */
/* Helpers                         */
/* =============================== */

function formatCategoryName(category: string): string {
  return category.replace(/-/g, " ").trim();
}

function isValidImageUrl(
  url: string | undefined | null,
): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return false;
  }

  try {
    new URL(cleanUrl);
    return true;
  } catch {
    return cleanUrl.startsWith("/");
  }
}

function getCardImageUrl(
  recipe: Recipe,
): string | undefined {
  return recipe.img?.["url-card"] || recipe.img?.url;
}

function hasCategory(
  recipe: Recipe,
  category: string,
): boolean {
  if (!recipe.category) {
    return false;
  }

  return Array.isArray(recipe.category)
    ? recipe.category.includes(category)
    : recipe.category === category;
}

function hasTag(
  recipe: Recipe,
  tag: string,
): boolean {
  if (!recipe.tags) {
    return false;
  }

  return Array.isArray(recipe.tags)
    ? recipe.tags.includes(tag)
    : recipe.tags === tag;
}

function getCountriesMap(
  recipes: Recipe[],
  categories: string[],
): Record<string, CountryItem[]> {
  const map: Record<string, CountryItem[]> = {};

  categories.forEach((category) => {
    const countryCounts: Record<string, number> = {};

    recipes
      .filter((recipe) =>
        hasCategory(recipe, category),
      )
      .forEach((recipe) => {
        if (!recipe.country) {
          return;
        }

        countryCounts[recipe.country] =
          (countryCounts[recipe.country] || 0) + 1;
      });

    map[category] = Object.entries(countryCounts)
      .map(([country, count]) => ({
        country,
        count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.country.localeCompare(
          b.country,
          "ar",
        );
      });
  });

  return map;
}

function getAvailableTags(
  recipes: Recipe[],
  activeCategory: string | null,
  activeCountry: string | null,
): TagItem[] {
  let filteredRecipes = recipes;

  if (activeCategory) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        hasCategory(recipe, activeCategory),
    );
  }

  if (activeCountry) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        recipe.country === activeCountry,
    );
  }

  const tagCounts: Record<string, number> = {};

  filteredRecipes.forEach((recipe) => {
    if (!recipe.tags) {
      return;
    }

    const recipeTags = Array.isArray(recipe.tags)
      ? recipe.tags
      : [recipe.tags];

    recipeTags.forEach((tag) => {
      if (!tag) {
        return;
      }

      tagCounts[tag] =
        (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({
      tag,
      count,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.tag.localeCompare(b.tag, "ar");
    })
    .slice(0, 16);
}

/* =============================== */
/* Footer dock hook                */
/* =============================== */

function useFooterDock(): FooterDockState {
  const [footerState, setFooterState] =
    useState<FooterDockState>({
      isFooterVisible: false,
      footerOffset: 0,
    });

  useEffect(() => {
    const footer =
      document.getElementById("site-footer") ||
      document.querySelector("footer");

    if (!footer) {
      return;
    }

    let animationFrameId = 0;

    const updateFooterPosition = () => {
      window.cancelAnimationFrame(animationFrameId);

      animationFrameId =
        window.requestAnimationFrame(() => {
          const footerRect =
            footer.getBoundingClientRect();

          const footerIsInsideViewport =
            footerRect.top < window.innerHeight &&
            footerRect.bottom > 0;

          const overlap = footerIsInsideViewport
            ? Math.max(
                0,
                window.innerHeight -
                  footerRect.top,
              )
            : 0;

          setFooterState({
            isFooterVisible:
              footerIsInsideViewport,
            footerOffset:
              overlap > 0 ? overlap + 12 : 0,
          });
        });
    };

    updateFooterPosition();

    window.addEventListener(
      "scroll",
      updateFooterPosition,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      updateFooterPosition,
    );

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(
            updateFooterPosition,
          )
        : null;

    resizeObserver?.observe(footer);

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      window.removeEventListener(
        "scroll",
        updateFooterPosition,
      );

      window.removeEventListener(
        "resize",
        updateFooterPosition,
      );

      resizeObserver?.disconnect();
    };
  }, []);

  return footerState;
}

/* =============================== */
/* Recipe skeleton                 */
/* =============================== */

function RecipeSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#121c2b] shadow-lg shadow-black/10">
      <div className="aspect-[4/3] animate-pulse bg-[#253246]" />

      <div className="space-y-3 p-4">
        <div className="mx-auto h-5 w-4/5 animate-pulse rounded-full bg-[#2a384d]" />

        <div className="mx-auto h-4 w-2/5 animate-pulse rounded-full bg-[#223044]" />

        <div className="mx-auto h-9 w-full animate-pulse rounded-xl bg-[#1c293b]" />
      </div>
    </div>
  );
}

/* =============================== */
/* Category navigation             */
/* =============================== */

function CategoryNavigation({
  categories,
  countriesMap,
  availableTags,
  activeCategory,
  activeCountry,
  activeTag,
  expandedCategories,
  onToggleCategory,
  onSelectAll,
  onSelectCountry,
  onSelectTag,
  onAfterSelect,
}: CategoryNavigationProps) {
  const handleSelectAll = () => {
    onSelectAll();
    onAfterSelect?.();
  };

  const handleSelectCountry = (
    category: string,
    country: string | null,
  ) => {
    onSelectCountry(category, country);
    onAfterSelect?.();
  };

  const handleSelectTag = (tag: string) => {
    onSelectTag(tag);
    onAfterSelect?.();
  };

  return (
    <nav
      aria-label="تصنيفات الوصفات"
      className="space-y-2.5"
    >
      <button
        type="button"
        onClick={handleSelectAll}
        aria-current={
          !activeCategory &&
          !activeCountry &&
          !activeTag
            ? "page"
            : undefined
        }
        className={clsx(
          "flex w-full items-center gap-2.5 rounded-2xl border px-3 py-3 text-right text-xs font-black transition-all duration-200",
          !activeCategory &&
            !activeCountry &&
            !activeTag
            ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
            : "border-white/[0.06] bg-[#1d2a3c] text-slate-100 hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-[#26364b]",
        )}
      >
        <span
          className={clsx(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full",
            !activeCategory &&
              !activeCountry &&
              !activeTag
              ? "bg-white/20"
              : "bg-[#101827]",
          )}
        >
          <UtensilsCrossed size={15} />
        </span>

        <span className="min-w-0 flex-1">
          كل الوصفات
        </span>
      </button>

      {categories.map((category) => {
        const isExpanded = Boolean(
          expandedCategories[category],
        );

        const isActive =
          activeCategory === category;

        return (
          <div
            key={category}
            className={clsx(
              "overflow-hidden rounded-2xl border transition-all duration-200",
              isActive
                ? "border-orange-500/50 bg-[#172335] shadow-lg shadow-orange-500/5"
                : "border-white/[0.06] bg-[#172335]",
            )}
          >
            <button
              type="button"
              onClick={() =>
                onToggleCategory(category)
              }
              aria-expanded={isExpanded}
              aria-current={
                isActive ? "page" : undefined
              }
              className={clsx(
                "flex w-full items-center gap-2.5 px-3 py-3 text-right text-xs font-black transition-all",
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-slate-100 hover:bg-[#233247]",
              )}
            >
              <span
                className={clsx(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  isActive
                    ? "bg-white/20"
                    : "bg-[#101827]",
                )}
              >
                <Filter size={14} />
              </span>

              <span className="min-w-0 flex-1 leading-5">
                {formatCategoryName(category)}
              </span>

              <span
                className={clsx(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                  isActive
                    ? "bg-white/15"
                    : "bg-[#101827]",
                )}
              >
                {isExpanded ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-white/[0.06] p-2.5">
                <div className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-black text-slate-400">
                  <MapPin size={12} />

                  <span>الدول المتاحة</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectCountry(
                        category,
                        null,
                      )
                    }
                    className={clsx(
                      "flex w-full items-center rounded-xl px-3 py-2.5 text-right text-[11px] font-black transition",
                      isActive && !activeCountry
                        ? "bg-orange-500/15 text-orange-400"
                        : "bg-[#111a28] text-slate-300 hover:bg-[#223148] hover:text-white",
                    )}
                  >
                    كل الدول
                  </button>

                  {countriesMap[category]?.map(
                    ({ country }) => (
                      <button
                        key={`${category}-${country}`}
                        type="button"
                        onClick={() =>
                          handleSelectCountry(
                            category,
                            country,
                          )
                        }
                        className={clsx(
                          "flex w-full items-center rounded-xl px-3 py-2.5 text-right text-[11px] font-black transition",
                          isActive &&
                            activeCountry === country
                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/15"
                            : "bg-[#111a28] text-slate-300 hover:bg-[#223148] hover:text-white",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {country}
                        </span>
                      </button>
                    ),
                  )}
                </div>

                {isActive &&
                  availableTags.length > 0 && (
                    <div className="mt-4 border-t border-white/[0.05] pt-3">
                      <div className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-black text-slate-400">
                        <Tags size={12} />

                        <span>وسوم مرتبطة</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {availableTags.map(
                          ({ tag }) => (
                            <button
                              key={`${category}-${tag}`}
                              type="button"
                              onClick={() =>
                                handleSelectTag(tag)
                              }
                              className={clsx(
                                "inline-flex min-w-0 items-center rounded-full border px-2.5 py-1.5 text-[9px] font-black transition",
                                activeTag === tag
                                  ? "border-orange-500 bg-orange-500 text-white"
                                  : "border-white/[0.07] bg-[#111a28] text-slate-300 hover:border-orange-500/40 hover:text-orange-400",
                              )}
                            >
                              <span className="max-w-[145px] truncate">
                                {tag}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* =============================== */
/* Desktop categories aside        */
/* =============================== */

function DesktopCategoriesAside({
  isOpen,
  onToggle,
  isFooterVisible,
  footerOffset,
  hasActiveFilters,
  onShowAllRecipes,
  children,
}: {
  isOpen: boolean;
  onToggle: () => void;
  isFooterVisible: boolean;
  footerOffset: number;
  hasActiveFilters: boolean;
  onShowAllRecipes: () => void;
  children: ReactNode;
}) {
  /*
   * عند ظهور الفوتر لا نُخفي التنقل بالكامل.
   * يتحول إلى زر صغير فوق الفوتر.
   */
  if (isFooterVisible) {
    return (
      <div
        className="fixed left-3 z-50 hidden transition-all duration-300 xl:block"
        style={{
          bottom: `${Math.max(
            footerOffset,
            16,
          )}px`,
        }}
      >
        <button
          type="button"
          onClick={
            hasActiveFilters
              ? onShowAllRecipes
              : onToggle
          }
          className="flex h-12 items-center gap-2 rounded-full border border-white/10 bg-orange-500 px-4 text-white shadow-2xl shadow-black/40 transition hover:-translate-y-0.5 hover:bg-orange-600 active:scale-95"
          aria-label={
            hasActiveFilters
              ? "عرض كل الوصفات"
              : "فتح دليل التصنيفات"
          }
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
            {hasActiveFilters ? (
              <RotateCcw size={16} />
            ) : (
              <ListFilter size={16} />
            )}
          </span>

          <span className="text-xs font-black">
            {hasActiveFilters
              ? "عرض كل الوصفات"
              : "دليل التصنيفات"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="قائمة تصنيفات الوصفات"
      className={clsx(
        "fixed bottom-5 left-0 top-28 z-40 hidden transition-all duration-300 ease-out xl:block",
        isOpen ? "w-[260px]" : "w-[58px]",
      )}
    >
      <div className="flex h-full max-h-[calc(100dvh-8.25rem)] flex-col overflow-hidden rounded-r-3xl border border-l-0 border-white/10 bg-[#162235]/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
        {isOpen ? (
          <>
            <div className="flex shrink-0 items-center justify-between gap-2 bg-orange-500 px-3 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <ListFilter
                  size={17}
                  className="shrink-0"
                />

                <span className="truncate text-sm font-black">
                  دليل التصنيفات
                </span>
              </div>

              <button
                type="button"
                onClick={onToggle}
                aria-label="إغلاق التصنيفات"
                title="إغلاق التصنيفات"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
              >
                <ChevronLeft size={17} />
              </button>
            </div>

            <div className="category-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5">
              {children}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-label="فتح التصنيفات"
            title="فتح التصنيفات"
            className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#162235] px-2 text-white transition hover:bg-[#1d2b3f]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 shadow-lg shadow-orange-500/20">
              <ChevronRight size={18} />
            </span>

            <ListFilter
              size={20}
              className="text-orange-400"
            />

            <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-black tracking-wide text-slate-200">
              التصنيفات
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}

/* =============================== */
/* Desktop advertisement aside     */
/* =============================== */

function DesktopAdvertisementAside({
  isFooterVisible,
}: {
  isFooterVisible: boolean;
}) {
  if (!adsEnabled) {
    return null;
  }

  return (
    <aside
      aria-label="الإعلان"
      className={clsx(
        "fixed bottom-5 right-0 top-28 z-40 hidden w-[300px] transition-all duration-300 ease-out xl:block",
        isFooterVisible
          ? "pointer-events-none translate-x-full opacity-0"
          : "translate-x-0 opacity-100",
      )}
    >
      <div className="flex h-full max-h-[calc(100dvh-8.25rem)] min-w-[300px] flex-col overflow-hidden rounded-l-3xl border border-r-0 border-white/10 bg-[#162235]/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex shrink-0 items-center justify-center gap-2 bg-orange-500 px-4 py-3 text-white">
          <Megaphone size={17} />

          <span className="text-sm font-black">
            مساحة إعلانية
          </span>
        </div>

        <div className="advertisement-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-3 rounded-2xl border border-white/[0.05] bg-[#1b293b] px-3 py-2 text-center text-[9px] font-black text-slate-500">
            إعلان
          </div>

          <div className="mx-auto w-full min-w-[250px] overflow-hidden rounded-2xl border border-white/[0.05] bg-[#111a28]">
            <div className="w-full min-w-[250px]">
              <AdSenseBanner adSlot="2901613977" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =============================== */
/* Mobile categories guide         */
/* =============================== */

function MobileCategoriesGuide({
  isOpen,
  onToggle,
  onClose,
  isFooterVisible,
  footerOffset,
  activeCategory,
  activeCountry,
  activeTag,
  onShowAllRecipes,
  children,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isFooterVisible: boolean;
  footerOffset: number;
  activeCategory: string | null;
  activeCountry: string | null;
  activeTag: string | null;
  onShowAllRecipes: () => void;
  children: ReactNode;
}) {
  const hasActiveFilters = Boolean(
    activeCategory ||
      activeCountry ||
      activeTag,
  );

  const activeLabel =
    activeTag ||
    activeCountry ||
    (activeCategory
      ? formatCategoryName(activeCategory)
      : "كل الوصفات");

  useEffect(() => {
    if (isFooterVisible) {
      onClose();
    }
  }, [isFooterVisible, onClose]);

  /*
   * عند ظهور الفوتر يظهر زر الرجوع
   * إلى كل الوصفات فوق الفوتر.
   */
  if (isFooterVisible) {
    return (
      <div
        className="fixed left-3 z-50 xl:hidden"
        style={{
          bottom: `${Math.max(
            footerOffset,
            12,
          )}px`,
        }}
      >
        <button
          type="button"
          onClick={
            hasActiveFilters
              ? onShowAllRecipes
              : onToggle
          }
          className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-orange-500 px-3 text-white shadow-2xl shadow-black/40 transition active:scale-95"
          aria-label={
            hasActiveFilters
              ? "عرض كل الوصفات"
              : "فتح التصنيفات"
          }
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
            {hasActiveFilters ? (
              <RotateCcw size={15} />
            ) : (
              <ListFilter size={15} />
            )}
          </span>

          <span className="text-[11px] font-black">
            {hasActiveFilters
              ? "عرض كل الوصفات"
              : "التصنيفات"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed left-3 z-50 flex w-[calc(100vw-5.75rem)] max-w-[330px] flex-col items-start gap-2 transition-all duration-300 xl:hidden"
      style={{
        bottom:
          "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      {isOpen && (
        <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-[#162235]/98 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 bg-orange-500 px-3 py-2.5 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
                <ListFilter size={16} />
              </span>

              <div className="min-w-0">
                <span className="block text-xs font-black">
                  دليل التصنيفات
                </span>

                <span className="block max-w-[200px] truncate text-[9px] font-bold text-white/80">
                  الاختيار الحالي: {activeLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق قائمة التصنيفات"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
            >
              <X size={16} />
            </button>
          </div>

          <div className="category-scrollbar max-h-[65dvh] overflow-y-auto p-2.5">
            {children}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? "إغلاق قائمة التصنيفات"
            : "فتح قائمة التصنيفات"
        }
        className={clsx(
          "flex h-12 max-w-[205px] items-center gap-2 rounded-full border border-white/10 px-3 text-white shadow-xl shadow-black/30 transition hover:-translate-y-0.5 active:scale-95",
          isOpen
            ? "bg-[#162235] hover:bg-[#1f2d40]"
            : "bg-orange-500 hover:bg-orange-600",
        )}
      >
        <span
          className={clsx(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full",
            isOpen
              ? "bg-orange-500"
              : "bg-white/15",
          )}
        >
          {isOpen ? (
            <X size={16} />
          ) : (
            <ListFilter size={17} />
          )}
        </span>

        <span className="min-w-0 text-right">
          <span className="block truncate text-[11px] font-black">
            تصنيفات الوصفات
          </span>

          {!isOpen && (
            <span className="block max-w-[135px] truncate text-[9px] font-bold text-white/80">
              {activeLabel}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

/* =============================== */
/* Recipe card                     */
/* =============================== */

function RecipeCard({
  recipe,
  index,
  hasImageError,
  onImageError,
}: {
  recipe: Recipe;
  index: number;
  hasImageError: boolean;
  onImageError: (id: number) => void;
}) {
  const cardImageUrl = getCardImageUrl(recipe);

  const categoryLabel = Array.isArray(
    recipe.category,
  )
    ? recipe.category[0]
    : recipe.category;

  return (
    <article className="group h-full">
      <Link
        href={`/recipe/${recipe.slug}`}
        prefetch={false}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#121c2b] shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-black/25"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#243247]">
          {isValidImageUrl(cardImageUrl) &&
          !hasImageError ? (
            <Image
              src={cardImageUrl!}
              alt={
                recipe.img?.alt ||
                recipe.title ||
                "صورة الوصفة"
              }
              fill
              sizes="(max-width: 640px) 94vw, (max-width: 1024px) 46vw, (max-width: 1536px) 31vw, 360px"
              quality={70}
              priority={index < 4}
              loading={
                index < 4 ? "eager" : "lazy"
              }
              decoding="async"
              draggable={false}
              unoptimized={cardImageUrl!.startsWith(
                "http",
              )}
              onError={() =>
                onImageError(recipe.id)
              }
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#25344a] via-[#172235] to-[#271f1a] text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/[0.06] text-slate-400">
                <UtensilsCrossed size={32} />
              </span>

              <span className="mt-3 px-4 text-xs font-black text-slate-400">
                صورة الوصفة غير متاحة
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0e1725] via-[#0e1725]/60 to-transparent" />

          {recipe.country && (
            <span className="absolute bottom-3 right-3 max-w-[80%] truncate rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md">
              {recipe.country}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {categoryLabel && (
            <span className="mb-2 block truncate text-[10px] font-black text-orange-400">
              {formatCategoryName(categoryLabel)}
            </span>
          )}

          <h2 className="line-clamp-2 min-h-[56px] text-center text-sm font-black leading-7 text-white transition-colors group-hover:text-orange-400 sm:text-base">
            {recipe.title}
          </h2>

          <div className="mt-auto pt-4">
            <span className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#1b293b] px-3 py-2.5 text-[11px] font-black text-slate-200 transition group-hover:border-orange-500/30 group-hover:bg-orange-500 group-hover:text-white">
              <UtensilsCrossed size={14} />

              مشاهدة الوصفة
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =============================== */
/* Main component                  */
/* =============================== */

export default function RecipesClient({
  recipes,
  categories,
  initialCategory = null,
}: RecipesClientProps) {
  const normalizedInitialCategory =
    initialCategory &&
    categories.includes(initialCategory)
      ? initialCategory
      : null;

  const [activeCategory, setActiveCategory] =
    useState<string | null>(
      normalizedInitialCategory,
    );

  const [activeCountry, setActiveCountry] =
    useState<string | null>(null);

  const [activeTag, setActiveTag] = useState<
    string | null
  >(null);

  const [visibleCount, setVisibleCount] =
    useState(INITIAL_VISIBLE_COUNT);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  const [sidebarMobileOpen, setSidebarMobileOpen] =
    useState(false);

  const [
    desktopCategoriesOpen,
    setDesktopCategoriesOpen,
  ] = useState(true);

  const [expandedCategories, setExpandedCategories] =
    useState<Record<string, boolean>>(() =>
      normalizedInitialCategory
        ? {
            [normalizedInitialCategory]: true,
          }
        : {},
    );

  const [
    expandedCategoriesMobile,
    setExpandedCategoriesMobile,
  ] = useState<Record<string, boolean>>(() =>
    normalizedInitialCategory
      ? {
          [normalizedInitialCategory]: true,
        }
      : {},
  );

  const loadingMoreRef = useRef(false);

  const loadMoreSentinelRef =
    useRef<HTMLDivElement>(null);

  const {
    isFooterVisible,
    footerOffset,
  } = useFooterDock();

  const hasActiveFilters = Boolean(
    activeCategory ||
      activeCountry ||
      activeTag,
  );

  useEffect(() => {
    if (
      initialCategory &&
      categories.includes(initialCategory)
    ) {
      setActiveCategory(initialCategory);

      setExpandedCategories({
        [initialCategory]: true,
      });

      setExpandedCategoriesMobile({
        [initialCategory]: true,
      });
    }
  }, [initialCategory, categories]);

  const countriesMap = useMemo(
    () => getCountriesMap(recipes, categories),
    [recipes, categories],
  );

  const availableTags = useMemo(
    () =>
      getAvailableTags(
        recipes,
        activeCategory,
        activeCountry,
      ),
    [recipes, activeCategory, activeCountry],
  );

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    if (activeCategory) {
      result = result.filter((recipe) =>
        hasCategory(recipe, activeCategory),
      );
    }

    if (activeCountry) {
      result = result.filter(
        (recipe) =>
          recipe.country === activeCountry,
      );
    }

    if (activeTag) {
      result = result.filter((recipe) =>
        hasTag(recipe, activeTag),
      );
    }

    return result.sort((a, b) => b.id - a.id);
  }, [
    recipes,
    activeCategory,
    activeCountry,
    activeTag,
  ]);

  const visibleRecipes = useMemo(
    () => filteredRecipes.slice(0, visibleCount),
    [filteredRecipes, visibleCount],
  );

  const hasMoreRecipes =
    visibleCount < filteredRecipes.length;

  const desktopGridColumns = useMemo(() => {
    if (!adsEnabled) {
      return "xl:grid-cols-4";
    }

    if (desktopCategoriesOpen) {
      return "xl:grid-cols-2";
    }

    return "xl:grid-cols-3";
  }, [desktopCategoriesOpen]);

  useEffect(() => {
    setIsLoading(true);
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    activeCategory,
    activeCountry,
    activeTag,
  ]);

  const loadMore = useCallback(() => {
    if (
      loadingMoreRef.current ||
      loadingMore ||
      !hasMoreRecipes
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    window.setTimeout(() => {
      setVisibleCount((currentCount) =>
        Math.min(
          currentCount + LOAD_MORE_COUNT,
          filteredRecipes.length,
        ),
      );

      setLoadingMore(false);
      loadingMoreRef.current = false;
    }, 350);
  }, [
    loadingMore,
    hasMoreRecipes,
    filteredRecipes.length,
  ]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;

    if (
      !sentinel ||
      !hasMoreRecipes ||
      isLoading
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "500px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreRecipes, isLoading, loadMore]);

  const toggleCategory = useCallback(
    (
      category: string,
      mobile = false,
    ) => {
      const setExpanded = mobile
        ? setExpandedCategoriesMobile
        : setExpandedCategories;

      setExpanded((currentState) => {
        const isCurrentlyOpen = Boolean(
          currentState[category],
        );

        return {
          [category]: !isCurrentlyOpen,
        };
      });

      setActiveCategory(category);
      setActiveCountry(null);
      setActiveTag(null);
    },
    [],
  );

  const selectCountry = useCallback(
    (
      category: string,
      country: string | null,
    ) => {
      setActiveCategory(category);
      setActiveCountry(country);
      setActiveTag(null);
    },
    [],
  );

  const selectTag = useCallback(
    (tag: string) => {
      setActiveTag((currentTag) =>
        currentTag === tag ? null : tag,
      );
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    setActiveCategory(null);
    setActiveCountry(null);
    setActiveTag(null);
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    setExpandedCategories({});
    setExpandedCategoriesMobile({});

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 40);
  }, []);

  const handleImageError = useCallback(
    (id: number) => {
      setImageErrors((currentErrors) => ({
        ...currentErrors,
        [String(id)]: true,
      }));
    },
    [],
  );

  const handleMobileGuideClose =
    useCallback(() => {
      setSidebarMobileOpen(false);
    }, []);

  const desktopNavigation = (
    <CategoryNavigation
      categories={categories}
      countriesMap={countriesMap}
      availableTags={availableTags}
      activeCategory={activeCategory}
      activeCountry={activeCountry}
      activeTag={activeTag}
      expandedCategories={expandedCategories}
      onToggleCategory={(category) =>
        toggleCategory(category, false)
      }
      onSelectAll={clearAllFilters}
      onSelectCountry={selectCountry}
      onSelectTag={selectTag}
    />
  );

  const mobileNavigation = (
    <CategoryNavigation
      categories={categories}
      countriesMap={countriesMap}
      availableTags={availableTags}
      activeCategory={activeCategory}
      activeCountry={activeCountry}
      activeTag={activeTag}
      expandedCategories={
        expandedCategoriesMobile
      }
      onToggleCategory={(category) =>
        toggleCategory(category, true)
      }
      onSelectAll={clearAllFilters}
      onSelectCountry={selectCountry}
      onSelectTag={selectTag}
      onAfterSelect={handleMobileGuideClose}
    />
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-32 pt-24 text-white dark:bg-[#0b1220] sm:pb-28 sm:pt-28 xl:pb-20"
    >
      <DesktopCategoriesAside
        isOpen={desktopCategoriesOpen}
        onToggle={() =>
          setDesktopCategoriesOpen(
            (current) => !current,
          )
        }
        isFooterVisible={isFooterVisible}
        footerOffset={footerOffset}
        hasActiveFilters={hasActiveFilters}
        onShowAllRecipes={clearAllFilters}
      >
        {desktopNavigation}
      </DesktopCategoriesAside>

      <DesktopAdvertisementAside
        isFooterVisible={isFooterVisible}
      />

      <MobileCategoriesGuide
        isOpen={sidebarMobileOpen}
        onToggle={() =>
          setSidebarMobileOpen(
            (currentState) => !currentState,
          )
        }
        onClose={handleMobileGuideClose}
        isFooterVisible={isFooterVisible}
        footerOffset={footerOffset}
        activeCategory={activeCategory}
        activeCountry={activeCountry}
        activeTag={activeTag}
        onShowAllRecipes={clearAllFilters}
      >
        {mobileNavigation}
      </MobileCategoriesGuide>

      <div
        className={clsx(
          "mx-auto w-full max-w-[1920px] px-3 transition-[padding] duration-300 sm:px-5",
          desktopCategoriesOpen
            ? "xl:pl-[280px]"
            : "xl:pl-[78px]",
          adsEnabled
            ? "xl:pr-[320px]"
            : "xl:pr-5",
        )}
      >
        {/* Hero */}

        <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#172438] via-[#111c2d] to-[#0e1725] px-4 py-7 text-center shadow-2xl shadow-black/20 sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 sm:h-16 sm:w-16">
              <UtensilsCrossed size={28} />
            </span>

            <h1 className="mx-auto max-w-[1000px] text-balance text-xl font-black leading-9 text-white sm:text-2xl sm:leading-10 lg:text-3xl lg:leading-[1.6]">
              استمتع بألذ الوصفات العربية والعالمية
              الأصيلة
            </h1>

            <p className="mx-auto mt-3 max-w-[900px] text-sm font-bold leading-7 text-slate-300 sm:text-base sm:leading-8">
              وصفات شهية وسهلة التحضير لكل المناسبات
              اليومية والعائلية، مع خطوات واضحة ونصائح
              احترافية وأفكار مبتكرة من مطابخ العالم.
            </p>
          </div>
        </section>

        <main className="min-w-0">
          {/* Recipes grid */}

          <div
            className={clsx(
              "grid grid-cols-1 gap-4 transition-all duration-300 sm:grid-cols-2 sm:gap-5",
              desktopGridColumns,
            )}
          >
            {isLoading
              ? Array.from({
                  length: 8,
                }).map((_, index) => (
                  <RecipeSkeleton
                    key={`recipe-skeleton-${index}`}
                  />
                ))
              : visibleRecipes.map(
                  (recipe, index) => (
                    <div
                      key={
                        recipe.slug
                          ? `recipe-${recipe.slug}`
                          : `recipe-${recipe.id}`
                      }
                    >
                      <RecipeCard
                        recipe={recipe}
                        index={index}
                        hasImageError={Boolean(
                          imageErrors[
                            String(recipe.id)
                          ],
                        )}
                        onImageError={
                          handleImageError
                        }
                      />

                      {adsEnabled &&
                        (index + 1) %
                          MOBILE_AD_INTERVAL ===
                          0 && (
                          <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.05] bg-[#111a28] xl:hidden">
                            <AdSenseBanner adSlot="2901613977" />
                          </div>
                        )}
                    </div>
                  ),
                )}
          </div>

          {/* Return to all recipes */}

          {!isLoading &&
            hasActiveFilters &&
            filteredRecipes.length > 0 && (
              <section className="mt-6 overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#172438] to-[#111a28] p-4 shadow-xl shadow-black/10 sm:p-5">
                <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-right">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                      <ListFilter size={19} />
                    </span>

                    <div>
                      <h2 className="text-sm font-black text-white sm:text-base">
                        أنت تشاهد نتائج تصنيف محدد
                      </h2>

                      <p className="mt-1 text-[11px] font-bold text-slate-400">
                        يمكنك الرجوع إلى جميع الوصفات
                        وعرض باقي التصنيفات.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 sm:w-auto"
                  >
                    <RotateCcw size={15} />

                    عرض كل الوصفات
                  </button>
                </div>
              </section>
            )}

          {/* Loading more */}

          {!isLoading && loadingMore && (
            <div
              className={clsx(
                "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5",
                desktopGridColumns,
              )}
            >
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <RecipeSkeleton
                  key={`loading-more-skeleton-${index}`}
                />
              ))}
            </div>
          )}

          {/* Empty state */}

          {!isLoading &&
            filteredRecipes.length === 0 && (
              <section className="rounded-3xl border border-white/[0.07] bg-[#121c2b] px-5 py-12 text-center shadow-xl shadow-black/10">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-500/10 text-orange-400">
                  <UtensilsCrossed size={30} />
                </span>

                <h2 className="mt-4 text-xl font-black text-white">
                  لا توجد وصفات مطابقة
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-7 text-slate-400">
                  جرّب تغيير التصنيف أو الدولة أو الوسم
                  لعرض وصفات أخرى.
                </p>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                >
                  <RotateCcw size={16} />

                  عرض كل الوصفات
                </button>
              </section>
            )}

          {/* Load more button */}

          {!isLoading &&
            filteredRecipes.length > 0 &&
            hasMoreRecipes && (
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      جاري التحميل
                    </>
                  ) : (
                    <>
                      <ChevronDown size={17} />

                      عرض وصفات أخرى
                    </>
                  )}
                </button>
              </div>
            )}

          <div
            ref={loadMoreSentinelRef}
            aria-hidden="true"
            className="h-5"
          />
        </main>
      </div>

      <style jsx global>{`
        .category-scrollbar,
        .advertisement-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #f97316 transparent;
          overscroll-behavior: contain;
        }

        .category-scrollbar::-webkit-scrollbar,
        .advertisement-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .category-scrollbar::-webkit-scrollbar-track,
        .advertisement-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .category-scrollbar::-webkit-scrollbar-thumb,
        .advertisement-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: #f97316;
        }

        .category-scrollbar::-webkit-scrollbar-thumb:hover,
        .advertisement-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }

        @media (max-width: 640px) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
}