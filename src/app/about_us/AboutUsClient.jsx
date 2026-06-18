// /src/app/about_us/AboutUsClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Target,
  HeartHandshake,
  ShieldCheck,
  Globe,
  BookOpen,
  ChevronDown,
} from "lucide-react";

const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), { ssr: false });
const AdSenseBanner = dynamic(() => import("../Components/AdSenseBanner"), { ssr: false });

const SHOW_ADS_ON_THIS_PAGE = false; // غيّره حسب الحاجة

export default function AboutUsClient() {

  const [openSections, setOpenSections] = useState({
    mission: true,
    why: true,
    editorial: true,
  });

  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ... باقي الكود كما هو بدون تغيير (المحتوى الثابت)
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

      {adsEnabled && SHOW_ADS_ON_THIS_PAGE && <InterstitialAd interstitialUnitID="2901613977" />}

      <div className="max-w-5xl mx-auto text-center mt-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 animate-fadeIn">
          من نحن
        </h1>

        <div className="bg-gray-800 rounded-2xl shadow-md p-8 text-gray-300 text-base sm:text-lg leading-relaxed text-right animate-fadeInUp">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {cards.map((card, idx) => (
            <div
              key={card.title}
              className="bg-gray-800 rounded-2xl shadow-md p-6 text-right transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-3 justify-start">
                <card.icon className="text-orange-400" />
                <h2 className="text-xl font-semibold text-gray-100">{card.title}</h2>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{card.content}</p>
            </div>
          ))}
        </div>

        {/* أكورديون لماذا شيف العرب */}
        <section className="bg-gray-800 rounded-2xl shadow-md mt-10 overflow-hidden animate-fadeInUp">
          <button
            onClick={() => toggleSection("why")}
            className="w-full flex items-center justify-between p-6 focus:outline-none hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HeartHandshake className="text-orange-400" />
              <h2 className="text-2xl font-semibold text-gray-100">لماذا شيف العرب؟</h2>
            </div>
            <ChevronDown
              className={`text-orange-400 transition-transform duration-300 ${
                openSections.why ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections.why ? "max-h-96 p-6 pt-0" : "max-h-0 p-0"
            }`}
          >
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm sm:text-base leading-relaxed">
              {whyList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* أكورديون سياسة المحتوى */}
        <section className="bg-gray-800 rounded-2xl shadow-md mt-6 overflow-hidden animate-fadeInUp">
          <button
            onClick={() => toggleSection("editorial")}
            className="w-full flex items-center justify-between p-6 focus:outline-none hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="text-orange-400" />
              <h2 className="text-2xl font-semibold text-gray-100">سياسة المحتوى والمصداقية</h2>
            </div>
            <ChevronDown
              className={`text-orange-400 transition-transform duration-300 ${
                openSections.editorial ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections.editorial ? "max-h-96 p-6 pt-0" : "max-h-0 p-0"
            }`}
          >
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm sm:text-base leading-relaxed">
              {editorialList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-gray-400 text-xs sm:text-sm mt-4 leading-relaxed">
              ملاحظة: بعض الروابط قد تكون داخلية داخل الموقع. أما الروابط الخارجية (إن وجدت) فتخضع
              لسياسات الجهات المالكة لها.
            </p>
          </div>
        </section>

        {/* إعلان بانر */}
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

      
    </div>
  );
}