// SearchFloating.jsx
"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  ChefHat,
  ArrowUpLeft,
  Command,
  UtensilsCrossed,
} from "lucide-react";
import recipes from "@/data/recipes-search.json";

/*
|--------------------------------------------------------------------------
| توحيد النص العربي
|--------------------------------------------------------------------------
*/

function normalizeArabic(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ـ/g, "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
|--------------------------------------------------------------------------
| الكلمات التي لا تؤثر في البحث
|--------------------------------------------------------------------------
*/

const STOP_WORDS = new Set(
  [
    "طريقة",
    "طريقه",
    "عمل",
    "وصفة",
    "وصفه",
    "تحضير",
    "كيفية",
    "كيفيه",
    "ازاي",
    "كيف",
    "عايز",
    "عاوزه",
    "اريد",
    "ابغى",
    "ممكن",
  ].map(normalizeArabic)
);

/*
|--------------------------------------------------------------------------
| مرادفات عربية شائعة
|--------------------------------------------------------------------------
*/

const SYNONYM_GROUPS = [
  ["دجاج", "فراخ", "فراخى", "فراخي"],
  ["لحم", "لحمة", "لحمه"],
  ["ارز", "أرز", "رز"],
  ["بطاطس", "بطاطا"],
  ["طماطم", "بندورة", "بندوره"],
  ["جبنة", "جبنه", "جبن"],
  ["مكرونة", "مكرونه", "باستا"],
  ["شوربة", "شوربه", "حساء"],
  ["فطور", "فطار", "افطار", "إفطار"],
  ["حلويات", "حلوى", "حلو", "حلى", "تحلية", "تحليه"],
  ["سمك", "اسماك", "أسماك"],
  ["جمبري", "روبيان", "قريدس"],
  ["باذنجان", "بتنجان"],
  ["فلفل", "فليفلة", "فليفله"],
  ["زبادي", "لبن رائب", "لبن رايب"],
  ["سريع", "سريعة", "سريعه"],
  ["سهل", "سهلة", "سهله"],
  ["مشوي", "مشوية", "مشويه"],
  ["مقلي", "مقلية", "مقليه"],
  ["مخبوز", "مخبوزة", "مخبوزه"],
  ["حار", "حارة", "حاره", "سبايسي"],
  ["بارد", "باردة", "بارده"],
  ["بيض", "بيضة", "بيضه"],
  ["خبز", "عيش", "رغيف"],
  ["صلصة", "صوص", "صوصات"],
];

const SYNONYM_MAP = new Map();

SYNONYM_GROUPS.forEach((group) => {
  const normalizedGroup = [
    ...new Set(group.map(normalizeArabic).filter(Boolean)),
  ];

  normalizedGroup.forEach((word) => {
    SYNONYM_MAP.set(word, normalizedGroup);
  });
});

/*
|--------------------------------------------------------------------------
| اقتراحات البحث السريع
|--------------------------------------------------------------------------
*/

const QUICK_SEARCHES = [
  "دجاج",
  "حلويات",
  "فطور",
  "أرز",
  "معجنات",
  "وصفة سريعة",
];

/*
|--------------------------------------------------------------------------
| تحويل أي بيانات إلى نص قابل للبحث
|--------------------------------------------------------------------------
*/

function collectStrings(value) {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

function tokenize(value) {
  const normalized = normalizeArabic(value);

  if (!normalized) {
    return [];
  }

  return normalized.split(/\s+/).filter(Boolean);
}

function getMeaningfulTokens(value) {
  const allTokens = tokenize(value);

  const usefulTokens = allTokens.filter(
    (word) => !STOP_WORDS.has(word)
  );

  return usefulTokens.length > 0 ? usefulTokens : allTokens;
}

/*
|--------------------------------------------------------------------------
| أشكال مختلفة للكلمة
|--------------------------------------------------------------------------
*/

function getBasicVariants(word) {
  const normalizedWord = normalizeArabic(word);
  const variants = new Set();

  if (!normalizedWord) {
    return variants;
  }

  variants.add(normalizedWord);

  if (
    normalizedWord.startsWith("ال") &&
    normalizedWord.length > 4
  ) {
    variants.add(normalizedWord.slice(2));
  }

  if (
    normalizedWord.startsWith("و") &&
    normalizedWord.length > 4
  ) {
    variants.add(normalizedWord.slice(1));
  }

  return variants;
}

function expandToken(word) {
  const results = new Set();
  const queue = [...getBasicVariants(word)];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || results.has(current)) {
      continue;
    }

    results.add(current);

    const synonyms = SYNONYM_MAP.get(current) || [];

    synonyms.forEach((synonym) => {
      getBasicVariants(synonym).forEach((variant) => {
        if (!results.has(variant)) {
          queue.push(variant);
        }
      });
    });
  }

  return results;
}

