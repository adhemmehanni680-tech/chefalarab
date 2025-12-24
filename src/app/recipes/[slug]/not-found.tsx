"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function RecipeNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md text-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
      >
        <h1 className="text-4xl font-bold text-orange-500 mb-4">
          😕 الوصفة غير موجودة
        </h1>

        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          الوصفة اللي بتدور عليها مش موجودة أو اتحذفت.
       
          جرّب ترجع للصفحة الرئيسية أو تختار وصفة تانية.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-5 py-2 rounded-xl transition"
          >
            <Home size={18} />
            الصفحة الرئيسية
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-black dark:text-white px-5 py-2 rounded-xl transition"
          >
            <ArrowLeft size={18} />
            رجوع
          </button>
        </div>
      </motion.div>
    </main>
  );
}
