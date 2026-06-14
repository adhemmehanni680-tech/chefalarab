"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import recipesData from "@/data/recipes.json";

import AdSenseBanner from "@/app/Components/AdSenseBanner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Head from "next/head";



/* =============================== */
interface RecipeImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface RecipeFAQ {
  question: string;
  answer: string;
}

interface Recipe {
  id?: number;
  title: string;
  slug: string;
  status: string;
  country?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  category?: string[];
  img?: string | RecipeImage;
  intro?: string;
  description?: string;
  data_box?: {
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    total_time_minutes?: number;
    servings?: number | string;
    meal_type?: string;
    difficulty?: string;
    dish_type?: string;
    [key: string]: any;
  };
  ingredients?: any;
  steps?: string[];
  tips?: string[];
  common_mistakes?: string[];
  nutrition?: Record<string, string | number>;
  faq?: RecipeFAQ[];
  internal_links?: { title: string; slug: string; anchor_text: string }[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
    og_title?: string;
    og_description?: string;
    og_image?: string;
  };
  schema?: Record<string, any>;
  faq_schema?: Record<string, any>;
  content_flags?: {
    has_video?: boolean;
    has_images?: boolean;
    has_faq?: boolean;
    is_long_form?: boolean;
  };
  cooking_tips?: string[];
}

/* =============================== */
function normalizeSlug(slug: string) {
  return slug
    .normalize("NFD")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .trim();
}

function normalizeDataBox(data?: any): string[] {
  if (!data) return [];
  const mapping: Record<string, string> = {
    prep_time_minutes: "⏱ وقت التحضير",
    cook_time_minutes: "🔥 وقت الطبخ",
    total_time_minutes: "⌛ الوقت الكلي",
    servings: "👨‍👩‍👧‍👦 عدد الأشخاص",
    meal_type: "🍽 الوجبة",
    difficulty: "⭐ المستوى",
    dish_type: "🍲 نوع الطبق",
  };

  return Object.keys(mapping)
    .map((key) => {
      const value = data[key];
      if (value === undefined || value === null) return null;
      return key.includes("time")
        ? `${mapping[key]}: ${value} دقيقة`
        : `${mapping[key]}: ${value}`;
    })
    .filter(Boolean) as string[];
}

function normalizeIngredients(data: any): { title?: string; items: string[] }[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    let currentTitle: string | undefined = undefined;
    const sections: { title?: string; items: string[] }[] = [];
    let currentItems: string[] = [];

    data.forEach((line) => {
      const lineStr = String(line);
      if (lineStr.endsWith(":") || lineStr.endsWith("?:")) {
        if (currentItems.length > 0) {
          sections.push({ title: currentTitle, items: currentItems });
        }
        currentTitle = lineStr;
        currentItems = [];
      } else {
        currentItems.push(lineStr);
      }
    });

    if (currentItems.length > 0) {
      sections.push({ title: currentTitle, items: currentItems });
    }

    return sections;
  }

  if (typeof data === "object") {
    return Object.entries(data).map(([key, value]) => ({
      title: key,
      items: Array.isArray(value) ? value.map(String) : [String(value)],
    }));
  }

  return [{ items: [String(data)] }];
}

function getRelativeDateArabic(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const diffInMs = Date.now() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 0) return "اليوم";
  if (diffInDays === 1) return "منذ يوم";
  if (diffInDays === 2) return "منذ يومين";
  if (diffInDays <= 10) return `منذ ${diffInDays} أيام`;
  return `منذ ${diffInDays} يومًا`;
}

/* =============================== */
const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.45 },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

/* =============================== */
type Props = { params: { slug: string } };

// Helper function to validate image URL
function isValidImageUrl(url: any): url is string {
  return typeof url === 'string' && url.trim().length > 0 && (url.startsWith('http') || url.startsWith('/'));
}

