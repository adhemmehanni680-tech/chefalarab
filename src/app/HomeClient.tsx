"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowUp, Heart as HeartIcon } from "lucide-react";

import recipesData from "../../public/recipes.json";
import ChefImage from "../../public/Heeder.webp";
import { adsEnabled } from "@/lib/ads";

const AdSenseBanner = dynamic(() => import("./Components/AdSenseBanner"), { ssr: false });

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country: string;
  category: string[];
  img: { url: string; alt?: string };
};

const SECTION_TYPES = [
  "المطبخ-العربي",
  "المطبخ-الآسيوي",
  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني",
  "المطبخ-الأفريقي",
  "مخللات-و-سلطات",
  "حلويات",
  "مثلجات-و-مشروبات",
] as const;

const SECTION_DESC: Record<
  (typeof SECTION_TYPES)[number],
  { icon: string; description: string }
> = {
  "المطبخ-العربي": {
    icon: "🍲",
    description:
      "وصفات عربية أصيلة تجمع النكهات التقليدية مع سهولة التحضير لكل الأذواق.",
  },
  "المطبخ-الآسيوي": {
    icon: "🥢",
    description: "استمتع بأطباق آسيوية مبتكرة وسهلة التحضير في منزلك.",
  },
  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني": {
    icon: "🍽️",
    description: "تجربة عالمية لأشهى وصفات مطابخ العالم بطريقة مبسطة.",
  },
  "المطبخ-الأفريقي": {
    icon: "🌍🍲",
    description: "استكشف نكهات غنية ومميزة من المطبخ الإفريقي بسهولة.",
  },
  "مخللات-و-سلطات": {
    icon: "🥗🥒",
    description: "وصفات صحية ومنعشة للسلطات والمخللات بأسلوب سهل وسريع.",
  },
  "حلويات": {
    icon: "🍰",
    description: "مجموعة غنية من الحلويات السهلة التحضير والممتعة.",
  },
  "مثلجات-و-مشروبات": {
    icon: "🍹❄️",
    description: "أفضل المثلجات والمشروبات المنعشة لجميع الأذواق والفصول.",
  },
};

const ITEMS_PER_SECTION = 8;

function pickByCategory(all: Recipe[], cat: (typeof SECTION_TYPES)[number], limit: number) {
  return all
    .filter((r) => r.category?.includes(cat))
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
}

export default function HomeClient() {
  const recipes = recipesData as Recipe[];
  const [showScroll, setShowScroll] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const sectionsData = useMemo(() => {
    return SECTION_TYPES.map((cat) => ({
      cat,
      items: pickByCategory(recipes, cat, ITEMS_PER_SECTION),
    }));
  }, [recipes]);

  return (
    <motion.main className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
      <style jsx global>{`
        html, body { overflow-x: hidden !important; }
      `}</style>

      {/* HEADER */}
      <header className="relative w-full">
        <div className="relative w-full min-h-[52vh] md:min-h-[62vh] lg:min-h-[70vh]">
          <Image
            src={ChefImage}
            alt="شيف العرب - وصفات طبخ عربية وعالمية"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-gray-50 dark:to-gray-900 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-center max-w-3xl">
              <h1 className="text-3xl mt-8 md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                شيف العرب – وصفات طبخ عربية وعالمية سهلة
              </h1>
              <p className="mt-4 text-base md:text-2xl font-bold dark:text-white/90 text-gray-950">
                وصفات مجربة بخطوات واضحة ومقادير دقيقة تناسب الجميع.
              </p>
              <div className="mt-7 flex justify-center gap-3 flex-wrap">
                <Link href="/recipe" className="px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition">
                  المزيد من الوصفات
                </Link>
                <a href="#sections" className="px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition">
                  تصفح الأقسام
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {adsEnabled && (
        <section className="max-w-6xl mx-auto px-3 -mt-6 md:-mt-10">
          <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 md:p-4 shadow-sm">
            <AdSenseBanner adSlot="2901613977" adFormat="auto" style={{ display: "block" }} />
          </div>
        </section>
      )}

      {/* SECTIONS */}
      <section id="sections" className="py-10">
        <div className="max-w-6xl mx-auto px-3 space-y-10">
          {sectionsData.map((sec, i) => (
            <section key={sec.cat} aria-label={sec.cat}>
              <div className="rounded-2xl bg-gray-800 border border-gray-200 dark:border-white/10 p-5 md:p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-xl md:text-2xl text-white/80 font-extrabold">
                      {SECTION_DESC[sec.cat].icon} {sec.cat.replace(/-/g, " ")}
                    </h2>
                    <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed">
                      {SECTION_DESC[sec.cat].description}
                    </p>
                  </div>
                  <Link href={`/recipe?category=${encodeURIComponent(sec.cat)}`} className="inline-flex px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:scale-[1.02] transition">
                    شاهد المزيد
                  </Link>
                </div>
              </div>

              {/* Grid */}
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {sec.items.map((recipe) => {
                  const isFav = favorites.includes(recipe.id) || recipe.category?.includes("الوصفات ألأكثر إعجابا");
                  return (
                    <article key={recipe.id} className="group rounded-2xl overflow-hidden border transition shadow-sm bg-gray-800 border-gray-200 dark:border-white/10 hover:border-lime-400/70">
                      <Link href={`/recipes/${recipe.slug}`}>
                        <div className="relative">
                          <Image
                            src={recipe.img.url}
                            alt={recipe.img.alt || recipe.title}
                            width={900}
                            height={650}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                          />
                          <span className="absolute top-3 right-3 rounded-full p-2 border bg-black/55 border-white/10">
                            <HeartIcon size={25} className={isFav ? "text-lime-400 animate-bounce" : "text-white/70"} />
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-bold text-lime-500 dark:text-lime-400 line-clamp-2 mb-1">{recipe.title}</h3>
                          <p className="text-sm text-white/75 mb-2">{recipe.country}</p>
                          <div className="text-xs text-white/55">
                            {recipe.category?.slice(0, 4).map((c) => c.replace(/-/g, " ")).join(" • ")}
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              {adsEnabled && i === 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 md:p-4 shadow-sm">
                    <AdSenseBanner adSlot="2901613977" adFormat="fluid" layoutKey="-fc+5g+70-cl-1m" style={{ display: "block" }} />
                  </div>
                </div>
              )}
            </section>
          ))}

          {adsEnabled && (
            <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 md:p-4 shadow-sm">
              <AdSenseBanner adSlot="2901613977" adFormat="auto" style={{ display: "block" }} />
            </div>
          )}
        </div>
      </section>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:scale-110 z-50"
          aria-label="العودة للأعلى"
          title="العودة للأعلى"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </motion.main>
  );
}
