
import Link from "next/link";

import {
  Target,
  HeartHandshake,
  ShieldCheck,
  Globe,
  BookOpen,
  ChefHat,
  Users,
  Mail,
  ListChecks,
  UtensilsCrossed,
  ExternalLink,
} from "lucide-react";

export default function AboutUsClient() {

  const cards = [
    {
      icon: Target,
      title: "هدفنا",
      content:
        "هدف شيف العرب هو تقديم محتوى طبخ عربي واضح ومنظم يساعد الزائر على الوصول إلى وصفة مناسبة وتنفيذها بسهولة في المنزل، مع الاهتمام بالمقادير والخطوات والنصائح العملية.",
    },

    {
      icon: Globe,
      title: "نوع المحتوى",
      content:
        "ننشر وصفات من المطابخ العربية والعالمية، وتشمل الأطباق الرئيسية، المخبوزات، الحلويات، السلطات، المخللات، المشروبات، ووصفات متنوعة تناسب الاستخدام اليومي والمناسبات.",
    },

    {
      icon: ShieldCheck,
      title: "المصداقية والوضوح",
      content:
        "نهتم بأن يكون المحتوى مفهومًا ومنظمًا، وأن تتضمن الوصفة معلومات تساعد المستخدم مثل المقادير، وقت التحضير والطهي، عدد الحصص، خطوات التنفيذ، النصائح، والأخطاء الشائعة عند الحاجة.",
    },
  ];

  const whyList = [
    "وصفات عربية وعالمية منظمة داخل تصنيفات واضحة.",
    "مقادير مكتوبة بصورة مباشرة وسهلة القراءة.",
    "خطوات تحضير مرتبة لتسهيل تنفيذ الوصفة.",
    "نصائح عملية وبدائل للمكونات عندما تكون مناسبة.",
    "معلومات عن وقت التحضير والطهي وعدد الحصص في الوصفات التي تتضمن هذه البيانات.",
    "تصميم متجاوب يعمل على الهاتف والكمبيوتر.",
    "إمكانية استخدام الوضع الليلي والنهاري.",
    "إضافة وتحديث محتوى الوصفات بشكل دوري.",
  ];

  const preparationList = [
    "يتم اختيار موضوع الوصفة بما يتناسب مع أقسام ومحتوى شيف العرب.",
    "يتم تنظيم المقادير بصورة واضحة وتقسيمها إلى مجموعات عند الحاجة.",
    "يتم ترتيب خطوات التحضير حسب تسلسل التنفيذ لتكون سهلة المتابعة.",
    "يتم إضافة معلومات مساعدة مثل وقت التحضير والطهي وعدد الحصص عندما تكون متوفرة.",
    "يتم إضافة النصائح والبدائل والأخطاء الشائعة عندما تكون مفيدة للقارئ.",
    "يتم تصنيف الوصفة وربطها بالمطبخ ونوع الطبق والتصنيفات المناسبة.",
    "تتم مراجعة المحتوى من ناحية الوضوح والتنظيم قبل نشره أو تحديثه.",
  ];

  const editorialList = [
    "نسعى إلى تقديم محتوى أصلي ومفيد للزائر وليس مجرد صفحات مكتوبة بغرض عرض الإعلانات.",
    "نحرص على كتابة الوصفات بلغة واضحة وسهلة بعيدًا عن العبارات المضللة أو الوعود غير الواقعية.",
    "قد تختلف نتيجة بعض الوصفات باختلاف نوع الفرن أو أدوات الطهي أو جودة المكونات المستخدمة.",
    "المعلومات الغذائية، عند وجودها، تكون تقديرية وقد تختلف حسب العلامات التجارية والكميات الفعلية المستخدمة.",
    "المحتوى المنشور لأغراض المعلومات العامة ولا يُعد بديلاً عن استشارة طبيب أو مختص تغذية في حالات الحساسية أو الأنظمة الغذائية الخاصة.",
    "نقوم بتحديث المحتوى عند اكتشاف معلومات تحتاج إلى تصحيح أو تحسين.",
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 dark:bg-[#0b1220] px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="mx-auto mt-8 max-w-5xl">
        <nav
          aria-label="مسار التنقل"
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400"
        >
          <Link
            href="/"
            className="rounded-md outline-none transition-colors hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-400 dark:hover:text-orange-400"
          >
            الرئيسية
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-gray-800 dark:text-gray-200">
            من نحن
          </span>
        </nav>

        {/* =========================================
            Header
        ========================================= */}

        <header className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
              <ChefHat
                className="h-9 w-9 text-orange-500"
                aria-hidden="true"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">
            من نحن في شيف العرب؟
          </h1>

        </header>

        {/* =========================================
            Introduction
        ========================================= */}

        <section
          aria-labelledby="about-chefalarab"
          className="rounded-3xl border border-gray-900 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          <h2
            id="about-chefalarab"
            className="mb-5 text-2xl font-bold text-gray-950 dark:text-white"
          >
            ما هو شيف العرب؟
          </h2>

          <div className="space-y-5 text-base leading-8 text-gray-700 dark:text-gray-300">
            <p>
              <Link
                href="/"
                className="font-bold text-orange-600 transition hover:text-orange-500 dark:text-orange-400"
              >
                شيف العرب
              </Link>{" "}
              هو موقع عربي متخصص في تقديم وصفات الطبخ العربية والعالمية
              بطريقة واضحة ومنظمة تساعد المستخدم على إعداد الطعام في المنزل
              بسهولة.
            </p>

            <p>
              نعمل على تقديم الوصفات في صورة عملية تشمل المقادير وخطوات
              التحضير والمعلومات الأساسية الخاصة بالوصفة، مع إضافة النصائح
              والبدائل والأخطاء الشائعة عندما تكون هذه المعلومات مفيدة
              للقارئ.
            </p>

            <p>
              هدفنا أن يتمكن الزائر من معرفة ما يحتاج إليه قبل بدء الوصفة،
              وأن يجد خطوات التنفيذ مرتبة وواضحة بدلًا من البحث عن المعلومات
              في أكثر من مكان.
            </p>
          </div>
        </section>

        {/* =========================================
            Main cards
        ========================================= */}

        <section
          aria-label="هدف ومحتوى وقيم شيف العرب"
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-3xl border border-gray-900 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
                    <Icon
                      className="h-6 w-6 text-orange-500"
                      aria-hidden="true"
                    />
                  </div>

                  <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                    {card.title}
                  </h2>
                </div>

                <p className="leading-8 text-gray-600 dark:text-gray-300">
                  {card.content}
                </p>
              </article>
            );
          })}
        </section>

        {/* =========================================
            Preparation process
        ========================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-900 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex w-full items-center justify-between gap-4 p-6 text-right transition hover:bg-gray-50 dark:hover:bg-gray-800/60 sm:p-7">
            <div className="flex items-center gap-3">
              <ListChecks
                className="h-6 w-6 shrink-0 text-orange-500"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-gray-950 dark:text-white sm:text-2xl">
                كيف نُعد وننظم الوصفات؟
              </h2>
            </div>
          </div>

          <div
            id="preparation-content"
            className="grid grid-rows-[1fr]"
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-100 px-6 pb-7 pt-5 dark:border-gray-800 sm:px-7">
                <p className="mb-5 leading-8 text-gray-600 dark:text-gray-300">
                  نحاول أن تكون كل وصفة سهلة القراءة والتنفيذ، ولذلك يتم
                  تنظيم محتوى الوصفة وفق مجموعة من الخطوات:
                </p>

                <ul className="space-y-3">
                  {preparationList.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-2xl bg-gray-50 p-4 leading-7 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                    >
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                        aria-hidden="true"
                      />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            What visitors get
        ========================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-900 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex w-full items-center justify-between gap-4 p-6 text-right transition hover:bg-gray-50 dark:hover:bg-gray-800/60 sm:p-7">
            <div className="flex items-center gap-3">
              <HeartHandshake
                className="h-6 w-6 shrink-0 text-orange-500"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-gray-950 dark:text-white sm:text-2xl">
                ماذا يقدم شيف العرب للزائر؟
              </h2>
            </div>
          </div>

          <div
            id="why-content"
            className="grid grid-rows-[1fr]"
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-100 px-6 pb-7 pt-5 dark:border-gray-800 sm:px-7">
                <ul className="space-y-3">
                  {whyList.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-2xl bg-gray-50 p-4 leading-7 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                    >
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                        aria-hidden="true"
                      />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            Management
        ========================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-900 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex w-full items-center justify-between gap-4 p-6 text-right transition hover:bg-gray-50 dark:hover:bg-gray-800/60 sm:p-7">
            <div className="flex items-center gap-3">
              <Users
                className="h-6 w-6 shrink-0 text-orange-500"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-gray-950 dark:text-white sm:text-2xl">
                من المسؤول عن الموقع؟
              </h2>
            </div>
          </div>

          <div
            id="management-content"
            className="grid grid-rows-[1fr]"
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-100 px-6 pb-7 pt-5 text-gray-700 dark:border-gray-800 dark:text-gray-300 sm:px-7">
                <div className="space-y-4 leading-8">
                  <p>
                    يتم إدارة موقع شيف العرب والإشراف على المحتوى المنشور من
                    خلال إدارة شيف العرب، التي تتولى تنظيم محتوى الوصفات،
                    مراجعة الصفحات، متابعة التحديثات، وتطوير تجربة استخدام
                    الموقع.
                  </p>

                  <p>
                    إذا لاحظت معلومة تحتاج إلى تصحيح، أو كان لديك اقتراح
                    بخصوص إحدى الوصفات أو الموقع، يمكنك التواصل معنا مباشرة
                    عبر صفحة التواصل.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            Editorial policy
        ========================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-900 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex w-full items-center justify-between gap-4 p-6 text-right transition hover:bg-gray-50 dark:hover:bg-gray-800/60 sm:p-7">
            <div className="flex items-center gap-3">
              <BookOpen
                className="h-6 w-6 shrink-0 text-orange-500"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-gray-950 dark:text-white sm:text-2xl">
                سياسة المحتوى والمراجعة
              </h2>
            </div>
          </div>

          <div
            id="editorial-content"
            className="grid grid-rows-[1fr]"
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-100 px-6 pb-7 pt-5 dark:border-gray-800 sm:px-7">
                <ul className="space-y-3">
                  {editorialList.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-2xl bg-gray-50 p-4 leading-7 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                    >
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                        aria-hidden="true"
                      />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            Contact
        ========================================= */}

        <section className="mt-8 rounded-3xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-950/20 sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <Mail
                  className="h-6 w-6 text-orange-600 dark:text-orange-400"
                  aria-hidden="true"
                />

                <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
                  كيف تتواصل معنا؟
                </h2>
              </div>

              <p className="max-w-2xl leading-8 text-gray-700 dark:text-gray-300">
                نستقبل الملاحظات والاقتراحات والاستفسارات وطلبات التعاون من
                خلال صفحة التواصل الرسمية للموقع.
              </p>
            </div>

            <Link
              href="/contact_us"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              تواصل معنا

              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* =========================================
            Trust links
        ========================================= */}

        <nav
          aria-label="روابط معلومات الموقع"
          className="mt-8 rounded-3xl border border-gray-900 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="mb-5 text-xl font-bold text-gray-950 dark:text-white">
            معلومات وسياسات الموقع
          </h2>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact_us"
              className="rounded-xl border border-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-orange-400"
            >
              تواصل معنا
            </Link>

            <Link
              href="/privacy_policy"
              className="rounded-xl border border-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-orange-400"
            >
              سياسة الخصوصية
            </Link>

            <Link
              href="/cookie_policy"
              className="rounded-xl border border-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-orange-400"
            >
              سياسة ملفات الارتباط
            </Link>

            <Link
              href="/terms_conditions"
              className="rounded-xl border border-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-orange-400"
            >
              الشروط والأحكام
            </Link>
          </div>
        </nav>

        {/* =========================================
            Final note
        ========================================= */}

        <section className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <UtensilsCrossed
              className="h-4 w-4 text-orange-500"
              aria-hidden="true"
            />

            <span>
              شيف العرب – وصفات عربية وعالمية بطريقة واضحة وعملية
            </span>
          </div>
        </section>

      </div>
    </main>
  );
}

