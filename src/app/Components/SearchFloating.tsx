"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowUpLeft,
  ChefHat,
  Command,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 220;
const MAX_RESULTS = 10;
const MAX_SMART_QUERIES = 4;

const SEARCH_SUGGESTIONS = [
  { title: "دجاج", icon: "🍗" },
  { title: "أرز", icon: "🍚" },
  { title: "حلويات", icon: "🍰" },
  { title: "مكرونة", icon: "🍝" },
  { title: "عصائر", icon: "🍹" },
  { title: "رمضان", icon: "🌙" },
  { title: "نباتية", icon: "🌱" },
  { title: "مخبوزات ومعجنات", icon: "🥐" },
] as const;

const ARABIC_SEARCH_SYNONYMS: Record<string, string[]> = {
  دجاج: ["فراخ"],
  فراخ: ["دجاج"],
  فرخة: ["دجاج", "فراخ"],
  رز: ["أرز"],
  ارز: ["أرز", "رز"],
  أرز: ["رز"],
  مكرونه: ["مكرونة", "باستا"],
  مكرونة: ["مكرونه", "باستا"],
  باستا: ["مكرونة"],
  حلويات: ["حلوى", "حلى"],
  حلوى: ["حلويات"],
  بطاطا: ["بطاطس"],
  بطاطس: ["بطاطا"],
  بندورة: ["طماطم"],
  طماطم: ["بندورة"],
  كوسا: ["كوسة"],
  كوسة: ["كوسا"],
  باذنجان: ["بتنجان"],
  بتنجان: ["باذنجان"],
};

type SearchResult = {
  id?: number | string;
  title: string;
  slug: string;
  country?: string | null;
  category?: string | string[] | null;
};

type SearchResponse = {
  results?: SearchResult[];
};

/* =========================================================
   Helpers
========================================================= */

function normalizeArabic(value: unknown): string {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ar");
}

function normalizeQuery(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildSmartQueries(query: string): string[] {
  const clean = normalizeQuery(query);
  const normalized = normalizeArabic(clean);
  const queries = [clean];

  if (normalized && normalized !== clean) {
    queries.push(normalized);
  }

  const tokens = normalized.split(" ").filter(Boolean);
  for (const token of tokens) {
    const synonyms = Object.entries(ARABIC_SEARCH_SYNONYMS)
      .filter(([key]) => normalizeArabic(key) === token)
      .flatMap(([, values]) => values);

    for (const synonym of synonyms) {
      const nextTokens = [...tokens];
      const index = nextTokens.indexOf(token);
      if (index >= 0) {
        nextTokens[index] = normalizeArabic(synonym);
      }
      const expanded = nextTokens.join(" ").trim();
      if (expanded) {
        queries.push(expanded);
      }
      if (queries.length >= MAX_SMART_QUERIES) break;
    }
    if (queries.length >= MAX_SMART_QUERIES) break;
  }

  return uniqueStrings(queries).slice(0, MAX_SMART_QUERIES);
}

function textParts(recipe: SearchResult): string[] {
  const category = resultCategory(recipe.category);
  return [recipe.title, recipe.country || "", category]
    .map((value) => normalizeArabic(value))
    .filter(Boolean);
}

function scoreSearchResult(
  recipe: SearchResult,
  query: string,
  matchedQueries: string[] = [query],
): number {
  const title = normalizeArabic(recipe.title);
  const meta = textParts(recipe).slice(1).join(" ");
  let bestScore = 0;

  for (const candidate of matchedQueries) {
    const normalizedQuery = normalizeArabic(candidate);
    const tokens = normalizedQuery.split(" ").filter(Boolean);
    if (!normalizedQuery || !title) continue;

    let score = 0;
    const isOriginal = normalizeArabic(candidate) === normalizeArabic(query);
    const sourceBoost = isOriginal ? 1 : 0.82;

    if (title === normalizedQuery) score += 1000 * sourceBoost;
    if (title.startsWith(normalizedQuery)) score += 650 * sourceBoost;
    if (title.includes(normalizedQuery)) score += 480 * sourceBoost;
    if (meta.includes(normalizedQuery)) score += 180 * sourceBoost;

    for (const token of tokens) {
      if (token.length < 2) continue;
      if (title.includes(token)) score += 90 * sourceBoost;
      else if (meta.includes(token)) score += 35 * sourceBoost;
    }

    bestScore = Math.max(bestScore, score);
  }

  return bestScore;
}

function rankSearchResults(
  results: SearchResult[],
  query: string,
  matchedQueries: string[] = [query],
): SearchResult[] {
  const bySlug = new Map<string, SearchResult>();

  for (const recipe of results) {
    if (!recipe?.slug) continue;
    const key = String(recipe.slug);
    const current = bySlug.get(key);
    if (
      !current ||
      scoreSearchResult(recipe, query, matchedQueries) >
        scoreSearchResult(current, query, matchedQueries)
    ) {
      bySlug.set(key, recipe);
    }
  }

  return Array.from(bySlug.values())
    .map((recipe, index) => ({
      recipe,
      score: scoreSearchResult(recipe, query, matchedQueries),
      index,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ recipe }) => recipe)
    .slice(0, MAX_RESULTS);
}

function resultCategory(value: SearchResult["category"]): string {
  if (Array.isArray(value)) {
    return value.find(Boolean) || "";
  }

  return typeof value === "string" ? value : "";
}

function resultMeta(recipe: SearchResult): string {
  return [recipe.country, resultCategory(recipe.category)]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" • ");
}

