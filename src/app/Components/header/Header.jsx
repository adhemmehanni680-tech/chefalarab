// Header.jsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import favicon_icon from "../../../../public/favicon.webp";
import recipes from "../../../../public/recipes.json";

export default function Header() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [scrollY, setScrollY] = useState(0);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const debounceTimeout = useRef(null);
  const lastScroll = useRef(0);
  const [hideHeader, setHideHeader] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchBoxRef = useRef(null);

  /* ------------------------------- Theme + Scroll ------------------------------- */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const autoTheme = prefersDark ? "dark" : "light";
      setTheme(autoTheme);
      document.documentElement.classList.toggle("dark", autoTheme === "dark");
    }

    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll.current && current > 80) setHideHeader(true);
      else setHideHeader(false);
      lastScroll.current = current;
      setScrollY(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------------------------- Debounce Search ------------------------------- */
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  /* ------------------------- Search Result (Optimized) ------------------------- */
  const recipesIndex = useMemo(() => {
    return (recipes || []).map((r) => ({
      slug: r.slug,
      title: r.title,
      titleLower: (r.title || "").toLowerCase(),
    }));
  }, []);

  const filteredResults = useMemo(() => {
    const q = debouncedTerm.trim().toLowerCase();
    if (q.length < 2) return [];
    const res = [];
    for (const r of recipesIndex) {
      if (r.titleLower.includes(q)) {
        res.push({ slug: r.slug, title: r.title });
        if (res.length >= 15) break;
      }
    }
    return res;
  }, [debouncedTerm, recipesIndex]);

  /* ------------------------------- Highlight Function ------------------------------- */
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={idx} className="bg-orange-100 dark:bg-orange-600 text-orange-800 dark:text-orange-200 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  /* ------------------------------- Close results on outside click ------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ------------------------------- Nav Background ------------------------------- */
  const navBg =
    scrollY > 10
      ? "bg-gray-900/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
      : "bg-gray-900/80";

  const links = [
    { title: "الصفحة الرئيسية", href: "/" },
    { title: "من نحن", href: "/about_us" },
    { title: "تواصل معنا", href: "/contact_us" },
    { title: "الوصفات", href: "/recipe" },
    { title: "الاسئلة الشائعة", href: "/faq" },
  ];

  const isActiveLink = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      role="navigation"
      aria-label="التنقل الرئيسي"
      className={`${navBg} fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-800
      transition-all duration-500 transform ${hideHeader ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
            aria-label="العودة للصفحة الرئيسية"
          >
            <Image
              src={favicon_icon}
              alt="Chefalarab Logo"
              width={64}
              height={64}
              priority
              loading="eager"
              className="h-16 w-16"
            />
            <span className="text-2xl font-bold text-white">شيف العرب</span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center flex-1 justify-center">
          <ul className="flex space-x-8 rtl:space-x-reverse font-medium text-white relative">
            {links.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <li key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-2 py-1 transition-all duration-300 ${
                      isActive
                        ? "text-orange-400 font-semibold drop-shadow-lg scale-105"
                        : "text-white hover:text-orange-400 hover:scale-105"
                    }`}
                  >
                    {link.title}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-orange-400 rounded transition-all duration-300 ${
                        isActive
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex relative w-64" ref={searchBoxRef}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg
            bg-gray-50 focus:ring-orange-200 focus:border-orange-200
            dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            placeholder="ابحث عن وصفة..."
            aria-label="بحث عن وصفة"
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500 dark:text-gray-300">
            🔍
          </div>

          {/* Animated Search Results */}
          <AnimatePresence>
            {showResults && debouncedTerm.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300
                dark:border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg z-50"
                role="listbox"
                aria-label="نتائج البحث"
              >
                {filteredResults.length > 0 ? (
                  filteredResults.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/recipes/${r.slug}`}
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setSearchTerm("");
                        setShowResults(false);
                      }}
                    >
                      {highlightMatch(r.title, debouncedTerm)}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-500">لا توجد نتائج مطابقة 😔</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="hidden md:flex items-center justify-center mr-4 md:mr-8 w-10 h-10 rounded-full  text-xl transition-transform hover:scale-110 "
          aria-label="تبديل الوضع الليلي"
        >
          <motion.div
            initial={{ rotate: theme === "light" ? 0 : 180 }}
            animate={{ rotate: theme === "light" ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex items-center justify-center w-full h-full "
          >
            {theme === "light" ? "🌙" : "☀️"}
          </motion.div>
        </button>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="فتح وإغلاق القائمة"
          className="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="p-4 flex flex-col space-y-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg
              bg-gray-50 focus:ring-orange-200 focus:border-orange-200
              dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
              placeholder="ابحث عن وصفة..."
              aria-label="بحث عن وصفة"
            />

            {debouncedTerm.trim().length >= 2 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg transition-colors">
                {filteredResults.length > 0 ? (
                  filteredResults.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/recipes/${r.slug}`}
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setSearchTerm("");
                        setIsMenuOpen(false);
                      }}
                    >
                      {highlightMatch(r.title, debouncedTerm)}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-500">😔 لا توجد نتائج مطابقة</p>
                )}
              </div>
            )}

            {/* Mobile Theme Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="text-gray-700 dark:text-yellow-300 hover:text-orange-500 transition-all duration-500 text-xl w-full text-right"
              aria-label="تبديل الوضع الليلي"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Mobile Links */}
            <ul className="flex flex-col space-y-2 text-gray-900 dark:text-white font-medium mt-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActiveLink(link.href) ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
