"use client";

import {
ShieldCheck,
Lock,
Cookie,
FileText,
Info,
Users,
Link2,
RefreshCw,
Mail,
Baby,
Settings,
} from "lucide-react";

import Link from "next/link";

type SectionLink = {
label: string;
href: string;
internal?: boolean;
};

type PrivacySection = {
icon: typeof Info;
title: string;
content: string;
links?: SectionLink[];
};

export default function PrivacyPolicyClient() {
const sections: PrivacySection[] = [
{
icon: Info,
title: "مقدمة",
content:
"نحن في موقع شيف العرب نلتزم باحترام خصوصية زوار الموقع ونسعى إلى توفير تجربة استخدام آمنة وموثوقة. توضح سياسة الخصوصية هذه كيفية التعامل مع المعلومات التي قد يتم جمعها عند استخدام الموقع، والأغراض التي قد تُستخدم من أجلها، وبعض الخيارات المتاحة للمستخدمين.",
},


{
  icon: Users,
  title: "المعلومات التي قد نقوم بجمعها",
  content:
    "قد يتم جمع بعض المعلومات التقنية غير الشخصية تلقائيًا عند زيارة الموقع، مثل نوع المتصفح ونظام التشغيل والصفحات التي تمت زيارتها ووقت وتاريخ الزيارة وبعض المعلومات التقنية المتعلقة بعنوان IP، وذلك لأغراض تشغيل الموقع والأمان وتحسين الأداء وفهم كيفية استخدام الخدمات. ولا نقوم بطلب بيانات شخصية مثل الاسم أو البريد الإلكتروني لمجرد تصفح الموقع، إلا إذا قام المستخدم بإرسالها طوعًا، مثل التواصل مع إدارة الموقع.",
},

{
  icon: Cookie,
  title: "ملفات تعريف الارتباط (Cookies)",
  content:
    "قد يستخدم موقع شيف العرب ملفات تعريف الارتباط وتقنيات مشابهة للمساعدة في تشغيل بعض وظائف الموقع وتحسين تجربة التصفح وقياس الأداء وفهم استخدام الخدمات، وقد ترتبط بعض ملفات تعريف الارتباط بالخدمات الإعلانية وفق الإعدادات والسياسات المعمول بها. يمكنك التحكم في ملفات تعريف الارتباط من إعدادات المتصفح أو من أدوات إدارة الخصوصية المتاحة في الموقع عندما تكون مطلوبة.",
  links: [
    {
      label: "اقرأ سياسة ملفات تعريف الارتباط",
      href: "/cookie_policy",
      internal: true,
    },
  ],
},

{
  icon: FileText,
  title: "الإعلانات وشركاء الإعلان",
  content:
    "قد يعرض موقع شيف العرب إعلانات من خلال خدمات إعلانية تابعة لجهات خارجية مثل Google AdSense. قد تستخدم Google وشركاؤها ملفات تعريف الارتباط أو تقنيات مشابهة لتقديم الإعلانات وقياس أدائها، وقد تكون بعض الإعلانات مخصصة وفقًا لإعدادات الإعلانات والخيارات المتاحة للمستخدم. يخضع استخدام هذه الخدمات للسياسات والإعدادات الخاصة بمزود الخدمة.",
  links: [
    {
      label: "سياسة Google المتعلقة بتقنيات الإعلانات",
      href: "https://policies.google.com/technologies/ads",
    },
  ],
},

{
  icon: Settings,
  title: "التحكم في الإعلانات المخصصة",
  content:
    "يمكن للمستخدم إدارة بعض إعدادات الإعلانات المخصصة من خلال أدوات وإعدادات Google المتاحة له، كما يمكنه إدارة ملفات تعريف الارتباط من إعدادات المتصفح أو أدوات إدارة الخصوصية المتاحة في الموقع. قد تختلف الخيارات المتاحة حسب الجهاز والمنطقة والحساب وإعدادات مزود الخدمة.",
  links: [
    {
      label: "إعدادات الإعلانات من Google",
      href: "https://adssettings.google.com/",
    },
  ],
},

{
  icon: Lock,
  title: "الأمان وحماية المعلومات",
  content:
    "نسعى إلى استخدام إجراءات تقنية وتنظيمية مناسبة للمساعدة في حماية المعلومات وتقليل مخاطر الوصول غير المصرح به أو سوء الاستخدام. ومع ذلك، لا يمكن ضمان أمان أي نظام أو عملية لنقل البيانات عبر الإنترنت بشكل مطلق، ولذلك لا يمكن اعتبار أي وسيلة إلكترونية آمنة بنسبة مئة بالمئة.",
},

{
  icon: Link2,
  title: "الروابط إلى مواقع خارجية",
  content:
    "قد تحتوي بعض صفحات شيف العرب على روابط تؤدي إلى مواقع أو خدمات خارجية. هذه المواقع لها سياسات وممارسات خاصة بها، ولا يتحمل شيف العرب مسؤولية محتوى أو ممارسات الخصوصية الخاصة بالمواقع الخارجية. ننصح بمراجعة سياسة الخصوصية وشروط الاستخدام الخاصة بأي موقع خارجي قبل تقديم معلومات شخصية إليه.",
},

{
  icon: Baby,
  title: "خصوصية الأطفال",
  content:
    "محتوى شيف العرب عام ومتاح للجمهور، ولا نستهدف جمع معلومات شخصية من الأطفال عمدًا. إذا كنت تعتقد أن طفلًا قد أرسل إلينا معلومات شخصية، يمكنك التواصل مع إدارة الموقع وطلب مراجعة المعلومات واتخاذ الإجراء المناسب.",
  links: [
    {
      label: "التواصل مع إدارة الموقع",
      href: "/contact_us",
      internal: true,
    },
  ],
},

{
  icon: ShieldCheck,
  title: "اختيارات الخصوصية والموافقة",
  content:
    "استخدام الموقع لا يعني تلقائيًا الموافقة على جميع أنواع ملفات التحليل أو الإعلانات الاختيارية. عندما تكون الموافقة مطلوبة، قد يتم توفير أداة لإدارة الخصوصية والموافقة تتيح للمستخدم قبول الخيارات المتاحة أو رفضها أو تعديلها وفقًا للخيارات المتوفرة في منطقته. وقد تختلف متطلبات الموافقة والإعدادات بحسب الموقع الجغرافي والخدمات المستخدمة.",
},

{
  icon: RefreshCw,
  title: "تحديث سياسة الخصوصية",
  content:
    "قد نقوم بتحديث سياسة الخصوصية من وقت إلى آخر نتيجة لتغييرات في خدمات الموقع أو طريقة عملها أو المتطلبات القانونية والتنظيمية أو ممارسات حماية البيانات. عند إجراء تحديثات مهمة، يتم تعديل تاريخ آخر تحديث الظاهر في هذه الصفحة. ننصح بمراجعة هذه الصفحة بشكل دوري لمعرفة أحدث نسخة من سياسة الخصوصية.",
},

{
  icon: Mail,
  title: "التواصل معنا وطلبات البيانات",
  content:
    "إذا كان لديك سؤال حول سياسة الخصوصية أو طريقة التعامل مع البيانات أو لديك طلب متعلق بالمعلومات التي أرسلتها إلى الموقع، يمكنك التواصل مع إدارة شيف العرب من خلال صفحة تواصل معنا أو عبر البريد الإلكتروني الموضح أدناه.",
  links: [
    {
      label: "صفحة تواصل معنا",
      href: "/contact_us",
      internal: true,
    },
    {
      label: "البريد الإلكتروني: chefalarabonline@gmail.com",
      href: "mailto:chefalarabonline@gmail.com",
    },
  ],
},


];

return ( <main
   dir="rtl"
   className="min-h-screen overflow-x-hidden bg-gray-50 px-6 py-16 text-black transition-colors duration-500 dark:bg-gray-900 dark:text-white"
 > <div className="mx-auto mt-10 max-w-5xl">
{/* Header */} <header className="mb-10 text-center"> <div className="mb-4 flex justify-center text-blue-400"> <ShieldCheck
           size={42}
           strokeWidth={1.8}
           aria-hidden="true"
         /> </div>


      <p className="mb-3 text-sm font-bold tracking-wide text-blue-500 dark:text-blue-400">
        الخصوصية وحماية البيانات
      </p>

      <h1 className="mb-4 text-4xl font-black leading-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
        سياسة الخصوصية
      </h1>

      <p className="mx-auto max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
        توضح هذه الصفحة كيفية تعامل موقع شيف العرب مع المعلومات والبيانات
        وملفات تعريف الارتباط والإعلانات والروابط الخارجية، بالإضافة إلى
        خيارات الخصوصية وطرق التواصل مع إدارة الموقع.
      </p>
    </header>

    {/* Introduction */}
    <section
      aria-labelledby="privacy-introduction"
      className="mb-10 rounded-2xl bg-gray-800 p-8 shadow-md"
    >
      <div className="mb-4 flex items-center gap-3">
        <Info
          className="shrink-0 text-blue-400"
          size={26}
          aria-hidden="true"
        />

        <h2
          id="privacy-introduction"
          className="text-2xl font-bold text-gray-100"
        >
          مقدمة سياسة الخصوصية
        </h2>
      </div>

      <p className="text-sm leading-8 text-gray-300 sm:text-base">
        نحن في{" "}
        <Link
          href="/"
          className="font-bold text-blue-400 transition hover:text-blue-300 hover:underline"
        >
          شيف العرب
        </Link>{" "}
        نلتزم باحترام خصوصية زوار الموقع وتوضيح طريقة التعامل مع المعلومات
        التي قد يتم جمعها أثناء استخدام الموقع. تهدف هذه السياسة إلى
        توضيح الممارسات المتعلقة بالبيانات وملفات تعريف الارتباط
        والإعلانات والأمان والروابط الخارجية.
      </p>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-xs font-bold text-gray-400">
          آخر تحديث لسياسة الخصوصية:{" "}
          <time dateTime="2026-09-17">17 سبتمبر 2026</time>
        </p>
      </div>
    </section>

    {/* Table of contents */}
    <nav
      aria-label="محتويات سياسة الخصوصية"
      className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-4 text-xl font-black text-gray-900 dark:text-gray-100">
        محتويات سياسة الخصوصية
      </h2>

      <div className="grid gap-2 sm:grid-cols-2">
        {sections.map((section, index) => (
          <a
            key={section.title}
            href={`#privacy-section-${index + 1}`}
            className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-orange-400"
          >
            {index + 1}. {section.title}
          </a>
        ))}
      </div>
    </nav>

    {/* Policy sections */}
    <div>
      {sections.map((section, idx) => {
        const Icon = section.icon;

        return (
          <section
            key={section.title}
            id={`privacy-section-${idx + 1}`}
            aria-labelledby={`privacy-title-${idx + 1}`}
            className="mb-6 scroll-mt-24 rounded-2xl bg-gray-800 p-8 shadow-md"
          >
            <div className="mb-4 flex items-start gap-3">
              <Icon
                className="mt-1 shrink-0 text-blue-400"
                size={26}
                aria-hidden="true"
              />

              <h2
                id={`privacy-title-${idx + 1}`}
                className="text-xl font-bold leading-8 text-gray-100 sm:text-2xl"
              >
                {section.title}
              </h2>
            </div>

            <p className="break-words rounded-lg p-2 text-sm leading-8 text-gray-300 sm:text-base">
              {section.content}
            </p>

            {section.links && section.links.length > 0 && (
              <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5">
                {section.links.map((link) => {
                  if (link.internal) {
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="break-words text-sm font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
                      >
                        {link.label}
                      </Link>
                    );
                  }

                  const isMail = link.href.startsWith("mailto:");

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target={isMail ? "_self" : "_blank"}
                      rel={
                        isMail
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="break-words text-sm font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>

    {/* Important links */}
    <section
      aria-labelledby="privacy-important-links"
      className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <FileText
          className="text-orange-400"
          size={26}
          aria-hidden="true"
        />

        <h2
          id="privacy-important-links"
          className="text-xl font-black text-gray-900 dark:text-gray-100"
        >
          روابط مهمة
        </h2>
      </div>

      <p className="mb-6 text-sm leading-8 text-gray-600 dark:text-gray-300 sm:text-base">
        يمكنك الانتقال إلى الصفحات التالية لمعرفة المزيد عن سياسات شيف
        العرب واستخدام الموقع أو للتواصل مع الإدارة.
      </p>

      <nav
        aria-label="روابط سياسة الخصوصية المهمة"
        className="flex flex-wrap gap-2"
      >
        <Link
          href="/faq"
          className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:text-orange-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-orange-400"
        >
          الأسئلة الشائعة
        </Link>

        <Link
          href="/cookie_policy"
          className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:text-orange-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-orange-400"
        >
          سياسة الكوكيز
        </Link>

        <Link
          href="/terms_conditions"
          className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:text-orange-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-orange-400"
        >
          الشروط والأحكام
        </Link>

        <Link
          href="/contact_us"
          className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:text-orange-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-orange-400"
        >
          تواصل معنا
        </Link>

        <Link
          href="/recipes"
          className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:text-orange-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-orange-400"
        >
          تصفح الوصفات
        </Link>
      </nav>
    </section>
  </div>
</main>


);
}
