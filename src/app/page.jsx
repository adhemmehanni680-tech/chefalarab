import HomeClient from "./HomeClient";
import recipesData from "@/data/recipes-catalog.json";

const ITEMS_PER_SECTION = 4;

const HOME_CATEGORIES = [
  "المطبخ-العربي",
  "المطبخ-الآسيوي",
  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني",
  "المطبخ-الأفريقي",
  "السلطات",
  "مخللات",
  "حلويات",
  "مثلجات",
  "عصائر",
  "مشروبات ساخنة",
];

const CATEGORY_ALIASES = {
  "مشروبات ساخنة": ["مشروبات ساخنة", "مشروبات-ساخنة"],
};

const CATEGORY_META = {
  "المطبخ-العربي": { eyebrow: "نكهات أصيلة", description: "وصفات من المطبخ العربي بتفاصيل واضحة ومكونات معروفة تناسب المائدة اليومية والعزائم." },
  "المطبخ-الآسيوي": { eyebrow: "نكهات آسيوية", description: "وصفات آسيوية متنوعة تجمع بين التوابل والصوصات والقوام المميز بخطوات مناسبة للتحضير المنزلي." },
  "المطبخ-الأمريكي-و-الأوروبي-و-اللاتيني": { eyebrow: "مذاقات متنوعة", description: "وصفات مستوحاة من المطابخ الأمريكية والأوروبية واللاتينية مع طرق تحضير واضحة ومكونات متناسقة." },
  "المطبخ-الأفريقي": { eyebrow: "نكهات أفريقية", description: "وصفات مستوحاة من تنوع المطابخ الأفريقية وتجمع بين التوابل والمكونات ذات النكهة الغنية." },
  "السلطات": { eyebrow: "أطباق خفيفة", description: "سلطات متنوعة بمكونات طازجة وتتبيلات متوازنة تناسب الوجبات اليومية والمقبلات." },
  "مخللات": { eyebrow: "نكهة منزلية", description: "وصفات مخللات بمقادير وخطوات واضحة تساعد على الوصول إلى نكهة وقوام متوازنين." },
  "حلويات": { eyebrow: "حلوى لكل مناسبة", description: "وصفات حلويات متنوعة مع خطوات منظمة لتحضير القوام والنكهة والتقديم في المنزل." },
  "مثلجات": { eyebrow: "وصفات باردة", description: "مثلجات ووصفات باردة بقوام منعش ونكهات متنوعة مناسبة للأيام الدافئة." },
  "عصائر": { eyebrow: "انتعاش طبيعي", description: "عصائر ومشروبات فاكهة بخطوات بسيطة ومقادير واضحة لمذاق منعش ومتوازن." },
  "مشروبات ساخنة": { eyebrow: "دفء ونكهة", description: "مشروبات ساخنة متنوعة بتفاصيل واضحة لتحضيرها وتقديمها في الصباح أو المساء." },
};

function normalizeCategory(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function getCategoryValues(category) {
  return CATEGORY_ALIASES[category] || [category];
}

function getCategoryRecipes(category) {
  const values = getCategoryValues(category).map(normalizeCategory);
  const recipes = Array.isArray(recipesData) ? recipesData : [];
  return recipes
    .filter((recipe) => {
      const categories = Array.isArray(recipe?.category) ? recipe.category : [recipe?.category];
      return categories.some((item) => values.includes(normalizeCategory(item)));
    })
    .filter((recipe) => recipe?.status !== "draft" && recipe?.slug && recipe?.title)
    .slice(0, ITEMS_PER_SECTION);
}

function buildSections() {
  return HOME_CATEGORIES.map((cat) => ({
    cat,
    items: getCategoryRecipes(cat),
    meta: CATEGORY_META[cat] || { eyebrow: "وصفات شيف العرب", description: "اكتشف وصفات متنوعة بخطوات واضحة ومكونات مرتبة." },
  })).filter((section) => section.items.length > 0);
}

export function generateMetadata() {
  const title = "شيف العرب | وصفات طبخ عربية وعالمية خطوة بخطوة";
  const description =
    "اكتشف وصفات طبخ عربية وعالمية سهلة ومجربة في شيف العرب، مع مقادير دقيقة وخطوات واضحة للحلويات والسلطات والعصائر والمشروبات الساخنة والأطباق الرئيسية.";
  const image = "https://chefalarab.com/og-image.jpg";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://chefalarab.com/" },
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
      title,
      description,
      url: "https://chefalarab.com/",
      siteName: "شيف العرب",
      type: "website",
      locale: "ar_AR",
      images: [{ url: image, width: 1200, height: 630, alt: "شيف العرب – وصفات طبخ عربية وعالمية سهلة" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function Page() {
  const sectionsData = buildSections();
  return <HomeClient sectionsData={sectionsData} />;
}