/*
|--------------------------------------------------------------------------
| تحمل الأخطاء الإملائية البسيطة
|--------------------------------------------------------------------------
*/

function levenshteinDistance(firstWord, secondWord) {
  const first = String(firstWord || "");
  const second = String(secondWord || "");

  if (first === second) {
    return 0;
  }

  if (!first.length) {
    return second.length;
  }

  if (!second.length) {
    return first.length;
  }

  const previousRow = Array.from(
    { length: second.length + 1 },
    (_, index) => index
  );

  for (
    let firstIndex = 1;
    firstIndex <= first.length;
    firstIndex += 1
  ) {
    const currentRow = [firstIndex];

    for (
      let secondIndex = 1;
      secondIndex <= second.length;
      secondIndex += 1
    ) {
      const insertCost =
        currentRow[secondIndex - 1] + 1;

      const deleteCost =
        previousRow[secondIndex] + 1;

      const replaceCost =
        previousRow[secondIndex - 1] +
        (first[firstIndex - 1] ===
        second[secondIndex - 1]
          ? 0
          : 1);

      currentRow[secondIndex] = Math.min(
        insertCost,
        deleteCost,
        replaceCost
      );
    }

    for (
      let index = 0;
      index < currentRow.length;
      index += 1
    ) {
      previousRow[index] = currentRow[index];
    }
  }

  return previousRow[second.length];
}

function isCloseWord(queryWord, recipeWord) {
  if (!queryWord || !recipeWord) {
    return false;
  }

  if (queryWord.length < 4 || recipeWord.length < 4) {
    return false;
  }

  const lengthDifference = Math.abs(
    queryWord.length - recipeWord.length
  );

  if (lengthDifference > 2) {
    return false;
  }

  const allowedDistance =
    Math.max(queryWord.length, recipeWord.length) >= 7
      ? 2
      : 1;

  return (
    levenshteinDistance(queryWord, recipeWord) <=
    allowedDistance
  );
}

/*
|--------------------------------------------------------------------------
| تجهيز وصف مختصر للنتيجة
|--------------------------------------------------------------------------
*/

function getRecipeMeta(recipe) {
  const values = [
    recipe?.country,
    ...(Array.isArray(recipe?.category)
      ? recipe.category
      : []),
    ...(Array.isArray(recipe?.tags) ? recipe.tags : []),
  ]
    .filter(Boolean)
    .map(String);

  return [...new Set(values)].slice(0, 2).join(" • ");
}

/*
|--------------------------------------------------------------------------
| حساب تطابق كل كلمة
|--------------------------------------------------------------------------
*/

function getTokenMatchScore(queryToken, recipe) {
  const variants = [...expandToken(queryToken)].filter(
    (word) => word.length >= 2
  );

  let bestScore = 0;

  for (const variant of variants) {
    if (recipe.titleTokenSet.has(variant)) {
      bestScore = Math.max(bestScore, 45);
      continue;
    }

    if (recipe.titleNorm.startsWith(variant)) {
      bestScore = Math.max(bestScore, 40);
    }

    if (recipe.titleNorm.includes(variant)) {
      bestScore = Math.max(bestScore, 35);
    }

    const titlePrefixMatch = recipe.titleTokens.some(
      (recipeToken) =>
        recipeToken.startsWith(variant) ||
        variant.startsWith(recipeToken)
    );

    if (titlePrefixMatch) {
      bestScore = Math.max(bestScore, 30);
    }

    if (recipe.searchTokenSet.has(variant)) {
      bestScore = Math.max(bestScore, 22);
    }

    const searchPrefixMatch = recipe.searchTokens.some(
      (recipeToken) =>
        recipeToken.startsWith(variant) ||
        variant.startsWith(recipeToken)
    );

    if (searchPrefixMatch) {
      bestScore = Math.max(bestScore, 16);
    }
  }

  if (bestScore > 0) {
    return bestScore;
  }

  for (const variant of variants) {
    const closeTitleWord = recipe.titleTokens.some(
      (recipeToken) =>
        isCloseWord(variant, recipeToken)
    );

    if (closeTitleWord) {
      return 18;
    }
  }

  for (const variant of variants) {
    const closeSearchWord = recipe.searchTokens.some(
      (recipeToken) =>
        isCloseWord(variant, recipeToken)
    );

    if (closeSearchWord) {
      return 10;
    }
  }

  return 0;
}