/* =========================================================
   Footer visibility
========================================================= */

function useFooterVisibility() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");

    if (!footer) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const checkFooter = () => {
        const rect = footer.getBoundingClientRect();
        const nearFooter =
          rect.top <= window.innerHeight + 80 && rect.bottom >= 0;

        setVisible(nearFooter);
      };

      checkFooter();
      window.addEventListener("scroll", checkFooter, { passive: true });
      window.addEventListener("resize", checkFooter, { passive: true });

      return () => {
        window.removeEventListener("scroll", checkFooter);
        window.removeEventListener("resize", checkFooter);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(Boolean(entry?.isIntersecting));
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px 80px 0px",
      },
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return visible;
}

/* =========================================================
   Visual viewport
========================================================= */

function useViewportHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const nextHeight =
        window.visualViewport?.height || window.innerHeight;

      setHeight(Math.round(nextHeight));
    };

    updateHeight();

    window.addEventListener("resize", updateHeight, { passive: true });
    window.visualViewport?.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("resize", updateHeight);
    };
  }, []);

  return height;
}

/* =========================================================
   Component
========================================================= */

export default function SearchFloating() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const footerVisible = useFooterVisibility();
  const viewportHeight = useViewportHeight();

  /* =======================================================
     Close
  ======================================================= */

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(0);
  }, []);

  /* =======================================================
     Focus + outside click + Escape
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    let focusTimer = 0;

    const frame = window.requestAnimationFrame(() => {
      focusTimer = window.setTimeout(() => {
        try {
          inputRef.current?.focus({ preventScroll: true });
        } catch {
          inputRef.current?.focus();
        }
      }, 60);
    });

    const handlePointerDown = (event: PointerEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);

      if (focusTimer) {
        window.clearTimeout(focusTimer);
      }

      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  /* =======================================================
     Smart Search API
  ======================================================= */

  useEffect(() => {
    const safeQuery = normalizeQuery(query);

    if (safeQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(false);
      setActiveIndex(0);
      return;
    }

    let cancelled = false;
    let controllers: AbortController[] = [];

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(false);

      try {
        const smartQueries = buildSmartQueries(safeQuery);

        const fetchResults = async (searchQueries: string[]) => {
          controllers = searchQueries.map(() => new AbortController());

          return Promise.allSettled(
            searchQueries.map(async (smartQuery, index) => {
              const response = await fetch(
                `/api/search?q=${encodeURIComponent(smartQuery)}`,
                {
                  method: "GET",
                  headers: { Accept: "application/json" },
                  signal: controllers[index]?.signal,
                },
              );

              if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
              }

              const payload = (await response.json()) as SearchResponse;
              return Array.isArray(payload?.results) ? payload.results : [];
            }),
          );
        };

        const primary = await fetchResults([smartQueries[0]]);
        if (cancelled) return;

        const primaryResults = primary
          .filter((item): item is PromiseFulfilledResult<SearchResult[]> => item.status === "fulfilled")
          .flatMap((item) => item.value);

        let merged = primaryResults;
        let matchedQueries = [smartQueries[0]];
        let hadSuccessfulRequest = primary.some(
          (item) => item.status === "fulfilled",
        );

        if (primaryResults.length < MAX_RESULTS && smartQueries.length > 1) {
          const fallbackQueries = smartQueries.slice(1);
          const fallbackResults = await fetchResults(fallbackQueries);
          if (cancelled) return;

          const successful = fallbackResults
            .map((item, index) => ({ item, query: fallbackQueries[index] }))
            .filter(
              (entry): entry is {
                item: PromiseFulfilledResult<SearchResult[]>;
                query: string;
              } => entry.item.status === "fulfilled",
            );

          hadSuccessfulRequest = hadSuccessfulRequest || successful.length > 0;
          merged = merged.concat(
            successful.flatMap((entry) => entry.item.value),
          );
          matchedQueries = smartQueries;
        }

        if (!hadSuccessfulRequest) {
          throw new Error("All search requests failed");
        }

        const ranked = rankSearchResults(merged, safeQuery, matchedQueries);

        setResults(ranked);
        setActiveIndex(0);
      } catch (requestError) {
        if (cancelled) return;

        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        if (
          requestError &&
          typeof requestError === "object" &&
          "name" in requestError &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setResults([]);
        setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controllers.forEach((controller) => controller.abort());
    };
  }, [query]);

  /* =======================================================
     Keyboard navigation
  ======================================================= */

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown" && results.length > 0) {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % results.length);
        return;
      }

      if (event.key === "ArrowUp" && results.length > 0) {
        event.preventDefault();
        setActiveIndex((current) =>
          current <= 0 ? results.length - 1 : current - 1,
        );
        return;
      }

      if (event.key === "Enter" && results.length > 0) {
        const selected = results[activeIndex] || results[0];

        if (!selected?.slug) {
          return;
        }

        event.preventDefault();
        close();
        router.push(`/recipe/${encodeURIComponent(selected.slug)}`);
      }
    },
    [activeIndex, close, results, router],
  );

  /* =======================================================
     Input
  ======================================================= */

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(false);

    requestAnimationFrame(() => {
      try {
        inputRef.current?.focus({ preventScroll: true });
      } catch {
        inputRef.current?.focus();
      }
    });
  }, []);

  /* =======================================================
     Retry
  ======================================================= */

  const retry = useCallback(() => {
    const current = query;
    setQuery("");

    window.setTimeout(() => {
      setQuery(current);
    }, 0);
  }, [query]);

  /* =======================================================
     Hide near footer
  ======================================================= */

  if (footerVisible) {
    return null;
  }

  /* =======================================================
     Responsive heights
  ======================================================= */

  const availableHeight =
    viewportHeight > 0
      ? Math.max(320, viewportHeight - 92)
      : undefined;

  const resultsHeight =
    viewportHeight > 0
      ? Math.max(170, Math.min(430, viewportHeight - 250))
      : 430;

  const normalizedLength = normalizeQuery(query).length;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      ref={panelRef}
      dir="rtl"
      className="fixed right-6 z-[80] flex flex-col items-end gap-3"
      style={{
       
        
        bottom: "calc(4.75rem + env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? "إغلاق البحث" : "فتح البحث عن وصفة"}
        aria-expanded={open}
        className="group relative inline-flex h-14 w-14 shrink-0 touch-manipulation items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/20 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-[0_18px_45px_rgba(234,88,12,0.32)] outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(234,88,12,0.4)] active:scale-95 focus-visible:ring-4 focus-visible:ring-orange-300/50 sm:h-14 sm:w-14"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-white/0 transition group-hover:bg-white/[0.08]"
        />

        {open ? (
          <X
            size={22}
            strokeWidth={2.6}
            className="relative transition-transform duration-300 group-hover:rotate-90"
            aria-hidden="true"
          />
        ) : (
          <Search
            size={23}
            strokeWidth={2.5}
            className="relative transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          />
        )}

        {!open ? (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-orange-500 bg-emerald-300 shadow-[0_0_0_3px_rgba(255,255,255,0.85)]"
          />
        ) : null}
      </button>

      {open ? (
        <section
          aria-label="البحث عن وصفة"
          role="dialog"
          aria-modal="false"
          className="animate-[search-pop_220ms_ease-out] flex w-[calc(100vw-1rem)] max-w-[450px] flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/[0.97] shadow-[0_30px_90px_rgba(15,23,42,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d1726]/95"
          style={{
            maxHeight: availableHeight
              ? `${availableHeight}px`
              : "calc(100dvh - 6rem)",
          }}
        >
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-l from-orange-600 via-orange-400 to-amber-300" />

          {/* Header */}
          <div className="shrink-0 border-b border-slate-200/80 p-4 dark:border-white/[0.08] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/20">
                  <ChefHat size={21} aria-hidden="true" />
                  <span className="absolute -bottom-3 -left-2 h-8 w-8 rounded-full bg-white/10 blur-md" />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[15px] font-black text-slate-950 dark:text-white sm:text-base">
                      البحث عن وصفة
                    </h2>
                    <Sparkles
                      size={14}
                      className="text-orange-500"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-0.5 truncate text-[10px] font-bold text-slate-500 dark:text-slate-400 sm:text-[11px]">
                    ابحث بالاسم أو المكوّن أو نوع الطبق
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={close}
                aria-label="إغلاق البحث"
                className="grid h-10 w-10 shrink-0 touch-manipulation place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 outline-none transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Search field */}
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center">
                <Search
                  size={19}
                  className="text-orange-500 transition-transform duration-300 group-focus-within:scale-110"
                  aria-hidden="true"
                />
              </div>

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                maxLength={80}
                placeholder="مثال: دجاج، أرز، حلويات..."
                aria-label="ابحث عن وصفة"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-20 pr-12 text-[15px] font-bold text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-400 dark:focus:bg-white/[0.06]"
              />

              <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center gap-1.5">
                {normalizedLength >= MIN_QUERY_LENGTH && !loading ? (
                  <span className="hidden rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-black text-slate-400 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-500 sm:inline-flex">
                    ↵ بحث
                  </span>
                ) : null}

                {loading ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500"
                    aria-hidden="true"
                  />
                ) : null}
              </div>

              {query ? (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="مسح البحث"
                  className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 touch-manipulation place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 active:scale-95 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[9px] font-bold text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-orange-500/10 text-orange-500">
                  <Command size={11} aria-hidden="true" />
                </span>
                نتائج فورية
              </span>

              <span className="hidden sm:inline">بحث ذكي + ↑ ↓ للتنقل</span>
            </div>
          </div>

          {/* Results */}
          <div
            className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-2.5 sm:p-3"
            style={{
              maxHeight: `${resultsHeight}px`,
              WebkitOverflowScrolling: "touch",
            }}
            aria-live="polite"
          >
            {normalizedLength < MIN_QUERY_LENGTH ? (
              <div className="px-2 pb-2 pt-3">
                <div className="rounded-[1.35rem] border border-orange-500/10 bg-gradient-to-br from-orange-500/[0.07] via-white to-amber-50/60 p-4 dark:border-orange-400/10 dark:from-orange-500/[0.08] dark:via-white/[0.02] dark:to-orange-500/[0.03]">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-xl text-white shadow-lg shadow-orange-500/20">
                      ✨
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-950 dark:text-white sm:text-base">
                          وصفات تستحق التجربة
                        </h3>
                        <Sparkles size={13} className="shrink-0 text-orange-500" aria-hidden="true" />
                      </div>

                      <p className="mt-1 text-[10px] font-bold leading-5 text-slate-500 dark:text-slate-400 sm:text-[11px]">
                        لم تقرر ماذا تطبخ اليوم؟ اختر فكرة وابدأ رحلتك.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SEARCH_SUGGESTIONS.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setQuery(item.title)}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-orange-400/30 dark:hover:bg-white/[0.05]"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg transition-transform duration-200 group-hover:scale-105 dark:bg-white/[0.05]">
                          {item.icon}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-black text-slate-900 dark:text-white sm:text-xs">
                            ابحث عن {item.title}
                          </span>
                          <span className="mt-0.5 block line-clamp-1 text-[9px] font-bold leading-5 text-slate-500 dark:text-slate-400">
                            اضغط للبحث في الوصفات
                          </span>
                        </span>

                        <Search size={15} className="shrink-0 text-orange-500 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                      </button>
                    ))}
                  </div>

                  <Link
                    href="/recipes"
                    prefetch={false}
                    onClick={close}
                    className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-[11px] font-black text-white shadow-lg shadow-orange-500/15 transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.99]"
                  >
                    <ChefHat size={15} aria-hidden="true" />
                    استكشف كل الوصفات
                  </Link>
                </div>

                <p className="px-2 pb-1 pt-4 text-center text-[9px] font-bold text-slate-400 dark:text-slate-500">
                  أو اكتب اسم أكلة أو مكوّن للبحث مباشرة
                </p>
              </div>
            ) : loading ? (
              <div className="space-y-2 p-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`search-skeleton-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/[0.06] dark:bg-white/[0.025]"
                  >
                    <span className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200 dark:bg-white/[0.07]" />
                    <span className="min-w-0 flex-1">
                      <span className="block h-3.5 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-white/[0.07]" />
                      <span className="mt-2 block h-2.5 w-1/2 animate-pulse rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                    </span>
                    <span className="h-4 w-4 animate-pulse rounded-full bg-slate-200 dark:bg-white/[0.07]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[280px]">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-500">
                  <X size={23} aria-hidden="true" />
                </span>

                <h3 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
                  تعذر إكمال البحث الآن
                </h3>

                <p className="mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  جرّب مرة أخرى بعد لحظات.
                </p>

                <button
                  type="button"
                  onClick={retry}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-orange-500 px-4 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 active:scale-95"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : results.length > 0 ? (
              <ul className="space-y-1.5" aria-label="نتائج البحث">
                {results.map((recipe, index) => {
                  const active = index === activeIndex;
                  const meta = resultMeta(recipe);

                  return (
                    <li key={recipe.slug || recipe.id || `${recipe.title}-${index}`}>
                      <Link
                        href={`/recipe/${encodeURIComponent(recipe.slug)}`}
                        prefetch={false}
                        onClick={close}
                        onMouseEnter={() => setActiveIndex(index)}
                        onFocus={() => setActiveIndex(index)}
                        className={`group flex touch-manipulation items-center gap-3 rounded-2xl border p-3 transition-all duration-200 outline-none ${
                          active
                            ? "border-orange-500/25 bg-gradient-to-l from-orange-500/10 to-orange-500/[0.03] shadow-sm"
                            : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.03]"
                        }`}
                      >
                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all duration-200 ${
                            active
                              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                              : "bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-300"
                          }`}
                        >
                          <ChefHat size={18} aria-hidden="true" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block line-clamp-2 text-[13px] font-black leading-6 text-slate-900 dark:text-white">
                            {recipe.title}
                          </span>

                          {meta ? (
                            <span className="mt-1 block truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {meta}
                            </span>
                          ) : null}
                        </span>

                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
                            active
                              ? "bg-orange-500/10 text-orange-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        >
                          <ArrowUpLeft
                            size={16}
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[280px]">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-500">
                  <ChefHat size={27} aria-hidden="true" />
                </span>

                <h3 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
                  لم نجد وصفة مطابقة
                </h3>

                <p className="mt-1.5 max-w-[250px] text-[11px] font-bold leading-6 text-slate-500 dark:text-slate-400">
                  جرّب كلمة أقصر أو أكثر تحديدًا. البحث يدعم اختلافات الكتابة العربية تلقائيًا.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <style jsx>{`
        @keyframes search-pop {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