export default function RecipeClient({ params }: Props) {
  const decodedSlug = decodeURIComponent(params.slug);

  const recipes = useMemo(() => {
    const cleaned = (recipesData as any[]).map((item: any) => {
      if (item.nutrition) {
        const cleanNutrition: Record<string, string | number> = {};
        for (const key in item.nutrition) {
          if (item.nutrition[key] !== undefined && item.nutrition[key] !== null) {
            cleanNutrition[key] = item.nutrition[key];
          }
        }
        return { ...item, nutrition: cleanNutrition };
      }
      return item;
    });
    return cleaned as Recipe[];
  }, []);

  // 1. البحث عن الوصفة المطلوبة (useMemo قبل أي return)
  const recipe = useMemo(
    () =>
      recipes.find(
        (r) =>
          r.status === "published" &&
          normalizeSlug(r.slug) === normalizeSlug(decodedSlug)
      ),
    [decodedSlug, recipes]
  );

  // 2. حساب الوصفات المشابهة (إذا كانت الوصفة موجودة وإلا [])
  const relatedRecipes = useMemo(() => {
    if (!recipe) return [];

    const getSimilarityScore = (recipeA: Recipe, recipeB: Recipe): number => {
      let score = 0;

      // تشابه في التصنيفات (category)
      const categoriesA = recipeA.category || [];
      const categoriesB = recipeB.category || [];
      const commonCategories = categoriesA.filter((cat) =>
        categoriesB.includes(cat)
      );
      score += commonCategories.length * 4;

      // تشابه في العلامات (tags)
      const tagsA = recipeA.tags || [];
      const tagsB = recipeB.tags || [];
      const commonTags = tagsA.filter((tag) => tagsB.includes(tag));
      score += commonTags.length * 3;

      // تشابه في نوع الوجبة (meal_type)
      const mealTypeA = recipeA.data_box?.meal_type;
      const mealTypeB = recipeB.data_box?.meal_type;
      if (mealTypeA && mealTypeB && mealTypeA === mealTypeB) {
        score += 5;
      }

      // تشابه في نوع الطبق (dish_type)
      const dishTypeA = recipeA.data_box?.dish_type;
      const dishTypeB = recipeB.data_box?.dish_type;
      if (dishTypeA && dishTypeB && dishTypeA === dishTypeB) {
        score += 5;
      }

      // تشابه في البلد
      if (recipeA.country && recipeB.country && recipeA.country === recipeB.country) {
        score += 2;
      }

      // تشابه في درجة الصعوبة
      const difficultyA = recipeA.data_box?.difficulty;
      const difficultyB = recipeB.data_box?.difficulty;
      if (difficultyA && difficultyB && difficultyA === difficultyB) {
        score += 1;
      }

      return score;
    };

    return recipes
      .filter((r) => r.status === "published" && r.slug !== recipe.slug)
      .map((r) => ({ recipe: r, score: getSimilarityScore(recipe, r) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.recipe);
  }, [recipe, recipes]);

  // 3. باقي الـ Hooks (useState, useEffect) - تُستدعى دائمًا بنفس الترتيب
  const [activeTab, setActiveTab] = useState<"data" | "ingredients">("data");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);


  // 4. بعد استدعاء جميع Hooks، يمكن الإرجاع المبكر بأمان
  if (!recipe) return null;

  const dataBoxItems = normalizeDataBox(recipe.data_box);
  const ingredientSections = normalizeIngredients(recipe.ingredients);
  const steps = recipe.steps ?? [];
  const tips = recipe.tips ?? [];
  const commonMistakes = recipe.common_mistakes ?? [];
  const nutrition = recipe.nutrition ?? {};
  const faq = recipe.faq ?? [];

  const imageUrl =
    typeof recipe.img === "string" ? recipe.img : recipe.img?.url;

  const imageAlt =
    typeof recipe.img === "string"
      ? recipe.title
      : recipe.img?.alt || recipe.title;

  const seoTitle =
    recipe.seo?.meta_title || `طريقة عمل ${recipe.title} - موقع الوصفات`;
  const seoDescription =
    recipe.seo?.meta_description || recipe.description || recipe.intro || "";
  const seoKeywords =
    recipe.seo?.keywords?.join(", ") || recipe.tags?.join(", ") || "";
  const seoOgTitle = recipe.seo?.og_title || seoTitle;
  const seoOgDescription = recipe.seo?.og_description || seoDescription;
  const seoOgImage = recipe.seo?.og_image || imageUrl || "";

  const fallbackStructuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    image: imageUrl
      ? [
        typeof recipe.img === "string"
          ? imageUrl
          : {
            "@type": "ImageObject",
            url: imageUrl,
            width: recipe.img?.width,
            height: recipe.img?.height,
          },
      ]
      : [],
    description: recipe.description ?? recipe.intro ?? "",
    recipeIngredient: ingredientSections.flatMap((s) => s.items),
    recipeInstructions: steps.map((s) => ({
      "@type": "HowToStep",
      text: s,
    })),
    prepTime: recipe.data_box?.prep_time_minutes
      ? `PT${recipe.data_box.prep_time_minutes}M`
      : undefined,
    cookTime: recipe.data_box?.cook_time_minutes
      ? `PT${recipe.data_box.cook_time_minutes}M`
      : undefined,
    totalTime: recipe.data_box?.total_time_minutes
      ? `PT${recipe.data_box.total_time_minutes}M`
      : undefined,
    recipeYield: recipe.data_box?.servings
      ? String(recipe.data_box.servings)
      : undefined,
    nutrition:
      Object.keys(nutrition).length > 0
        ? {
          "@type": "NutritionInformation",
          ...nutrition,
        }
        : undefined,
    inLanguage: recipe.language || "ar",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://chefalarab.com/recipe/${recipe.slug}`,
    },
  };

  const structuredData = recipe.schema ?? fallbackStructuredData;

  const generatedFaqSchema =
    faq.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
      : null;

  const faqSchema = recipe.faq_schema ?? generatedFaqSchema;

  const createdAt = recipe.created_at
    ? new Date(recipe.created_at).toLocaleDateString("ar-EG")
    : "";

  const updatedAtRelative = getRelativeDateArabic(recipe.updated_at);

  // Validate main image URL
  const validMainImageUrl = isValidImageUrl(imageUrl) ? imageUrl : null;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {seoKeywords && <meta name="keywords" content={seoKeywords} />}
        <meta property="og:title" content={seoOgTitle} />
        <meta property="og:description" content={seoOgDescription} />
        {seoOgImage && <meta property="og:image" content={seoOgImage} />}
        <meta property="og:type" content="article" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
      </Head>

      <main className="max-w-full sm:max-w-5xl mx-auto mt-20 px-4 sm:px-6 text-black dark:text-white bg-white dark:bg-gray-900">
       
          <motion.h1
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500 mb-5 text-center leading-snug mt-10"
      >
        {recipe.title.split(" ").map((word, index, arr) => (
          // استخدمنا الـ Fragment المختصر <>
          <span key={index}>
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
              }}
              style={{ display: "inline-block" }}
            >
              {word}
            </motion.span>
            {index < arr.length - 1 && " "}
          </span>
        ))}
            </motion.h1>

        <motion.h4
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-xl sm:text-xl md:text-2xl font-bold text-orange-500 mb-5 text-center leading-snug"
        >
          {recipe.country}
        </motion.h4>

        {validMainImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
            className="mb-6 w-full flex justify-center"
          >
            <div className="relative w-full sm:w-11/12 md:w-4/5 lg:w-3/4 aspect-[16/9] max-h-[400px] rounded-xl overflow-hidden">
              <Image
                src={validMainImageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
               priority   
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={!validMainImageUrl.startsWith('http')}
              />
            </div>
          </motion.div>
        )}

        <AdSenseBanner adSlot="1234567890" />

        {recipe.intro && (
          <motion.p
            {...fadeUp}
            className="bg-gray-800 p-3 sm:p-4 rounded-xl text-white mb-8 text-sm sm:text-base"
          >
            {recipe.intro}
          </motion.p>
        )}

        {recipe.description && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.48, delay: 0.05 }}
            className="bg-gray-800 p-3 sm:p-4 rounded-xl text-white mb-8 text-sm sm:text-base"
          >
            {recipe.description}
          </motion.div>
        )}

        <motion.div
          {...fadeUp}
          className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4 text-sm text-gray-200"
        >
          {createdAt && (
            <motion.span
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800 px-3 py-1 rounded-lg"
            >
              📅 تاريخ النشر: {createdAt}
            </motion.span>
          )}
          {updatedAtRelative && (
            <motion.span
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800 px-3 py-1 rounded-lg"
            >
              🔄 تم التحديث {updatedAtRelative}
            </motion.span>
          )}
        </motion.div>

        <AdSenseBanner adSlot="1234567890" />

        {(dataBoxItems.length > 0 || ingredientSections.length > 0) && (
          <motion.section {...fadeUp} className="mb-10">
            <div className="flex gap-2 mb-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("data")}
                className={`flex-1 p-3 rounded-xl font-bold ${activeTab === "data"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-800 text-white"
                  }`}
              >
                📊 معلومات الوصفة
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("ingredients")}
                className={`flex-1 p-3 rounded-xl font-bold ${activeTab === "ingredients"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-800 text-white"
                  }`}
              >
                🧂 المكونات
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "data" && (
                <motion.ul
                  key="data-tab"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {dataBoxItems.map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ scale: 1.015 }}
                      className="bg-gray-700 p-3 rounded text-white"
                    >
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              )}

              {activeTab === "ingredients" && (
                <motion.div
                  key="ingredients-tab"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {ingredientSections.map((section, i) => (
                    <div key={i}>
                      {section.title && (
                        <motion.h3
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-xl sm:text-xl md:text-xl lg:text-2xl font-bold dark:text-orange-400 mb-3"
                        >
                          {section.title}
                        </motion.h3>
                      )}
                      <motion.ul
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="space-y-2 list-disc list-inside"
                      >
                        {section.items.map((item, j) => (
                          <motion.li
                            key={j}
                            variants={staggerItem}
                            whileHover={{ scale: 1.015 }}
                            className="bg-gray-700 p-2 rounded-lg text-white hover:bg-lime-500 hover:text-black break-words"
                          >
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        <AdSenseBanner adSlot="1234567890" />

        {steps.length > 0 && (
          <motion.section {...fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-orange-400 mb-3">
              🍳 خطوات التحضير
            </h2>
            <motion.ol
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="list-decimal list-inside space-y-2 bg-gray-800 p-3 rounded-xl text-sm sm:text-base break-words text-right"
            >
              {steps.map((step: string, i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-lime-500 hover:text-black break-words"
                >
                  {step}
                </motion.li>
              ))}
            </motion.ol>
          </motion.section>
        )}

        {tips.length > 0 && (
          <motion.section {...fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-orange-400 mb-3">
              💡 نصائح
            </h2>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="list-disc list-inside pl-5 space-y-1 text-right"
            >
              {tips.map((t: string, i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-lime-500 hover:text-black text-lg break-words"
                >
                  {t}
                </motion.li>
              ))}
            </motion.ul>
          </motion.section>
        )}

        {commonMistakes.length > 0 && (
          <motion.section {...fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-orange-400 mb-3">
              ⚠️ الأخطاء الشائعة
            </h2>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="list-disc list-inside pl-5 space-y-1 text-right"
            >
              {commonMistakes.map((m: string, i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-lime-500 hover:text-black text-lg break-words"
                >
                  {m}
                </motion.li>
              ))}
            </motion.ul>
          </motion.section>
        )}

        {Object.keys(nutrition).length > 0 && (
          <motion.section {...fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-orange-400 mb-3">
              🍏 القيمة الغذائية
            </h2>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="list-disc list-inside pl-5 space-y-1 text-right"
            >
              {Object.entries(nutrition).map(([k, v], i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-lime-500 hover:text-black text-lg break-words"
                >
                  {k}: {v}
                </motion.li>
              ))}
            </motion.ul>
          </motion.section>
        )}

        {faq.length > 0 && (
          <motion.section {...fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-orange-400 mb-3">
              ❓ أسئلة شائعة
            </h2>

            <div className="space-y-2">
              {faq.map((f: { question: string; answer: string }, i: number) => {
                const isOpen = openFaqIndex === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="bg-gray-700 rounded-lg text-white overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-3 text-right flex items-center justify-between hover:bg-lime-500 hover:text-black transition-colors"
                    >
                      <span className="font-bold text-lg">{f.question}</span>
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 pt-0 text-lg break-words">{f.answer}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {relatedRecipes.length > 0 && (
          <motion.section {...fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-orange-400 mb-3">
              🍽 وصفات مشابهة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedRecipes.map((r, i) => {
                const imgUrl = typeof r.img === "string" ? r.img : r.img?.url;
                const imgAlt =
                  typeof r.img === "string" ? r.title : r.img?.alt || r.title;
                const validImgUrl = isValidImageUrl(imgUrl) ? imgUrl : null;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="bg-gray-800 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-transform"
                  >
                    <Link href={`/recipe/${r.slug}`}>
                      {validImgUrl ? (
                        <div className="relative w-full aspect-[16/9]">
                          <Image
                            src={validImgUrl}
                            alt={imgAlt}
                            fill
                           priority   
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[16/9] bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image Available</span>
                        </div>
                      )}
                      <div className="p-2 text-white text-sm sm:text-base font-semibold break-words">
                        {r.title}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

       

      
      </main>
    </>
  );
}