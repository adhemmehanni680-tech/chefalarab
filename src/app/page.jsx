//Page.jsx
import HomeClient from "./HomeClient";
import ChefImage from "../../public/Heeder.webp";
import recipesData from "@/data/recipes-index.json";


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

const categoryIcons = {
  "المطبخ-العربي": "🧆",
  يخنات: "🥗",
  العشاء: "🍲",
  "أطباق رئيسية": "🍲",
  "المطبخ الرمضانى": "🌙",
  "المطبخ الآسيوي": "🥢",
  أمريكي: "🍔",
  سندويشات: "🍔",
  أوروبي: "🍝",
  لاتيني: "🌮",
  "المطبخ الأفريقي": "🌍",
  سلطات: "🥗",
  مخللات: "🥒",
  حلويات: "🍰",
  مثلجات: "🍦",
  "آيس كريم": "🍦",
  عصائر: "🍹",
  "مشروبات ساخنة": "☕",
  عربي: "🧆",
  شرقي: "🥘",
  بحري: "🍤",
  لحوم: "🥩",
  الغداء: "🥩",
  "أكلات عيدالأضحى": "🥩",
  دجاج: "🍗",
  خضروات: "🥦",
  "أكلات نباتية": "🥦",
  فطور: "🥞",
  الإفطار: "🥞",
  معجنات: "🥐",
  صوصات: "🍝",
  شوربة: "🍜",
  "وجبات سريعة": "🚀",
};

const descriptionTemplates = [
  "تشكيلة رائعة من وصفات [name] بخطوات سهلة ونكهات أصيلة. جرّبها الآن وأضف لمسة جديدة لسفرتك.",
  "أفضل وصفات [name] اخترناها لك بعناية. من الأطباق الكلاسيكية إلى العصرية، كلها بمقادير مظبوطة.",
  "استمتع بتحضير أشهى أطباق [name] في منزلك. وصفات مجربة وسهلة التنفيذ تناسب جميع المستويات.",
  "اكتشف أسرار [name] مع مجموعتنا المتنوعة من الأطباق. نكهات غنية وتقديم مميز.",
  "كل ما تحتاج معرفته عن [name] في مكان واحد. وصفات اقتصادية وسريعة ومضمونة النتائج.",
];

function pickByCategory(all, cat, limit) {
  return all
    .filter((r) => r.category?.includes(cat))
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
}

function getCategoryMeta(cat) {
  const name = cat.replace(/-/g, " ");
  let icon = "🍽️";
  const catLower = cat.toLowerCase();

  for (const [keyword, ico] of Object.entries(categoryIcons)) {
    if (catLower.includes(keyword.toLowerCase())) {
      icon = ico;
      break;
    }
  }

  const hash = cat.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const description = descriptionTemplates[hash % descriptionTemplates.length].replace("[name]", name);

  return { icon, description };
}

function buildHomeSections() {
  const recipes = recipesData;
  const allCategories = new Set(recipes.flatMap((r) => r.category || []));
  const preferredCategories = HOME_CATEGORIES.filter((cat) => allCategories.has(cat));
  const categories = preferredCategories.length
    ? preferredCategories
    : [...allCategories].sort((a, b) => a.localeCompare(b, "ar"));

  return categories.map((cat) => ({
    cat,
    items: pickByCategory(recipes, cat, ITEMS_PER_SECTION),
    meta: getCategoryMeta(cat),
  }));
}

export async function generateMetadata() {
  const title = "شيف العرب | وصفات طبخ عربية وعالمية خطوة بخطوة";
  const description =
    "اكتشف أفضل وصفات الطبخ العربية والعالمية في شيف العرب: وصفات سهلة، مجربة، مجمعة لكل المناسبات، سلطات، حلويات، ومشروبات، مع تصفح سريع وتصنيفات واضحة وأفكار مبتكرة للطبخ.";
  
  return {
    title,
    description,
    alternates: { canonical: "https://chefalarab.com/" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "https://chefalarab.com/",
      siteName: "شيف العرب",
      type: "website",
      locale: "ar_AR",
      images: [
        { url: ChefImage.src, width: 1200, height: 630, alt: "شيف العرب – وصفات طبخ عربية وعالمية سهلة" }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ChefImage.src]
    }
  };
}

export default function Page() {
  const sectionsData = buildHomeSections();
  return <HomeClient sectionsData={sectionsData} />;
}