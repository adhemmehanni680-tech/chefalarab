// CookiePolicyClient

"use client";
import {
  Cookie,
  Info,
  ShieldCheck,
  Settings,
  Link2,
  RefreshCw,
  Mail,
} from "lucide-react";
import Link from "next/link";



export default function CookiePolicyClient() {



  const sections = [
    {
      icon: Info,
      title: "ما هي ملفات تعريف الارتباط (Cookies)؟",
      content:
        "ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة المواقع الإلكترونية، وتُستخدم لتحسين تجربة التصفح وتوفير وظائف أساسية وتحليل الأداء.",
    },
    {
      icon: Cookie,
      title: "كيف نستخدم ملفات تعريف الارتباط؟",
      content:
        "يستخدم موقع شيف العرب ملفات تعريف الارتباط الضرورية لتشغيل الموقع بشكل صحيح، بالإضافة إلى ملفات اختيارية لتحليل الأداء وتحسين تجربة المستخدم.",
    },
    {
      icon: ShieldCheck,
      title: "الموافقة على ملفات تعريف الارتباط",
      content:
        "لا يتم تفعيل ملفات تعريف الارتباط غير الضرورية، مثل ملفات التحليل أو الإعلانات، إلا بعد الحصول على موافقتك الصريحة من خلال نافذة إدارة الكوكيز التي تظهر عند زيارتك الأولى للموقع.",
    },
    {
      icon: Settings,
      title: "ملفات تعريف الارتباط والإعلانات",
      content:
        "قد يستخدم شركاؤنا الإعلانيون، مثل Google AdSense، ملفات تعريف الارتباط لعرض إعلانات (قد تكون مخصصة) بناءً على زياراتك السابقة لهذا الموقع أو لمواقع أخرى، وذلك بعد موافقتك.",
      links: [
        {
          label: "كيفية استخدام Google للبيانات",
          href: "https://policies.google.com/technologies/ads",
        },
        {
          label: "إعدادات الإعلانات من Google",
          href: "https://adssettings.google.com",
        },
      ],
    },
    {
      icon: Settings,
      title: "التحكم في ملفات تعريف الارتباط",
      content:
        "يمكنك في أي وقت التحكم في ملفات تعريف الارتباط أو حذفها من خلال إعدادات المتصفح لديك. يرجى ملاحظة أن تعطيل بعض الملفات قد يؤثر على وظائف معينة في الموقع.",
    },
    {
      icon: Link2,
      title: "روابط خارجية",
      content:
        "قد يحتوي موقع شيف العرب على روابط لمواقع خارجية. نحن غير مسؤولين عن سياسات الخصوصية أو ملفات تعريف الارتباط الخاصة بتلك المواقع.",
    },
    {
      icon: RefreshCw,
      title: "تحديث سياسة الكوكيز",
      content:
        "قد نقوم بتحديث سياسة ملفات تعريف الارتباط من وقت لآخر. سيتم نشر أي تحديث على هذه الصفحة مع تعديل تاريخ التحديث.",
    },
    {
      icon: Mail,
      title: "التواصل معنا",
      content:
        "إذا كان لديك أي استفسار بخصوص سياسة ملفات تعريف الارتباط، يمكنك التواصل معنا عبر صفحة تواصل معنا أو البريد الإلكتروني.",
      links: [
        { label: "تواصل معنا", href: "/contact_us", internal: true },
        {
          label: "chefalarabonline@gmail.com",
          href: "mailto:chefalarabonline@gmail.com",
        },
      ],
    },
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
      <div className="max-w-5xl mx-auto mt-10">
        <h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          سياسة ملفات تعريف الارتباط (Cookies)
        </h1>

        <div
          className="bg-gray-800 rounded-2xl shadow-md p-8 mb-10"
        >
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            يوضح هذا المستند كيفية استخدام{" "}
            <Link href="/" className="font-semibold text-blue-400">
              شيف العرب
            </Link>{" "}
            لملفات تعريف الارتباط، مع التأكيد على عدم تفعيل أي ملفات غير ضرورية
            إلا بعد موافقتك.
          </p>
        </div>

        {sections.map((section, idx) => (
          <section
            key={idx}
            className="bg-gray-800 rounded-2xl shadow-md p-8 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <section.icon className="text-blue-400" />
              <h2 className="text-2xl font-semibold text-gray-100">
                {section.title}
              </h2>
            </div>

            <p className="text-gray-300 text-lg sm:text-base leading-relaxed bg-gray-700 p-2 rounded-lg  hover:bg-orange-500 hover:text-black break-words">
              {section.content}
            </p>

            {section.links?.length > 0 && (
              <div className="mt-4 flex flex-col gap-2  ">
                {section.links.map((l, i) =>
                  l.internal ? (
                    <Link
                      key={i}
                      href={l.href}
                      className="text-blue-400 hover:underline text-sm"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      key={i}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm"
                    >
                      {l.label}
                    </a>
                  )
                )}
              </div>
            )}
          </section>
        ))}
      </div>

    </div>
  );
}
