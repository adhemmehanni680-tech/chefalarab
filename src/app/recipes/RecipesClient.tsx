"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, UtensilsCrossed } from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { adsEnabled } from "@/lib/ads";

const AdSenseBanner = dynamic(() => import("@/app/Components/AdSenseBanner"), {
  ssr: false,
});

const MOBILE_AD_INTERVAL = 4;

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

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== "string") return false;
  if (url.trim() === "") return false;

  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith("/");
  }
};

const getCardImageUrl = (recipe: Recipe): string | undefined => {
  return recipe.img?.["url-card"] || recipe.img?.url;
};

const hasCategory = (recipe: Recipe, category: string): boolean => {
  if (!recipe.category) return false;

  return Array.isArray(recipe.category)
    ? recipe.category.includes(category)
    : recipe.category === category;
};

const hasTag = (recipe: Recipe, tag: string): boolean => {
  if (!recipe.tags) return false;

  return Array.isArray(recipe.tags)
    ? recipe.tags.includes(tag)
    : recipe.tags === tag;
};

const getCountriesMap = (
  recipes: Recipe[],
  categories: string[]
): Record<string, { country: string; count: number }[]> => {
  const map: Record<string, { country: string; count: number }[]> = {};

  categories.forEach((cat) => {
    const countryCounts: Record<string, number> = {};

    recipes
      .filter((recipe) => hasCategory(recipe, cat))
      .forEach((recipe) => {
        if (recipe.country) {
          countryCounts[recipe.country] =
            (countryCounts[recipe.country] || 0) + 1;
        }
      });

    map[cat] = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  });

  return map;
};

