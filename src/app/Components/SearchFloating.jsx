"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import recipes from "@/data/recipes-search.json";

// دالة لهروب الرموز الخاصة (بدون TypeScript annotations)
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function SearchFloating() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [open, setOpen] = useState(false);

  const debounceTimeout = useRef(null);
  const boxRef = useRef(null);

  // debounce
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => setDebouncedTerm(searchTerm), 250);
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

  // index (ضمان slug نصي)
  const recipesIndex = useMemo(() => {
    return (recipes || []).map((r) => ({
      slug: String(r.slug || r.id || ""), // 👈 هنا الإصلاح
      title: r.title,
      norm: normalize(r.title),
    }));
  }, [normalize]);

  // search logic
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

  // highlight   
  const highlight = useCallback((text, query) => {
    if (!query) return text;
    const words = query.split(/\s+/).filter(Boolean);
    let parts = [text];

    words.forEach((w) => {
      parts = parts.flatMap((part) => {
        if (typeof part !== "string") return [part];
        const safeWord = escapeRegExp(w); // 👈  
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
  const handleClickOutside = useCallback((e) => {
    if (!boxRef.current) return;
    if (!boxRef.current.contains(e.target)) {
      setShowResults(false);
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed z-[9999] bottom-40 right-6"
      ref={boxRef}
    >
      {!open && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full bg-orange-500 text-white text-2xl shadow-lg"
        >
          🔍
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-80"
          >
            <div className="relative rounded-2xl bg-gray-900/80 dark:bg-white/80 backdrop-blur-xl border border-gray-700 dark:border-gray-200 shadow-2xl">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                placeholder="ابحث عن وصفة..."
                className="w-full p-4 ps-12 bg-transparent outline-none text-gray-200 dark:text-gray-800 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <span className="absolute left-4 top-4 text-gray-400 text-lg">🔍</span>
            </div>

            {showResults && debouncedTerm.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 rounded-2xl overflow-hidden bg-gray-900 dark:bg-white border border-gray-700 dark:border-gray-200 shadow-xl max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent"
              >
                {filteredResults.length > 0 ? (
                  filteredResults.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/recipe/${encodeURIComponent(r.slug)}`}
                      onClick={() => {
                        setOpen(false);
                        setSearchTerm("");
                        setShowResults(false);
                      }}
                      className="block px-4 py-3 text-sm text-gray-200 dark:text-gray-700 hover:bg-gray-800 dark:hover:bg-orange-200 transition"
                    >
                      {highlight(r.title, debouncedTerm)}
                    </Link>
                  ))
                ) : (
                  <p className="p-4 text-gray-400 dark:text-gray-500 text-xl">
                    لا توجد نتائج 😔
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}