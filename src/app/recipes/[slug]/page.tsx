// page Recipe[]
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import recipes from "../../../../public/recipes.json";
import dynamic from "next/dynamic";
const InterstitialAd = dynamic(() => import("../../Components/InterstitialAd"), {
  ssr: false,
});
const AdSenseBanner = dynamic(() => import("../../Components/AdSenseBanner"), {
  ssr: false,
});


interface Recipe {
  id: number;
  title: string;
  slug: string;
  country: string;
  img: string;
  category: string[];
  description: string;
  ingredients?: string[];
  data_box?: string[];
  preparation?: string[];
}

interface RecipePageProps {
  params: { slug: string };
}

export default function RecipePage({ params }: RecipePageProps) {
  // ✅✅✅ الحل النهائي هنا
  const decodedSlug = decodeURIComponent(params.slug);

  const recipe = (recipes as Recipe[]).find(
    (r) => r.slug === decodedSlug
  );

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!recipe)
    return (
      <div className="text-center mt-20 text-red-500 text-xl px-4">
        ❌ الوصفة غير موجودة
      </div>
    );

  return (
    <main className="relative max-w-5xl mx-auto mt-24 px-4 sm:px-6 md:px-8 text-white overflow-hidden">
      <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        * {
          max-width: 100vw !important;
        }
      `}</style>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2 text-center break-words"
      >
        
      <InterstitialAd interstitialUnitID="1234567890" />

        {recipe.title}
      </motion.h1>

      <p className="text-gray-400 text-center mb-4 text-sm sm:text-base break-words">
        {recipe.country}
      </p>

      <div className="text-center mt-2 text-sm text-gray-400 mb-6 break-words">
        التصنيفات:{" "}
        <span className="text-orange-400">
          {recipe.category.join(" / ")}
        </span>
      </div>

      {/* صورة الوصفة */}
      {recipe.img && (
        <div className="flex justify-center mb-6">
          <div className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={recipe.img}
              alt={recipe.title}
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 940px) 100vw, (max-width: 1024px) 75vw, 50vw"
              priority
              fetchPriority="high"
            />
          </div>
        </div>
      )}

      {/* إعلان بعد الصورة */}
      <div className="flex justify-center my-6">
        <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
          <AdSenseBanner adSlot="9257395922" adFormat="auto" />
        </div>
      </div>

      {/* وصف الوصفة */}
      <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 text-center break-words px-1">
        {recipe.description}
      </p>

      {/* معلومات ومكونات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
        {recipe.data_box?.length && (
          <div className="bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <h3 className="text-orange-400 font-semibold mb-2 text-sm sm:text-base">
              معلومات الوصفة
            </h3>
            <div className="grid gap-2">
              {recipe.data_box.map((info, i) => (
                <div
                  key={i}
                  className="bg-gray-900 p-2 rounded-lg text-xs sm:text-sm text-gray-300 break-words"
                >
                  {info}
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.ingredients?.length && (
          <div className="bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <h3 className="text-orange-400 font-semibold mb-3 text-sm sm:text-base">
              🧂 المكونات
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {recipe.ingredients.map((item, i) => (
                <span
                  key={i}
                  className="bg-gray-900 text-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm break-words"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* إعلان وسط المحتوى */}
      <div className="flex justify-center my-8">
        <AdSenseBanner adSlot="9257395921" adFormat="horizontal" />
      </div>

      {/* خطوات التحضير */}
      {recipe.preparation?.length && (
        <section className="mb-10 w-full">
          <h2 className="text-xl sm:text-2xl text-orange-400 font-semibold mb-4">
            🍳 خطوات التحضير
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 bg-gray-900 rounded-xl p-4 leading-relaxed text-sm sm:text-base">
            {recipe.preparation.map((step, i) => (
              <li
                key={i}
                className="p-1 sm:p-2 rounded break-words"
              >
                {step}
              </li>
            ))}
          </ol>

          {/* إعلان بعد التحضير */}
          <div className="flex justify-center my-8">
           <AdSenseBanner
  adSlot="2901613977"
  adFormat="fluid"
  layoutKey="-fc+5g+70-cl-1m"
  style={{ display: "block" }}
/>

          </div>
        </section>
      )}

      {/* زر الرجوع للأعلى */}
      {showScrollTop && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 z-50"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </main>
  );
}
