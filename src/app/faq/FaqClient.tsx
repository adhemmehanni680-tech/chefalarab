// app/faq/FaqClient
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { ChevronDown, Search, ArrowUp, HelpCircle } from "lucide-react";


type Item = {
  q: string;
  a: JSX.Element;
  tags?: string[];
};

export default function FAQClient() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);


  const items: Item[] = useMemo(
    () => [
      {
        q: "ما هو موقع شيف العرب؟",
        a: (
          <>
            شيف العرب هو موقع يقدم وصفات عربية وعالمية بطريقة مبسطة وخطوات
            واضحة، مع التركيز على جودة المحتوى وتجربة المستخدم.
          </>
        ),
        tags: ["عام"],
      },
      {
        q: "هل الوصفات مجرّبة؟",
        a: (
          <>
            نسعى لتقديم وصفات دقيقة ومُحسّنة. قد تختلف النتائج حسب نوع
            المكونات والأدوات المتاحة. لو واجهتك مشكلة في وصفة معيّنة تواصل
            معنا وسنساعدك.
          </>
        ),
        tags: ["وصفات"],
      },
      {
        q: "كيف أبحث عن وصفة بسرعة؟",
        a: (
          <>
            استخدم مربع البحث أعلى الموقع، واكتب اسم الوصفة (حرفين على
            الأقل). ستظهر نتائج مباشرة ويمكنك الضغط على الوصفة للانتقال
            إليها.
          </>
        ),
        tags: ["بحث", "وصفات"],
      },
      {
        q: "هل يمكنني مشاركة الوصفات؟",
        a: (
          <>
            نعم يمكنك مشاركة رابط الوصفة مع أصدقائك. يُفضل مشاركة الرابط
            المباشر بدل نسخ المحتوى كاملًا.
          </>
        ),
        tags: ["مشاركة"],
      },
      {
        q: "لماذا تظهر إعلانات في الموقع؟",
        a: (
          <>
            الإعلانات تساعدنا على تغطية تكاليف التشغيل وتحسين المحتوى. نحرص
            على أن تكون تجربة التصفح مريحة قدر الإمكان.
          </>
        ),
        tags: ["إعلانات"],
      },
      {
        q: "هل الإعلانات مخصّصة حسب اهتماماتي؟ وكيف أتحكم بها؟",
        a: (
          <>
            قد يعرض مزودو الإعلانات (مثل Google) إعلانات مخصّصة حسب إعداداتك
            واختياراتك. يمكنك التحكم في الإعلانات من خلال{" "}
            <a
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href="https://adssettings.google.com"
            >
              إعدادات إعلانات Google
            </a>
            .
          </>
        ),
        tags: ["إعلانات", "خصوصية"],
      },
      {
        q: "ما هي ملفات تعريف الارتباط (Cookies)؟",
        a: (
          <>
            هي ملفات صغيرة تُحفظ على جهازك لتحسين الأداء وتجربة الاستخدام،
            وقد تُستخدم أيضًا لقياس الأداء أو عرض الإعلانات. يمكنك قراءة
            التفاصيل هنا:{" "}
            <Link
              href="/cookie_policy"
              className="text-blue-400 hover:underline"
            >
              سياسة الكوكيز
            </Link>
            .
          </>
        ),
        tags: ["كوكيز", "خصوصية"],
      },
      {
        q: "كيف يتم التعامل مع بياناتي وخصوصيتي؟",
        a: (
          <>
            نوضح طريقة جمع البيانات واستخدامها في{" "}
            <Link
              href="/privacy_policy"
              className="text-blue-400 hover:underline"
            >
              سياسة الخصوصية
            </Link>
            . إذا كان لديك أي طلب متعلق بالبيانات تواصل معنا.
          </>
        ),
        tags: ["خصوصية"],
      },
      {
        q: "هل يوجد محتوى للأطفال؟ وهل تجمعون بيانات أطفال؟",
        a: (
          <>
            المحتوى عام ومناسب للجمهور. نحن لا نستهدف جمع بيانات شخصية من
            الأطفال عمدًا. لو تعتقد أن هناك بيانات لطفل تم إرسالها لنا تواصل
            معنا لحذفها.
          </>
        ),
        tags: ["خصوصية", "أطفال"],
      },
      {
        q: "كيف أتواصل مع إدارة الموقع؟",
        a: (
          <>
            يمكنك مراسلتنا عبر صفحة{" "}
            <Link
              href="/contact_us"
              className="text-blue-400 hover:underline"
            >
              تواصل معنا
            </Link>{" "}
            أو عبر البريد:{" "}
            <a
              className="text-blue-400 hover:underline"
              href="mailto:chefalarabonline@gmail.com"
            >
              chefalarabonline@gmail.com
            </a>
            .
          </>
        ),
        tags: ["تواصل"],
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) => {
      const inQ = it.q.toLowerCase().includes(q);
      const inTags = (it.tags || []).some((t) =>
        t.toLowerCase().includes(q)
      );
      return inQ || inTags;
    });
  }, [query, items]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6 text-black dark:text-white">

      <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        * {
          max-width: 100vw !important;
        }
      `}</style>

      <div className="max-w-5xl mx-auto mt-10">

        <div
       
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-3 text-orange-400">
            <HelpCircle size={34} />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            الأسئلة الشائعة
          </h1>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            هنا ستجد إجابات سريعة على أكثر الأسئلة تكرارًا حول شيف العرب.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-8">

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث داخل الأسئلة (مثال: إعلانات، كوكيز، وصفات)..."
            className={`w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-800
            px-12 py-3 text-sm sm:text-base text-gray-900 dark:text-gray-100 outline-none
            focus:ring-2 focus:ring-orange-400`}
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
            <Search size={18} />
          </div>

        </div>

        {/* FAQ list */}
        <div className="space-y-4">

          {filtered.map((it, idx) => {

            const isOpen = openIndex === idx;

            return (
              <div
                key={it.q}
                className="bg-gray-800 rounded-2xl shadow-md border border-white/5 overflow-hidden"
              >

                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right"
                  aria-expanded={isOpen}
                >

                  <span className="text-base sm:text-lg font-semibold text-gray-100">
                    {it.q}
                  </span>

                  <ChevronDown
                    className={`text-gray-300 transition-transform ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                    size={20}
                  />

                </button>

                {isOpen && (

                  <div className="px-5 pb-5 -mt-1">

                    <div className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      {it.a}
                    </div>

                  </div>

                )}

              </div>
            );

          })}

        </div>

        {/* Helpful links */}
        <div className="mt-10 bg-gray-800 rounded-2xl shadow-md p-6 text-gray-300">

          <h2 className="text-xl font-semibold text-orange-400 mb-3">
            روابط مهمة
          </h2>

          <ul className="list-disc list-inside space-y-2">

            <li>
              <Link href="/privacy_policy" className="text-blue-400 hover:underline">
                سياسة الخصوصية
              </Link>
            </li>

            <li>
              <Link href="/cookie_policy" className="text-blue-400 hover:underline">
                سياسة الكوكيز
              </Link>
            </li>

            <li>
              <Link href="/terms_conditions" className="text-blue-400 hover:underline">
                الشروط والأحكام
              </Link>
            </li>

            <li>
              <Link href="/contact_us" className="text-blue-400 hover:underline">
                تواصل معنا
              </Link>
            </li>

          </ul>

        </div>

      </div>

    

    </main>
  );
}