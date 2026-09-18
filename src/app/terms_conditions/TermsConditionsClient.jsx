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
        "يقدم موقع شيف العرب وصفات ومعلومات طبخ لأغراض معرفية وتثقيفية عامة. قد تختلف النتائج حسب المكونات والأدوات وطرق الطهي. أنت تتحمل مسؤولية تطبيق الوصفات والتحقق من الملاءمة الغذائية والحساسية وسلامة الطعام.",
    },
    {
      icon: AlertTriangle,
      title: "حدود المسؤولية",
      content:
        "نبذل جهدًا لتقديم محتوى دقيق ومفيد، ومع ذلك لا نضمن خلو المحتوى من الأخطاء أو اكتماله في جميع الأوقات. لا يتحمل الموقع أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المحتوى أو الاعتماد عليه.",
    },
    {
      icon: Copyright,
      title: "حقوق الملكية الفكرية",
      content:
        "جميع النصوص والتصاميم والشعارات والمحتوى المنشور في الموقع مملوكة لموقع شيف العرب أو لأصحابها إن وُجد، ومحميّة بموجب حقوق الملكية الفكرية. لا يجوز نسخ أو إعادة نشر أو توزيع أي جزء من المحتوى دون إذن كتابي مسبق، باستثناء الاستخدام الشخصي غير التجاري مع الإشارة للمصدر.",
    },
    {
      icon: Link2,
      title: "الروابط الخارجية",
      content:
        "قد يحتوي الموقع على روابط لمواقع أو خدمات خارجية. نحن غير مسؤولين عن محتوى تلك المواقع أو سياسات الخصوصية الخاصة بها، ويكون استخدامك لها على مسؤوليتك.",
    },
    {
      icon: BadgeInfo,
      title: "الإعلانات والأطراف الثالثة (AdSense)",
      content:
        "قد يعرض الموقع إعلانات من أطراف ثالثة مثل Google AdSense. قد تستخدم هذه الجهات ملفات تعريف الارتباط وتقنيات مشابهة لعرض الإعلانات وقياس الأداء. نحن لسنا مسؤولين عن محتوى الإعلانات المعروضة من أطراف ثالثة.",
      links: [
        { label: "سياسة Google للإعلانات", href: "https://policies.google.com/technologies/ads" },
        { label: "سياسة الخصوصية", href: "/privacy_policy", internal: true },
        { label: "سياسة الكوكيز", href: "/cookie_policy", internal: true },
      ],
    },
    {
      icon: Cookie,
      title: "ملفات تعريف الارتباط",
      content:
        "قد يستخدم الموقع ملفات تعريف الارتباط لتحسين الأداء وتجربة المستخدم وقياس الزيارات ودعم الإعلانات. يمكنك إدارة ملفات الارتباط من إعدادات المتصفح لديك.",
      links: [{ label: "اقرأ سياسة الكوكيز بالتفصيل", href: "/cookie_policy", internal: true }],
    },
    {
      icon: RefreshCw,
      title: "التعديلات على الشروط",
      content:
        "يحتفظ موقع شيف العرب بالحق في تعديل هذه الشروط والأحكام في أي وقت. يتم نشر النسخة المحدثة على هذه الصفحة وتصبح سارية فور نشرها. ننصح بمراجعة الصفحة دوريًا.",
    },
    {
      icon: Mail,
      title: "التواصل معنا",
      content: (
        <>
          لأي استفسار بخصوص الشروط والأحكام يمكنك التواصل معنا عبر البريد:{" "}
          <Link href="mailto:chefalarabonline@gmail.com" className="text-white font-semibold">
            chefalarabonline@gmail.com
          </Link>
        </>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6 overflow-x-hidden transition-colors duration-500">


      <div className="max-w-5xl mx-auto mt-10">
        <h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8"
        >
          الشروط والأحكام
        </h1>
        <p className="mb-8 text-center text-xs font-bold text-gray-500 dark:text-gray-400">آخر تحديث: 17 سبتمبر 2026</p>

        {sections.map((section, idx) => (
          <section
            key={idx}
            className="bg-gray-800 rounded-2xl shadow-md p-8 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <section.icon className="text-blue-400 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold text-gray-100">{section.title}</h2>
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed   p-2 rounded-lg  hover:bg-orange-500 hover:text-black break-words">
              {section.content}
            </p>

            {section.links?.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {section.links.map((l, i) =>
                  l.internal ? (
                    <Link
                      key={i}
                      href={l.href}
                      className="text-blue-400 hover:underline text-sm break-words"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      key={i}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm break-words"
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


    </main>
  );
}
