"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Heart } from "lucide-react";
import recipesData from "../../../public/recipes.json";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { adsEnabled } from "@/lib/ads";

const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), { ssr: false });
const AdSenseBanner = dynamic(() => import("../Components/AdSenseBanner"), { ssr: false });

const categories = [
  "جميع-الوصفات",
  "المطبخ-العربي",
  "المطبخ-الآسيوي",
  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني",
  "المطبخ-الأفريقي",
  "مخللات-و-سلطات",
  "حلويات",
  "مثلجات-و-مشروبات",
  "احدث-الوصفات",
] as const;

type Category = (typeof categories)[number];

export default function RecipesClient() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("جميع-الوصفات");
  const [showScroll, setShowScroll] = useState(false);

  const recipes = recipesData as any[];

  useEffect(() => {
    const cat = searchParams.get("category");
    if (!cat) return;

    if ((categories as readonly string[]).includes(cat)) {
      setActiveCategory(cat as Category);
      return;
    }

    const decoded = decodeURIComponent(cat);
    if ((categories as readonly string[]).includes(decoded)) {
      setActiveCategory(decoded as Category);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredRecipes = useMemo(() => {
    if (activeCategory === "جميع-الوصفات") return recipes;
    if (activeCategory === "احدث-الوصفات") return [...recipes].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    return recipes.filter((r) => r.category?.includes(activeCategory));
  }, [activeCategory, recipes]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="w-full py-10 px-2 md:px-4 lg:px-8 mt-16 relative bg-white dark:bg-gray-900 transition-colors duration-500 text-black dark:text-white">
      <style jsx global>{`
        html, * { max-width: 100vw !important; }
      `}</style>

      {adsEnabled && <InterstitialAd interstitialUnitID="2901613977" />}

      <div className="flex justify-between max-w-7xl mx-auto gap-6 relative">
        {adsEnabled && (
          <aside className="hidden xl:block sticky top-24 self-start w-64">
            <AdSenseBanner
              adSlot="2901613977"
              adFormat="fluid"
              layoutKey="-fc+5g+70-cl-1m"
              style={{ display: "block" }}
            />
          </aside>
        )}

        <main className="flex-1">
          <h1 className="text-3xl font-bold text-center mb-8">جميع وصفات شيف العرب</h1>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-lime-400 text-black border-lime-400 dark:text-black"
                    : "bg-gray-900 dark:bg-gray-800 border-gray-700 text-lime-300 dark:text-lime-400 hover:bg-gray-800 dark:hover:bg-gray-700 hover:border-lime-300"
                }`}
              >
                {cat.replace(/-/g, " ")}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 dark:border-gray-600 hover:border-lime-400 transition-all duration-300 shadow-md hover:shadow-lime-400/30"
              >
                <Link href={`/recipes/${recipe.slug}`}>
                  <div className="relative">
                    <Image
                      src={recipe.img.url}
                      alt={recipe.img.alt || recipe.title}
                      width={500}
                      height={350}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-2 z-20">
                      <div
                        className={`w-11 h-11 rounded-full bg-gray-900 backdrop-blur-sm border flex items-center justify-center ${
                          recipe.category?.includes("الوصفات ألأكثر إعجابا")
                            ? "border-lime-400"
                            : "border-gray-400 dark:border-gray-600"
                        }`}
                      >
                        <Heart
                          size={25}
                          className={
                            recipe.category?.includes("الوصفات ألأكثر إعجابا")
                              ? "text-lime-400 animate-bounce"
                              : "text-gray-200"
                          }
                        />
                      </div>
                    </div>
                  </div>
              

                <div className="p-4 text-center relative">
                  <h3 className="text-lg font-semibold mb-1 text-lime-400 group-hover:text-lime-600 dark:group-hover:text-lime-300 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-400">{recipe.country}</p>
                </div>
                    </Link>
                {adsEnabled && (index + 1) % 3 === 0 && (
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

        {adsEnabled && (
          <aside className="hidden xl:block sticky top-24 self-start w-64">
            <AdSenseBanner
              adSlot="2901613977"
              adFormat="fluid"
              layoutKey="-fc+5g+70-cl-1m"
              style={{ display: "block" }}
            />
          </aside>
        )}
      </div>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:scale-110 z-50"
          aria-label="العودة للأعلى"
          title="العودة للأعلى"
          type="button"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
