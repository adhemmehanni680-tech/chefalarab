import {
  FileText,
  ShieldCheck,
  Copyright,
  Link2,
  BadgeInfo,
  AlertTriangle,
  RefreshCw,
  Mail,
  Cookie,
} from "lucide-react";
import Link from "next/link";

export default function TermsConditionsClient() {
  const sections = [
    {
      icon: ShieldCheck,
      title: "قبول الشروط",
      content:
        "باستخدامك لموقع شيف العرب أو تصفحك لأي صفحة داخله، فإنك تقر بأنك قرأت هذه الشروط وفهمتها وتوافق على الالتزام بها. إذا كنت لا توافق على أي بند، يُرجى التوقف عن استخدام الموقع.",
    },
    {
      icon: FileText,
      title: "طبيعة المحتوى والغرض منه",
      content:
        "يقدم موقع شيف العرب وصفات ومعلومات عن الطبخ لأغراض معرفية وتثقيفية عامة. قد تختلف النتائج حسب المكونات والأدوات وطرق التحضير والطهي. تقع مسؤولية التحقق من ملاءمة المكونات للحالة الغذائية أو الحساسية وسلامة الطعام على المستخدم.",
    },
    {
      icon: AlertTriangle,
      title: "حدود المسؤولية",
      content:
        "نبذل جهدًا معقولًا لتقديم محتوى دقيق ومفيد، ومع ذلك قد يحتوي المحتوى أحيانًا على أخطاء أو معلومات غير مكتملة. لا يُعد محتوى الموقع بديلًا عن الإرشادات المتخصصة المتعلقة بسلامة الغذاء أو الحساسية الغذائية أو أي احتياج مهني متخصص.",
    },
    {
      icon: Copyright,
      title: "حقوق الملكية الفكرية",
      content:
        "جميع النصوص والتصاميم والشعارات والمحتوى المنشور في الموقع مملوكة لموقع شيف العرب أو لأصحاب الحقوق المعنيين، ومحمية بموجب القوانين المعمول بها. لا يجوز نسخ أو إعادة نشر أو توزيع المحتوى المنشور على الموقع لأغراض تجارية دون الحصول على إذن مسبق من صاحب الحق. يُسمح بالاستخدام الشخصي غير التجاري مع احترام حقوق الملكية والإشارة إلى المصدر عند الاقتباس المسموح به.",
    },
    {
      icon: Link2,
      title: "الروابط الخارجية",
      content:
        "قد يحتوي الموقع على روابط لمواقع أو خدمات خارجية. لا نتحكم في محتوى هذه المواقع أو ممارسات الخصوصية الخاصة بها، ولذلك ننصح بمراجعة سياسات الخصوصية والشروط الخاصة بأي موقع خارجي قبل استخدامه.",
    },
    {
      icon: BadgeInfo,
      title: "الإعلانات والأطراف الثالثة (AdSense)",
      content:
        "قد يعرض الموقع إعلانات من أطراف ثالثة، بما في ذلك Google AdSense. قد تستخدم الجهات الإعلانية ملفات تعريف الارتباط وتقنيات مشابهة وفقًا لسياساتها الخاصة، وذلك لأغراض مثل عرض الإعلانات وقياس الأداء وتخصيصها عندما يكون ذلك متاحًا ومسموحًا به. لا يتحكم موقع شيف العرب في محتوى الإعلانات التي تعرضها الجهات الخارجية.",
      links: [
        {
          label: "سياسة Google لتقنيات الإعلانات",
          href: "https://policies.google.com/technologies/ads",
        },
        {
          label: "سياسة الخصوصية",
          href: "/privacy_policy",
          internal: true,
        },
        {
          label: "سياسة ملفات تعريف الارتباط",
          href: "/cookie_policy",
          internal: true,
        },
      ],
    },
    {
      icon: Cookie,
      title: "ملفات تعريف الارتباط",
      content:
        "قد يستخدم الموقع ملفات تعريف الارتباط وتقنيات مشابهة لتحسين الأداء وتجربة المستخدم وقياس الزيارات ودعم بعض وظائف الموقع والإعلانات. يمكنك إدارة ملفات تعريف الارتباط من خلال إعدادات المتصفح أو خيارات الخصوصية المتاحة على الموقع، بحسب ما هو متاح.",
      links: [
        {
          label: "اقرأ سياسة ملفات تعريف الارتباط بالتفصيل",
          href: "/cookie_policy",
          internal: true,
        },
      ],
    },
    {
      icon: RefreshCw,
      title: "التعديلات على الشروط",
      content:
        "قد يتم تحديث هذه الشروط والأحكام من وقت لآخر لمواكبة التغييرات في الموقع أو الخدمات أو المتطلبات القانونية. عند إجراء أي تحديث، سيتم نشر النسخة الجديدة على هذه الصفحة مع تحديث تاريخ المراجعة.",
    },
    {
      icon: Mail,
      title: "التواصل معنا",
      content: (
        <>
          لأي استفسار بخصوص الشروط والأحكام يمكنك التواصل معنا عبر البريد:{" "}
          <Link
            href="mailto:chefalarabonline@gmail.com"
            className="font-semibold text-blue-400 hover:underline"
          >
            chefalarabonline@gmail.com
          </Link>
        </>
      ),
    },
  ];

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-gray-50
        px-6
        py-16
        transition-colors
        duration-500
        dark:bg-gray-900
      "
    >
      <div className="mx-auto mt-10 max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            الشروط والأحكام
          </h1>

          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            آخر تحديث: 25 سبتمبر 2026
          </p>
        </header>

        {sections.map((section, idx) => {
          const Icon = section.icon;

          return (
            <section
              key={idx}
              className="
                mb-6
                rounded-2xl
                bg-gray-800
                p-8
                shadow-md
              "
            >
              <div className="mb-3 flex items-center gap-3">
                <Icon className="text-blue-400" />

                <h2 className="text-2xl font-semibold text-gray-100">
                  {section.title}
                </h2>
              </div>

              <div
                className="
                  break-words
                  rounded-lg
                  p-2
                  text-sm
                  leading-relaxed
                  text-gray-300
                  transition-colors
                  sm:text-base
                  hover:bg-orange-500
                  hover:text-black
                "
              >
                {section.content}
              </div>

              {section.links?.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {section.links.map((link, i) =>
                    link.internal ? (
                      <Link
                        key={i}
                        href={link.href}
                        className="
                          break-words
                          text-sm
                          text-blue-400
                          hover:underline
                        "
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        key={i}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          break-words
                          text-sm
                          text-blue-400
                          hover:underline
                        "
                      >
                        {link.label}
                      </a>
                    )
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}