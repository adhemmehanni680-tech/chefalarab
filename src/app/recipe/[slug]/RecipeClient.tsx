"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import AdSenseBanner from "@/app/Components/AdSenseBanner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* =============================== */

interface RecipeImage {
  url: string;
  "url-card"?: string;
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
  status?: string;
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
  internal_links?: {
    title: string;
    slug: string;
    anchor_text: string;
  }[];
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

      if (value === undefined || value === null || value === "") return null;

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
          sections.push({
            title: currentTitle,
            items: currentItems,
          });
        }

        currentTitle = lineStr;
        currentItems = [];
      } else {
        currentItems.push(lineStr);
      }
    });

    if (currentItems.length > 0) {
      sections.push({
        title: currentTitle,
        items: currentItems,
      });
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
  initial: {
    opacity: 0,
    y: 22,
  },
  whileInView: {
    opacity: 1,
    y: 0,
  },
  viewport: {
    once: true,
    amount: 0.15,
  },
  transition: {
    duration: 0.45,
  },
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
  hidden: {
    opacity: 0,
    y: 14,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

/* =============================== */

type Props = {
  recipe: Recipe;
  relatedRecipes: Recipe[];
};

/* =============================== */
/* تحسين الصور */
/* =============================== */

function normalizeImageUrl(url: any): string | null {
  if (typeof url !== "string") return null;

  const cleanUrl = url.trim().replace(/\\/g, "/");

  if (!cleanUrl) return null;

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  return cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
}

function getImageFileName(url?: string | null) {
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

function getMainImageSources(recipe: Recipe) {
  const mainUrl = typeof recipe.img === "string" ? recipe.img : recipe.img?.url;

  const cardUrl =
    typeof recipe.img === "string" ? null : recipe.img?.["url-card"];

  const main = normalizeImageUrl(mainUrl);
  const card = normalizeImageUrl(cardUrl);

  const fileName = getImageFileName(main || card);

  const sources: Array<string | null> = [];

  if (main) {
    sources.push(main);
  } else if (fileName) {
    sources.push(`/uploads/${fileName}`);
  }

  if (card) {
    sources.push(card);
  } else if (fileName) {
    sources.push(`/card/${fileName}`);
  }

  sources.push("/Heeder.webp");

  return uniqueImageSources(sources);
}

function getRelatedImageSources(recipe: Recipe) {
  const mainUrl = typeof recipe.img === "string" ? recipe.img : recipe.img?.url;

  const cardUrl =
    typeof recipe.img === "string" ? null : recipe.img?.["url-card"];

  const main = normalizeImageUrl(mainUrl);
  const card = normalizeImageUrl(cardUrl);

  const fileName = getImageFileName(card || main);

  const sources: Array<string | null> = [];

  if (card) {
    sources.push(card);
  } else if (fileName) {
    sources.push(`/card/${fileName}`);
  }

  if (main) {
    sources.push(main);
  } else if (fileName) {
    sources.push(`/uploads/${fileName}`);
  }

  sources.push("/Heeder.webp");

  return uniqueImageSources(sources);
}

const IMAGE_BLUR_DATA =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23f3f4f6'/%3E%3Crect x='0' y='6' width='16' height='3' fill='%23fed7aa'/%3E%3C/svg%3E";

function InlineImageFallback({ alt }: { alt: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 text-center text-orange-950 p-4">
      <span className="text-4xl mb-2">🍽️</span>

      <span className="text-sm sm:text-base font-bold leading-relaxed">
        {alt || "صورة الوصفة"}
      </span>

      <span className="mt-2 text-xs text-orange-900/70">
        تأكد من وجود الصورة داخل public/uploads أو public/card
      </span>
    </div>
  );
}

type SmartImageProps = {
  sources: string[];
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
};

function SmartRecipeImage({
  sources,
  alt,
  className = "object-cover",
  sizes,
  priority = false,
  quality = 72,
}: SmartImageProps) {
  const sourcesKey = sources.join("|");

  const stableSources = useMemo(() => {
    return sources.filter(Boolean);
  }, [sourcesKey]);

  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourcesKey]);

  const currentSource = stableSources[sourceIndex];

  if (!currentSource) return <InlineImageFallback alt={alt} />;

  const isRemote =
    currentSource.startsWith("http://") || currentSource.startsWith("https://");

  return (
    <Image
      key={currentSource}
      src={currentSource}
      alt={alt}
      fill
      className={`${className} transition-opacity duration-300`}
      sizes={sizes}
      quality={quality}
      placeholder="blur"
      blurDataURL={IMAGE_BLUR_DATA}
      decoding="async"
      unoptimized={isRemote}
      {...(priority
        ? {
            priority: true,
            fetchPriority: "high" as const,
          }
        : {
            loading: "lazy" as const,
            fetchPriority: "auto" as const,
          })}
      onError={() => {
        setSourceIndex((current) =>
          current < stableSources.length - 1 ? current + 1 : current
        );
      }}
    />
  );
}

/* =============================== */
/* كارت الوصفات المشابهة */
/* =============================== */

const RelatedRecipeCard = memo(function RelatedRecipeCard({
  recipe,
  index,
}: {
  recipe: Recipe;
  index: number;
}) {
  const relatedImageSources = useMemo(
    () => getRelatedImageSources(recipe),
    [recipe]
  );

  const imgAlt =
    typeof recipe.img === "string"
      ? recipe.title
      : recipe.img?.alt || recipe.title;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.03,
      }}
      whileHover={{
        scale: 1.03,
        y: -3,
      }}
      className="bg-gray-800 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-transform"
    >
      <Link href={`/recipe/${recipe.slug}`} prefetch={false}>
        <div className="relative w-full aspect-[16/9] bg-gray-700">
          <SmartRecipeImage
            sources={relatedImageSources}
            alt={imgAlt}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 260px"
            quality={60}
          />
        </div>

        <div className="p-2 text-white text-sm sm:text-base font-semibold break-words">
          {recipe.title}
        </div>
      </Link>
    </motion.div>
  );
});

