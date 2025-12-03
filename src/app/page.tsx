//Home Page 
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import recipesData from "../../public/recipes.json";
import ChefImage from "../../public/Heeder.webp";
import { motion } from "framer-motion";
import { ArrowUp, Heart } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  country: string;
  img: string;
  category: string[];
}

const categories: string[] = [
  "جميع الوصفات",
  "الطبق العربي",
  "مخللات وسلطات",
  "حلويات",
  "مثلجات و مشروبات",
  "احدث الوصفات",
  "الوصفات ألأكثر إعجابا",
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("جميع الوصفات");
  const [showScroll, setShowScroll] = useState(false);
  const [recipes] = useState<Recipe[]>(recipesData);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredRecipes: Recipe[] =
    activeCategory === "جميع الوصفات"
      ? recipes
      : activeCategory === "الوصفات ألأكثر إعجابا"
        ? recipes.filter((r) => r.category.includes("الوصفات ألأكثر إعجابا"))
        : recipes.filter((item) => item.category.includes(activeCategory));

  return (
    <motion.main
      className="ml-0 mr-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="m-0">
        {/* صورة الهيدر */}
        <div className="w-full relative">
          <Image
            src={ChefImage}
            alt="ChefImage"
            width={1920}
            height={1080}
            className="mt-12 w-full h-96 object-cover"
            priority
          />

          {/* النص فوق الصورة */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/40 px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">استمتعوا بطبخٍ</h2>
            <p className="text-lg md:text-xl mb-6 max-w-xl">
              .شهيّ مع عائلتكم، واستمتعوا بأطباقٍ شهيةٍ تُرضي جميع الأذواق
            </p>

            {/* زر المزيد من الوصفات */}
            <Link
              href="/recipe"
              className="mt-4 px-6 py-3 bg-lime-500 text-black font-semibold rounded-lg shadow-lg hover:bg-lime-600 hover:scale-105 transition-all duration-300"
            >
              المزيد من الوصفات
            </Link>
          </div>

        </div>

        {/* قسم الوصفات */}
        <section className="py-12 text-white">
          {/* الفلاتر */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium border border-lime-400 bg-gray-900 transition-all duration-300 ${activeCategory === cat
                    ? "bg-lime-400 text-lime-600"
                    : "hover:bg-gray-700 text-lime-300"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* شبكة الوصفات */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto px-6">
            {filteredRecipes.map((recipe: Recipe) => (
              <div
                key={recipe.id}
                className="group relative bg-[#0f1a25] rounded-xl overflow-hidden border-2 border-transparent hover:border-lime-400 transition-all duration-300 shadow-lg hover:shadow-lime-400/30"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <motion.div
                    className="overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Image
                      src={recipe.img}
                      alt={recipe.title}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                </Link>

                <div className="p-4 text-center relative">
                  <h3 className="text-lg font-semibold mb-2 text-lime-300">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-400">{recipe.country}</p>

                  {/* القلب حسب المفضلة */}
                  <Heart
                    size={24}
                    className={`absolute top-3 right-3 transition-colors duration-300 ${recipe.category.includes("الوصفات ألأكثر إعجابا")
                        ? "text-red-500"
                        : "text-white"
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* زر الصعود للأعلى */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-14 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </motion.main>
  );
}
