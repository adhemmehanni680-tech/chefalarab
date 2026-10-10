"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import Link from "next/link";

import {
  ChevronDown,
  Search,
  HelpCircle,
  ChefHat,
  BookOpen,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

type Item = {
  q: string;
  a: ReactNode;
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
            <p>
              شيف العرب هو موقع عربي يهتم بتقديم وصفات الطبخ بطريقة واضحة
              ومنظمة، مع وصف المكونات وخطوات التحضير والنصائح التي تساعد
              القارئ على فهم الوصفة وتنفيذها بسهولة.
            </p>

            <p className="mt-3">
              يمكنك تصفح{" "}
              <Link
                href="/recipes"
                className="font-semibold text-orange-400 hover:underline"
              >
                وصفات شيف العرب
              </Link>{" "}
              والبحث عن الوصفات حسب الاسم أو الوصول إلى الوصفة المناسبة
              مباشرة.
            </p>
          </>
        ),
        tags: ["عام", "شيف العرب", "الموقع"],
      },

      {
        q: "هل الوصفات مجرّبة؟",
        a: (
          <>
            <p>
              نسعى إلى تقديم وصفات دقيقة ومُنظمة ومفيدة للقارئ، مع توضيح
              المكونات والخطوات والنصائح المرتبطة بكل وصفة.
            </p>

            <p className="mt-3">
              ومع ذلك، قد تختلف النتيجة النهائية من شخص لآخر بسبب اختلاف نوع
              المكونات، والكميات المستخدمة، ودرجة حرارة الفرن أو الموقد،
              والأدوات وطريقة التحضير.
            </p>
          </>
        ),
        tags: ["وصفات", "الطبخ", "طريقة التحضير"],
      },

      {
        q: "كيف أبحث عن وصفة بسرعة؟",
        a: (
          <>
            <p>
              يمكنك استخدام مربع البحث الموجود في الموقع وكتابة اسم الوصفة
              أو جزء من اسمها. ستظهر لك النتائج المرتبطة بما تبحث عنه، ويمكنك
              اختيار الوصفة للانتقال إلى صفحتها.
            </p>

            <p className="mt-3">
              ويمكنك أيضًا تصفح{" "}
              <Link
                href="/recipes"
                className="font-semibold text-orange-400 hover:underline"
              >
                قسم الوصفات
              </Link>{" "}
              للوصول إلى مجموعة الوصفات المتاحة على شيف العرب.
            </p>
          </>
        ),
        tags: ["بحث", "الوصفات", "البحث عن وصفة"],
      },

      {
        q: "هل يمكنني مشاركة الوصفات؟",
        a: (
          <>
            <p>
              نعم، يمكنك مشاركة رابط الوصفة مع أصدقائك أو أفراد عائلتك. ويفضل
              مشاركة الرابط المباشر لصفحة الوصفة بدل نسخ محتوى الوصفة كاملًا.
            </p>

            <p className="mt-3">
              مشاركة الرابط تساعد الشخص الآخر على الوصول إلى الصفحة الأصلية
              ومشاهدة أحدث نسخة من المعلومات الموجودة فيها.
            </p>
          </>
        ),
        tags: ["مشاركة", "روابط الوصفات", "المشاركة"],
      },

      {
        q: "لماذا تظهر إعلانات في موقع شيف العرب؟",
        a: (
          <>
            <p>
              تساعد الإعلانات في دعم تشغيل الموقع وتغطية تكاليف الاستضافة
              والخدمات التقنية والمساهمة في تطوير المحتوى والخدمات المقدمة
              للزوار.
            </p>

            <p className="mt-3">
              نحاول قدر الإمكان الحفاظ على تجربة تصفح مناسبة وعدم جعل
              الإعلانات تعيق الوصول إلى محتوى الوصفات.
            </p>
          </>
        ),
        tags: ["إعلانات", "Google", "الإعلانات"],
      },

      {
        q: "هل الإعلانات مخصّصة حسب اهتماماتي؟ وكيف أتحكم بها؟",
        a: (
          <>
            <p>
              قد يعرض بعض مزودي الإعلانات، مثل Google، إعلانات مخصّصة بناءً
              على إعدادات الإعلانات والخيارات المتاحة للمستخدم.
            </p>

            <p className="mt-3">
              يمكنك معرفة المزيد عن إعدادات الإعلانات المتاحة من خلال{" "}
              <a
                className="font-semibold text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://adssettings.google.com/"
              >
                إعدادات إعلانات Google
              </a>
              .
            </p>
          </>
        ),
        tags: ["إعلانات", "خصوصية", "Google Ads", "الإعلانات المخصصة"],
      },

      {
        q: "ما هي ملفات تعريف الارتباط Cookies؟",
        a: (
          <>
            <p>
              ملفات تعريف الارتباط أو Cookies هي ملفات صغيرة قد يتم تخزينها
              على جهازك عند استخدام بعض المواقع. يمكن أن تساعد في تشغيل بعض
              الوظائف وتحسين الأداء وتجربة الاستخدام، وقد تُستخدم أيضًا
              لقياس أداء الموقع أو تشغيل بعض الخدمات والإعلانات وفق الإعدادات
              والسياسات المعمول بها.
            </p>

            <p className="mt-3">
              لمعرفة تفاصيل أكثر، يمكنك قراءة{" "}
              <Link
                href="/cookie_policy"
                className="font-semibold text-orange-400 hover:underline"
              >
                سياسة ملفات تعريف الارتباط
              </Link>{" "}
              في شيف العرب.
            </p>
          </>
        ),
        tags: ["كوكيز", "Cookies", "الخصوصية", "ملفات تعريف الارتباط"],
      },

      {
        q: "كيف يتم التعامل مع بياناتي وخصوصيتي؟",
        a: (
          <>
            <p>
              نهتم بتوضيح كيفية التعامل مع البيانات والمعلومات المتعلقة
              باستخدام الموقع. وتحتوي{" "}
              <Link
                href="/privacy_policy"
                className="font-semibold text-orange-400 hover:underline"
              >
                سياسة الخصوصية
              </Link>{" "}
              على المعلومات المتعلقة بجمع البيانات واستخدامها والتعامل معها.
            </p>

            <p className="mt-3">
              إذا كان لديك استفسار أو طلب متعلق بالبيانات، يمكنك التواصل مع
              إدارة الموقع من خلال صفحة{" "}
              <Link
                href="/contact_us"
                className="font-semibold text-orange-400 hover:underline"
              >
                تواصل معنا
              </Link>
              .
            </p>
          </>
        ),
        tags: ["خصوصية", "البيانات", "حماية البيانات"],
      },

      {
        q: "هل يوجد محتوى للأطفال؟ وهل تجمعون بيانات أطفال؟",
        a: (
          <>
            <p>
              المحتوى الموجود في شيف العرب محتوى عام وموجه للجمهور، ولا
              نستهدف جمع بيانات شخصية من الأطفال عمدًا.
            </p>

            <p className="mt-3">
              إذا كنت تعتقد أن بيانات شخصية لطفل تم إرسالها إلى الموقع، يمكنك
              التواصل مع إدارة شيف العرب لبحث الأمر واتخاذ الإجراء المناسب.
            </p>

            <p className="mt-3">
              لمزيد من المعلومات حول الخصوصية، يمكنك مراجعة{" "}
              <Link
                href="/privacy_policy"
                className="font-semibold text-orange-400 hover:underline"
              >
                سياسة الخصوصية
              </Link>
              .
            </p>
          </>
        ),
        tags: ["خصوصية", "أطفال", "بيانات الأطفال"],
      },

      {
        q: "كيف أتواصل مع إدارة موقع شيف العرب؟",
        a: (
          <>
            <p>
              يمكنك التواصل مع إدارة شيف العرب من خلال{" "}
              <Link
                href="/contact_us"
                className="font-semibold text-orange-400 hover:underline"
              >
                صفحة تواصل معنا
              </Link>
              .
            </p>

            <p className="mt-3">
              ويمكنك أيضًا مراسلتنا عبر البريد الإلكتروني:
            </p>

            <p className="mt-2">
              <a
                className="font-semibold text-blue-400 hover:underline"
                href="mailto:chefalarabonline@gmail.com"
              >
                chefalarabonline@gmail.com
              </a>
            </p>
          </>
        ),
        tags: ["تواصل", "اتصال", "البريد الإلكتروني", "الدعم"],
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return items;
    }

    return items.filter((it) => {
      const inQuestion = it.q.toLowerCase().includes(q);

      const inTags = (it.tags || []).some((tag) =>
        tag.toLowerCase().includes(q)
      );

      return inQuestion || inTags;
    });
  }, [query, items]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-6 py-16 text-black dark:bg-gray-900 dark:text-white"
    >
      <div className="mx-auto mt-10 max-w-5xl">
        {/* Hero / Introduction */}
        <header className="mb-10 text-center">
          <div className="mb-4 flex justify-center text-orange-400">
            <HelpCircle
              size={40}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <p className="mb-3 text-sm font-bold tracking-wide text-orange-500">
            مركز المساعدة والأسئلة الشائعة
          </p>

          <h1 className="mb-4 text-4xl font-black leading-tight text-gray-950 dark:text-gray-100 sm:text-5xl">
            الأسئلة الشائعة عن شيف العرب
          </h1>

          <p className="mx-auto max-w-3xl text-base leading-8 text-gray-700 dark:text-gray-300 sm:text-lg">
            تعرف على طريقة استخدام شيف العرب، وكيفية البحث عن وصفات الطبخ
            ومشاركتها، بالإضافة إلى معلومات مهمة حول الإعلانات وملفات تعريف
            الارتباط والخصوصية وطرق التواصل مع إدارة الموقع.
          </p>
        </header>

        {/* Quick navigation */}
        <nav
          aria-label="روابط سريعة في صفحة الأسئلة الشائعة"
          className="mb-10 grid gap-3 sm:grid-cols-3"
        >
          <Link
            href="/recipes"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-gray-700 dark:bg-gray-800"
          >
            <ChefHat
              className="shrink-0 text-orange-400"
              size={24}
              aria-hidden="true"
            />

            <span className="font-bold text-gray-800 dark:text-gray-100">
              تصفح الوصفات
            </span>
          </Link>

          <Link
            href="/privacy_policy"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-gray-700 dark:bg-gray-800"
          >
            <ShieldCheck
              className="shrink-0 text-orange-400"
              size={24}
              aria-hidden="true"
            />

            <span className="font-bold text-gray-800 dark:text-gray-100">
              سياسة الخصوصية
            </span>
          </Link>

          <Link
            href="/contact_us"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-gray-700 dark:bg-gray-800"
          >
            <MessageCircle
              className="shrink-0 text-orange-400"
              size={24}
              aria-hidden="true"
            />

            <span className="font-bold text-gray-800 dark:text-gray-100">
              تواصل معنا
            </span>
          </Link>
        </nav>

        {/* Search */}
        <section
          aria-label="البحث داخل الأسئلة الشائعة"
          className="mb-8"
        >
          <div className="relative mx-auto max-w-2xl">
            <label htmlFor="faq-search" className="sr-only">
              البحث داخل الأسئلة الشائعة
            </label>

            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setQuery(event.target.value)
              }
              placeholder="ابحث داخل الأسئلة مثل: وصفات، إعلانات، كوكيز، خصوصية..."
              autoComplete="off"
              className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 sm:text-base"
            />

            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
              aria-hidden="true"
            >
              <Search size={18} />
            </div>
          </div>
        </section>

        {/* Search result information */}
        {query.trim() && (
          <p
            className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400"
            aria-live="polite"
          >
            تم العثور على {filtered.length}{" "}
            {filtered.length === 1 ? "نتيجة" : "نتائج"} مرتبطة ببحثك.
          </p>
        )}

        {/* FAQ */}
        <section
          aria-labelledby="faq-heading"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          <h2
            id="faq-heading"
            className="mb-5 text-2xl font-black text-gray-900 dark:text-gray-100"
          >
            إجابات الأسئلة الأكثر شيوعًا
          </h2>

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((it) => {
                const originalIndex = items.findIndex(
                  (item) => item.q === it.q
                );

                const isOpen = openIndex === originalIndex;

                return (
                  <article
                    key={it.q}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                    className="overflow-hidden rounded-2xl border border-white/5 bg-gray-800 shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex(
                          isOpen ? null : originalIndex
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 p-5 text-right"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${originalIndex}`}
                    >
                      <span
                        itemProp="name"
                        className="text-base font-semibold text-gray-100 sm:text-lg"
                      >
                        {it.q}
                      </span>

                      <ChevronDown
                        className={`shrink-0 text-gray-300 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                        size={20}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-answer-${originalIndex}`}
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                        className="px-5 pb-5"
                      >
                        <div
                          itemProp="text"
                          className="text-sm leading-8 text-gray-300 sm:text-base"
                        >
                          {it.a}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <Search
                className="mx-auto mb-3 text-gray-400"
                size={32}
                aria-hidden="true"
              />

              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                لم نجد سؤالًا مطابقًا
              </h3>

              <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                جرّب البحث باستخدام كلمة مختلفة مثل وصفات أو خصوصية أو
                إعلانات أو كوكيز.
              </p>

              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                عرض جميع الأسئلة
              </button>
            </div>
          )}
        </section>

        {/* Helpful content */}
        <section className="mt-12 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <BookOpen
              className="text-orange-500"
              size={26}
              aria-hidden="true"
            />

            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              معلومات وروابط مهمة في شيف العرب
            </h2>
          </div>

          <p className="mb-6 text-sm leading-8 text-gray-600 dark:text-gray-300 sm:text-base">
            إذا لم تجد إجابة سؤالك هنا، يمكنك الانتقال إلى الصفحات التالية
            لمعرفة المزيد عن استخدام الموقع وسياساته أو للتواصل مع إدارة شيف
            العرب.
          </p>

          <nav
            aria-label="روابط مهمة"
            className="flex flex-wrap gap-2 text-sm font-bold"
          >
            <Link
              href="/recipes"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-gray-800 transition hover:text-orange-600 dark:bg-slate-700 dark:text-gray-100 dark:hover:text-orange-400"
            >
              وصفات الطبخ
            </Link>

            <Link
              href="/privacy_policy"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-gray-800 transition hover:text-orange-600 dark:bg-slate-700 dark:text-gray-100 dark:hover:text-orange-400"
            >
              سياسة الخصوصية
            </Link>

            <Link
              href="/cookie_policy"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-gray-800 transition hover:text-orange-600 dark:bg-slate-700 dark:text-gray-100 dark:hover:text-orange-400"
            >
              سياسة الكوكيز
            </Link>

            <Link
              href="/terms_conditions"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-gray-800 transition hover:text-orange-600 dark:bg-slate-700 dark:text-gray-100 dark:hover:text-orange-400"
            >
              الشروط والأحكام
            </Link>

            <Link
              href="/contact_us"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-gray-800 transition hover:text-orange-600 dark:bg-slate-700 dark:text-gray-100 dark:hover:text-orange-400"
            >
              تواصل معنا
            </Link>
          </nav>
        </section>
      </div>
    </main>
  );
}