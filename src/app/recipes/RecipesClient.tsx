"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useMemo,
  useState,
} from "react";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;
  excerpt?: string;
  cookingTimeMinutes?: number | null;
  contentFlags?: unknown;
  img?: {
    url?: string;
    "url-card"?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

type RecipesClientProps = {
  recipes: Recipe[];
  categories: string[];
  initialCategory: string | null;
  initialCountry: string | null;
  initialTag: string | null;
  initialDiscover:
    | "latest"
    | "quick"
    | "family"
    | null;
  initialShowAllTags: boolean;
  initialGroup:
    | "desserts"
    | "drinks"
    | "birthdays"
    | null;
  initialPage: number;
};
const ITEMS_PER_PAGE = 12;

/* =========================================================
   IMAGE HELPERS
========================================================= */

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

  // Absolute URL
  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://")
  ) {
    return cleanUrl;
  }

  // Protocol-relative URL
  if (cleanUrl.startsWith("//")) {
    return `https:${cleanUrl}`;
  }

  // Local public path
  if (cleanUrl.startsWith("/")) {
    return cleanUrl;
  }

  // Relative local path
  return `/${cleanUrl}`;
}

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

function isValidImageUrl(
  url: string | undefined,
): boolean {
  return Boolean(normalizeImageUrl(url));
}

/* =========================================================
   SMALL HELPERS
========================================================= */

function getCategoryLabel(
  category: string[] | string | undefined,
): string {
  if (Array.isArray(category)) {
    return category[0] || "";
  }

  return category || "";
}

function getTags(
  tags: string[] | string | undefined,
): string[] {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }

  if (typeof tags === "string" && tags.trim()) {
    return [tags.trim()];
  }

  return [];
}