/*
|--------------------------------------------------------------------------
| ترتيب النتائج
|--------------------------------------------------------------------------
*/

function calculateRecipeScore(recipe, query) {
  const normalizedQuery = normalizeArabic(query);
  const queryTokens = getMeaningfulTokens(query);

  if (!normalizedQuery || queryTokens.length === 0) {
    return null;
  }

  let score = 0;
  let matchedTokens = 0;

  const meaningfulPhrase = queryTokens.join(" ");

  const phrases = [
    ...new Set(
      [normalizedQuery, meaningfulPhrase].filter(Boolean)
    ),
  ];

  phrases.forEach((phrase) => {
    if (recipe.titleNorm === phrase) {
      score += 170;
    } else if (recipe.titleNorm.startsWith(phrase)) {
      score += 115;
    } else if (recipe.titleNorm.includes(phrase)) {
      score += 85;
    } else if (recipe.searchNorm.includes(phrase)) {
      score += 35;
    }
  });

  queryTokens.forEach((queryToken) => {
    const tokenScore = getTokenMatchScore(
      queryToken,
      recipe
    );

    if (tokenScore > 0) {
      matchedTokens += 1;
      score += tokenScore;
    }
  });

  if (matchedTokens === 0) {
    return null;
  }

  const coverage =
    matchedTokens / queryTokens.length;

  score += Math.round(coverage * 40);

  if (matchedTokens === queryTokens.length) {
    score += 45;
  }

  score -= Math.min(recipe.titleNorm.length / 30, 5);

  return {
    score,
    matchedTokens,
    coverage,
  };
}

/*
|--------------------------------------------------------------------------
| تمييز كلمات البحث
|--------------------------------------------------------------------------
*/

function highlightTitle(text, query) {
  const queryTokens = getMeaningfulTokens(query);
  const queryVariants = new Set();

  queryTokens.forEach((token) => {
    expandToken(token).forEach((variant) => {
      queryVariants.add(variant);
    });
  });

  return String(text || "")
    .split(/(\s+)/)
    .map((part, index) => {
      if (!part.trim()) {
        return part;
      }

      const normalizedPart = normalizeArabic(part);

      if (!normalizedPart) {
        return part;
      }

      const partVariants = expandToken(normalizedPart);

      const matched = [...queryVariants].some(
        (queryVariant) => {
          if (partVariants.has(queryVariant)) {
            return true;
          }

          if (
            queryVariant.length >= 3 &&
            normalizedPart.startsWith(queryVariant)
          ) {
            return true;
          }

          if (
            normalizedPart.length >= 3 &&
            queryVariant.startsWith(normalizedPart)
          ) {
            return true;
          }

          return isCloseWord(
            queryVariant,
            normalizedPart
          );
        }
      );

      if (!matched) {
        return part;
      }

      return (
        <mark
          key={`${part}-${index}`}
          className="rounded-md bg-orange-500/15 px-0.5 font-bold text-orange-500"
        >
          {part}
        </mark>
      );
    });
}

/*
|--------------------------------------------------------------------------
| المكوّن
|--------------------------------------------------------------------------
*/

