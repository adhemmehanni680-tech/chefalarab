"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import recipesData from "../../public/recipes.json";
import ChefImage from "../../public/Heeder.webp";
import { motion } from "framer-motion";
import { ArrowUp, Heart as HeartIcon } from "lucide-react";
import AdSenseBanner from "./Components/AdSenseBanner";

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
  "الطبق الغربى",
  "مخللات وسلطات",
  "حلويات",
  "مثلجات و مشروبات",
  "احدث الوصفات",
  "الوصفات ألأكثر إعجابا",
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("جميع الوصفات");
  const [showScroll, setShowScroll] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [chunkSize, setChunkSize] = useState(8); // Desktop default

  const recipes = recipesData as Recipe[];

  // تحديد عدد الوصفات حسب حجم الشاشة
  useEffect(() => {
    const updateChunkSize = () => {
      if (window.innerWidth < 768) setChunkSize(6);
      else setChunkSize(8);
    };
    updateChunkSize();
    window.addEventListener("resize", updateChunkSize);
    return () => window.removeEventListener("resize", updateChunkSize);
  }, []);

  // تحميل الإعجابات
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // زر الصعود
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // الفلترة
  const filteredRecipes =
    activeCategory === "جميع الوصفات"
      ? recipes
      : recipes.filter((item) =>
          activeCategory === "الوصفات ألأكثر إعجابا"
            ? item.category.includes("الوصفات ألأكثر إعجابا")
            : item.category.includes(activeCategory)
        );

  // تقسيم الوصفات حسب حجم الشاشة
  const recipeChunks: Recipe[][] = [];
  for (let i = 0; i < filteredRecipes.length; i += chunkSize) {
    recipeChunks.push(filteredRecipes.slice(i, i + chunkSize));
  }

  return (
    <motion.main className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
       <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        * {
          max-width: 100vw !important;
        }
      `}</style>

      {/* HEADER */}
      <header className="relative w-full">
        <div className="relative w-full min-h-[50vh] md:min-h-[65vh] lg:min-h-[80vh]">
          <Image
            src={ChefImage}
            alt="هيدر موقع الشيف"
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white">
                استمتعوا بطبخٍ شهي مع عائلتكم
              </h1>
              <p className="text-base md:text-2xl lg:text-3xl text-gray-100/90 mb-6">
                اكتشف وصفات معدّة بعناية ترضي جميع الأذواق
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  href="/recipe"
                  className="px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition"
                >
                  المزيد من الوصفات
                </Link>
                <a
                  href="#recipes-section"
                  className="px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition"
                >
                  تصفح الوصفات
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* RECIPES */}
      <section id="recipes-section" className="py-10">
        <div className="max-w-6xl mx-auto px-3">
          {/* FILTERS */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-lime-400 text-black border-lime-400"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Recipes + Ads */}
          {recipeChunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="mb-10">
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {chunk.map((recipe) => {
                  const isFav =
                    favorites.includes(recipe.id) ||
                    recipe.category.includes("الوصفات ألأكثر إعجابا");

                  return (
                    <article
                      key={recipe.id}
                      className="group bg-[#07121a] rounded-xl overflow-hidden border border-transparent hover:border-lime-400 transition duration-300 shadow-sm"
                    >
                      <Link href={`/recipes/${recipe.id}`}>
                        <div className="relative">
                          <Image
                            src={recipe.img}
                            alt={recipe.title}
                            width={800}
                            height={600}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                          />
                          <span className="absolute top-3 right-3 rounded-full p-2 bg-black/40 border border-white/10">
                            <HeartIcon
                              size={20}
                              className={isFav ? "text-red-500" : "text-white/70"}
                            /> 
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-lime-400 line-clamp-2 mb-1">
                            {recipe.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-2">{recipe.country}</p>
                          <div className="text-xs text-gray-400">
                            {recipe.category.slice(0, 8).join(" • ")}
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              {/* AdSense بعد كل chunk */}
              <div className="w-auto flex justify-center my-8 m-auto">
                <AdSenseBanner
                  adSlot="9257395922"
                  style={{ display: "block", width: "200%", minHeight: 90 }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scroll Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-xl transition-transform hover:scale-110 z-50"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </motion.main>
  );
}
