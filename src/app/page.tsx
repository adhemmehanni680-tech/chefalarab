//Home Page 
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import recipesData from "../../public/recipes.json";
import ChefImage from "../../public/Heeder.webp";
import InterstitialAd from "../app/Components/InterstitialAd";
import { motion } from "framer-motion";
import { ArrowUp, Heart as HeartIcon, Sun, Moon } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  country: string;
  img: string;
  category: string[];
}

const categories: string[] = [
  "جميع الوصفات",
  "الطبق العربي",
  "الطبق الأروبي",
  "مخللات وسلطات",
  "حلويات",
  "مثلجات و مشروبات",
  "احدث الوصفات",
  "الوصفات ألأكثر إعجابا",
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("جميع الوصفات");
  const [showScroll, setShowScroll] = useState(false);
  const [recipes] = useState<Recipe[]>(recipesData as Recipe[]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  // Apply Dark Mode class
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("theme", !prev ? "dark" : "light");
      return !prev;
    });
  };

  const filteredRecipes: Recipe[] =
    activeCategory === "جميع الوصفات"
      ? recipes
      : activeCategory === "الوصفات ألأكثر إعجابا"
      ? recipes.filter((r) => r.category.includes("الوصفات ألأكثر إعجابا"))
      : recipes.filter((item) => item.category.includes(activeCategory));

  return (
    <motion.main
      className="ml-0 mr-0 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.45 }}
    >
   <InterstitialAd interstitialUnitID="1234567890" />
      {/* HEADER */}
      <header className="relative w-full">
        <div className="relative w-full min-h-[50vh] md:min-h-[65vh] lg:min-h-[80vh]">
          <Image
            src={ChefImage}
            alt="هيدر موقع الشيف"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white">
                استمتعوا بطبخٍ شهي مع عائلتكم
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-100/90 leading-relaxed mb-6">
                اكتشف وصفات معدّة بعناية ترضي جميع الأذواق — تعليمات واضحة ونتيجة رائعة.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/recipe"
                  className="inline-block px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transform transition"
                >
                  المزيد من الوصفات
                </Link>

                <a
                  href="#recipes-section"
                  className="inline-block px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transform transition"
                >
                  تصفح الوصفات
                </a>

                
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* RECIPES SECTION */}
      <section
        id="recipes-section"
        className="py-12 transition-colors duration-300"
        aria-labelledby="recipes-heading"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 id="recipes-heading" className="sr-only">
            الوصفات
          </h2>

          {/* FILTERS */}
          <div className="mb-8">
            <div
              role="tablist"
              aria-label="تصنيفات الوصفات"
              className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1"
            >
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-lime-300 ${
                      active
                        ? "bg-lime-400 text-black border-lime-400 shadow"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRID */}
         <div
  className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  role="list"
  aria-label="قائمة الوصفات"
>
  {filteredRecipes.map((recipe) => {
    const isFav =
      favorites.includes(recipe.id) ||
      recipe.category.includes("الوصفات ألأكثر إعجابا");

    return (
      <article
        key={recipe.id}
        role="listitem"
        aria-labelledby={`title-${recipe.id}`}
        className="group bg-[#07121a] rounded-2xl overflow-hidden border border-transparent hover:border-lime-400 transition-shadow duration-300 shadow-md hover:shadow-[0_8px_30px_rgba(34,197,94,0.08)]"
      >    <Link
            href={`/recipes/${recipe.id}`}
            aria-label={`عرض وصفة ${recipe.title}`}
          >
        <div className="relative">
      
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full h-48 md:h-40 lg:h-44 overflow-hidden"
            >
              <Image
                src={recipe.img}
                alt={recipe.title}
                width={800}
                height={600}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
        

          <span
            aria-hidden="true"
            className="absolute top-3 right-3 rounded-full p-2 bg-black/40 backdrop-blur border border-white/10"
            title={isFav ? "موجود في المفضلة" : "غير مفضل"}
          >
            <HeartIcon
              size={20}
              className={isFav ? "text-red-500" : "text-white/70"}
            />
          </span>
        </div>

        <div className="p-4">
          <h3
            id={`title-${recipe.id}`}
            className="text-lg font-semibold text-lime-400 line-clamp-2 mb-1"
          >
            {recipe.title}
          </h3>

          <p className="text-sm text-gray-300 mb-3">{recipe.country}</p>

          <div className="flex items-center justify-between gap-3">
         

            <div className="text-xs text-gray-400">
              {recipe.category.slice(0, 8).join(" • ")}
            </div>
          </div>
          </div>  
          </Link>

      </article>
    );
  })}
</div>


        </div>
      </section>

      {/* SCROLL TOP */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 md:bottom-10 right-5 md:right-8 bg-lime-400 text-black p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          aria-label="العودة للأعلى"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </motion.main>
  );
}
