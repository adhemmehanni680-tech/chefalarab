"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpLeft,
  ChefHat,
  Command,
  Search,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";

const QUICK_SEARCHES = ["دجاج", "حلويات", "فطور", "أرز", "معجنات", "وصفة سريعة"];
const MAX_CACHE_ENTRIES = 30;

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

function highlightTitle(title, query) {
  const words = normalizeArabic(query).split(" ").filter((word) => word.length >= 2);

  if (words.length === 0) return title;

  return String(title)
    .split(/(\s+)/)
    .map((part, index) => {
      const normalizedPart = normalizeArabic(part);
      if (!normalizedPart) return part;

      const matched = words.some(
        (word) =>
          normalizedPart === word ||
          normalizedPart.startsWith(word) ||
          word.startsWith(normalizedPart),
      );

      return matched ? (
        <mark
          key={`${part}-${index}`}
          className="rounded-md bg-orange-500/15 px-0.5 font-bold text-orange-500"
        >
          {part}
        </mark>
      ) : (
        part
      );
    });
}

export default function SearchPanel({ onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);

  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const cacheRef = useRef(new Map());

  const normalizedQuery = useMemo(() => normalizeArabic(query), [query]);
  const hasQuery = normalizedQuery.length > 0;
  const canSearch = normalizedQuery.length >= 2;

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(false);
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closePanel = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(false);
    onClose();
  }, [onClose]);

  const openRecipe = useCallback(
    (recipe) => {
      if (!recipe?.slug) return;
      router.push(`/recipe/${encodeURIComponent(recipe.slug)}`);
      closePanel();
    },
    [closePanel, router],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setLoading(false);
      setError(false);
      return undefined;
    }

    const cached = cacheRef.current.get(normalizedQuery);
    if (cached) {
      setResults(cached);
      setLoading(false);
      setError(false);
      return undefined;
    }

    const controller = new AbortController();
    setResults([]);
    setLoading(true);
    setError(false);

    const timeout = window.setTimeout(async () => {

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`Search failed with ${response.status}`);

        const payload = await response.json();
        const nextResults = Array.isArray(payload?.results) ? payload.results : [];

        if (cacheRef.current.size >= MAX_CACHE_ENTRIES) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }

        cacheRef.current.set(normalizedQuery, nextResults);
        setResults(nextResults);
        setActiveIndex(0);
      } catch (fetchError) {
        if (fetchError?.name !== "AbortError") {
          console.error("Recipe search failed:", fetchError);
          setResults([]);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 150);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [canSearch, normalizedQuery, query, retryNonce]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) closePanel();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [closePanel]);

  useEffect(() => {
    const activeElement = resultsRef.current?.querySelector(
      `[data-search-result="${activeIndex}"]`,
    );
    activeElement?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
        return;
      }

      if (results.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % results.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + results.length) % results.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        openRecipe(results[activeIndex] || results[0]);
      }
    },
    [activeIndex, closePanel, openRecipe, results],
  );

  return (
    <section
      ref={panelRef}
      role="dialog"
      aria-label="البحث الذكي عن الوصفات"
      className="search-panel-enter w-[calc(100vw-1.5rem)] max-w-[410px] overflow-hidden rounded-[26px] border border-white/10 bg-gray-950/95 shadow-[0_30px_80px_-25px_rgba(0,0,0,0.75)] backdrop-blur-2xl dark:border-gray-200/70 dark:bg-white/95"
    >
      <div className="relative overflow-hidden border-b border-white/10 px-4 pb-4 pt-4 dark:border-gray-200">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25">
              <ChefHat size={21} strokeWidth={2.2} aria-hidden="true" />
            </div>
            <div>
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-white dark:text-gray-900">
                البحث الذكي
                <Sparkles size={14} className="text-orange-400" aria-hidden="true" />
              </h2>
              <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                اكتب أقل عدد من الكلمات وسنجد الأقرب
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="إغلاق البحث"
            onClick={closePanel}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400 dark:border-gray-200 dark:bg-gray-100 dark:text-gray-500 dark:hover:bg-red-50 dark:hover:text-red-500"
          >
            <X size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-orange-500 dark:border-gray-300 dark:border-t-orange-500" />
            ) : (
              <Search size={20} className="text-orange-500" aria-hidden="true" />
            )}
          </div>

          <input
            ref={inputRef}
            type="search"
            value={query}
            autoComplete="off"
            enterKeyHint="search"
            aria-label="ابحث عن وصفة"
            aria-controls="recipe-search-results"
            aria-activedescendant={results[activeIndex] ? `search-result-${activeIndex}` : undefined}
            placeholder="مثال: دجاج، رز، حلويات..."
            onKeyDown={handleKeyDown}
            onChange={(event) => {
              setQuery(event.target.value.slice(0, 80));
              setActiveIndex(0);
            }}
            className="h-[54px] w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-12 pr-12 text-sm font-medium text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/70 focus:bg-black/30 focus:ring-4 focus:ring-orange-500/10 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-900 dark:placeholder:text-gray-400 dark:focus:bg-white sm:text-[15px]"
          />

          {hasQuery ? (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={clearSearch}
              className="absolute inset-y-0 left-3 my-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/10 hover:text-white dark:hover:bg-gray-200 dark:hover:text-gray-800"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 left-3 hidden items-center sm:flex">
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-gray-500 dark:border-gray-200 dark:bg-white">
                <Command size={11} aria-hidden="true" /> K
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-[150px] bg-gradient-to-b from-transparent to-black/10 dark:to-gray-50">
        {!hasQuery ? (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-300 dark:text-gray-700">
                <Sparkles size={14} className="text-orange-500" aria-hidden="true" />
                اقتراحات سريعة
              </p>
              <span className="text-[10px] text-gray-500">اختر بكلمة واحدة</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}
                  className="group flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 dark:border-gray-200 dark:bg-white dark:text-gray-600 dark:hover:border-orange-300 dark:hover:bg-orange-50 dark:hover:text-orange-600"
                >
                  <UtensilsCrossed size={13} className="text-gray-500 group-hover:text-orange-500" aria-hidden="true" />
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-orange-500/15 bg-orange-500/[0.06] p-3">
              <p className="flex items-start gap-2 text-[11px] leading-5 text-gray-400 dark:text-gray-500">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-orange-500" aria-hidden="true" />
                يفهم كلمات مثل فراخ بدل دجاج، رز بدل أرز، وبندورة بدل طماطم.
              </p>
            </div>
          </div>
        ) : !canSearch ? (
          <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <Search size={23} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-gray-200 dark:text-gray-700">أكمل كتابة الكلمة</p>
            <p className="mt-1 text-xs text-gray-500">اكتب حرفين على الأقل لعرض النتائج</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
            <p className="text-sm font-bold text-gray-200 dark:text-gray-700">تعذر تنفيذ البحث الآن</p>
            <p className="mt-1 text-xs text-gray-500">تحقق من الاتصال ثم أعد المحاولة</p>
            <button
              type="button"
              onClick={() => setRetryNonce((current) => current + 1)}
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between px-4 pb-2 pt-3">
              <p className="text-[11px] font-medium text-gray-500">أفضل {results.length} نتائج</p>
              <p className="hidden text-[10px] text-gray-600 dark:text-gray-400 sm:block">
                ↑ ↓ للتنقل • Enter للفتح
              </p>
            </div>

            <div
              id="recipe-search-results"
              ref={resultsRef}
              role="listbox"
              className="custom-scrollbar max-h-[340px] overflow-y-auto px-2 pb-2"
            >
              {results.map((recipe, index) => {
                const isActive = activeIndex === index;
                const meta = [recipe.country, recipe.category].filter(Boolean).join(" • ");

                return (
                  <Link
                    id={`search-result-${index}`}
                    key={recipe.slug}
                    data-search-result={index}
                    role="option"
                    aria-selected={isActive}
                    href={`/recipe/${encodeURIComponent(recipe.slug)}`}
                    onClick={closePanel}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`group relative mb-1 flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 transition-colors ${
                      isActive
                        ? "border-orange-500/40 bg-orange-500/10 shadow-[0_10px_30px_-18px_rgba(249,115,22,0.8)]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.04] dark:hover:border-gray-200 dark:hover:bg-white"
                    }`}
                  >
                    {isActive && <span className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-orange-500" />}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                          : "bg-white/[0.05] text-gray-500 group-hover:bg-orange-500/10 group-hover:text-orange-500 dark:bg-gray-100"
                      }`}
                    >
                      <ChefHat size={20} strokeWidth={2} aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-bold leading-6 text-gray-200 group-hover:text-white dark:text-gray-700 dark:group-hover:text-gray-900">
                        {highlightTitle(recipe.title, query)}
                      </p>
                      {meta && <p className="mt-0.5 truncate text-[10px] text-gray-500">{meta}</p>}
                    </div>

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 group-hover:bg-orange-500/10 group-hover:text-orange-500"
                      }`}
                    >
                      <ArrowUpLeft size={16} strokeWidth={2.2} aria-hidden="true" />
                    </div>

                    {index === 0 && (
                      <span className="absolute left-3 top-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">
                        الأقرب
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4" aria-live="polite" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex animate-pulse items-center gap-3 rounded-2xl bg-white/[0.04] p-3 dark:bg-gray-100">
                <div className="h-11 w-11 rounded-xl bg-gray-700 dark:bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-4/5 rounded bg-gray-700 dark:bg-gray-200" />
                  <div className="h-2 w-2/5 rounded bg-gray-800 dark:bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
              <UtensilsCrossed size={25} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-gray-200 dark:text-gray-700">لم نجد وصفة مطابقة</p>
            <p className="mt-1 max-w-[260px] text-xs leading-5 text-gray-500">
              جرّب كلمة أبسط مثل دجاج، أرز، بطاطس أو حلويات.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 active:scale-95"
            >
              البحث بكلمة أخرى
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-black/10 px-4 py-2.5 text-[10px] text-gray-500 dark:border-gray-200 dark:bg-gray-50">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-orange-500" aria-hidden="true" />
          بحث سريع وذكي
        </span>
        <span>نتائج مختصرة ودقيقة</span>
      </div>
    </section>
  );
}
