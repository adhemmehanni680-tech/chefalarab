"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { UtensilsCrossed } from "lucide-react";
import ChefImage from "../../public/Heeder.webp";
import { adsEnabled } from "@/lib/ads";

const AdSenseBanner = dynamic(() => import("./Components/AdSenseBanner"), {
  ssr: false,
});

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country: string;
  category: string[];
  tags?: string[];
  img: {
    url: string; // الصورة الكبيرة لصفحة الوصفة
    "url-card"?: string; // الصورة المصغرة للكروت
    alt?: string;
    width?: number;
    height?: number;
  };
  intro?: string;
  description?: string;
};

type HomeSection = {
  cat: string;
  items: Recipe[];
  meta: {
    icon: string;
    description: string;
  };
};


const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== "string") return false;
  if (url.trim() === "") return false;

  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith("/");
  }
};

const getCardImageUrl = (recipe: Recipe): string | undefined => {
  return recipe.img?.["url-card"] || recipe.img?.url;
};

const RecipeCard = memo(function RecipeCard({ recipe }: { recipe: Recipe }) {
  const recipeUrl = `/recipe/${String(recipe.slug)}`;

  const imageUrl = getCardImageUrl(recipe);
  const imageAlt = recipe.img?.alt || recipe.title;

  return (
    <article className="group rounded-2xl overflow-hidden border transition shadow-sm bg-gray-800 border-gray-200 dark:border-white/10 hover:border-lime-400/70">
      <Link href={recipeUrl}>
        <div className="relative">
          {isValidImageUrl(imageUrl) ? (
            <Image
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              src={imageUrl!}
              alt={imageAlt}
              width={500}
              height={350}
              className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
              unoptimized={imageUrl!.startsWith("http")}
            />
          ) : (
            <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
              <UtensilsCrossed size={44} className="text-gray-500" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-base font-bold text-lime-500 dark:text-lime-400 line-clamp-2 mb-1">
            {recipe.title}
          </h3>

          <p className="text-sm text-white/75 mb-2">{recipe.country}</p>

          <div className="text-xs text-white/55">
            {recipe.category
              ?.slice(0, 4)
              .map((c) => c.replace(/-/g, " "))
              .join(" • ")}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-gray-700 px-2 py-0.5 rounded-full text-gray-300"
                >
                  #{tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
});

export default function HomeClient({ sectionsData }: { sectionsData: HomeSection[] }) {
  return (
    <main className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
      <header className="relative w-full">
        <div className="relative w-full min-h-[52vh] md:min-h-[62vh] lg:min-h-[70vh]">
          <Image
            src={ChefImage}
            alt="شيف العرب – وصفات طبخ عربية وعالمية"
            priority
            fill
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-gray-50 dark:to-gray-900 transition-colors" />

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-center max-w-3xl">
              <h1 className="font-heading text-3xl mt-8 md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                شيف العرب – وصفات طبخ عربية وعالمية سهلة
              </h1>

              <p className="mt-4 text-base md:text-2xl font-bold dark:text-white/90 text-gray-950">
                وصفات مجربة بخطوات واضحة ومقادير دقيقة تناسب الجميع.
              </p>

              <div className="mt-7 flex justify-center gap-3 flex-wrap">
                <Link
                  href="/recipes"
                  className="px-5 py-3 bg-orange-500 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition"
                >
                  المزيد من الوصفات
                </Link>

                <a
                  href="#sections"
                  className="px-5 py-3 bg-orange-500 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition"
                >
                  تصفح الأقسام
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {adsEnabled && (
        <section className="max-w-6xl mx-auto px-3 -mt-6 md:-mt-10">
          <div className="rounded-2xl bg-gray-800 border border-gray-200 dark:border-white/10 p-5 md:p-6 shadow-sm">
            <div className="rounded-xl overflow-hidden bg-black/30 flex justify-center items-center">
              <AdSenseBanner
                adSlot="2901613977"
                adFormat="auto"
                style={{ display: "block", width: "100%" }}
              />
            </div>
          </div>
        </section>
      )}

      <section id="sections" className="py-10">
        <div className="max-w-6xl mx-auto px-3 space-y-10">
          {sectionsData.map((sec, i) => (
            <section key={sec.cat} aria-label={sec.cat}>
              <div className="rounded-2xl bg-gray-800 border border-gray-200 dark:border-white/10 p-5 md:p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-heading text-xl md:text-2xl text-white/80 font-extrabold">
                      {sec.meta.icon} {sec.cat.replace(/-/g, " ")}
                    </h2>

                    <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed">
                      {sec.meta.description}
                    </p>
                  </div>

                  <Link
                    href={`/recipes?category=${encodeURIComponent(sec.cat)}`}
                    className="inline-flex px-4 py-2 rounded-lg bg-orange-500 text-black font-semibold hover:scale-[1.02] transition whitespace-nowrap"
                  >
                    شاهد المزيد
                  </Link>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {sec.items.map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </div>

              {adsEnabled && i === 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="w-full max-w-4xl rounded-2xl bg-gray-800 border border-gray-200 dark:border-white/10 p-5 md:p-6 shadow-sm">
                    <div className="rounded-xl overflow-hidden bg-black/30 flex justify-center items-center">
                      <AdSenseBanner
                        adSlot="2901613977"
                        adFormat="fluid"
                        layoutKey="-fc+5g+70-cl-1m"
                        style={{ display: "block", width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}