const getAvailableTags = (
  recipes: Recipe[],
  activeCategory: string | null,
  activeCountry: string | null
): { tag: string; count: number }[] => {
  let filtered = recipes;

  if (activeCategory) {
    filtered = filtered.filter((r) => hasCategory(r, activeCategory));
  }

  if (activeCountry) {
    filtered = filtered.filter((r) => r.country === activeCountry);
  }

  const tagCounts: Record<string, number> = {};

  filtered.forEach((recipe) => {
    if (!recipe.tags) return;

    const tags = Array.isArray(recipe.tags) ? recipe.tags : [recipe.tags];

    tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 14);
};

const RecipeSkeleton = () => (
  <div className="animate-pulse bg-[#111827] rounded-2xl h-[350px] w-full border border-gray-700">
    <div className="h-56 bg-gray-700 rounded-t-2xl" />
    <div className="p-4 text-center space-y-2">
      <div className="h-6 bg-gray-600 rounded w-3/4 mx-auto" />
      <div className="h-4 bg-gray-500 rounded w-1/2 mx-auto" />
    </div>
  </div>
);

interface RecipesClientProps {
  recipes: Recipe[];
  categories: string[];
  initialCategory?: string | null;
}

export default function RecipesClient({
  recipes,
  categories,
  initialCategory = null,
}: RecipesClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [sidebarTop, setSidebarTop] = useState(0);
  const [leftAdTop, setLeftAdTop] = useState(0);

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const [expandedCategoriesMobile, setExpandedCategoriesMobile] = useState<
    Record<string, boolean>
  >({});

  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const leftAdRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (initialCategory && categories.includes(initialCategory)) {
      setActiveCategory(initialCategory);

      setExpandedCategories((prev) => ({
        ...prev,
        [initialCategory]: true,
      }));

      setExpandedCategoriesMobile((prev) => ({
        ...prev,
        [initialCategory]: true,
      }));
    }
  }, [initialCategory, categories]);

  const countriesMap = useMemo(
    () => getCountriesMap(recipes, categories),
    [recipes, categories]
  );

  const availableTags = useMemo(
    () => getAvailableTags(recipes, activeCategory, activeCountry),
    [recipes, activeCategory, activeCountry]
  );

  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    if (activeCategory) {
      filtered = filtered.filter((r) => hasCategory(r, activeCategory));
    }

    if (activeCountry) {
      filtered = filtered.filter((r) => r.country === activeCountry);
    }

    if (activeTag) {
      filtered = filtered.filter((r) => hasTag(r, activeTag));
    }

    return filtered.sort((a, b) => b.id - a.id);
  }, [recipes, activeCategory, activeCountry, activeTag]);

  const visibleRecipes = filteredRecipes.slice(0, visibleCount);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [activeCategory, activeCountry, activeTag]);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, activeCountry, activeTag]);

  const loadMore = useCallback(() => {
    if (
      loadingMoreRef.current ||
      loadingMore ||
      visibleCount >= filteredRecipes.length
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    setTimeout(() => {
      setVisibleCount((v) => Math.min(v + 6, filteredRecipes.length));
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }, 450);
  }, [loadingMore, visibleCount, filteredRecipes.length]);

  useEffect(() => {
    const onScroll = () => {
      if (!isMobile) {
        if (sidebarRef.current && containerRef.current) {
          const sidebarHeight = sidebarRef.current.offsetHeight;
          const containerTop = containerRef.current.offsetTop;
          const containerHeight = containerRef.current.offsetHeight;
          const scrollY = window.scrollY + 80;
          const maxTop = containerTop + containerHeight - sidebarHeight - 40;

          setSidebarTop(
            scrollY < containerTop
              ? 0
              : scrollY > maxTop
              ? maxTop - containerTop
              : scrollY - containerTop
          );
        }

        if (leftAdRef.current && containerRef.current) {
          const adHeight = leftAdRef.current.offsetHeight;
          const containerTop = containerRef.current.offsetTop;
          const containerHeight = containerRef.current.offsetHeight;
          const scrollY = window.scrollY + 80;
          const maxTop = containerTop + containerHeight - adHeight - 40;

          setLeftAdTop(
            scrollY < containerTop
              ? 0
              : scrollY > maxTop
              ? maxTop - containerTop
              : scrollY - containerTop
          );
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 600
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, loadMore]);

  const toggleCategory = useCallback((cat: string, mobile = false) => {
    const setter = mobile ? setExpandedCategoriesMobile : setExpandedCategories;

    setter((prev) => {
      const isOpen = !!prev[cat];
      const newState: Record<string, boolean> = {};

      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });

      newState[cat] = !isOpen;

      return newState;
    });

    setActiveCategory(cat);
    setActiveCountry(null);
    setActiveTag(null);
  }, []);

  const clearAllFilters = () => {
    setActiveCategory(null);
    setActiveCountry(null);
    setActiveTag(null);
    setVisibleCount(12);
  };

  const handleImageError = (id: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [id.toString()]: true,
    }));
  };

  return (
    <div className="dark:bg-gray-900 min-h-screen dark:text-white pb-24 pt-16 mt-16">
      <h1 className="text-center font-bold text-3xl mb-6 px-4 leading-relaxed">
        استمتع بألذ الوصفات العربية والعالمية الأصيلة: وصفات شهية وسهلة التحضير
        لكل المناسبات اليومية والعائلية، مع خطوات واضحة، نصائح احترافية، وأفكار
        مبتكرة من جميع مطابخ العالم
      </h1>

      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full z-50">
          <button
            type="button"
            onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
            className="w-full bg-lime-400 p-3 text-black text-center font-bold rounded-t-xl"
          >
            {sidebarMobileOpen ? "إغلاق القائمة 🍽️" : "قائمة التصنيفات"}
          </button>

          {sidebarMobileOpen && (
            <div className="bg-gray-900 border-t border-gray-700 p-3 space-y-3 rounded-t-xl max-h-[60vh] overflow-y-auto shadow-2xl">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat, true)}
                    className={clsx(
                      "w-full flex justify-between items-center px-4 py-3 text-right transition",
                      activeCategory === cat
                        ? "bg-lime-400 text-black font-semibold"
                        : "text-white hover:bg-gray-800"
                    )}
                  >
                    <span>{cat.replace(/-/g, " ")}</span>

                    {expandedCategoriesMobile[cat] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {expandedCategoriesMobile[cat] && (
                    <div className="p-3 border-t border-gray-800">
                      <div className="mb-3">
                        <div className="text-xs text-gray-400 mb-2">الدول</div>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCategory(cat);
                              setActiveCountry(null);
                              setActiveTag(null);
                              setSidebarMobileOpen(false);
                            }}
                            className={clsx(
                              "block w-full text-right text-sm py-2 px-3 rounded-xl transition",
                              activeCategory === cat && !activeCountry
                                ? "bg-gray-800 text-yellow-400 font-semibold"
                                : "text-gray-400 hover:text-yellow-400"
                            )}
                          >
                            كل الدول
                          </button>

                          {countriesMap[cat]?.map(({ country }) => (
                            <button
                              type="button"
                              key={country}
                              onClick={() => {
                                setActiveCategory(cat);
                                setActiveCountry(country);
                                setActiveTag(null);
                                setSidebarMobileOpen(false);
                              }}
                              className={clsx(
                                "block w-full text-right text-sm py-2 px-3 rounded-xl transition",
                                activeCountry === country &&
                                  activeCategory === cat
                                  ? "bg-yellow-300 text-black font-semibold"
                                  : "text-gray-400 hover:text-yellow-400"
                              )}
                            >
                              {country}
                            </button>
                          ))}
                        </div>
                      </div>

                      {activeCategory === cat && availableTags.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-400 mb-2">
                            وسوم مرتبطة
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {availableTags.map(({ tag }) => (
                              <button
                                type="button"
                                key={tag}
                                onClick={() => {
                                  setActiveTag(tag);
                                  setSidebarMobileOpen(false);
                                }}
                                className={clsx(
                                  "px-3 py-1.5 rounded-full text-xs border transition",
                                  activeTag === tag
                                    ? "bg-lime-400 text-black border-yellow-400 font-semibold"
                                    : "bg-gray-800 text-gray-300 border-gray-700 hover:border-yellow-400 hover:text-yellow-400"
                                )}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div ref={containerRef} className="max-w-[1500px] mx-auto flex gap-6 px-3">
        {adsEnabled && (
          <aside className="hidden lg:block w-[220px]">
            <div className="sticky" style={{ top: leftAdTop }} ref={leftAdRef}>
              <AdSenseBanner adSlot="2901613977" />
            </div>
          </aside>
        )}

        <main className="flex-1">
          {/* {!isLoading && (
            <div className="mb-5 bg-[#111827] rounded-2xl border border-gray-700 overflow-hidden text-center p-4">
              عدد الوصفات:{" "}
              <span className="text-yellow-400 font-semibold mr-2">
                {filteredRecipes.length}
              </span>
            </div>
          )} */}

          <div
            className={clsx(
              "grid gap-5 grid-cols-1 sm:grid-cols-2",
              adsEnabled && !sidebarCollapsed && "lg:grid-cols-2",
              adsEnabled && sidebarCollapsed && "lg:grid-cols-3",
              !adsEnabled && !sidebarCollapsed && "lg:grid-cols-3",
              !adsEnabled && sidebarCollapsed && "lg:grid-cols-4"
            )}
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <RecipeSkeleton key={i} />
                ))
              : visibleRecipes.map((recipe, index) => {
                  const cardImageUrl = getCardImageUrl(recipe);
                  const hasImageError = imageErrors[recipe.id.toString()];

                  return (
                    <div key={recipe.id}>
                      <Link
                        href={`/recipe/${recipe.slug}`}
                        className="group block bg-[#111827] rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-400 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
                      >
                        <div className="overflow-hidden">
                          {isValidImageUrl(cardImageUrl) && !hasImageError ? (
                            <Image
                              src={cardImageUrl!}
                              alt={recipe.img?.alt || recipe.title || "وصفة"}
                              width={500}
                              height={350}
                              className="w-full h-56 object-cover group-hover:scale-[1.04] transition duration-500"
                              loading={index < 6 ? "eager" : "lazy"}
                              onError={() => handleImageError(recipe.id)}
                              unoptimized={cardImageUrl!.startsWith("http")}
                            />
                          ) : (
                            <div className="w-full h-56 bg-gray-700 flex items-center justify-center">
                              <UtensilsCrossed
                                size={48}
                                className="text-gray-500"
                              />
                            </div>
                          )}
                        </div>

                        <div className="p-4 text-center">
                          <h3 className="text-yellow-400 font-semibold leading-7 line-clamp-2 min-h-[56px]">
                            {recipe.title}
                          </h3>

                          <p className="text-gray-400 text-sm mt-1">
                            {recipe.country}
                          </p>
                        </div>
                      </Link>

                      {adsEnabled &&
                        isMobile &&
                        (index + 1) % MOBILE_AD_INTERVAL === 0 && (
                          <div className="mt-3">
                            <AdSenseBanner adSlot="2901613977" />
                          </div>
                        )}
                    </div>
                  );
                })}
          </div>

          {!isLoading && filteredRecipes.length === 0 && (
            <div className="bg-[#111827] border border-gray-700 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">
                لا توجد وصفات مطابقة
              </h3>

              <p className="text-gray-400 mb-4">
                جرّب تغيير التصنيف أو الدولة أو الوسم.
              </p>

              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:opacity-90 transition"
              >
                عرض كل الوصفات
              </button>
            </div>
          )}
        </main>

        {!isMobile && (
          <aside
            className="hidden lg:block transition-all duration-300"
            style={{ width: sidebarCollapsed ? 75 : 305 }}
          >
            <div
              ref={sidebarRef}
              className="sticky top-16 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
              style={{ position: "relative", top: sidebarTop }}
            >
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full bg-lime-400 text-black p-3 flex justify-center"
              >
                <UtensilsCrossed
                  size={20}
                  className={clsx(
                    "transition-transform duration-300",
                    sidebarCollapsed ? "rotate-0" : "rotate-180"
                  )}
                />
              </button>

              {!sidebarCollapsed && (
                <div className="p-3 max-h-[calc(100vh-150px)] overflow-y-auto">
                  <div className="font-bold text-lg mb-3 text-center text-white">
                    التصنيفات
                  </div>

                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <div
                        key={cat}
                        className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={clsx(
                            "w-full flex justify-between items-center px-4 py-3 text-right transition",
                            activeCategory === cat
                              ? "bg-lime-400 text-black font-semibold"
                              : "text-white hover:bg-gray-700"
                          )}
                        >
                          <span className="leading-7">
                            {cat.replace(/-/g, " ")}
                          </span>

                          {expandedCategories[cat] ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>

                        {expandedCategories[cat] && (
                          <div className="p-3 border-t border-gray-800">
                            <div className="mb-3">
                              <div className="text-xs text-gray-400 mb-2">
                                الدول
                              </div>

                              <div className="space-y-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCategory(cat);
                                    setActiveCountry(null);
                                    setActiveTag(null);
                                  }}
                                  className={clsx(
                                    "block w-full text-right text-sm py-2 px-3 rounded-xl transition",
                                    activeCategory === cat && !activeCountry
                                      ? "bg-gray-800 text-yellow-400 font-semibold"
                                      : "text-gray-400 hover:bg-gray-800 hover:text-yellow-400"
                                  )}
                                >
                                  كل الدول
                                </button>

                                {countriesMap[cat]?.map(({ country }) => (
                                  <button
                                    type="button"
                                    key={country}
                                    onClick={() => {
                                      setActiveCategory(cat);
                                      setActiveCountry(country);
                                      setActiveTag(null);
                                    }}
                                    className={clsx(
                                      "block w-full text-right text-sm py-2 px-3 rounded-xl transition",
                                      activeCountry === country &&
                                        activeCategory === cat
                                        ? "bg-gray-800 text-yellow-400 font-semibold"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-yellow-400"
                                    )}
                                  >
                                    {country}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {activeCategory === cat &&
                              availableTags.length > 0 && (
                                <div>
                                  <div className="text-xs text-gray-400 mb-2">
                                    وسوم مرتبطة
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {availableTags.map(({ tag }) => (
                                      <button
                                        type="button"
                                        key={tag}
                                        onClick={() => setActiveTag(tag)}
                                        className={clsx(
                                          "px-3 py-1.5 rounded-full text-xs border transition",
                                          activeTag === tag
                                            ? "bg-lime-400 text-black border-yellow-400 font-semibold"
                                            : "bg-gray-800 text-gray-300 border-gray-700 hover:border-yellow-400 hover:text-yellow-400"
                                        )}
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}