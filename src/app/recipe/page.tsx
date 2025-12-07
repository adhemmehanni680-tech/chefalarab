// Recipes Page
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import recipesData from "../../../public/recipes.json";
import { motion, useMotionValue } from "framer-motion";
import { ArrowUp, Heart } from "lucide-react";
import AdSense from "../../app/Components/AdSense";
import InterstitialAd from "../Components/InterstitialAd";

const categories = [
  "جميع الوصفات",
  "الطبق العربي",
  "الطبق الأروبي",
  "مخللات وسلطات",
  "حلويات",
  "مثلجات و مشروبات",
  "احدث الوصفات",
  "الوصفات ألأكثر إعجابا",
];

export default function Recipes() {
  const [activeCategory, setActiveCategory] = useState("جميع الوصفات");
  const [showScroll, setShowScroll] = useState(false);
  const [recipes] = useState(recipesData);

  const containerRef = useRef<HTMLDivElement>(null);

  const yLeft = useMotionValue(0);
  const yRight = useMotionValue(0);

  const yLeftRef = useRef(yLeft);
  const yRightRef = useRef(yRight);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScroll(scrollTop > 400);

      if (containerRef.current) {
        const containerHeight = containerRef.current.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxY = containerHeight - windowHeight - 100;

        yLeftRef.current.set(Math.min(scrollTop * 0.8, maxY));
        yRightRef.current.set(Math.min(scrollTop * 0.8, maxY));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredRecipes =
    activeCategory === "جميع الوصفات"
      ? recipes
      : activeCategory === "الوصفات ألأكثر إعجابا"
        ? recipes.filter((r) => r.category.includes("الوصفات ألأكثر إعجابا"))
        : recipes.filter((r) => r.category.includes(activeCategory));

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <motion.div
      ref={containerRef}
      className="w-full py-10 px-2 md:px-4 lg:px-8 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
      `}</style>
      <InterstitialAd interstitialUnitID="1234567890" />
      <div className="flex justify-between w-full gap-6">
        {/* إعلان اليسار */}
        <aside className="hidden xl:flex flex-col items-start">
          <motion.div
            style={{ y: yLeftRef.current }}
            className="w-64 h-[400px] rounded-2xl shadow-lg border border-gray-800 sticky top-24 overflow-hidden"
          >
            <AdSense adSlot="9257395922" />
          </motion.div>
        </aside>

        {/* المحتوى */}
        <main className="flex-1">
          {/* التصنيفات */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-300 ${activeCategory === cat
                    ? "bg-lime-400 text-black border-lime-400"
                    : "bg-gray-900 border-gray-700 text-lime-300 hover:bg-gray-800 hover:border-lime-300"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* إعلان موبايل */}
          <div className="xl:hidden w-full mb-10 flex justify-center">
            <div className="w-full max-w-sm">
              <AdSense adSlot="9257395922" />
            </div>
          </div>

          {/* الشبكة */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-6xl mx-auto">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="group relative bg-[#0f1a25] rounded-xl overflow-hidden border border-gray-700 hover:border-lime-400 transition-all duration-300 shadow-md hover:shadow-lime-400/30"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <div className="relative">
                    <Image
                      src={recipe.img}
                      alt={recipe.title}
                      width={500}
                      height={350}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* ❤️ القلب فوق الصورة */}
                    <div className="absolute top-3 right-3 z-20">
                      <div
                        className={`w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border flex items-center justify-center
                          ${recipe.category.includes("الوصفات ألأكثر إعجابا")
                            ? "border-red-500"
                            : "border-gray-300"
                          }
                        `}
                      >
                        <Heart
                          size={20}
                          className={
                            recipe.category.includes("الوصفات ألأكثر إعجابا")
                              ? "text-red-500"
                              : "text-white"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-4 text-center relative">
                  <h3 className="text-lg font-semibold mb-1 text-lime-300 group-hover:text-lime-200 transition">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-400">{recipe.country}</p>
                </div>

                {/* إعلان بعد كل 3 كروت */}
                {index > 0 && (index + 1) % 3 === 0 && (
                  <div className="xl:hidden w-full my-6 flex justify-center">
                    <div className="w-full max-w-sm">
                      <AdSense adSlot="9257395922" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* إعلان اليمين */}
        <aside className="hidden xl:flex flex-col items-end">
          <motion.div
            style={{ y: yRightRef.current }}
            className="w-64 h-[400px] rounded-2xl shadow-lg border border-gray-800 sticky top-24 overflow-hidden"
          >
            <AdSense adSlot="9257395922" />
          </motion.div>
        </aside>
      </div>

      {/* زر الصعود */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:scale-110 z-50"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </motion.div>
  );
}
