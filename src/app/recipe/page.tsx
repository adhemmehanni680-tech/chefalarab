"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import recipesData from "../../../public/recipes.json";
import { ArrowUp, Heart } from "lucide-react";
import AdSenseBanner from "../Components/AdSenseBanner";
import InterstitialAd from "../Components/InterstitialAd";

const categories = [
  "جميع الوصفات",
  "الطبق العربي",
  "الطبق الغربى",
  "مخللات وسلطات",
  "حلويات",
  "مثلجات و مشروبات",
  "احدث الوصفات",
  "الوصفات ألأكثر إعجابا",
];

// كومبوننت للإعلانات الجانبية Desktop (sticky داخل حدود الصفحة)
const SideAd = ({ adSlot }: { adSlot: string }) => (
  <div className="w-64 min-h-[400px] rounded-2xl shadow-lg border overflow-hidden sticky top-24">
    <AdSenseBanner adSlot={adSlot} />
  </div>
);

export default function Recipes() {
  const [activeCategory, setActiveCategory] = useState("جميع الوصفات");
  const [showScroll, setShowScroll] = useState(false);
  const [recipes] = useState(recipesData);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
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
    <div className="w-full py-10 px-2 md:px-4 lg:px-8 mt-16 relative">
      <InterstitialAd interstitialUnitID="1234567890" />

      <div className="flex justify-between max-w-7xl mx-auto gap-6 relative">
        {/* إعلان يسار Desktop */}
        <aside className="hidden xl:block">
          <SideAd adSlot="9257395922" />
        </aside>

        {/* المحتوى الرئيسي */}
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

          {/* إعلان موبايل بعد كل 3 كروت */}
          <div className="xl:hidden w-full flex flex-col gap-6">
            {filteredRecipes.map((recipe, index) => (
              <div key={recipe.id} className="relative">
                <Link href={`/recipes/${recipe.id}`}>
                  <Image
                    src={recipe.img}
                    alt={recipe.title}
                    width={500}
                    height={350}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-56 object-cover rounded-xl"
                    loading="lazy"
                  />
                </Link>

                {/* إعلان بعد كل 3 كروت */}
                {(index + 1) % 3 === 0 && (
                  <div className="w-full my-6 flex justify-center">
                    <div className="w-full max-w-sm">
                      <AdSenseBanner adSlot="9257395922" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* شبكة الوصفات Desktop */}
          <div className="hidden xl:grid grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredRecipes.map((recipe) => (
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
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* ❤️ القلب */}
                    <div className="absolute top-3 right-3 z-20">
                      <div
                        className={`w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border flex items-center justify-center ${recipe.category.includes("الوصفات ألأكثر إعجابا")
                            ? "border-red-500"
                            : "border-gray-300"
                          }`}
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
              </div>
            ))}
          </div>
        </main>

        {/* إعلان يمين Desktop */}
        <aside className="hidden xl:block">
          <SideAd adSlot="9257395923" />
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
    </div>
  );
}