/* =============================== */

export default function RecipeClient({ recipe, relatedRecipes }: Props) {
  const [activeTab, setActiveTab] = useState<"data" | "ingredients">("data");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const dataBoxItems = useMemo(
    () => normalizeDataBox(recipe.data_box),
    [recipe.data_box]
  );

  const ingredientSections = useMemo(
    () => normalizeIngredients(recipe.ingredients),
    [recipe.ingredients]
  );

  const steps = recipe.steps ?? [];
  const tips = recipe.tips ?? [];
  const commonMistakes = recipe.common_mistakes ?? [];
  const nutrition = recipe.nutrition ?? {};
  const faq = recipe.faq ?? [];

  const imageAlt =
    typeof recipe.img === "string"
      ? recipe.title
      : recipe.img?.alt || recipe.title;

  const mainImageSources = useMemo(() => getMainImageSources(recipe), [recipe]);

  const createdAt = recipe.created_at
    ? new Date(recipe.created_at).toLocaleDateString("ar-EG")
    : "";

  const updatedAtRelative = getRelativeDateArabic(recipe.updated_at);

  return (
    <>
      <main
        dir="rtl"
        className="max-w-full sm:max-w-5xl mx-auto mt-20 px-4 sm:px-6 text-black dark:text-white bg-white dark:bg-gray-900"
      >
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500 mb-5 text-center leading-snug mt-10"
        >
          {recipe.title.split(" ").map((word, index, arr) => (
            <span key={index}>
              <motion.span
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 25,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                style={{
                  display: "inline-block",
                }}
              >
                {word}
              </motion.span>

              {index < arr.length - 1 && " "}
            </span>
          ))}
        </motion.h1>

        {recipe.country && (
          <motion.h4
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.08,
            }}
            className="text-xl sm:text-xl md:text-2xl font-bold text-orange-500 mb-5 text-center leading-snug"
          >
            {recipe.country}
          </motion.h4>
        )}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.55,
          }}
          className="mb-6 w-full flex justify-center"
        >
          <div className="relative w-full sm:w-11/12 md:w-4/5 lg:w-3/4 aspect-[16/9] max-h-[400px] rounded-xl overflow-hidden bg-gray-800 shadow-lg">
            <SmartRecipeImage
              sources={mainImageSources}
              alt={imageAlt}
              priority
              quality={75}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 900px"
            />
          </div>
        </motion.div>

        <AdSenseBanner adSlot="2901613977" />

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
            transition={{
              duration: 0.48,
              delay: 0.05,
            }}
            className="bg-gray-800 p-3 sm:p-4 rounded-xl text-white mb-8 text-sm sm:text-base"
          >
            {recipe.description}
          </motion.div>
        )}

        {(createdAt || updatedAtRelative) && (
          <motion.div
            {...fadeUp}
            className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4 text-sm text-gray-200"
          >
            {createdAt && (
              <motion.span
                whileHover={{
                  scale: 1.03,
                }}
                className="bg-gray-800 px-3 py-1 rounded-lg"
              >
                📅 تاريخ النشر: {createdAt}
              </motion.span>
            )}

            {updatedAtRelative && (
              <motion.span
                whileHover={{
                  scale: 1.03,
                }}
                className="bg-gray-800 px-3 py-1 rounded-lg"
              >
               🔄 تم التحديث منذ يومين
              </motion.span>
            )}
          </motion.div>
        )}

        <AdSenseBanner adSlot="2901613977" />

        {(dataBoxItems.length > 0 || ingredientSections.length > 0) && (
          <motion.section {...fadeUp} className="mb-10">
            <div className="flex gap-2 mb-4">
              <motion.button
                type="button"
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => setActiveTab("data")}
                className={`flex-1 p-3 rounded-xl font-bold ${
                  activeTab === "data"
                    ? "bg-orange-400 text-white"
                    : "bg-gray-800 text-white"
                }`}
              >
                📊 معلومات الوصفة
              </motion.button>

              <motion.button
                type="button"
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => setActiveTab("ingredients")}
                className={`flex-1 p-3 rounded-xl font-bold ${
                  activeTab === "ingredients"
                    ? "bg-orange-400 text-white"
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
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {dataBoxItems.map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{
                        scale: 1.015,
                      }}
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
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="space-y-4"
                >
                  {ingredientSections.map((section, i) => (
                    <div key={i}>
                      {section.title && (
                        <motion.h3
                          initial={{
                            opacity: 0,
                            x: 10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
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
                            whileHover={{
                              scale: 1.015,
                            }}
                            className="bg-gray-700 p-2 rounded-lg text-white hover:bg-orange-500 hover:text-black break-words"
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

        <AdSenseBanner adSlot="2901613977" />

        {steps.length > 0 && (
          <motion.section {...fadeUp} className="mb-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-orange-400 mb-3">
              🍳 خطوات التحضير
            </h2>

            <motion.ol
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              className="list-decimal list-inside space-y-2 bg-gray-800 p-3 rounded-xl text-sm sm:text-base break-words text-right"
            >
              {steps.map((step: string, i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{
                    scale: 1.01,
                  }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-orange-500 hover:text-black break-words"
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
              viewport={{
                once: true,
                amount: 0.15,
              }}
              className="list-disc list-inside pl-5 space-y-1 text-right"
            >
              {tips.map((t: string, i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{
                    scale: 1.01,
                  }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-orange-500 hover:text-black text-lg break-words"
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
              viewport={{
                once: true,
                amount: 0.15,
              }}
              className="list-disc list-inside pl-5 space-y-1 text-right"
            >
              {commonMistakes.map((m: string, i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{
                    scale: 1.01,
                  }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-orange-500 hover:text-black text-lg break-words"
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
              viewport={{
                once: true,
                amount: 0.15,
              }}
              className="list-disc list-inside pl-5 space-y-1 text-right"
            >
              {Object.entries(nutrition).map(([k, v], i: number) => (
                <motion.li
                  key={i}
                  variants={staggerItem}
                  whileHover={{
                    scale: 1.01,
                  }}
                  className="bg-gray-700 p-2 rounded-lg text-white hover:bg-orange-500 hover:text-black text-lg break-words"
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
                    key={f.question || i}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.15,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: i * 0.03,
                    }}
                    className="bg-gray-700 rounded-lg text-white overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-3 text-right flex items-center justify-between hover:bg-orange-500 hover:text-black transition-colors"
                    >
                      <span className="font-bold text-lg">{f.question}</span>

                      {isOpen ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.28,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 pt-0 text-lg break-words">
                            {f.answer}
                          </div>
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
              {relatedRecipes.map((r, i) => (
                <RelatedRecipeCard key={r.slug || i} recipe={r} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </>
  );
}