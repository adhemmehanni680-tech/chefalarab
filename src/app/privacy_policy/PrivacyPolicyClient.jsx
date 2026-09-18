// PrivacyPolicyClient
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

export default function PrivacyPolicyClient() {

  const sections = [
    {
      icon: Info,
      title: "مقدمة",
      content:
        "نحن في موقع شيف العرب نلتزم بحماية خصوصية زوارنا، ونسعى لتوفير تجربة آمنة وموثوقة لجميع المستخدمين. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات عند استخدامك للموقع.",
    },
    {
      icon: Users,
      title: "المعلومات التي قد نقوم بجمعها",
      content:
        "قد نجمع معلومات غير شخصية تلقائيًا مثل نوع المتصفح، نظام التشغيل، الصفحات التي تمت زيارتها، وقت وتاريخ الزيارة، وعنوان IP بشكل تقني لأغراض الأمان وتحسين الأداء. ولا نقوم بجمع بيانات شخصية مثل الاسم أو البريد الإلكتروني إلا إذا قمت بإرسالها طوعًا عند التواصل معنا.",
    },
    {
      icon: Cookie,
      title: "ملفات تعريف الارتباط (Cookies)",
      content:
        "يستخدم موقع شيف العرب ملفات تعريف الارتباط لتحسين تجربة التصفح، وتخصيص المحتوى، وتحليل حركة المرور، وقياس الأداء. يمكنك التحكم بإعدادات الكوكيز من خلال متصفحك، وقد يؤدي تعطيلها إلى التأثير على بعض وظائف الموقع.",
      links: [{ label: "اقرأ سياسة الكوكيز", href: "/cookie_policy", internal: true }],
    },
    {
      icon: FileText,
      title: "الإعلانات وشركاء الإعلان (Google AdSense)",
      content:
        "قد نعرض إعلانات من خلال خدمات مثل Google AdSense. قد يستخدم Google وشركاؤه ملفات تعريف الارتباط وتقنيات مماثلة لعرض إعلانات (قد تكون مخصصة) بناءً على زياراتك السابقة لهذا الموقع أو لمواقع أخرى. لمعرفة المزيد حول كيفية استخدام Google للبيانات في الإعلانات، يمكنك زيارة سياسة إعلانات Google.",
      links: [
        { label: "سياسة Google للإعلانات", href: "https://policies.google.com/technologies/ads" },
      ],
    },
    {
      icon: Settings,
      title: "التحكم في الإعلانات المخصصة",
      content:
        "يمكنك التحكم في الإعلانات المخصصة أو تعطيلها عبر إعدادات الإعلانات في Google. كما يمكنك إدارة ملفات الارتباط من إعدادات المتصفح لديك.",
      links: [{ label: "إعدادات الإعلانات من Google", href: "https://adssettings.google.com" }],
    },
    {
      icon: Lock,
      title: "الأمان",
      content:
        "نسعى لحماية معلومات المستخدمين باستخدام إجراءات تقنية وتنظيمية مناسبة لتقليل المخاطر قدر الإمكان. ومع ذلك، لا يمكن ضمان أمان أي نقل بيانات عبر الإنترنت بشكل مطلق.",
    },
    {
      icon: Link2,
      title: "روابط لمواقع خارجية",
      content:
        "قد يحتوي الموقع على روابط لمواقع خارجية. نحن غير مسؤولين عن محتوى أو ممارسات الخصوصية لتلك المواقع، وننصح بمراجعة سياسة الخصوصية الخاصة بها قبل استخدامها.",
    },
    {
      icon: Baby,
      title: "خصوصية الأطفال",
      content:
        "محتوى الموقع عام ومخصص للجمهور. نحن لا نستهدف جمع معلومات شخصية من الأطفال عمدًا. إذا كنت تعتقد أن طفلًا قد زودنا بمعلومات شخصية، يرجى التواصل معنا لطلب حذفها.",
    },
    {
      icon: ShieldCheck,
      title: "اختيارات الخصوصية والموافقة",
      content:
        "استخدام الموقع لا يُعد موافقة تلقائية على ملفات التحليل أو الإعلانات الاختيارية. عند الحاجة إلى الموافقة، يمكنك القبول أو الرفض من أداة إدارة الخصوصية، ويمكنك تغيير اختيارك لاحقًا من رابط إعدادات الخصوصية في تذييل الموقع. وفي المناطق التي تتطلب ذلك، تُدار موافقة الإعلانات من خلال منصة إدارة موافقة معتمدة ومتوافقة مع متطلبات Google.",
    },
    {
      icon: RefreshCw,
      title: "تحديث سياسة الخصوصية",
      content:
        "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر بما يتوافق مع المتطلبات القانونية وتحسينات الخدمات. ننصح بمراجعة هذه الصفحة دوريًا للاطلاع على أحدث إصدار.",
    },
    {
      icon: Mail,
      title: "التواصل معنا",
      content:
        "إذا كان لديك أي استفسار بخصوص سياسة الخصوصية أو طلب متعلق بالبيانات، يمكنك التواصل معنا عبر صفحة تواصل معنا أو البريد الإلكتروني.",
      links: [
        { label: "صفحة تواصل معنا", href: "/contact_us", internal: true },
        { label: "البريد: chefalarabonline@gmail.com", href: "mailto:chefalarabonline@gmail.com" },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6 overflow-x-hidden transition-colors duration-500">



      <div className="max-w-5xl mx-auto mt-10">
        <h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8"

        >
          سياسة الخصوصية
        </h1>

        <div
          className="bg-gray-800 rounded-2xl shadow-md p-8 mb-10"
        >
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            نحن في موقع{" "}
            <Link href="/" className="font-semibold text-blue-400 ">
              شيف العرب
            </Link>{" "}
            نلتزم بحماية خصوصية زوارنا، ونسعى لتوفير تجربة آمنة وموثوقة لجميع المستخدمين.
            تتناول سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي يتم جمعها من خلال الموقع.
          </p>
          <p className="mt-3 text-xs font-bold text-gray-400">آخر تحديث: 17 سبتمبر 2026</p>
        </div>

        {sections.map((section, idx) => (
          <section
            key={idx}
            className="bg-gray-800 rounded-2xl shadow-md p-8 mb-6"

          >
            <div className="flex items-center gap-3 mb-3 ">
              <section.icon className="text-blue-400 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold text-gray-100">{section.title}</h2>
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed    p-2 rounded-lg  hover:bg-orange-500 hover:text-black break-words">{section.content}</p>

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
                      target={l.href.startsWith("mailto:") ? "_self" : "_blank"}
                      rel={l.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
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
