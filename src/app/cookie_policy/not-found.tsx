import Link from "next/link";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "الصفحة غير موجودة | شيف العرب",
  description:
    "عذرًا، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة للصفحة الرئيسية أو تصفح الوصفات.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-24 flex items-center justify-center">
      <div className="max-w-xl w-full text-center bg-gray-800 dark:bg-gray-800 rounded-2xl p-10 shadow-md">
        <div className="flex justify-center mb-4">
          <AlertCircle className="text-orange-400 w-12 h-12" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-orange-400 mb-4">
          404 — الصفحة غير موجودة
        </h1>
        <p className="text-gray-300 leading-relaxed mb-8">
          ممكن تكون الصفحة اتنقلت أو اتغير الرابط. جرّب ترجع للرئيسية أو تصفح الوصفات.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-3 bg-lime-400 text-black font-semibold rounded-lg hover:bg-lime-500 transition-colors"
          >
            الصفحة الرئيسية
          </Link>

          <Link
            href="/recipes"
            className="px-5 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            صفحة الوصفات
          </Link>
        </div>
      </div>
    </main>
  );
}
