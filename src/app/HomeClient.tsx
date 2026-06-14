"use client";
import { useMemo, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import recipesData from "@/data/recipes.json";
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

const ITEMS_PER_SECTION = 8;

function pickByCategory(all: Recipe[], cat: string, limit: number) {
  return all
    .filter((r) => r.category?.includes(cat))
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
}

// قائمة مرنة للكلمات المفتاحية ⇄ أيقونة (يمكنك توسيعها حسب الحاجة)
const categoryIcons: Record<string, string> = {
  "يخنات": "`🥗`",
  "العشاء": "🍲",
  "أطباق رئيسية": "🍲",
  "المطبخ الرمضانى": "🌙",
  "المطبخ الآسيوي": "🥢",
  "أمريكي": "🍔",
  "سندويشات": "🍔",
  "أوروبي": "🍝",
  "لاتيني": "🌮",
  "المطبخ الأفريقي": "🌍",
  "سلطات": "🥗",
  "مخللات": "🥒",
  "حلويات": "🍰",
  "مثلجات": "🍦",
  "آيس كريم": "🍦",
  "عصائر": "🍹",
  "مشروبات ساخنة": "☕",
  "عربي": "🧆",
  "المطبخ العربي": "🧆",
  "شرقي": "🥘",
  "بحري": "🍤",
  "لحوم": "🥩",
  "الغداء": "🥩",
  "أكلات عيدالأضحى": "🥩",
  "دجاج": "🍗",
  "خضروات": "🥦",
  "أكلات نباتية": "🥦",
  "فطور": "🥞",
  "الإفطار": "🥞",
  "معجنات": "🥐",
  "صوصات": "🍝",
  "شوربة": "🍜",
  "وجبات سريعة": "🚀",
};

const descriptionTemplates = [
  "تشكيلة رائعة من وصفات [name] بخطوات سهلة ونكهات أصيلة. جرّبها الآن وأضف لمسة جديدة لسفرتك.",
  "أفضل وصفات [name] اخترناها لك بعناية. من الأطباق الكلاسيكية إلى العصرية، كلها بمقادير مظبوطة.",
  "استمتع بتحضير أشهى أطباق [name] في منزلك. وصفات مجربة وسهلة التنفيذ تناسب جميع المستويات.",
  "اكتشف أسرار [name] مع مجموعتنا المتنوعة من الأطباق. نكهات غنية وتقديم مميز.",
  "كل ما تحتاج معرفته عن [name] في مكان واحد. وصفات اقتصادية وسريعة ومضمونة النتائج.",
];

function getCategoryMeta(cat: string): { icon: string; description: string } {
  const name = cat.replace(/-/g, " ");

  // اختيار أيقونة مناسبة (الافتراضي طبق طعام 🍽️)
  let icon = "🍽️";
  const catLower = cat.toLowerCase();
  for (const [keyword, ico] of Object.entries(categoryIcons)) {
    if (catLower.includes(keyword.toLowerCase())) {
      icon = ico;
      break;
    }
  }

  // اختيار وصف غير متكرر باستخدام تجزئة بسيطة
  const hash = cat.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const templateIndex = hash % descriptionTemplates.length;
  const description = descriptionTemplates[templateIndex].replace("[name]", name);

  return { icon, description };
}

const RecipeCard = memo(function RecipeCard({ recipe }: { recipe: Recipe }) {
  const recipeUrl = `/recipe/${String(recipe.slug)}`;

  return (
    <article className="group rounded-2xl overflow-hidden border transition shadow-sm bg-gray-800 border-gray-200 dark:border-white/10 hover:border-lime-400/70">
      <Link href={recipeUrl}>
        <div className="relative">
          <Image
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={recipe.img.url}
            alt={recipe.img.alt || recipe.title}
            width={900}
            height={650}
            className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
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
        </div>
      </Link>
    </article>
  );
});

export default function HomeClient() {
  const recipes = recipesData as Recipe[];

  const uniqueCategories = useMemo(() => {
    const cats = recipes.flatMap((r) => r.category);
    const unique = [...new Set(cats)];
    return unique.sort((a, b) => a.localeCompare(b, "ar"));
  }, [recipes]);

  //  البيانات المهيكلة JSON‑LD
  const structuredData = useMemo(() => {
    const recipeLD = recipes.map((r) => ({
      "@context": "https://schema.org/",
      "@type": "Recipe",
      name: r.title,
      image: r.img.url,
      author: { "@type": "Person", name: "شيف العرب" },
      recipeCategory: r.category.join(" • "),
      recipeCuisine: r.country,
      url: `https://www.chefalarab.com/recipe/${r.slug}`,
    }));

    const sectionLD = uniqueCategories.map((cat) => {
      const { description } = getCategoryMeta(cat);
      const items = pickByCategory(recipes, cat, ITEMS_PER_SECTION);
      return {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        name: cat.replace(/-/g, " "),
        description,
        hasPart: items.map((r) => ({
          "@type": "Recipe",
          name: r.title,
          url: `https://www.chefalarab.com/recipe/${r.slug}`,
        })),
      };
    });

    return [...recipeLD, ...sectionLD];
  }, [recipes, uniqueCategories]);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [structuredData]);

  const sectionsData = useMemo(
    () =>
      uniqueCategories.map((cat) => ({
        cat,
        items: pickByCategory(recipes, cat, ITEMS_PER_SECTION),
        meta: getCategoryMeta(cat),
      })),
    [recipes, uniqueCategories]
  );

  return (
    <main className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
      {/* HEADER */}
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
              <h1 className="text-3xl mt-8 md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                شيف العرب – وصفات طبخ عربية وعالمية سهلة
              </h1>
              <p className="mt-4 text-base md:text-2xl font-bold dark:text-white/90 text-gray-950">
                وصفات مجربة بخطوات واضحة ومقادير دقيقة تناسب الجميع.
              </p>
              <div className="mt-7 flex justify-center gap-3 flex-wrap">
                <Link
                  href="/recipes"
                  className="px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition"
                >
                  المزيد من الوصفات
                </Link>
                <a
                  href="#sections"
                  className="px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg shadow-md hover:scale-[1.03] transition"
                >
                  تصفح الأقسام
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ADS TOP */}
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

      {/* SECTIONS */}
      <section id="sections" className="py-10">
        <div className="max-w-6xl mx-auto px-3 space-y-10">
          {sectionsData.map((sec, i) => (
            <section key={sec.cat} aria-label={sec.cat}>
              <div className="rounded-2xl bg-gray-800 border border-gray-200 dark:border-white/10 p-5 md:p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-xl md:text-2xl text-white/80 font-extrabold">
                      {sec.meta.icon} {sec.cat.replace(/-/g, " ")}
                    </h2>
                    <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed">
                      {sec.meta.description}
                    </p>
                  </div>
                      <Link
                   href={`/recipes?category=${encodeURIComponent(sec.cat)}`}
                    className="inline-flex px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:scale-[1.02] transition"
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