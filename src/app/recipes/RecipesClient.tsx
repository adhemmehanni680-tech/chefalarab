"use client";

import {
  Fragment,
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
  ChefHat,
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

function MeasuredAdSenseBanner({
  adFormat = "auto",
  minHeight = 90,
}: {
  adFormat?:
    | "auto"
    | "rectangle"
    | "horizontal"
    | "vertical"
    | "fluid";
  minHeight?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(
        host.getBoundingClientRect().width,
      );

      setAvailableWidth((currentWidth) =>
        currentWidth === nextWidth
          ? currentWidth
          : nextWidth,
      );
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(
      updateWidth,
    );

    resizeObserver.observe(host);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const canRenderAd = availableWidth >= 250;

  return (
    <div
      ref={hostRef}
      className="w-full min-w-0"
      style={{
        minHeight,
      }}
    >
      {canRenderAd ? (
        <AdSenseBanner
          adSlot="2901613977"
          adFormat={adFormat}
          minHeight={minHeight}
          className="w-full max-w-full"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "100%",
          }}
        />
      ) : null}
    </div>
  );
}

const MOBILE_AD_INTERVAL = 4;
const MOBILE_RECIPES_PER_PAGE = 8;
const DESKTOP_RECIPES_PER_PAGE = 12;

/* =========================================================
   Types
========================================================= */

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;

  img: {
    url?: string;
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
  initialCountry?: string | null;
  initialTag?: string | null;

  initialDiscover?: string | null;
  initialShowAllTags?: boolean;
  initialGroup?: string | null;

  initialPage?: number;
}

interface CategoryNavigationProps {
  categories: string[];
  countriesMap: Record<string, CountryItem[]>;
  availableTags: TagItem[];
  activeCategory: string | null;
  activeCountry: string | null;
  activeTag: string | null;
  expandedCategories: Record<string, boolean>;

  onToggleCategory: (
    category: string,
  ) => void;

  onSelectAll: () => void;

  onSelectCountry: (
    category: string,
    country: string | null,
  ) => void;

  onSelectTag: (tag: string) => void;

  onAfterSelect?: () => void;
}

/* =========================================================
   Image Helpers
========================================================= */

/**
 * Normalize all possible image paths.
 *
 * Supports:
 * /images/a.jpg
 * images/a.jpg
 * uploads/a.jpg
 * https://...
 * http://...
 * //cdn...
 */
function normalizeImageUrl(
  url: string | undefined | null,
): string | undefined {
  if (!url || typeof url !== "string") {
    return undefined;
  }

  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return undefined;
  }

  // Full URL
  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://")
  ) {
    return cleanUrl;
  }

  // Protocol relative URL
  if (cleanUrl.startsWith("//")) {
    return `https:${cleanUrl}`;
  }

  // Absolute path from public/
  if (cleanUrl.startsWith("/")) {
    return cleanUrl;
  }

  // Relative path
  return `/${cleanUrl}`;
}

/**
 * Get image URL.
 *
 * Prefer url-card.
 * If missing, use url.
 */
function getCardImageUrl(
  recipe: Recipe,
): string | undefined {
  const cardUrl = normalizeImageUrl(
    recipe.img?.["url-card"],
  );

  const normalUrl = normalizeImageUrl(
    recipe.img?.url,
  );

  return cardUrl || normalUrl;
}

/**
 * Check if image URL is usable.
 */
function isValidImageUrl(
  url: string | undefined | null,
): boolean {
  return Boolean(normalizeImageUrl(url));
}

/* =========================================================
   Helpers
========================================================= */

function formatCategoryName(
  category: string,
): string {
  return category
    .replace(/-/g, " ")
    .trim();
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
  const map: Record<
    string,
    CountryItem[]
  > = {};

  categories.forEach((category) => {
    const countryCounts: Record<
      string,
      number
    > = {};

    recipes
      .filter((recipe) =>
        hasCategory(recipe, category),
      )
      .forEach((recipe) => {
        if (!recipe.country) {
          return;
        }

        countryCounts[recipe.country] =
          (countryCounts[recipe.country] || 0) +
          1;
      });

    map[category] = Object.entries(
      countryCounts,
    )
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
    filteredRecipes =
      filteredRecipes.filter((recipe) =>
        hasCategory(
          recipe,
          activeCategory,
        ),
      );
  }

  if (activeCountry) {
    filteredRecipes =
      filteredRecipes.filter(
        (recipe) =>
          recipe.country === activeCountry,
      );
  }

  const tagCounts: Record<
    string,
    number
  > = {};

  filteredRecipes.forEach((recipe) => {
    if (!recipe.tags) {
      return;
    }

    const recipeTags = Array.isArray(
      recipe.tags,
    )
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

      return a.tag.localeCompare(
        b.tag,
        "ar",
      );
    })
    .slice(0, 16);
}

type PaginationItem =
  | number
  | "start-ellipsis"
  | "end-ellipsis";

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "end-ellipsis",
      totalPages,
    ];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "start-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end-ellipsis",
    totalPages,
  ];
}

