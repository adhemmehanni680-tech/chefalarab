"use client";

import Image from "next/image";
import recipes from "../../../../public/recipes.json";
import AdSense from "../../Components/AdSense";
import InterstitialAd from "../../Components/InterstitialAd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  country: string;
  img: string;
  category: string[];
  description: string;
  ingredients?: string[];
  data_box?: string[];
  preparation?: string[];
}

interface RecipePageProps {
  params: { id: string };
}

export default function RecipePage({ params }: RecipePageProps) {
  const recipeId = parseInt(params.id);
  const recipe = recipes.find((r) => r.id === recipeId);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!recipe)
    return (
      <div className="text-center mt-20 text-red-500 text-xl px-4">
        ❌ الوصفة غير موجودة
      </div>
    );

  return (
    <main className="relative max-w-5xl mx-auto mt-24 px-4 sm:px-6 md:px-8 text-white box-border overflow-x-hidden overflow-y-visible">
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

      {/* إعلان Interstitial */}
      <InterstitialAd interstitialUnitID="1234567890" />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2 text-center break-words"
      >
        {recipe.title}
      </motion.h1>

      <p className="text-gray-400 text-center mb-4 text-sm sm:text-base break-words">
        {recipe.country}
      </p>

      {/* التصنيفات */}
      <div className="text-center mt-2 text-sm text-gray-400 mb-6 break-words">
        التصنيفات:{" "}
        <span className="text-orange-400">
          {recipe.category.join(" / ")}
        </span>
      </div>

      {/* الصورة */}
      {recipe.img && (
        <div className="flex justify-center mb-6">
          <div className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={recipe.img}
              alt={recipe.title}
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
              priority
            />
          </div>
        </div>
      )}
 {/* إعلان بعد الصوره */}
      <AdSense adSlot="9257395922" />
      {/* الوصف */}
      <p className="text-gray-600 text-base dark:text-white sm:text-lg leading-relaxed mb-8 text-center break-words px-1">
        {recipe.description}
      </p>

      {/* معلومات الوصفة والمكونات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
        {recipe.data_box?.length && (
          <div className="bg-gray-800 rounded-xl shadow-md p-4 text-center overflow-hidden">
            <h3 className="text-orange-400 font-semibold mb-2 text-sm sm:text-base">
              معلومات الوصفة
            </h3>
            <div className="grid gap-2">
              {recipe.data_box.map((info, i) => (
                <div
                  key={i}
                  className="bg-gray-900 p-2 rounded-lg text-xs sm:text-sm text-gray-300 hover:bg-orange-500 hover:text-white transition cursor-default break-words"
                >
                  {info}
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.ingredients?.length && (
          <div className="bg-gray-800 rounded-xl shadow-md p-4 text-center overflow-hidden">
            <h3 className="text-orange-400 font-semibold mb-3 text-sm sm:text-base">
              🧂 المكونات
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {recipe.ingredients.map((item, i) => (
                <span
                  key={i}
                  className="bg-gray-900 text-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm shadow-sm hover:bg-orange-500 hover:text-white transition cursor-default break-words"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* إعلان بعد المعلومات */}
      <AdSense adSlot="9257395921" />

      {/* خطوات التحضير */}
      {recipe.preparation?.length && (
        <section className="mb-6 w-full overflow-hidden">
          <h2 className="text-xl sm:text-2xl text-orange-400 font-semibold mb-3">
            🍳 خطوات التحضير
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 bg-gray-900 rounded-xl p-4 leading-relaxed text-sm sm:text-base">
            {recipe.preparation.map((step, i) => (
              <li
                key={i}
                className="hover:bg-orange-500 hover:text-white transition cursor-default p-1 sm:p-2 rounded break-words"
              >
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* إعلان بعد التحضير */}
      <AdSense adSlot="9257395922" />

      {/* زر الصعود للأعلى */}
      {showScrollTop && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-14 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 z-50"
          aria-label="العودة للأعلى"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </main>
  );
}