/* =========================================================
   RECIPE CARD
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
  onImageError: (id: number) => void;
}) {
  const cardImageUrl = getCardImageUrl(recipe);

  const categoryLabel = getCategoryLabel(
    recipe.category,
  );

  const tags = getTags(recipe.tags);

  return (
    <article className="group h-full">
      <Link
        href={`/recipe/${encodeURIComponent(recipe.slug)}`}
        prefetch={false}
        className="
          flex h-full flex-col
          overflow-hidden
          rounded-3xl
          border border-white/[0.07]
          bg-[#121c2b]
          shadow-lg shadow-black/10
          transition-all duration-300
          hover:-translate-y-1.5
          hover:border-orange-500/40
          hover:shadow-2xl
          hover:shadow-black/25
        "
      >
        {/* IMAGE */}
        <div
          className="
            relative
            aspect-[4/3]
            w-full
            overflow-hidden
            bg-[#243247]
          "
        >
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
              sizes="
                (max-width: 640px) 94vw,
                (max-width: 1024px) 46vw,
                (max-width: 1536px) 31vw,
                360px
              "
              quality={70}
              priority={index < 4}
              loading={
                index < 4
                  ? undefined
                  : "lazy"
              }
              decoding="async"
              draggable={false}

              /*
               * مهم جدًا:
               * يمنع Next.js من استخدام
               * /_next/image
               */
              unoptimized

              onError={() => {
                onImageError(recipe.id);
              }}
              className="
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.06]
              "
            />
          ) : (
            <div
              className="
                flex h-full w-full
                items-center
                justify-center
                bg-[#243247]
                text-center
                text-sm
                text-slate-400
              "
            >
              <div className="px-4">
                <div className="mb-2 text-4xl">
                  🍽️
                </div>

                <div>
                  صورة الوصفة غير متاحة
                </div>

                {cardImageUrl && (
                  <div
                    dir="ltr"
                    className="
                      mt-3
                      max-w-full
                      break-all
                      text-[10px]
                      text-slate-500
                    "
                  >
                    {cardImageUrl}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image gradient */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-28
              bg-gradient-to-t
              from-black/70
              via-black/20
              to-transparent
            "
          />

          {/* Category */}
          {categoryLabel && (
            <div
              className="
                absolute
                right-3
                top-3
                rounded-full
                border
                border-white/10
                bg-black/45
                px-3
                py-1
                text-xs
                font-medium
                text-white
                backdrop-blur-md
              "
            >
              {categoryLabel}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col p-5">
          <h2
            className="
              line-clamp-2
              text-lg
              font-bold
              leading-8
              text-white
              transition-colors
              group-hover:text-orange-400
            "
          >
            {recipe.title}
          </h2>

          {recipe.country && (
            <div
              className="
                mt-2
                flex
                items-center
                gap-2
                text-sm
                text-slate-400
              "
            >
              <span>🌍</span>
              <span>
                {recipe.country}
              </span>
            </div>
          )}

          {recipe.excerpt && (
            <p
              className="
                mt-3
                line-clamp-2
                text-sm
                leading-7
                text-slate-400
              "
            >
              {recipe.excerpt}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={tag}
                    className="
                      rounded-full
                      bg-white/[0.05]
                      px-2.5
                      py-1
                      text-[11px]
                      text-slate-400
                    "
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          )}

          <div
            className="
              mt-auto
              flex
              items-center
              justify-between
              pt-4
            "
          >
            {recipe.cookingTimeMinutes ? (
              <span className="text-xs text-slate-500">
                ⏱️{" "}
                {recipe.cookingTimeMinutes} دقيقة
              </span>
            ) : (
              <span />
            )}

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                text-sm
                font-semibold
                text-orange-400
                transition-transform
                group-hover:-translate-x-1
              "
            >
              مشاهدة الوصفة
              <span>←</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RecipesClient({
  recipes,
}: RecipesClientProps) {
  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("الكل");

  const [selectedCountry, setSelectedCountry] =
    useState("الكل");

  const [selectedTag, setSelectedTag] =
    useState("الكل");

  const [sortBy, setSortBy] =
    useState<"latest" | "title">("latest");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  const handleImageError = useCallback(
    (id: number) => {
      setImageErrors((currentErrors) => ({
        ...currentErrors,
        [String(id)]: true,
      }));
    },
    [],
  );

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const categories = useMemo(() => {
    const values = new Set<string>();

    recipes.forEach((recipe) => {
      const category = recipe.category;

      if (Array.isArray(category)) {
        category.forEach((item) => {
          if (item) {
            values.add(item);
          }
        });
      } else if (category) {
        values.add(category);
      }
    });

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(
          b,
          "ar",
        ),
    );
  }, [recipes]);

  const countries = useMemo(() => {
    const values = new Set<string>();

    recipes.forEach((recipe) => {
      if (recipe.country) {
        values.add(recipe.country);
      }
    });

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(
          b,
          "ar",
        ),
    );
  }, [recipes]);

  const tags = useMemo(() => {
    const values = new Set<string>();

    recipes.forEach((recipe) => {
      getTags(recipe.tags).forEach(
        (tag) => {
          if (tag) {
            values.add(tag);
          }
        },
      );
    });

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(
          b,
          "ar",
        ),
    );
  }, [recipes]);

  /* =======================================================
     FILTERED RECIPES
  ======================================================= */

  const filteredRecipes = useMemo(() => {
    const query = search
      .trim()
      .toLocaleLowerCase("ar");

    const result = recipes.filter(
      (recipe) => {
        /* Search */
        if (query) {
          const category =
            getCategoryLabel(
              recipe.category,
            );

          const recipeTags =
            getTags(recipe.tags).join(" ");

          const searchableText = [
            recipe.title,
            recipe.country || "",
            category,
            recipeTags,
            recipe.excerpt || "",
          ]
            .join(" ")
            .toLocaleLowerCase(
              "ar",
            );

          if (
            !searchableText.includes(
              query,
            )
          ) {
            return false;
          }
        }

        /* Category */
        if (
          selectedCategory !== "الكل"
        ) {
          const recipeCategories =
            Array.isArray(
              recipe.category,
            )
              ? recipe.category
              : recipe.category
                ? [recipe.category]
                : [];

          if (
            !recipeCategories.includes(
              selectedCategory,
            )
          ) {
            return false;
          }
        }

        /* Country */
        if (
          selectedCountry !== "الكل" &&
          recipe.country !==
            selectedCountry
        ) {
          return false;
        }

        /* Tag */
        if (
          selectedTag !== "الكل"
        ) {
          const recipeTags =
            getTags(recipe.tags);

          if (
            !recipeTags.includes(
              selectedTag,
            )
          ) {
            return false;
          }
        }

        return true;
      },
    );

    if (sortBy === "title") {
      result.sort((a, b) =>
        a.title.localeCompare(
          b.title,
          "ar",
        ),
      );
    }

    return result;
  }, [
    recipes,
    search,
    selectedCategory,
    selectedCountry,
    selectedTag,
    sortBy,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRecipes.length /
        ITEMS_PER_PAGE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedRecipes =
    filteredRecipes.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE,
    );

  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  const changeSearch = (
    value: string,
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const changeCategory = (
    value: string,
  ) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const changeCountry = (
    value: string,
  ) => {
    setSelectedCountry(value);
    setCurrentPage(1);
  };

  const changeTag = (
    value: string,
  ) => {
    setSelectedTag(value);
    setCurrentPage(1);
  };

  const changeSort = (
    value:
      | "latest"
      | "title",
  ) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("الكل");
    setSelectedCountry("الكل");
    setSelectedTag("الكل");
    setSortBy("latest");
    setCurrentPage(1);
  };

  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    const start = Math.max(
      1,
      safeCurrentPage - 2,
    );

    const end = Math.min(
      totalPages,
      safeCurrentPage + 2,
    );

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  }, [
    safeCurrentPage,
    totalPages,
  ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-[#0b1220]
        text-white
      "
    >
      {/* ================================================
          HEADER
      ================================================= */}
      <section className="border-b border-white/[0.06]">
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-10
            sm:px-6
            lg:px-8
          "
        >
          <div className="text-center">
            <span
              className="
                inline-flex
                rounded-full
                border
                border-orange-500/20
                bg-orange-500/10
                px-4
                py-1.5
                text-xs
                font-semibold
                text-orange-400
              "
            >
              وصفات شيف العرب
            </span>

            <h1
              className="
                mt-4
                text-3xl
                font-black
                sm:text-4xl
                lg:text-5xl
              "
            >
              كل الوصفات
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-slate-400
                sm:text-base
              "
            >
              اكتشف وصفات متنوعة من
              مختلف المطابخ حول العالم
            </p>
          </div>
        </div>
      </section>

      {/* ================================================
          FILTERS
      ================================================= */}
      <section>
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-6
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-white/[0.07]
              bg-[#121c2b]
              p-4
              shadow-xl
              shadow-black/10
              sm:p-5
            "
          >
            {/* Search */}
            <div>
              <label
                htmlFor="recipe-search"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-300
                "
              >
                ابحث عن وصفة
              </label>

              <div className="relative">
                <input
                  id="recipe-search"
                  value={search}
                  onChange={(event) =>
                    changeSearch(
                      event.target.value,
                    )
                  }
                  placeholder="مثال: كبسة، مكرونة، شوربة..."
                  className="
                    h-12
                    w-full
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#0d1624]
                    px-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-slate-500
                    focus:border-orange-500/50
                    focus:ring-2
                    focus:ring-orange-500/10
                  "
                />
              </div>
            </div>

            {/* Filters */}
            <div
              className="
                mt-4
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {/* Category */}
              <div>
                <label
                  htmlFor="recipe-category"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  التصنيف
                </label>

                <select
                  id="recipe-category"
                  value={selectedCategory}
                  onChange={(event) =>
                    changeCategory(
                      event.target.value,
                    )
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0d1624]
                    px-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-orange-500/50
                  "
                >
                  <option value="الكل">
                    كل التصنيفات
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="recipe-country"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  المطبخ / الدولة
                </label>

                <select
                  id="recipe-country"
                  value={selectedCountry}
                  onChange={(event) =>
                    changeCountry(
                      event.target.value,
                    )
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0d1624]
                    px-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-orange-500/50
                  "
                >
                  <option value="الكل">
                    كل المطابخ
                  </option>

                  {countries.map(
                    (country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Tag */}
              <div>
                <label
                  htmlFor="recipe-tag"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  الوسم
                </label>

                <select
                  id="recipe-tag"
                  value={selectedTag}
                  onChange={(event) =>
                    changeTag(
                      event.target.value,
                    )
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0d1624]
                    px-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-orange-500/50
                  "
                >
                  <option value="الكل">
                    كل الوسوم
                  </option>

                  {tags.map((tag) => (
                    <option
                      key={tag}
                      value={tag}
                    >
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label
                  htmlFor="recipe-sort"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  الترتيب
                </label>

                <select
                  id="recipe-sort"
                  value={sortBy}
                  onChange={(event) =>
                    changeSort(
                      event.target
                        .value as
                        | "latest"
                        | "title",
                    )
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0d1624]
                    px-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-orange-500/50
                  "
                >
                  <option value="latest">
                    الأحدث
                  </option>

                  <option value="title">
                    حسب الاسم
                  </option>
                </select>
              </div>
            </div>

            {/* Filter bottom */}
            <div
              className="
                mt-4
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="text-sm text-slate-400">
                عدد الوصفات:
                <span className="mr-1 font-bold text-white">
                  {filteredRecipes.length}
                </span>
              </div>

              {(search ||
                selectedCategory !==
                  "الكل" ||
                selectedCountry !==
                  "الكل" ||
                selectedTag !==
                  "الكل") && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-slate-300
                    transition
                    hover:border-orange-500/30
                    hover:text-orange-400
                  "
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          RECIPES
      ================================================= */}
      <main>
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            pb-10
            sm:px-6
            lg:px-8
          "
        >
          {paginatedRecipes.length >
          0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {paginatedRecipes.map(
                (recipe, index) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={
                      startIndex +
                      index
                    }
                    hasImageError={
                      Boolean(
                        imageErrors[
                          String(
                            recipe.id,
                          )
                        ],
                      )
                    }
                    onImageError={
                      handleImageError
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <div
              className="
                rounded-3xl
                border
                border-white/[0.07]
                bg-[#121c2b]
                px-6
                py-16
                text-center
              "
            >
              <div className="text-5xl">
                🔎
              </div>

              <h2
                className="
                  mt-4
                  text-xl
                  font-bold
                  text-white
                "
              >
                لم يتم العثور على
                وصفات
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-400
                "
              >
                جرّب تغيير كلمات البحث
                أو الفلاتر.
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="
                  mt-5
                  rounded-xl
                  bg-orange-500
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-orange-400
                "
              >
                مسح الفلاتر
              </button>
            </div>
          )}

          {/* ==============================================
              PAGINATION
          =============================================== */}
          {totalPages > 1 && (
            <nav
              aria-label="تنقل صفحات الوصفات"
              className="
                mt-10
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <button
                type="button"
                disabled={
                  safeCurrentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1,
                      ),
                  )
                }
                className="
                  h-10
                  rounded-xl
                  border
                  border-white/10
                  bg-[#121c2b]
                  px-4
                  text-sm
                  text-slate-300
                  transition
                  hover:border-orange-500/30
                  hover:text-orange-400
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                السابق
              </button>

              {pageNumbers.map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page,
                      )
                    }
                    className={`
                      flex
                      h-10
                      min-w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      px-3
                      text-sm
                      font-semibold
                      transition
                      ${
                        page ===
                        safeCurrentPage
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-white/10 bg-[#121c2b] text-slate-300 hover:border-orange-500/30 hover:text-orange-400"
                      }
                    `}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1,
                      ),
                  )
                }
                className="
                  h-10
                  rounded-xl
                  border
                  border-white/10
                  bg-[#121c2b]
                  px-4
                  text-sm
                  text-slate-300
                  transition
                  hover:border-orange-500/30
                  hover:text-orange-400
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                التالي
              </button>
            </nav>
          )}
        </div>
      </main>
    </div>
  );
}