function formatNumber(
  value: number,
): string {
  return value.toLocaleString("ar-EG");
}

function replaceRecipesUrl(
  page: number,
  category: string | null,
  country: string | null = null,
  tag: string | null = null,
) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(
    window.location.href,
  );

  if (category) {
    url.searchParams.set(
      "category",
      category,
    );
  } else {
    url.searchParams.delete(
      "category",
    );
  }

  if (country) {
    url.searchParams.set(
      "country",
      country,
    );
  } else {
    url.searchParams.delete(
      "country",
    );
  }

  if (tag) {
    url.searchParams.set(
      "tag",
      tag,
    );
  } else {
    url.searchParams.delete(
      "tag",
    );
  }

  if (page > 1) {
    url.searchParams.set(
      "page",
      String(page),
    );
  } else {
    url.searchParams.delete("page");
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

/* =========================================================
   Footer Hook
========================================================= */

function useFooterDock(): FooterDockState {
  const [footerState, setFooterState] =
    useState<FooterDockState>({
      isFooterVisible: false,
      footerOffset: 0,
    });

  useEffect(() => {
    const footer =
      document.getElementById(
        "site-footer",
      ) ||
      document.querySelector("footer");

    if (!footer) {
      return;
    }

    let animationFrameId = 0;

    const updateFooterPosition = () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      animationFrameId =
        window.requestAnimationFrame(
          () => {
            const footerRect =
              footer.getBoundingClientRect();

            const footerIsInsideViewport =
              footerRect.top <
                window.innerHeight &&
              footerRect.bottom > 0;

            const overlap =
              footerIsInsideViewport
                ? Math.max(
                    0,
                    window.innerHeight -
                      footerRect.top,
                  )
                : 0;

            const nextOffset =
              overlap > 0
                ? Math.round(
                    overlap + 12,
                  )
                : 0;

            setFooterState(
              (current) => {
                if (
                  current.isFooterVisible ===
                    footerIsInsideViewport &&
                  current.footerOffset ===
                    nextOffset
                ) {
                  return current;
                }

                return {
                  isFooterVisible:
                    footerIsInsideViewport,
                  footerOffset:
                    nextOffset,
                };
              },
            );
          },
        );
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
      typeof ResizeObserver !==
      "undefined"
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

/* =========================================================
   Skeleton
========================================================= */

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

/* =========================================================
   Category Navigation
========================================================= */

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
    onSelectCountry(
      category,
      country,
    );

    onAfterSelect?.();
  };

  const handleSelectTag = (
    tag: string,
  ) => {
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
        const isExpanded =
          Boolean(
            expandedCategories[
              category
            ],
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
                onToggleCategory(
                  category,
                )
              }
              aria-expanded={isExpanded}
              aria-current={
                isActive
                  ? "page"
                  : undefined
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
                {formatCategoryName(
                  category,
                )}
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
                  <ChevronUp
                    size={14}
                  />
                ) : (
                  <ChevronDown
                    size={14}
                  />
                )}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-white/[0.06] p-2.5">
                <div className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-black text-slate-400">
                  <MapPin size={12} />

                  <span>
                    الدول المتاحة
                  </span>
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
                      isActive &&
                        !activeCountry
                        ? "bg-orange-500/15 text-orange-400"
                        : "bg-[#111a28] text-slate-300 hover:bg-[#223148] hover:text-white",
                    )}
                  >
                    كل الدول
                  </button>

                  {countriesMap[
                    category
                  ]?.map(
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
                            activeCountry ===
                              country
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
                  availableTags.length >
                    0 && (
                    <div className="mt-4 border-t border-white/[0.05] pt-3">
                      <div className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-black text-slate-400">
                        <Tags size={12} />

                        <span>
                          وسوم مرتبطة
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {availableTags.map(
                          ({ tag }) => (
                            <button
                              key={`${category}-${tag}`}
                              type="button"
                              onClick={() =>
                                handleSelectTag(
                                  tag,
                                )
                              }
                              className={clsx(
                                "inline-flex min-w-0 items-center rounded-full border px-2.5 py-1.5 text-[9px] font-black transition",
                                activeTag ===
                                  tag
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

/* =========================================================
   Desktop Categories
========================================================= */

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
        isOpen
          ? "w-[260px]"
          : "w-[58px]",
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
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
              >
                <ChevronLeft
                  size={17}
                />
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
            className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#162235] px-2 text-white transition hover:bg-[#1d2b3f]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 shadow-lg shadow-orange-500/20">
              <ChevronRight
                size={18}
              />
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

/* =========================================================
   Desktop Advertisement
========================================================= */

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
              <MeasuredAdSenseBanner minHeight={250} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   Mobile Categories
========================================================= */

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
  const hasActiveFilters =
    Boolean(
      activeCategory ||
        activeCountry ||
        activeTag,
    );

  const activeLabel =
    activeTag ||
    activeCountry ||
    (activeCategory
      ? formatCategoryName(
          activeCategory,
        )
      : "كل الوصفات");

  useEffect(() => {
    if (isFooterVisible && isOpen) {
      onClose();
    }
  }, [
    isFooterVisible,
    isOpen,
    onClose,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen, onClose]);

  if (isFooterVisible) {
    return (
      <div
        className="fixed left-2 z-50 xl:hidden sm:left-3"
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
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="إغلاق قائمة التصنيفات"
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px] xl:hidden"
        />
      )}

      <div
        className={clsx(
          "fixed left-2 right-auto z-[70] flex w-[calc(100vw-1rem)] max-w-[430px] flex-col gap-2 xl:hidden sm:left-3 sm:w-[calc(100vw-1.5rem)]",
          isOpen
            ? "pointer-events-auto"
            : "pointer-events-none",
        )}
        style={{
          bottom:
            "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        {isOpen && (
          <section
            role="dialog"
            aria-modal="true"
            aria-label="دليل تصنيفات الوصفات"
            className="mobile-category-panel flex w-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#162235]/98 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 bg-orange-500 px-3 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
                  <ListFilter size={16} />
                </span>

                <div className="min-w-0">
                  <span className="block text-xs font-black">
                    دليل التصنيفات
                  </span>

                  <span className="block max-w-[240px] truncate text-[9px] font-bold text-white/80">
                    الاختيار الحالي:{" "}
                    {activeLabel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق قائمة التصنيفات"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 transition hover:bg-white/25 active:scale-95"
              >
                <X size={17} />
              </button>
            </div>

            <div
              className="category-scrollbar mobile-category-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-2.5"
              tabIndex={0}
            >
              {children}

              <div
                aria-hidden="true"
                className="h-3"
              />
            </div>
          </section>
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
            "pointer-events-auto ml-0 mr-auto flex h-12 max-w-[220px] items-center gap-2 rounded-full border border-white/10 px-3 text-white shadow-xl shadow-black/30 transition active:scale-95",
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
              <span className="block max-w-[145px] truncate text-[9px] font-bold text-white/80">
                {activeLabel}
              </span>
            )}
          </span>
        </button>
      </div>
    </>
  );
}

/* =========================================================
   Recipe Card
========================================================= */

function RecipeCard({
  recipe,
  index,
  hasImageError,
  onImageError,
}: {
  recipe: Recipe;
  index: number;
  hasImageError: boolean;
  onImageError: (
    id: number,
  ) => void;
}) {
  const cardImageUrl =
    getCardImageUrl(recipe);

  const categoryLabel =
    Array.isArray(recipe.category)
      ? recipe.category[0]
      : recipe.category;

  return (
    <article className="group h-full">
      <Link
        href={`/recipe/${encodeURIComponent(
          recipe.slug,
        )}`}
        prefetch={false}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#121c2b] shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-black/25"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#243247]">
          {isValidImageUrl(
            cardImageUrl,
          ) &&
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
                index < 4
                  ? undefined
                  : "lazy"
              }
              decoding="async"
              draggable={false}
              unoptimized={
                cardImageUrl!.startsWith(
                  "http://",
                ) ||
                cardImageUrl!.startsWith(
                  "https://",
                )
              }
              onError={() =>
                onImageError(
                  recipe.id,
                )
              }
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#25344a] via-[#172235] to-[#271f1a] text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/[0.06] text-slate-400">
                <UtensilsCrossed
                  size={32}
                />
              </span>

              <span className="mt-3 px-4 text-xs font-black text-slate-400">
                صورة الوصفة غير متاحة
              </span>

              {cardImageUrl && (
                <span className="mt-2 max-w-[90%] truncate text-[8px] text-slate-600">
                  {cardImageUrl}
                </span>
              )}
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
              {formatCategoryName(
                categoryLabel,
              )}
            </span>
          )}

          <h2 className="line-clamp-2 min-h-[56px] text-center text-sm font-black leading-7 text-white transition-colors group-hover:text-orange-400 sm:text-base">
            {recipe.title}
          </h2>

          <div className="mt-auto pt-4">
            <span className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#1b293b] px-3 py-2.5 text-[11px] font-black text-slate-200 transition group-hover:border-orange-500/30 group-hover:bg-orange-500 group-hover:text-white">
              <UtensilsCrossed
                size={14}
              />

              مشاهدة الوصفة
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   Pagination
========================================================= */

function RecipesPagination({
  currentPage,
  totalPages,
  totalItems,
  recipesPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  recipesPerPage: number;
  onPageChange: (
    page: number,
  ) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const paginationItems =
    getPaginationItems(
      currentPage,
      totalPages,
    );

  const firstItem =
    (currentPage - 1) *
      recipesPerPage +
    1;

  const lastItem = Math.min(
    currentPage * recipesPerPage,
    totalItems,
  );

  const progress = Math.min(
    100,
    Math.max(
      0,
      (currentPage / totalPages) *
        100,
    ),
  );

  return (
    <nav
      aria-label="التنقل بين صفحات الوصفات"
      className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-[2rem] border border-orange-500/15 bg-[#111c2c] shadow-2xl shadow-black/25"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 border-b border-white/[0.06] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25">
            <ChefHat
              size={23}
              strokeWidth={2.2}
            />

            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#111c2c] bg-emerald-400" />
          </span>

          <div className="text-center sm:text-right">
            <p className="text-sm font-black text-white sm:text-base">
              رحلة جديدة بين وصفاتنا
            </p>

            <p className="mt-1 text-[10px] font-bold text-slate-400 sm:text-xs">
              الوصفات{" "}
              {formatNumber(
                firstItem,
              )}
              –
              {formatNumber(
                lastItem,
              )}{" "}
              من أصل{" "}
              {formatNumber(
                totalItems,
              )}{" "}
              وصفة
            </p>
          </div>
        </div>

        <div className="mx-auto flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-3 py-2 sm:mx-0">
          <span className="text-[10px] font-bold text-slate-400">
            محطتك الحالية
          </span>

          <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-white">
            {formatNumber(
              currentPage,
            )}{" "}
            /{" "}
            {formatNumber(
              totalPages,
            )}
          </span>
        </div>
      </div>

      <div className="relative p-4 sm:px-6 sm:py-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage - 1,
              )
            }
            disabled={
              currentPage === 1
            }
            className="inline-flex h-12 items-center justify-center gap-1 rounded-2xl border border-white/[0.08] bg-[#19283b] px-3 text-[11px] font-black text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight
              size={18}
            />

            السابق
          </button>

          <div className="grid h-12 min-w-12 place-items-center rounded-2xl bg-orange-500 text-sm font-black text-white shadow-lg shadow-orange-500/25">
            {formatNumber(
              currentPage,
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage + 1,
              )
            }
            disabled={
              currentPage ===
              totalPages
            }
            className="inline-flex h-12 items-center justify-center gap-1 rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 px-3 text-[11px] font-black text-white shadow-lg shadow-orange-500/20 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            التالي

            <ChevronLeft
              size={18}
            />
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] font-bold text-slate-500 sm:hidden">
          صفحة{" "}
          {formatNumber(
            currentPage,
          )}{" "}
          من{" "}
          {formatNumber(
            totalPages,
          )}
        </p>

        <div className="hidden items-center justify-between gap-4 sm:flex">
          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage - 1,
              )
            }
            disabled={
              currentPage === 1
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-[#19283b] px-5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:border-orange-500/40 hover:bg-[#213147] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
          >
            <ChevronRight
              size={16}
            />

            السابق
          </button>

          <div className="flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-[#0c1623]/80 p-1.5 shadow-inner shadow-black/20">
            {paginationItems.map(
              (item, index) => {
                if (
                  item ===
                    "start-ellipsis" ||
                  item ===
                    "end-ellipsis"
                ) {
                  return (
                    <span
                      key={`${item}-${index}`}
                      aria-hidden="true"
                      className="grid h-10 w-7 place-items-center text-sm font-black text-slate-600"
                    >
                      …
                    </span>
                  );
                }

                const isActive =
                  item ===
                  currentPage;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      onPageChange(
                        item,
                      )
                    }
                    aria-label={`الانتقال إلى الصفحة ${item}`}
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    className={clsx(
                      "grid h-10 min-w-10 place-items-center rounded-xl px-2 text-xs font-black transition duration-200",
                      isActive
                        ? "scale-105 bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                        : "text-slate-400 hover:bg-[#223148] hover:text-white",
                    )}
                  >
                    {formatNumber(
                      item,
                    )}
                  </button>
                );
              },
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage + 1,
              )
            }
            disabled={
              currentPage ===
              totalPages
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 px-5 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-orange-500/35 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
          >
            التالي

            <ChevronLeft
              size={16}
            />
          </button>
        </div>
      </div>

      <div
        className="h-1.5 bg-white/[0.04]"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-amber-300 via-orange-500 to-orange-600 transition-[width] duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </nav>
  );
}

/* =========================================================
   Main Component
========================================================= */

export default function RecipesClient({
  recipes,
  categories,
  initialCategory = null,
  initialCountry = null,
  initialTag = null,
  initialPage = 1,
}: RecipesClientProps) {
  const normalizedInitialCategory =
    initialCategory &&
    categories.includes(
      initialCategory,
    )
      ? initialCategory
      : null;

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<string | null>(
    normalizedInitialCategory,
  );

  const [
    activeCountry,
    setActiveCountry,
  ] = useState<string | null>(
    initialCountry,
  );

  const [
    activeTag,
    setActiveTag,
  ] = useState<string | null>(
    initialTag,
  );

  const [
    currentPage,
    setCurrentPage,
  ] = useState(() =>
    Math.max(
      1,
      initialPage,
    ),
  );

  const [
    recipesPerPage,
    setRecipesPerPage,
  ] = useState(
    DESKTOP_RECIPES_PER_PAGE,
  );

  const isLoading = false;

  const [
    imageErrors,
    setImageErrors,
  ] = useState<
    Record<string, boolean>
  >({});

  const [
    sidebarMobileOpen,
    setSidebarMobileOpen,
  ] = useState(false);

  const [
    desktopCategoriesOpen,
    setDesktopCategoriesOpen,
  ] = useState(true);

  const [
    expandedCategories,
    setExpandedCategories,
  ] = useState<
    Record<string, boolean>
  >(
    () =>
      normalizedInitialCategory
        ? {
            [normalizedInitialCategory]:
              true,
          }
        : {},
  );

  const [
    expandedCategoriesMobile,
    setExpandedCategoriesMobile,
  ] = useState<
    Record<string, boolean>
  >(
    () =>
      normalizedInitialCategory
        ? {
            [normalizedInitialCategory]:
              true,
          }
        : {},
  );

  const recipesSectionRef =
    useRef<HTMLElement>(null);

  const {
    isFooterVisible,
    footerOffset,
  } = useFooterDock();

  const hasActiveFilters =
    Boolean(
      activeCategory ||
        activeCountry ||
        activeTag,
    );

  /* =======================================================
     Responsive pagination
  ======================================================= */

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 639px)",
      );

    const updateRecipesPerPage =
      () => {
        setRecipesPerPage(
          mediaQuery.matches
            ? MOBILE_RECIPES_PER_PAGE
            : DESKTOP_RECIPES_PER_PAGE,
        );
      };

    updateRecipesPerPage();

    mediaQuery.addEventListener(
      "change",
      updateRecipesPerPage,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateRecipesPerPage,
      );
    };
  }, []);

  /* =======================================================
     Initial URL state
  ======================================================= */

  useEffect(() => {
    if (
      initialCategory &&
      categories.includes(
        initialCategory,
      )
    ) {
      setActiveCategory(
        initialCategory,
      );

      setExpandedCategories({
        [initialCategory]: true,
      });

      setExpandedCategoriesMobile({
        [initialCategory]: true,
      });
    }

    setCurrentPage(
      Math.max(
        1,
        initialPage,
      ),
    );
  }, [
    initialCategory,
    initialPage,
    categories,
  ]);

  /* =======================================================
     Data
  ======================================================= */

  const countriesMap = useMemo(
    () =>
      getCountriesMap(
        recipes,
        categories,
      ),
    [recipes, categories],
  );

  const availableTags = useMemo(
    () =>
      getAvailableTags(
        recipes,
        activeCategory,
        activeCountry,
      ),
    [
      recipes,
      activeCategory,
      activeCountry,
    ],
  );

  const filteredRecipes =
    useMemo(() => {
      let result = [...recipes];

      if (activeCategory) {
        result = result.filter(
          (recipe) =>
            hasCategory(
              recipe,
              activeCategory,
            ),
        );
      }

      if (activeCountry) {
        result = result.filter(
          (recipe) =>
            recipe.country ===
            activeCountry,
        );
      }

      if (activeTag) {
        result = result.filter(
          (recipe) =>
            hasTag(
              recipe,
              activeTag,
            ),
        );
      }

      return result.sort(
        (a, b) => b.id - a.id,
      );
    }, [
      recipes,
      activeCategory,
      activeCountry,
      activeTag,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRecipes.length /
        recipesPerPage,
    ),
  );

  const safeCurrentPage =
    Math.min(
      Math.max(
        currentPage,
        1,
      ),
      totalPages,
    );

  const paginatedRecipes =
    useMemo(() => {
      const startIndex =
        (safeCurrentPage - 1) *
        recipesPerPage;

      return filteredRecipes.slice(
        startIndex,
        startIndex +
          recipesPerPage,
      );
    }, [
      filteredRecipes,
      safeCurrentPage,
      recipesPerPage,
    ]);

  /* =======================================================
     Grid
  ======================================================= */

  const desktopGridColumns =
    useMemo(() => {
      if (!adsEnabled) {
        return "xl:grid-cols-4";
      }

      if (
        desktopCategoriesOpen
      ) {
        return "xl:grid-cols-2";
      }

      return "xl:grid-cols-3";
    }, [
      desktopCategoriesOpen,
    ]);

  /* =======================================================
     Page correction
  ======================================================= */

  useEffect(() => {
    if (
      currentPage ===
      safeCurrentPage
    ) {
      return;
    }

    setCurrentPage(
      safeCurrentPage,
    );

    replaceRecipesUrl(
      safeCurrentPage,
      activeCategory,
      activeCountry,
      activeTag,
    );
  }, [
    currentPage,
    safeCurrentPage,
    activeCategory,
    activeCountry,
    activeTag,
  ]);

  /* =======================================================
     Pagination
  ======================================================= */

  const goToPage = useCallback(
    (page: number) => {
      const nextPage = Math.min(
        Math.max(page, 1),
        totalPages,
      );

      if (
        nextPage ===
        safeCurrentPage
      ) {
        return;
      }

      setCurrentPage(
        nextPage,
      );

      replaceRecipesUrl(
        nextPage,
        activeCategory,
        activeCountry,
        activeTag,
      );

      window.setTimeout(() => {
        const section =
          recipesSectionRef.current;

        if (!section) {
          return;
        }

        const top =
          section.getBoundingClientRect()
            .top +
          window.scrollY -
          112;

        window.scrollTo({
          top: Math.max(
            0,
            top,
          ),
          behavior: "smooth",
        });
      }, 30);
    },
    [
      totalPages,
      safeCurrentPage,
      activeCategory,
      activeCountry,
      activeTag,
    ],
  );

  /* =======================================================
     Filters
  ======================================================= */

  const toggleCategory =
    useCallback(
      (
        category: string,
        mobile = false,
      ) => {
        const setExpanded =
          mobile
            ? setExpandedCategoriesMobile
            : setExpandedCategories;

        setExpanded(
          (currentState) => {
            const isCurrentlyOpen =
              Boolean(
                currentState[
                  category
                ],
              );

            return {
              [category]:
                !isCurrentlyOpen,
            };
          },
        );

        setActiveCategory(
          category,
        );

        setActiveCountry(
          null,
        );

        setActiveTag(null);

        setCurrentPage(1);

        replaceRecipesUrl(
          1,
          category,
          null,
          null,
        );
      },
      [],
    );

  const selectCountry =
    useCallback(
      (
        category: string,
        country:
          | string
          | null,
      ) => {
        setActiveCategory(
          category,
        );

        setActiveCountry(
          country,
        );

        setActiveTag(null);

        setCurrentPage(1);

        replaceRecipesUrl(
          1,
          category,
          country,
          null,
        );
      },
      [],
    );

  const selectTag = useCallback(
    (tag: string) => {
      const nextTag =
        activeTag === tag
          ? null
          : tag;

      setActiveTag(nextTag);
      setCurrentPage(1);

      replaceRecipesUrl(
        1,
        activeCategory,
        activeCountry,
        nextTag,
      );
    },
    [
      activeCategory,
      activeCountry,
      activeTag,
    ],
  );

  const clearAllFilters =
    useCallback(() => {
      setActiveCategory(null);
      setActiveCountry(null);
      setActiveTag(null);

      setCurrentPage(1);

      replaceRecipesUrl(
        1,
        null,
        null,
        null,
      );

      setExpandedCategories(
        {},
      );

      setExpandedCategoriesMobile(
        {},
      );

      window.setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 40);
    }, []);

  /* =======================================================
     Image error
  ======================================================= */

  const handleImageError =
    useCallback(
      (id: number) => {
        setImageErrors(
          (currentErrors) => ({
            ...currentErrors,
            [String(id)]: true,
          }),
        );
      },
      [],
    );

  const handleMobileGuideClose =
    useCallback(() => {
      setSidebarMobileOpen(
        false,
      );
    }, []);

  /* =======================================================
     Navigation
  ======================================================= */

  const desktopNavigation = (
    <CategoryNavigation
      categories={categories}
      countriesMap={countriesMap}
      availableTags={availableTags}
      activeCategory={
        activeCategory
      }
      activeCountry={
        activeCountry
      }
      activeTag={activeTag}
      expandedCategories={
        expandedCategories
      }
      onToggleCategory={(
        category,
      ) =>
        toggleCategory(
          category,
          false,
        )
      }
      onSelectAll={
        clearAllFilters
      }
      onSelectCountry={
        selectCountry
      }
      onSelectTag={selectTag}
    />
  );

  const mobileNavigation = (
    <CategoryNavigation
      categories={categories}
      countriesMap={countriesMap}
      availableTags={availableTags}
      activeCategory={
        activeCategory
      }
      activeCountry={
        activeCountry
      }
      activeTag={activeTag}
      expandedCategories={
        expandedCategoriesMobile
      }
      onToggleCategory={(
        category,
      ) =>
        toggleCategory(
          category,
          true,
        )
      }
      onSelectAll={
        clearAllFilters
      }
      onSelectCountry={
        selectCountry
      }
      onSelectTag={selectTag}
      onAfterSelect={
        handleMobileGuideClose
      }
    />
  );

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-32 pt-24 text-white dark:bg-[#0b1220] sm:pb-28 sm:pt-28 xl:pb-20"
    >
      <DesktopCategoriesAside
        isOpen={
          desktopCategoriesOpen
        }
        onToggle={() =>
          setDesktopCategoriesOpen(
            (current) =>
              !current,
          )
        }
        isFooterVisible={
          isFooterVisible
        }
        footerOffset={
          footerOffset
        }
        hasActiveFilters={
          hasActiveFilters
        }
        onShowAllRecipes={
          clearAllFilters
        }
      >
        {desktopNavigation}
      </DesktopCategoriesAside>

      <DesktopAdvertisementAside
        isFooterVisible={
          isFooterVisible
        }
      />

      <MobileCategoriesGuide
        isOpen={sidebarMobileOpen}
        onToggle={() =>
          setSidebarMobileOpen(
            (currentState) =>
              !currentState,
          )
        }
        onClose={
          handleMobileGuideClose
        }
        isFooterVisible={
          isFooterVisible
        }
        footerOffset={
          footerOffset
        }
        activeCategory={
          activeCategory
        }
        activeCountry={
          activeCountry
        }
        activeTag={activeTag}
        onShowAllRecipes={
          clearAllFilters
        }
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
              <UtensilsCrossed
                size={28}
              />
            </span>

            <h1 className="mx-auto max-w-[1000px] text-balance text-xl font-black leading-9 text-white sm:text-2xl sm:leading-10 lg:text-3xl lg:leading-[1.6]">
              استمتع بألذ الوصفات العربية والعالمية الأصيلة
            </h1>

            <p className="mx-auto mt-3 max-w-[900px] text-sm font-bold leading-7 text-slate-300 sm:text-base sm:leading-8">
              وصفات شهية وسهلة التحضير لكل المناسبات اليومية والعائلية، مع خطوات واضحة ونصائح احترافية وأفكار مبتكرة من مطابخ العالم.
            </p>
          </div>
        </section>

        <main
          ref={recipesSectionRef}
          className="min-w-0"
        >
          {/* Recipes Grid */}

          <div
            className={clsx(
              "grid grid-cols-1 gap-4 transition-all duration-300 sm:grid-cols-2 sm:gap-5",
              desktopGridColumns,
            )}
          >
            {isLoading
              ? Array.from({
                  length: 8,
                }).map(
                  (_, index) => (
                    <RecipeSkeleton
                      key={`recipe-skeleton-${index}`}
                    />
                  ),
                )
              : paginatedRecipes.map(
                  (
                    recipe,
                    index,
                  ) => (
                    <Fragment
                      key={
                        recipe.slug
                          ? `recipe-${recipe.slug}`
                          : `recipe-${recipe.id}`
                      }
                    >
                      <div className="min-w-0">
                        <RecipeCard
                          recipe={
                            recipe
                          }
                          index={
                            index
                          }
                          hasImageError={Boolean(
                            imageErrors[
                              String(
                                recipe.id,
                              )
                            ],
                          )}
                          onImageError={
                            handleImageError
                          }
                        />
                      </div>

                      {adsEnabled &&
                        (index + 1) %
                          MOBILE_AD_INTERVAL ===
                          0 && (
                          <section
                            aria-label="مساحة إعلانية"
                            className="relative isolate col-span-full my-2 min-h-[152px] w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111a28] p-3 shadow-lg shadow-black/10 xl:hidden"
                            style={{
                              contain:
                                "layout paint",
                            }}
                          >
                            <div className="mb-2 text-center text-[9px] font-black text-slate-500">
                              إعلان
                            </div>

                            <div className="mx-auto flex min-h-[110px] w-full min-w-0 items-center justify-center overflow-hidden">
                              <MeasuredAdSenseBanner
                                adFormat="horizontal"
                                minHeight={
                                  110
                                }
                              />
                            </div>
                          </section>
                        )}
                    </Fragment>
                  ),
                )}
          </div>

          {/* Return to all recipes */}

          {!isLoading &&
            hasActiveFilters &&
            filteredRecipes.length >
              0 && (
              <section className="mt-6 overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#172438] to-[#111a28] p-4 shadow-xl shadow-black/10 sm:p-5">
                <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-right">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                      <ListFilter
                        size={19}
                      />
                    </span>

                    <div>
                      <h2 className="text-sm font-black text-white sm:text-base">
                        أنت تشاهد نتائج تصنيف محدد
                      </h2>

                      <p className="mt-1 text-[11px] font-bold text-slate-400">
                        يمكنك الرجوع إلى جميع الوصفات وعرض باقي التصنيفات.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      clearAllFilters
                    }
                    className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 sm:w-auto"
                  >
                    <RotateCcw
                      size={15}
                    />

                    عرض كل الوصفات
                  </button>
                </div>
              </section>
            )}

          {/* Empty */}

          {!isLoading &&
            filteredRecipes.length ===
              0 && (
              <section className="rounded-3xl border border-white/[0.07] bg-[#121c2b] px-5 py-12 text-center shadow-xl shadow-black/10">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-500/10 text-orange-400">
                  <UtensilsCrossed
                    size={30}
                  />
                </span>

                <h2 className="mt-4 text-xl font-black text-white">
                  لا توجد وصفات مطابقة
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-7 text-slate-400">
                  جرّب تغيير التصنيف أو الدولة أو الوسم لعرض وصفات أخرى.
                </p>

                <button
                  type="button"
                  onClick={
                    clearAllFilters
                  }
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                >
                  <RotateCcw
                    size={16}
                  />

                  عرض كل الوصفات
                </button>
              </section>
            )}

          {!isLoading &&
            filteredRecipes.length >
              0 && (
              <RecipesPagination
                currentPage={
                  safeCurrentPage
                }
                totalPages={
                  totalPages
                }
                totalItems={
                  filteredRecipes.length
                }
                recipesPerPage={
                  recipesPerPage
                }
                onPageChange={
                  goToPage
                }
              />
            )}
        </main>
      </div>

      <style jsx global>{`
        .category-scrollbar,
        .advertisement-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #f97316 transparent;
          overscroll-behavior-y: contain;
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

        .mobile-category-panel {
          max-height: calc(100vh - 7rem);
          max-height: calc(100svh - 7rem);
          max-height: calc(100dvh - 7rem);
        }

        .mobile-category-scroll {
          min-height: 0;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          touch-action: pan-y;
          scrollbar-gutter: stable;
        }

        @supports (-webkit-touch-callout: none) {
          .mobile-category-scroll {
            -webkit-overflow-scrolling: touch;
            touch-action: pan-y;
          }
        }

        @media (max-height: 650px) and (max-width: 1279px) {
          .mobile-category-panel {
            max-height: calc(100vh - 5.75rem);
            max-height: calc(100svh - 5.75rem);
            max-height: calc(100dvh - 5.75rem);
          }
        }

        @media (max-width: 640px) {
          html {
            scroll-behavior: auto;
          }

          .mobile-category-panel {
            max-height: calc(100vh - 6.25rem);
            max-height: calc(100svh - 6.25rem);
            max-height: calc(100dvh - 6.25rem);
          }

          .mobile-category-scroll {
            padding-bottom: max(
              0.75rem,
              env(safe-area-inset-bottom)
            );
          }
        }

        @media (max-width: 380px) {
          .mobile-category-panel {
            max-height: calc(100vh - 5.5rem);
            max-height: calc(100svh - 5.5rem);
            max-height: calc(100dvh - 5.5rem);
          }
        }
      `}</style>
    </div>
  );
}