export default function SearchFloating({
  footerSelector = "#site-footer",
}) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] =
    useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [footerVisible, setFooterVisible] = useState(false);

  const debounceTimeout = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | بناء فهرس البحث مرة واحدة
  |--------------------------------------------------------------------------
  */

  const recipesIndex = useMemo(() => {
    return (Array.isArray(recipes) ? recipes : [])
      .map((recipe) => {
        const slug = String(
          recipe?.slug || recipe?.id || ""
        ).trim();

        const title = String(
          recipe?.title || "وصفة بدون عنوان"
        ).trim();

        const searchableFields = [
          title,
          recipe?.country,
          recipe?.tags,
          recipe?.category,
          recipe?.intro,
          recipe?.description,
          recipe?.ingredients,
          recipe?.data_box?.meal_type,
          recipe?.data_box?.dish_type,
          recipe?.data_box?.difficulty,
        ];

        const searchText = collectStrings(
          searchableFields
        )
          .filter(Boolean)
          .join(" ");

        const titleNorm = normalizeArabic(title);
        const searchNorm = normalizeArabic(searchText);

        const titleTokens = [
          ...new Set(tokenize(titleNorm)),
        ];

        const searchTokens = [
          ...new Set(tokenize(searchNorm)),
        ];

        return {
          slug,
          title,
          meta: getRecipeMeta(recipe),
          titleNorm,
          searchNorm,
          titleTokens,
          searchTokens,
          titleTokenSet: new Set(titleTokens),
          searchTokenSet: new Set(searchTokens),
        };
      })
      .filter((recipe) => recipe.slug && recipe.title);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Debounce
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 160);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  /*
  |--------------------------------------------------------------------------
  | النتائج
  |--------------------------------------------------------------------------
  */

  const filteredResults = useMemo(() => {
    const normalizedQuery =
      normalizeArabic(debouncedTerm);

    if (normalizedQuery.length < 2) {
      return [];
    }

    const results = [];

    for (const recipe of recipesIndex) {
      const match = calculateRecipeScore(
        recipe,
        debouncedTerm
      );

      if (!match) {
        continue;
      }

      results.push({
        ...recipe,
        ...match,
      });
    }

    return results
      .sort((firstRecipe, secondRecipe) => {
        if (
          secondRecipe.score !== firstRecipe.score
        ) {
          return (
            secondRecipe.score - firstRecipe.score
          );
        }

        if (
          secondRecipe.coverage !==
          firstRecipe.coverage
        ) {
          return (
            secondRecipe.coverage -
            firstRecipe.coverage
          );
        }

        return (
          firstRecipe.title.length -
          secondRecipe.title.length
        );
      })
      .slice(0, 10);
  }, [debouncedTerm, recipesIndex]);

  const hasQuery =
    normalizeArabic(searchTerm).length > 0;

  const hasEnoughCharacters =
    normalizeArabic(debouncedTerm).length >= 2;

  const isSearching =
    searchTerm !== debouncedTerm && hasQuery;

  /*
  |--------------------------------------------------------------------------
  | فتح وإغلاق البحث
  |--------------------------------------------------------------------------
  */

  const openSearch = useCallback(() => {
    setOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setSearchTerm("");
    setDebouncedTerm("");
    setActiveIndex(0);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | إخفاء زر البحث عند ظهور الفوتر
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const footerElement = document.querySelector(footerSelector);

    if (!footerElement) {
      setFooterVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isFooterVisible = entry.isIntersecting;

        setFooterVisible(isFooterVisible);

        // إغلاق البحث وتنظيفه عند الوصول إلى الفوتر.
        if (isFooterVisible) {
          closeSearch();
        }
      },
      {
        root: null,
        threshold: 0.01,
        // يخفي الزر قبل ملامسة الفوتر بقليل حتى لا يغطي محتواه.
        rootMargin: "0px 0px 40px 0px",
      }
    );

    observer.observe(footerElement);

    return () => {
      observer.disconnect();
    };
  }, [footerSelector, closeSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedTerm("");
    setActiveIndex(0);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  /*
  |--------------------------------------------------------------------------
  | فتح وصفة
  |--------------------------------------------------------------------------
  */

  const openRecipe = useCallback(
    (recipe) => {
      if (!recipe?.slug) {
        return;
      }

      router.push(
        `/recipe/${encodeURIComponent(recipe.slug)}`
      );

      closeSearch();
    },
    [router, closeSearch]
  );

  /*
  |--------------------------------------------------------------------------
  | اختيار اقتراح سريع
  |--------------------------------------------------------------------------
  */

  const selectQuickSearch = useCallback((value) => {
    setSearchTerm(value);
    setDebouncedTerm(value);
    setActiveIndex(0);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  /*
  |--------------------------------------------------------------------------
  | إعادة تحديد أول نتيجة
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedTerm]);

  /*
  |--------------------------------------------------------------------------
  | إظهار النتيجة النشطة داخل القائمة
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!resultsRef.current) {
      return;
    }

    const activeElement =
      resultsRef.current.querySelector(
        `[data-result-index="${activeIndex}"]`
      );

    activeElement?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeIndex]);

  /*
  |--------------------------------------------------------------------------
  | الضغط خارج البحث
  |--------------------------------------------------------------------------
  */

  const handleClickOutside = useCallback(
    (event) => {
      if (
        boxRef.current &&
        !boxRef.current.contains(event.target)
      ) {
        closeSearch();
      }
    },
    [closeSearch]
  );

  useEffect(() => {
    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "touchstart",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "touchstart",
        handleClickOutside
      );
    };
  }, [handleClickOutside]);

  /*
  |--------------------------------------------------------------------------
  | اختصار Ctrl + K
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleShortcut = (event) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (!isShortcut) {
        return;
      }

      event.preventDefault();

      if (open) {
        inputRef.current?.focus();
      } else {
        setOpen(true);
      }
    };

    document.addEventListener(
      "keydown",
      handleShortcut
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleShortcut
      );
    };
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | التركيز التلقائي
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timeout);
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | التنقل بلوحة المفاتيح
  |--------------------------------------------------------------------------
  */

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        closeSearch();
        return;
      }

      if (!filteredResults.length) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setActiveIndex((current) =>
          current >= filteredResults.length - 1
            ? 0
            : current + 1
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setActiveIndex((current) =>
          current <= 0
            ? filteredResults.length - 1
            : current - 1
        );

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const selectedRecipe =
          filteredResults[activeIndex] ||
          filteredResults[0];

        openRecipe(selectedRecipe);
      }
    },
    [
      activeIndex,
      filteredResults,
      closeSearch,
      openRecipe,
    ]
  );

  if (footerVisible) {
    return null;
  }

  return (
    <div
      ref={boxRef}
      dir="rtl"
      className="fixed bottom-44 right-3 z-[9999] sm:right-6"
    >
      <AnimatePresence mode="wait">
        {!open ? (
          /*
          |--------------------------------------------------------------------------
          | زر البحث الثابت
          |--------------------------------------------------------------------------
          */

          <motion.button
            key="closed-search-button"
            type="button"
            aria-label="فتح البحث الذكي"
            initial={{
              opacity: 0,
              scale: 0.75,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.75,
            }}
            whileHover={{
              scale: 1.06,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={openSearch}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-[0_18px_45px_-15px_rgba(249,115,22,0.85)] outline-none transition-shadow duration-300 hover:shadow-[0_22px_55px_-15px_rgba(249,115,22,1)] focus-visible:ring-4 focus-visible:ring-orange-300/60"
          >
            <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />

            <Search
              size={25}
              strokeWidth={2.4}
              className="relative z-10"
            />
          </motion.button>
        ) : (
          /*
          |--------------------------------------------------------------------------
          | صندوق البحث
          |--------------------------------------------------------------------------
          */

          <motion.section
            key="opened-search"
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 18,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 18,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 27,
            }}
            className="w-[calc(100vw-1.5rem)] max-w-[410px] overflow-hidden rounded-[26px] border border-white/10 bg-[#111827]/95 shadow-[0_30px_80px_-25px_rgba(0,0,0,0.75)] backdrop-blur-2xl dark:border-gray-200/70 dark:bg-white/95"
          >
            {/*
            |--------------------------------------------------------------------------
            | رأس الصندوق
            |--------------------------------------------------------------------------
            */}

            <div className="relative overflow-hidden border-b border-white/10 px-4 pb-4 pt-4 dark:border-gray-200">
              <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

              <div className="relative mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25">
                    <ChefHat
                      size={21}
                      strokeWidth={2.2}
                    />
                  </div>

                  <div>
                    <h2 className="flex items-center gap-1.5 text-sm font-bold text-white dark:text-gray-900">
                      البحث الذكي

                      <Sparkles
                        size={14}
                        className="text-orange-400"
                      />
                    </h2>

                    <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                      اكتب كلمة واحدة وسنجد الأقرب
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="إغلاق البحث"
                  onClick={closeSearch}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition duration-200 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400 dark:border-gray-200 dark:bg-gray-100 dark:text-gray-500 dark:hover:bg-red-50 dark:hover:text-red-500"
                >
                  <X
                    size={18}
                    strokeWidth={2.2}
                  />
                </button>
              </div>

              {/*
              |--------------------------------------------------------------------------
              | حقل البحث
              |--------------------------------------------------------------------------
              */}

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  {isSearching ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-orange-500 dark:border-gray-300 dark:border-t-orange-500" />
                  ) : (
                    <Search
                      size={20}
                      className="text-orange-500"
                    />
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="search"
                  value={searchTerm}
                  autoComplete="off"
                  enterKeyHint="search"
                  aria-label="ابحث عن وصفة"
                  placeholder="مثال: دجاج، رز، حلويات..."
                  onKeyDown={handleKeyDown}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                  className="h-[54px] w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-12 pr-12 text-sm font-medium text-white outline-none transition duration-200 placeholder:text-gray-500 focus:border-orange-500/70 focus:bg-black/30 focus:ring-4 focus:ring-orange-500/10 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-900 dark:placeholder:text-gray-400 dark:focus:bg-white sm:text-[15px]"
                />

                {hasQuery ? (
                  <button
                    type="button"
                    aria-label="مسح البحث"
                    onClick={clearSearch}
                    className="absolute inset-y-0 left-3 my-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/10 hover:text-white dark:hover:bg-gray-200 dark:hover:text-gray-800"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <div className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-gray-500 dark:border-gray-200 dark:bg-white sm:flex">
                      <Command size={11} />
                      <span>K</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | المحتوى والنتائج
            |--------------------------------------------------------------------------
            */}

            <div className="bg-gradient-to-b from-transparent to-black/10 dark:to-gray-50">
              <AnimatePresence mode="wait">
                {!hasQuery ? (
                  /*
                  |--------------------------------------------------------------------------
                  | الاقتراحات السريعة
                  |--------------------------------------------------------------------------
                  */

                  <motion.div
                    key="quick-searches"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-xs font-bold text-gray-300 dark:text-gray-700">
                        <Sparkles
                          size={14}
                          className="text-orange-500"
                        />

                        اقتراحات سريعة
                      </p>

                      <span className="text-[10px] text-gray-500">
                        اختر بكلمة واحدة
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {QUICK_SEARCHES.map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() =>
                              selectQuickSearch(
                                suggestion
                              )
                            }
                            className="group flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-gray-300 transition duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 dark:border-gray-200 dark:bg-white dark:text-gray-600 dark:hover:border-orange-300 dark:hover:bg-orange-50 dark:hover:text-orange-600"
                          >
                            <UtensilsCrossed
                              size={13}
                              className="text-gray-500 transition group-hover:text-orange-500"
                            />

                            {suggestion}
                          </button>
                        )
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-orange-500/15 bg-orange-500/[0.06] p-3">
                      <p className="flex items-start gap-2 text-[11px] leading-5 text-gray-400 dark:text-gray-500">
                        <Sparkles
                          size={14}
                          className="mt-0.5 shrink-0 text-orange-500"
                        />

                        يفهم البحث كلمات مثل فراخ بدل
                        دجاج، رز بدل أرز، وبندورة بدل
                        طماطم.
                      </p>
                    </div>
                  </motion.div>
                ) : !hasEnoughCharacters ? (
                  /*
                  |--------------------------------------------------------------------------
                  | أقل من حرفين
                  |--------------------------------------------------------------------------
                  */

                  <motion.div
                    key="minimum-characters"
                    initial={{
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="flex flex-col items-center justify-center px-6 py-9 text-center"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                      <Search size={23} />
                    </div>

                    <p className="text-sm font-bold text-gray-200 dark:text-gray-700">
                      أكمل كتابة الكلمة
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      اكتب حرفين على الأقل لعرض النتائج
                    </p>
                  </motion.div>
                ) : filteredResults.length > 0 ? (
                  /*
                  |--------------------------------------------------------------------------
                  | قائمة النتائج
                  |--------------------------------------------------------------------------
                  */

                  <motion.div
                    key="search-results"
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-center justify-between px-4 pb-2 pt-3">
                      <p className="text-[11px] font-medium text-gray-500">
                        وجدنا {filteredResults.length} نتائج
                        مناسبة
                      </p>

                      <p className="hidden text-[10px] text-gray-600 sm:block dark:text-gray-400">
                        ↑ ↓ للتنقل • Enter للفتح
                      </p>
                    </div>

                    <div
                      ref={resultsRef}
                      className="max-h-[340px] overflow-y-auto px-2 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-orange-500/60"
                    >
                      {filteredResults.map(
                        (recipe, index) => {
                          const isActive =
                            activeIndex === index;

                          return (
                            <Link
                              key={recipe.slug}
                              data-result-index={index}
                              href={`/recipe/${encodeURIComponent(
                                recipe.slug
                              )}`}
                              onClick={closeSearch}
                              onMouseEnter={() =>
                                setActiveIndex(index)
                              }
                              className={`group relative mb-1 flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 transition-all duration-200 ${
                                isActive
                                  ? "border-orange-500/40 bg-orange-500/10 shadow-[0_10px_30px_-18px_rgba(249,115,22,0.8)]"
                                  : "border-transparent hover:border-white/10 hover:bg-white/[0.04] dark:hover:border-gray-200 dark:hover:bg-white"
                              }`}
                            >
                              {isActive && (
                                <motion.span
                                  layoutId="active-search-result"
                                  className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-orange-500"
                                  transition={{
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 35,
                                  }}
                                />
                              )}

                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-200 ${
                                  isActive
                                    ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                                    : "bg-white/[0.05] text-gray-500 group-hover:bg-orange-500/10 group-hover:text-orange-500 dark:bg-gray-100"
                                }`}
                              >
                                <ChefHat
                                  size={20}
                                  strokeWidth={2}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`line-clamp-2 text-[13px] font-bold leading-6 transition ${
                                    isActive
                                      ? "text-white dark:text-gray-900"
                                      : "text-gray-200 group-hover:text-white dark:text-gray-700 dark:group-hover:text-gray-900"
                                  }`}
                                >
                                  {highlightTitle(
                                    recipe.title,
                                    debouncedTerm
                                  )}
                                </p>

                                {recipe.meta && (
                                  <p className="mt-0.5 truncate text-[10px] text-gray-500">
                                    {recipe.meta}
                                  </p>
                                )}
                              </div>

                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200 ${
                                  isActive
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-600 group-hover:bg-orange-500/10 group-hover:text-orange-500"
                                }`}
                              >
                                <ArrowUpLeft
                                  size={16}
                                  strokeWidth={2.2}
                                />
                              </div>

                              {index === 0 && (
                                <span className="absolute left-3 top-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">
                                  الأقرب
                                </span>
                              )}
                            </Link>
                          );
                        }
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /*
                  |--------------------------------------------------------------------------
                  | لا توجد نتائج
                  |--------------------------------------------------------------------------
                  */

                  <motion.div
                    key="no-results"
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="flex flex-col items-center justify-center px-6 py-10 text-center"
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-xl" />

                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
                        <UtensilsCrossed size={25} />
                      </div>
                    </div>

                    <p className="text-sm font-bold text-gray-200 dark:text-gray-700">
                      لم نجد وصفة مطابقة
                    </p>

                    <p className="mt-1 max-w-[260px] text-xs leading-5 text-gray-500">
                      جرّب كلمة أبسط مثل دجاج، أرز،
                      بطاطس أو حلويات.
                    </p>

                    <button
                      type="button"
                      onClick={clearSearch}
                      className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600 active:scale-95"
                    >
                      البحث بكلمة أخرى
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | الشريط السفلي
            |--------------------------------------------------------------------------
            */}

            <div className="flex items-center justify-between border-t border-white/10 bg-black/10 px-4 py-2.5 text-[10px] text-gray-500 dark:border-gray-200 dark:bg-gray-50">
              <span className="flex items-center gap-1.5">
                <Sparkles
                  size={12}
                  className="text-orange-500"
                />

                بحث سريع وذكي
              </span>

              
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}