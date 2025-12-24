"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUp, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import recipes from "../../../../public/recipes.json";

// الإعلانات معطلة مؤقتًا
const InterstitialAd = () => null;
const AdSenseBanner = () => null;

function normalizeSlug(slug: string) {
  return slug
    .normalize("NFD")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .trim();
}

function normalizeDataBox(data: any) {
  if (data && !Array.isArray(data)) {
    const rows: string[] = [];
    if (data.prep_time_minutes)
      rows.push(`⏱ وقت التحضير: ${data.prep_time_minutes} دقيقة`);
    if (data.cook_time_minutes)
      rows.push(`🔥 وقت الطبخ: ${data.cook_time_minutes} دقيقة`);
    if (data.total_time_minutes)
      rows.push(`⌛ الوقت الكلي: ${data.total_time_minutes} دقيقة`);
    if (data.servings) rows.push(`👨‍👩‍👧‍👦 عدد الأشخاص: ${data.servings}`);
    if (data.meal_type) rows.push(`🍽 الوجبة: ${data.meal_type}`);
    if (data.difficulty) rows.push(`⭐ المستوى: ${data.difficulty}`);
    if (data.dish_type) rows.push(`🍲 نوع الطبق: ${data.dish_type}`);
    return rows;
  }
  if (Array.isArray(data)) return data;
  return [];
}

type Props = { params: { slug: string } };

export default function RecipeClient({ params }: Props) {
  const decodedSlug = decodeURIComponent(params.slug);

  const recipe = useMemo(() => {
    return (recipes as any[]).find(
      (r) =>
        r.status === "published" &&
        normalizeSlug(r.slug) === normalizeSlug(decodedSlug)
    );
  }, [decodedSlug]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!recipe) return null;

  const dataBoxItems = normalizeDataBox(recipe.data_box);
  const imageUrl = typeof recipe.img === "string" ? recipe.img : recipe.img?.url;
  const imageAlt =
    typeof recipe.img === "string" ? recipe.title : recipe.img?.alt || recipe.title;

  const steps = recipe.steps || recipe.preparation || [];
  const tips = recipe.tips || [];
  const commonMistakes = recipe.common_mistakes || [];
  const nutrition = recipe.nutrition || {};
  const faq = recipe.faq || [];

  return (
    <main className="relative max-w-5xl mx-auto mt-24 px-4 text-black dark:text-white bg-white dark:bg-gray-900">
      
      <InterstitialAd />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2 text-center"
      >
        {recipe.title}
      </motion.h1>

      <p className="text-gray-500 text-center mb-2 text-lg">{recipe.country}</p>

      {!!recipe.tags?.length && (
        <div className="text-center text-lg mb-4 text-black dark:text-orange-400">
          {recipe.tags.join(" • ")}
        </div>
      )}

      {imageUrl && (
        <div className="flex justify-center mb-6">
          <div className="relative w-full sm:w-3/4 aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              className="object-cover hover:scale-110 transition duration-500"
            />
          </div>
        </div>
      )}

      {recipe.intro && (
        <p className="text-center text-base sm:text-lg text-gray-800 dark:text-gray-300 mb-6">
          {recipe.intro}
        </p>
      )}

      {recipe.description && (
        <p className="text-center text-gray-900 dark:text-gray-300 mb-8 text-lg">
          {recipe.description}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {!!dataBoxItems.length && (
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <h3 className="text-orange-400 font-semibold mb-3">ℹ️ معلومات الوصفة</h3>
            <div className="grid gap-2">
              {dataBoxItems.map((item: string, i: number) => (
                <div
                  key={i}
                  className="bg-gray-700 text-white p-2 rounded-lg text-sm hover:bg-lime-500 hover:text-black"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {!!recipe.ingredients?.length && (
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <h3 className="text-orange-400 font-semibold mb-3">🧂 المكونات</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {recipe.ingredients.map((item: string, i: number) => (
                <span
                  key={i}
                  className="bg-gray-700 text-white p-2 rounded-lg text-sm hover:bg-lime-500 hover:text-black"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!!steps.length && (
        <section className="mb-10">
          <h2 className="text-2xl dark:text-orange-400 font-semibold mb-4 text-black">
            🍳 خطوات التحضير
          </h2>
          <ol className="list-decimal list-inside space-y-2 bg-gray-800 rounded-xl p-4">
            {steps.map((step: string, i: number) => (
              <li
                key={i}
                className="bg-gray-700 text-white p-2 rounded-lg hover:bg-lime-500 hover:text-black"
              >
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {!!tips.length && (
        <section className="mb-10">
          <h2 className="text-2xl dark:text-orange-400 font-semibold mb-4">💡 نصائح الطهي</h2>
          <ul className="list-disc list-inside space-y-2 bg-gray-800 rounded-xl p-4">
            {tips.map((tip: string, i: number) => (
              <li
                key={i}
                className="bg-gray-700 text-white p-2 rounded-lg hover:bg-lime-500 hover:text-black"
              >
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!commonMistakes.length && (
        <section className="mb-10">
          <h2 className="text-2xl dark:text-orange-400 font-semibold mb-4">⚠️ الأخطاء الشائعة</h2>
          <ul className="list-disc list-inside space-y-2 bg-gray-800 rounded-xl p-4">
            {commonMistakes.map((mistake: string, i: number) => (
              <li
                key={i}
                className="bg-gray-700 text-white p-2 rounded-lg hover:bg-lime-500 hover:text-black"
              >
                {mistake}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!Object.keys(nutrition).length && (
        <section className="mb-10">
          <h2 className="text-2xl dark:text-orange-400 font-semibold mb-4">🍏 القيمة الغذائية</h2>
          <ul className="list-inside space-y-2 bg-gray-800 rounded-xl p-4">
            {Object.entries(nutrition).map(([key, value]: any, i: number) => (
              <li
                key={i}
                className="bg-gray-700 text-white p-2 rounded-lg hover:bg-lime-500 hover:text-black"
              >
                {key}: {value}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!faq.length && (
        <section className="mb-10">
          <h2 className="text-2xl dark:text-orange-400 font-semibold mb-4">❓ أسئلة شائعة</h2>
          <div className="space-y-4 bg-gray-800 rounded-xl p-4">
            {faq.map((item: any, i: number) => (
              <div
                key={i}
                className="bg-gray-700 text-white p-2 rounded-lg hover:bg-lime-500 hover:text-black"
              >
                <p className="font-semibold">{item.question}</p>
                <p className="hover:text-black">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* زر الرجوع  */}
      <button
        onClick={() => window.history.back()}
        className="fixed bottom-96 left-6 bg-lime-500 p-3 shadow-lg py-2 rounded-xl z-50 hover:scale-105 transition-transform"
        aria-label="العودة للخلف"
      >
        <ArrowLeft size={18} />
      </button>

      <AdSenseBanner />

      {/* زر العودة للأعلى */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 bg-lime-500 p-3 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
          aria-label="العودة للأعلى"
          title="العودة للأعلى"
        >
          <ArrowUp />
        </button>
      )}
    </main>
  );
}
