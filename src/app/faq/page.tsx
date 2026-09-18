import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات على الأسئلة الشائعة حول موقع شيف العرب: استخدام الموقع، الوصفات، الصور، الإعلانات، الخصوصية، الكوكيز، والتواصل.",
  alternates: {
    canonical: "https://chefalarab.com/faq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "الأسئلة الشائعة | شيف العرب",
    description:
      "إجابات على الأسئلة الشائعة حول موقع شيف العرب: استخدام الموقع، الوصفات، الخصوصية والكوكيز.",
    url: "https://chefalarab.com/faq",
    siteName: "شيف العرب",
    type: "article",
    locale: "ar_AR",
    images: [
      {
        url: "https://chefalarab.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "الأسئلة الشائعة | شيف العرب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الأسئلة الشائعة | شيف العرب",
    description:
      "إجابات على الأسئلة الشائعة حول موقع شيف العرب: استخدام الموقع، الوصفات، الخصوصية والكوكيز.",
    images: ["https://chefalarab.com/og-image.jpg"],
  },
};

const FAQ_ITEMS = [
  {
    q: "ما هو موقع شيف العرب؟",
    a: "شيف العرب هو موقع يقدم وصفات عربية وعالمية بطريقة مبسطة وخطوات واضحة، مع التركيز على جودة المحتوى وتجربة المستخدم.",
  },
  {
    q: "هل الوصفات مجرّبة؟",
    a: "نسعى لتقديم وصفات دقيقة ومُحسّنة. قد تختلف النتائج حسب نوع المكونات والأدوات المتاحة. لو واجهتك مشكلة في وصفة معيّنة تواصل معنا وسنساعدك.",
  },
  {
    q: "كيف أبحث عن وصفة بسرعة؟",
    a: "استخدم زر البحث العائم في الموقع واكتب اسم الوصفة أو أحد مكوناتها. تظهر النتائج من فهرس بحث خفيف من الخادم دون تحميل قاعدة الوصفات كاملة في المتصفح.",
  },
  {
    q: "هل يمكنني مشاركة الوصفات؟",
    a: "نعم، يمكنك مشاركة رابط الوصفة مباشرة مع أصدقائك. يُفضل مشاركة الرابط بدل نسخ المحتوى كاملًا.",
  },
  {
    q: "لماذا تظهر إعلانات في الموقع؟",
    a: "الإعلانات تساعد على تغطية تكاليف التشغيل وتحسين المحتوى. لا نعرض وحدات إعلانية يدوية على صفحات الخصوصية والشروط والكوكيز والتواصل ومن نحن.",
  },
  {
    q: "هل الإعلانات مخصّصة حسب اهتماماتي؟",
    a: "قد يعرض Google ومزودو الإعلانات إعلانات مخصّصة أو غير مخصّصة وفق المنطقة واختيارات الموافقة وإعدادات حسابك. يمكنك تعديل اختيارك من إعدادات الخصوصية في تذييل الموقع.",
  },
  {
    q: "ما هي ملفات تعريف الارتباط (Cookies)؟",
    a: "هي ملفات أو تقنيات تخزين صغيرة تساعد في الوظائف الأساسية وقياس الأداء والإعلانات بحسب الموافقة. التفاصيل موجودة في سياسة الكوكيز.",
  },
  {
    q: "كيف يتم التعامل مع بياناتي وخصوصيتي؟",
    a: "نوضح فئات البيانات وأغراض الاستخدام وخياراتك في سياسة الخصوصية. ويمكنك التواصل معنا لأي استفسار متعلق بالخصوصية.",
  },
  {
    q: "هل يستهدف الموقع الأطفال؟",
    a: "الموقع يقدم محتوى طبخ عامًا ولا يستهدف جمع بيانات شخصية من الأطفال عمدًا. إذا اعتقدت أن بيانات طفل أُرسلت إلينا، تواصل معنا لمراجعتها.",
  },
  {
    q: "كيف أتواصل مع إدارة الموقع؟",
    a: "يمكنك استخدام صفحة تواصل معنا أو مراسلتنا عبر البريد الإلكتروني chefalarabonline@gmail.com.",
  },
] as const;

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900 dark:bg-[#0b1220] dark:text-gray-100 sm:px-6 sm:py-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <div className="mb-3 flex justify-center text-orange-500">
            <HelpCircle size={36} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">الأسئلة الشائعة</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
            إجابات واضحة على أكثر الأسئلة تكرارًا حول وصفات شيف العرب، الإعلانات، الخصوصية والكوكيز.
          </p>
        </header>

        <section className="space-y-3" aria-label="الأسئلة الشائعة">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.q}
              open={index === 0}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <summary className="cursor-pointer list-none px-5 py-4 text-base font-black leading-7 text-slate-950 marker:hidden dark:text-white sm:text-lg">
                {item.q}
              </summary>
              <div className="border-t border-slate-200 px-5 py-4 text-sm font-bold leading-8 text-slate-700 dark:border-slate-700 dark:text-slate-300 sm:text-base">
                {item.a}
              </div>
            </details>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-black text-orange-600 dark:text-orange-400">روابط مهمة</h2>
          <div className="flex flex-wrap gap-2 text-sm font-black">
            <Link href="/privacy_policy" className="rounded-xl bg-slate-100 px-3 py-2 hover:text-orange-600 dark:bg-slate-800 dark:hover:text-orange-400">
              سياسة الخصوصية
            </Link>
            <Link href="/cookie_policy" className="rounded-xl bg-slate-100 px-3 py-2 hover:text-orange-600 dark:bg-slate-800 dark:hover:text-orange-400">
              سياسة الكوكيز
            </Link>
            <Link href="/terms_conditions" className="rounded-xl bg-slate-100 px-3 py-2 hover:text-orange-600 dark:bg-slate-800 dark:hover:text-orange-400">
              الشروط والأحكام
            </Link>
            <Link href="/contact_us" className="rounded-xl bg-slate-100 px-3 py-2 hover:text-orange-600 dark:bg-slate-800 dark:hover:text-orange-400">
              تواصل معنا
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
