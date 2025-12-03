// Recipes page
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import recipesData from "../../../public/recipes.json";
import { motion } from "framer-motion";
import { ArrowUp, Heart } from "lucide-react";
import AdSense from "../../app/Components/AdSense";

const categories = [
  "جميع الوصفات",
  "الطبق العربي",
  "مخللات وسلطات",
  "حلويات",
  "مثلجات و مشروبات",
  "احدث الوصفات",
  "الوصفات ألأكثر إعجابا",
];

export default function Recipes() {
  const [activeCategory, setActiveCategory] = useState("جميع الوصفات");
  const [showScroll, setShowScroll] = useState(false);
  const [recipes, setRecipes] = useState(recipesData);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // هنا شيلنا toggleFavorite تماما، القلب هيظهر حسب category فقط

  const filteredRecipes =
    activeCategory === "جميع الوصفات"
      ? recipes
      : activeCategory === "الوصفات ألأكثر إعجابا"
      ? recipes.filter((r) => r.category.includes("الوصفات ألأكثر إعجابا"))
      : recipes.filter((r) => r.category.includes(activeCategory));

  return (
    <motion.div
      className="w-full py-10 px-2 lg:px-6 mt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-start gap-4 lg:gap-6 w-full">
        <style jsx global>{`
          html,
          body {
            overflow-x: hidden !important;
          }
          * {
            box-sizing: border-box;
            max-width: 100vw !important;
          }
        `}</style>

        <div className="hidden xl:flex sticky top-24 w-64 h-[800px] rounded-xl justify-center items-center">
          <AdSense adSlot="9257395922" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium border border-lime-400 bg-gray-900 transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-lime-400 text-black"
                    : "hover:bg-gray-700 text-lime-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="xl:hidden w-full mb-6 flex justify-center">
            <div className="w-full max-w-sm">
              <AdSense adSlot="9257395922" />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group relative bg-[#0f1a25] rounded-xl overflow-hidden border border-gray-700 hover:border-lime-400 transition-all duration-300 shadow-lg hover:shadow-lime-400/30"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <Image
                    src={recipe.img}
                    alt={recipe.title}
                    width={400}
                    height={300}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="p-4 text-center relative">
                  <h3 className="text-lg font-semibold mb-1 text-lime-300">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-400">{recipe.country}</p>

                  <div className="absolute top-3 right-3">
                    <Heart
                      size={24}
                      className={
                        recipe.category.includes("الوصفات ألأكثر إعجابا")
                          ? "text-red-500"
                          : "text-white"
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden xl:flex sticky top-24 w-64 h-[800px] rounded-xl justify-center items-center">
          <AdSense adSlot="9257395922" />
        </div>
      </div>

      <div className="xl:hidden w-full mb-6 flex justify-center">
        <div className="w-full max-w-sm">
          <AdSense adSlot="9257395922" />
        </div>
      </div>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-14 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 z-50"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </motion.div>
  );
}
