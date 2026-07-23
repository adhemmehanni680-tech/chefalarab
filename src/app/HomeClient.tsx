"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";

import ChefImage from "../../public/Heeder.webp";
import { adsEnabled } from "@/lib/ads";

const AdSenseBanner = dynamic(() => import("./Components/AdSenseBanner"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[90px] w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
  ),
});

/* =============================== */
/* Types */
/* =============================== */

type RecipeImage = {
  url?: string;
  "url-card"?: string;
  alt?: string;
  width?: number;
  height?: number;
};

type Recipe = {
  id: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;
  img?: RecipeImage;
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

type HomeClientProps = {
  sectionsData: HomeSection[];
};

/* =============================== */
/* Constants */
/* =============================== */

const FALLBACK_IMAGE = "/Heeder.webp";
const NEXT_IMAGE_QUALITY = 70;

const IMAGE_BLUR_DATA =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23111827'/%3E%3Crect x='0' y='6' width='16' height='3' fill='%23f97316'/%3E%3C/svg%3E";

/* =============================== */
/* Helpers */
/* =============================== */

function normalizeImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;

  const cleanUrl = url.trim().replace(/\\/g, "/");
  if (!cleanUrl) return null;

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  return cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
}

function getImageFileName(url?: string | null): string | null {
  if (!url) return null;

  const cleanUrl = url.split("?")[0].split("#")[0];
  const fileName = cleanUrl.split("/").filter(Boolean).pop();

  return fileName || null;
}

function uniqueImageSources(sources: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return sources
    .map(normalizeImageUrl)
    .filter((source): source is string => Boolean(source))
    .filter((source) => {
      if (seen.has(source)) return false;
      seen.add(source);
      return true;
    });
}

function getRecipeImageSources(recipe: Recipe): string[] {
  const card = normalizeImageUrl(recipe.img?.["url-card"]);
  const main = normalizeImageUrl(recipe.img?.url);
  const fileName = getImageFileName(card || main);

  return uniqueImageSources([
    card,
    fileName ? `/card/${fileName}` : null,
    main,
    fileName ? `/uploads/${fileName}` : null,
    FALLBACK_IMAGE,
  ]);
}

function getRecipeAlt(recipe: Recipe): string {
  return recipe.img?.alt || recipe.title || "صورة وصفة من شيف العرب";
}

function formatLabel(value?: string) {
  if (!value) return "";
  return value.replace(/-/g, " ");
}

function normalizeList(value?: string[] | string): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/* =============================== */
/* Ad Box */
/* =============================== */

