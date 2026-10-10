import type { Metadata } from "next";
import FAQClient from "./FaqClient";

const SITE_URL = "https://chefalarab.com";
const PAGE_URL = `${SITE_URL}/faq`;

export const metadata: Metadata = {
  title: "الأسئلة الشائعة عن شيف العرب | الوصفات واستخدام الموقع",

  description:
    "تعرف على إجابات أهم الأسئلة الشائعة حول شيف العرب، مثل البحث عن الوصفات، مشاركة الوصفات، الإعلانات، ملفات تعريف الارتباط، الخصوصية، والتواصل مع إدارة الموقع.",

  keywords: [
    "الأسئلة الشائعة",
    "شيف العرب",
    "أسئلة شيف العرب",
    "طريقة استخدام شيف العرب",
    "البحث عن وصفات",
    "وصفات شيف العرب",
    "مشاركة الوصفات",
    "خصوصية شيف العرب",
    "سياسة الكوكيز",
    "إعلانات شيف العرب",
  ],

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

  // ...
};
const faqSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "الأسئلة الشائعة عن شيف العرب",
      description:
        "إجابات عن الأسئلة الشائعة حول استخدام موقع شيف العرب والوصفات والخصوصية والكوكيز والإعلانات والتواصل.",
      inLanguage: "ar",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: "شيف العرب",
      },
      breadcrumb: {
        "@id": `${PAGE_URL}#breadcrumb`,
      },
      mainEntity: {
        "@id": `${PAGE_URL}#faq`,
      },
    },

    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "الرئيسية",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "الأسئلة الشائعة",
          item: PAGE_URL,
        },
      ],
    },

    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      name: "الأسئلة الشائعة عن شيف العرب",
      url: PAGE_URL,
      inLanguage: "ar",
      mainEntity: [
        {
          "@type": "Question",
          name: "ما هو موقع شيف العرب؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "شيف العرب هو موقع يقدم وصفات عربية وعالمية بطريقة مبسطة وخطوات واضحة، مع التركيز على جودة المحتوى وتجربة المستخدم.",
          },
        },
        {
          "@type": "Question",
          name: "هل الوصفات مجرّبة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نسعى لتقديم وصفات دقيقة ومُحسّنة. قد تختلف النتائج حسب نوع المكونات والأدوات المتاحة. إذا واجهتك مشكلة في وصفة معيّنة يمكنك التواصل معنا.",
          },
        },
        {
          "@type": "Question",
          name: "كيف أبحث عن وصفة بسرعة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يمكنك استخدام مربع البحث في الموقع وكتابة اسم الوصفة أو جزء منه للوصول إلى النتائج المناسبة، ثم اختيار الوصفة التي تريدها.",
          },
        },
        {
          "@type": "Question",
          name: "هل يمكنني مشاركة الوصفات؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، يمكنك مشاركة رابط الوصفة مع أصدقائك. يُفضل مشاركة الرابط المباشر للصفحة بدل نسخ محتوى الوصفة كاملًا.",
          },
        },
        {
          "@type": "Question",
          name: "لماذا تظهر إعلانات في الموقع؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "تساعد الإعلانات في دعم تشغيل الموقع وتغطية تكاليفه والمساهمة في تطوير المحتوى والخدمات، مع الحرص على توفير تجربة تصفح مناسبة للزوار.",
          },
        },
        {
          "@type": "Question",
          name: "هل الإعلانات مخصّصة حسب اهتماماتي؟ وكيف أتحكم بها؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "قد يعرض مزودو الإعلانات مثل Google إعلانات مخصّصة وفقًا لإعدادات الإعلانات والاختيارات المتاحة للمستخدم. يمكن التحكم في بعض إعدادات الإعلانات من خلال إعدادات إعلانات Google.",
          },
        },
        {
          "@type": "Question",
          name: "ما هي ملفات تعريف الارتباط Cookies؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ملفات تعريف الارتباط هي ملفات صغيرة قد تُحفظ على جهازك للمساعدة في تحسين أداء الموقع وتجربة الاستخدام، وقد تُستخدم أيضًا في قياس الأداء أو تشغيل بعض الخدمات والإعلانات وفق الإعدادات والسياسات المعمول بها.",
          },
        },
        {
          "@type": "Question",
          name: "كيف يتم التعامل مع بياناتي وخصوصيتي؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يوضح موقع شيف العرب كيفية جمع البيانات واستخدامها والتعامل معها في سياسة الخصوصية الخاصة بالموقع. ويمكنك التواصل مع إدارة الموقع بخصوص أي طلب متعلق بالبيانات.",
          },
        },
        {
          "@type": "Question",
          name: "هل يوجد محتوى للأطفال وهل تجمعون بيانات أطفال؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "المحتوى في الموقع عام وموجه للجمهور. لا نستهدف جمع بيانات شخصية من الأطفال عمدًا، ويمكن التواصل مع إدارة الموقع إذا كان لديك اعتقاد بأن بيانات طفل تم إرسالها إلينا.",
          },
        },
        {
          "@type": "Question",
          name: "كيف أتواصل مع إدارة موقع شيف العرب؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يمكنك التواصل مع إدارة شيف العرب من خلال صفحة تواصل معنا أو عبر البريد الإلكتروني chefalarabonline@gmail.com.",
          },
        },
      ],
    },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <FAQClient />
    </>
  );
}