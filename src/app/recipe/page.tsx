//Recipe Page
//Recipe Page
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Heart } from "lucide-react";
import recipesData from "../../../public/recipes.json";
import dynamic from "next/dynamic";

const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), {
  ssr: false,
});
const AdSenseBanner = dynamic(() => import("../Components/AdSenseBanner"), {
  ssr: false,
});

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
      <style jsx global>{`
        html,
        * {
          max-width: 100vw !important;
        }
      `}</style>

      <InterstitialAd interstitialUnitID="2901613977" />

      {/* الكتلة الرئيسية اللي فيها إعلان يمين + شمال + المحتوى */}
      <div className="flex justify-between max-w-7xl mx-auto gap-6 relative">

        {/* إعلان الشمال */}
        <aside className="hidden xl:block sticky top-24 self-start w-64">
          <AdSenseBanner
            adSlot="2901613977"
            adFormat="fluid"
            layoutKey="-fc+5g+70-cl-1m"
            style={{ display: "block" }}
          />
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-lime-400 text-black border-lime-400"
                    : "bg-gray-900 border-gray-700 text-lime-300 hover:bg-gray-800 hover:border-lime-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="group relative bg-[#0f1a25] rounded-xl overflow-hidden border border-gray-700 hover:border-lime-400 transition-all duration-300 shadow-md hover:shadow-lime-400/30"
              >

                <Link href={`/recipes/${recipe.slug}`}>
                  <div className="relative">
                    <Image
                      src={recipe.img}
                      alt={recipe.title}
                      width={500}
                      height={350}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    <div className="absolute top-3 right-3 z-20">
                      <div
                        className={`w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border flex items-center justify-center ${
                          recipe.category.includes("الوصفات ألأكثر إعجابا")
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
                  <p className="text-sm text-gray-400">
                    {recipe.country}
                  </p>
                </div>

                {(index + 1) % 3 === 0 && (
                  <div className="flex justify-center my-6 xl:hidden">
                    <AdSenseBanner
                      adSlot="2901613977"
                      adFormat="fluid"
                      layoutKey="-fc+5g+70-cl-1m"
                      style={{ display: "block" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* إعلان اليمين */}
        <aside className="hidden xl:block sticky top-24 self-start w-64">
          <AdSenseBanner
            adSlot="2901613977"
            adFormat="fluid"
            layoutKey="-fc+5g+70-cl-1m"
            style={{ display: "block" }}
          />
        </aside>

      </div>

      {/* زر الصعود للأعلى */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:scale-110 z-50"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