function AdBox({
  type = "auto",
}: {
  type?: "auto" | "fluid";
}) {
  if (!adsEnabled) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-3">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-4">
        <div className="flex min-h-[90px] items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
          {type === "fluid" ? (
            <AdSenseBanner
              adSlot="2901613977"
              adFormat="fluid"
              layoutKey="-fc+5g+70-cl-1m"
              style={{ display: "block", width: "100%" }}
            />
          ) : (
            <AdSenseBanner
              adSlot="2901613977"
              adFormat="auto"
              style={{ display: "block", width: "100%" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================== */
/* Recipe Image */
/* =============================== */

function RecipeCardImage({
  recipe,
  priority = false,
}: {
  recipe: Recipe;
  priority?: boolean;
}) {
  const sources = useMemo(() => getRecipeImageSources(recipe), [recipe]);
  const sourcesKey = sources.join("|");

  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setFailed(false);
  }, [sourcesKey]);

  const currentSource = sources[sourceIndex];

  if (!currentSource || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800">
        <UtensilsCrossed size={44} className="text-gray-500" />
      </div>
    );
  }

  const isRemote =
    currentSource.startsWith("http://") || currentSource.startsWith("https://");

  return (
    <Image
      src={currentSource}
      alt={getRecipeAlt(recipe)}
      fill
      sizes="(max-width: 640px) 92vw, (max-width: 768px) 45vw, (max-width: 1024px) 31vw, 280px"
      quality={NEXT_IMAGE_QUALITY}
      placeholder="blur"
      blurDataURL={IMAGE_BLUR_DATA}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      unoptimized={isRemote}
      onError={() => {
        setSourceIndex((current) => {
          if (current < sources.length - 1) {
            return current + 1;
          }

          setFailed(true);
          return current;
        });
      }}
    />
  );
}

/* =============================== */
/* Recipe Card */
/* =============================== */

const RecipeCard = memo(function RecipeCard({
  recipe,
  priority = false,
}: {
  recipe: Recipe;
  priority?: boolean;
}) {
  const recipeUrl = `/recipe/${String(recipe.slug)}`;
  const categories = normalizeList(recipe.category).slice(0, 3);
  const tags = normalizeList(recipe.tags).slice(0, 3);

  return (
    <article className="group h-full overflow-hidden rounded-3xl border border-gray-200  shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl dark:border-gray-700 bg-gray-900">
      <Link href={recipeUrl} prefetch={false} className="flex h-full flex-col">
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-gray-800">
          <RecipeCardImage recipe={recipe} priority={priority} />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />

          {recipe.country && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white backdrop-blur">
              {recipe.country}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 min-h-[56px] text-base font-black leading-7 transition group-hover:text-orange-500 text-white">
            {recipe.title}
          </h3>

          {categories.length > 0 && (
            <p className="mt-2 line-clamp-1 text-xs font-bold text-gray-400">
              {categories.map(formatLabel).join(" • ")}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full  px-2.5 py-1 text-[11px] font-bold text-orange-600 bg-gray-900  dark:text-orange-00"
                >
                  #{formatLabel(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
});

/* =============================== */
/* Section Header */
/* =============================== */

function SectionHeader({ section }: { section: HomeSection }) {
  return (
    <div className="mb-5 overflow-hidden rounded-3xl border border-gray-200  p-5 shadow-sm dark:border-gray-700 bg-gray-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="">

          </div>

          <h2 className="text-xl  sm:text-2xl mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5  font-black text-orange-600 bg-gray-900  dark:text-orange-500">
            <span>{section.meta.icon}</span>
            <span>{formatLabel(section.cat)}</span>
          </h2>

          <p className="mt-2 max-w-3xl text-sm font-bold leading-7  text-gray-300 sm:text-base">
            {section.meta.description}
          </p>
        </div>

        <Link
          href={`/recipes?category=${encodeURIComponent(section.cat)}`}
          prefetch={false}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
        >
          شاهد المزيد
          <ArrowLeft size={18} />
        </Link>
      </div>
    </div>
  );
}

/* =============================== */
/* Hero */
/* =============================== */

function HomeHero() {
  return (
    <header className="relative w-full overflow-hidden">
      <div className="relative min-h-[520px] w-full sm:min-h-[560px] lg:min-h-[640px]">
        <Image
          src={ChefImage}
          alt="شيف العرب – وصفات طبخ عربية وعالمية"
          priority
          fill
          sizes="100vw"
          placeholder="blur"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-orange-50 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.28),transparent_45%)]" />

        <div className="absolute inset-0 flex items-center justify-center px-4 pt-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
              <UtensilsCrossed size={18} />
              وصفات عربية وعالمية سهلة
            </div>

            <h1 className="font-heading text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              شيف العرب – وصفات طبخ سهلة بطعم بيتي أصيل
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-8 text-white/90 sm:text-xl">
              وصفات مجربة بخطوات واضحة ومقادير دقيقة، مناسبة لكل يوم وكل
              مناسبة عائلية.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/recipes"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 sm:text-base"
              >
                المزيد من الوصفات
              </Link>

              <a
                href="#sections"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15 sm:text-base"
              >
                تصفح الأقسام
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =============================== */
/* Empty State */
/* =============================== */

function EmptyHomeState() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/10">
        <UtensilsCrossed size={34} />
      </div>

      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
        لا توجد وصفات للعرض حاليًا
      </h2>

      <p className="mt-3 text-sm font-bold leading-7 text-gray-500 dark:text-gray-400">
        تأكد من تمرير بيانات الأقسام والوصفات إلى الصفحة الرئيسية.
      </p>
    </section>
  );
}

/* =============================== */
/* Main Component */
/* =============================== */

export default function HomeClient({ sectionsData }: HomeClientProps) {
  const safeSections = useMemo(() => {
    return (sectionsData || []).filter(
      (section) => section?.cat && Array.isArray(section.items)
    );
  }, [sectionsData]);

  return (
    <main className="min-h-screen bg-orange-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <HomeHero />

      <div className="-mt-8 relative z-10">
        <AdBox type="auto" />
      </div>

      <section id="sections" className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl space-y-12 px-3 sm:px-4">
          {safeSections.length === 0 && <EmptyHomeState />}

          {safeSections.map((section, sectionIndex) => (
            <section key={section.cat} aria-label={section.cat}>
              <SectionHeader section={section} />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {section.items.slice(0, 8).map((recipe, recipeIndex) => (
                  <RecipeCard
                    key={recipe.slug || recipe.id}
                    recipe={recipe}
                    priority={sectionIndex === 0 && recipeIndex < 2}
                  />
                ))}
              </div>

              {adsEnabled && sectionIndex === 1 && (
                <div className="mt-8">
                  <AdBox type="fluid" />
                </div>
              )}
            </section>
          ))}
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-center shadow-xl shadow-orange-500/20 sm:p-8">
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              اكتشف كل وصفات شيف العرب
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-7 text-white/90 sm:text-base">
              تصفح مئات الوصفات العربية والعالمية حسب التصنيف، الدولة، أو نوع
              الوجبة.
            </p>

            <Link
              href="/recipes"
              prefetch={false}
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50"
            >
              الذهاب إلى صفحة الوصفات
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}