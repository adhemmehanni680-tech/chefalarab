"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import food_icon from "../../../../public/food_icon.png";
import recipes from "../../../../public/recipes.json";

export default function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const filteredResults =
    searchTerm.trim().length >= 2
      ? recipes.filter((r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];


  return (
    <nav className="bg-gray-900 dark:bg-gray-900 fixed w-full z-30 top-0 left-0 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* الشعار */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <Image
              src={food_icon}
              className="h-8 w-8"
              alt="Chefalarab Logo"
              width={32}
              height={32}
            />
            <span className="text-2xl font-bold text-white">شيف العرب</span>
          </Link>
        </div>

        {/* روابط الديسكتوب */}
        <div className="hidden md:flex items-center flex-1 justify-center">
          <ul className="flex space-x-8 rtl:space-x-reverse font-medium text-white">
            <li><Link href="/" className="text-orange-400">الصفحة الرئيسية</Link></li>
            <li><Link href="/about_us" className="hover:text-orange-400 transition-colors">من نحن</Link></li>
            <li><Link href="/contact_us" className="hover:text-orange-400 transition-colors">تواصل معنا</Link></li>
          
          </ul>
        </div>

        {/* البحث */}
        <div className="hidden md:flex relative w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg
                       bg-gray-50 focus:ring-orange-400 focus:border-orange-400
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            placeholder="ابحث عن وصفة..."
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500 dark:text-gray-300">
            🔍
          </div>
          {searchTerm.trim().length >= 2 && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg z-50">
              {filteredResults.length > 0 ? (
                filteredResults.map((r) => (
                  <Link
                    key={r.id}
                    href={`/recipes/${r.id}`}
                    className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setSearchTerm("")}
                  >
                    {r.title}
                  </Link>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">لا توجد نتائج مطابقة 😔</p>
              )}
            </div>
          )}
        </div>

        {/* زر الوضع الليلي */}
        <button
          onClick={toggleTheme}
          className="mr-8 text-gray-600 dark:text-yellow-300 hover:text-orange-500 transition-colors text-lg"
          title="تبديل الوضع الليلي"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* زر الموبايل */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition"
        >
          ☰
        </button>
      </div>

      {/* قائمة الموبايل */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="p-4 flex flex-col space-y-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg
                         bg-gray-50 focus:ring-orange-400 focus:border-orange-400
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
              placeholder="ابحث عن وصفة..."
            />
            {searchTerm.trim().length >= 2 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg transition-colors">
                {filteredResults.length > 0 ? (
                  filteredResults.map((r) => (
                    <Link
                      key={r.id}
                      href={`/recipes/${r.id}`}
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setSearchTerm("");
                        setIsMenuOpen(false);
                      }}
                    >
                      {r.title}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-500">لا توجد نتائج مطابقة 😔</p>
                )}
              </div>
            )}

            <ul className="flex flex-col space-y-2 text-gray-900 dark:text-white font-medium mt-3">
              <li><Link href="/" onClick={() => setIsMenuOpen(false)}>الصفحة الرئيسية</Link></li>
              <li><Link href="/about_us" onClick={() => setIsMenuOpen(false)}>من نحن</Link></li>
              <li><Link href="/contact_us" onClick={() => setIsMenuOpen(false)}>تواصل معنا</Link></li>
          
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
