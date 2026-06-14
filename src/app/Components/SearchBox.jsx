"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import recipes from "@/data/recipes.json";

// دالة هروب الرموز الخاصة (JavaScript عادي)
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function SearchBox({ floating = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [open, setOpen] = useState(!floating);

  const debounceTimeout = useRef(null);
  const ref = useRef(null);

  // debounce
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 250);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm]);

  // normalize عربي
  const normalize = useCallback((str) => {
    return str
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي");
  }, []);

  // index (slug نصي مضمون)
  const recipesIndex = useMemo(() => {
    return (recipes || []).map((r) => ({
      slug: String(r.slug || r.id || ""),
      title: r.title,
      norm: normalize(r.title),
    }));
  }, [normalize]);

  // search
  const filteredResults = useMemo(() => {
    const q = normalize(debouncedTerm.trim());
    if (q.length < 2) return [];

    const stopWords = ["طريقه", "طريقة", "عمل", "وصفه", "وصفة"];
    const words = q.split(/\s+/).filter((w) => w && !stopWords.includes(w));

    const results = [];
    for (const r of recipesIndex) {
      let score = 0;
      for (const w of words) {
        if (r.norm.includes(w)) score += 2;
        if (r.norm.startsWith(w)) score += 3;
      }
      if (score > 0) results.push({ ...r, score });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [debouncedTerm, recipesIndex, normalize]);

  // highlight مع هروب آمن
  const highlight = useCallback((text, query) => {
    if (!query) return text;
    const words = query.split(/\s+/).filter(Boolean);
    let parts = [text];

    words.forEach((w) => {
      parts = parts.flatMap((part) => {
        if (typeof part !== "string") return [part];
        const safeWord = escapeRegExp(w);
        const reg = new RegExp(`(${safeWord})`, "gi");
        return part.split(reg).map((p, i) =>
          p.toLowerCase() === w.toLowerCase() ? (
            <span key={i} className="text-orange-500 font-semibold">
              {p}
            </span>
          ) : (
            p
          )
        );
      });
    });

    return parts;
  }, []);

  // click outside
  const handleClickOutside = useCallback(
    (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) {
        setShowResults(false);
        if (floating) setOpen(false);
      }
    },
    [floating]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div
      ref={ref}
      className={
        floating
          ? "fixed bottom-6 right-4 z-[9999]"
          : "relative w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl"
      }
    >
      {floating && !open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-orange-500 text-white text-xl shadow-lg"
        >
          🔍
        </button>
      )}

      {open && (
        <div className="w-full">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="ابحث عن وصفة..."
            className="w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-orange-400"
          />

          {showResults && debouncedTerm.trim().length >= 2 && (
            <div className="mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-80 overflow-auto border z-50">
              {filteredResults.length > 0 ? (
                filteredResults.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/recipe/${encodeURIComponent(r.slug)}`}
                    onClick={() => {
                      setSearchTerm("");
                      setShowResults(false);
                      setOpen(!floating);
                    }}
                    className="block p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {highlight(r.title, debouncedTerm)}
                  </Link>
                ))
              ) : (
                <p className="p-3 text-gray-500 text-sm">
                  لا توجد نتائج 😔
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}