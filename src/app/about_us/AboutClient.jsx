// src/app/about_us/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUp, Target, HeartHandshake, ShieldCheck, Globe, BookOpen } from "lucide-react";

const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), {
  ssr: false,
});
const AdSenseBanner = dynamic(() => import("../Components/AdSenseBanner"), {
  ssr: false,
});
const showAdsOnThisPage = false;

export default function AboutPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  //    الإعلانات   :
  // NEXT_PUBLIC_ADS_ENABLED=false
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cards = [
    {
      icon: Target,
      title: "رسالتنا",
      content:
        "تقديم وصفات واضحة ومُجرّبة بخطوات مرتبة وصور تساعدك على النجاح من أول مرة، مع نصائح عملية تجعل الطبخ أسهل حتى للمبتدئين.",
    },
    {
      icon: Globe,
      title: "رؤيتنا",
      content:
        "أن يصبح شيف العرب مرجعًا عربيًا موثوقًا للوصفات العربية والعالمية، مع تجربة تصفح سريعة ومرتبة تناسب الهاتف والكمبيوتر.",
    },
    {
      icon: ShieldCheck,
      title: "قيمنا",
      content:
        "الوضوح، المصداقية، احترام وقت الزائر، وتقديم محتوى نظيف وآمن للجميع مع الالتزام بالمعايير العامة لسياسات النشر والإعلانات.",
    },
  ];

  const whyList = [
    "وصفات عربية متنوعة + لمسات عالمية تناسب جميع الأذواق.",
    "خطوات تحضير مرتبة ومبسطة مع نصائح بدائل للمكونات عند الحاجة.",
    "تصنيفات واضحة لتسهيل الوصول للوصفة المناسبة بسرعة.",
    "تجربة استخدام خفيفة وسريعة على الهاتف، مع دعم الوضع الليلي والنهاري.",
    "تحديثات مستمرة وإضافة وصفات جديدة بشكل دوري.",
  ];

  const editorialList = [
    "نلتزم بكتابة وصفات مفهومة وخالية من المبالغة، مع توضيح المقادير وطريقة التنفيذ.",
    "قد تختلف النتائج حسب نوع الفرن/البوتاجاز وجودة المكونات، لذلك نضيف نصائح للتعديل حسب المتاح.",
    "الموقع يقدم محتوى للمعلومات العامة، وليس بديلاً عن استشارة مختص في حالات الحساسية أو الأنظمة الخاصة.",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6 overflow-x-hidden">
       <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        * {
          max-width: 100vw !important;
        }
      `}</style>

      {adsEnabled && showAdsOnThisPage && <InterstitialAd interstitialUnitID="2901613977" />}

      <div className="max-w-5xl mx-auto text-center mt-10">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          من نحن
        </motion.h1>

        {/*  مقدمة */}
        <motion.div
          className="bg-gray-800 rounded-2xl shadow-md p-8 text-gray-300 text-base sm:text-lg leading-relaxed text-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <p className="mb-4">
            <Link href="/" className="font-semibold text-blue-400 hover:underline">
              شيف العرب
            </Link>{" "}
            هو موقع عربي يهتم بتقديم وصفات الطبخ العربية والعالمية بطريقة بسيطة وعملية. هدفنا أن تجد
            وصفة واضحة، بمقادير دقيقة وخطوات مرتبة، تساعدك على الحصول على نتيجة ناجحة في المنزل سواء
            كنت مبتدئًا أو لديك خبرة.
          </p>

          <p className="mb-4">
            نؤمن أن الطبخ ليس مجرد وصفة؛ بل تجربة ممتعة تجمع العائلة وتدعم أسلوب حياة متوازن. لذلك
            نهتم بتقديم وصفات يومية، حلويات، سلطات ومخللات، ومشروبات، مع نصائح اختيار المكونات
            وبدائلها عند الحاجة.
          </p>

          <p>
            إذا كان لديك اقتراح أو تعاون أو ملاحظة لتحسين المحتوى، يسعدنا تواصلك عبر{" "}
            <Link href="/contact_us" className="text-blue-400 font-semibold hover:underline">
              صفحة تواصل معنا
            </Link>
            .
          </p>
        </motion.div>

        {/*  Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {cards.map((c, idx) => (
            <motion.div
              key={c.title}
              className="bg-gray-800 rounded-2xl shadow-md p-6 text-right"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-3 justify-start">
                <c.icon className="text-orange-400" />
                <h2 className="text-xl font-semibold text-gray-100">{c.title}</h2>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{c.content}</p>
            </motion.div>
          ))}
        </div>

        {/*  Why us */}
        <motion.section
          className="bg-gray-800 rounded-2xl shadow-md p-8 mt-10 text-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <HeartHandshake className="text-orange-400" />
            <h2 className="text-2xl font-semibold text-gray-100">لماذا شيف العرب؟</h2>
          </div>

          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm sm:text-base leading-relaxed">
            {whyList.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </motion.section>

        {/*  Editorial / Disclaimer */}
        <motion.section
          className="bg-gray-800 rounded-2xl shadow-md p-8 mt-6 text-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-orange-400" />
            <h2 className="text-2xl font-semibold text-gray-100">سياسة المحتوى والمصداقية</h2>
          </div>

          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm sm:text-base leading-relaxed">
            {editorialList.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          <p className="text-gray-400 text-xs sm:text-sm mt-4 leading-relaxed">
            ملاحظة: بعض الروابط قد تكون داخلية داخل الموقع. أما الروابط الخارجية (إن وجدت) فتخضع
            لسياسات الجهات المالكة لها.
          </p>
        </motion.section>

        {/*  Banner Ad  */}
        {adsEnabled && (
          <div className="flex justify-center my-8">
            <AdSenseBanner
              adSlot="2901613977"
              adFormat="fluid"
              layoutKey="-fc+5g+70-cl-1m"
              style={{ display: "block" }}
            />
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 z-50"
          aria-label="العودة للأعلى"
          title="العودة للأعلى"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
