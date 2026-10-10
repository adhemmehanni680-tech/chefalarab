// lib/recipeSearch.ts
import "server-only";
import { getAllRecipes } from "@/lib/recipesData";

export interface Recipe {
  id: number;
  title: string;
  slug: string;
  status: string;
  country: string;
  language: string;
  img: { url: string; alt: string; width: number; height: number };
  category: string[];
  tags: string[];
  intro: string;
  description: string;
  data_box: {
    prep_time_minutes: number;
    cook_time_minutes: number;
    total_time_minutes: number;
    servings: number;
    meal_type: string;
    difficulty: string;
    dish_type: string;
  };
  ingredients: Record<string, string[]>;
  steps: string[];
  tips: string[];
  common_mistakes: string[];
  nutrition: Record<string, string>;
  faq: Array<{ question: string; answer: string }>;
  cooking_tips: string[];
}

export interface ChatResponse {
  answer: string;
  recipeTitle: string;
  recipeSlug: string;  // رابط (slug) الوصفة
}

// دالة لاستخراج اسم الوصفة من السؤال (تطابق ذكي)
function extractRecipeTitle(query: string, recipes: Recipe[]): Recipe {
  const queryLower = query.toLowerCase();
  // 1. تطابق تام في العنوان
  for (const recipe of recipes) {
    if (queryLower.includes(recipe.title.toLowerCase())) {
      return recipe;
    }
  }
  // 2. تطابق جزئي في كلمات العنوان (أكثر من 3 أحرف)
  for (const recipe of recipes) {
    const titleWords = recipe.title.toLowerCase().split(" ");
    for (const word of titleWords) {
      if (word.length > 3 && queryLower.includes(word)) {
        return recipe;
      }
    }
  }
  // 3. البحث في التصنيفات والوسوم
  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      if (queryLower.includes(tag.toLowerCase())) {
        return recipe;
      }
    }
  }
  // 4. افتراض أول وصفة إذا لم يتم العثور على شيء
  return recipes[0];
}

// دالة لتحديد نية السؤال (تعتمد على أولوية الكلمات)
function getIntentFromQuery(query: string): string {
  const q = query.toLowerCase();
  
  const intents = [
    { name: "ingredients", keywords: ["مكونات", "مقادير", "المقادير", "المكونات", "ما هي المواد", "ما هي العناصر", "قائمة المكونات", "محتوي", "محتويات"] },
    { name: "steps", keywords: ["خطوات", "طريقة", "كيفية", "كيف اعد", "كيف أسوي", "طريقة التحضير", "الطريقة", "خطوة بخطوة", "شرح", "كيف أطبخ", "طريقة الطبخ", "طريقة عمل", "نسويها", "نعملها"] },
    { name: "tips", keywords: ["نصائح", "نصيحة", "ارشادات", "نصائح مهمة", "نصيحة مهمة", "خبرة", "لتحضير أفضل", "حكم"] },
    { name: "common_mistakes", keywords: ["أخطاء", "غلطات", "أخطاء شائعة", "الأخطاء", "تجنب", "احذر", "لا تفعل", "غلطة", "خطأ"] },
    { name: "faq", keywords: ["سؤال", "اسئلة", "هل يمكن", "ماذا لو", "كم مدة", "هل يصلح", "أسئلة شائعة", "استفسار"] },
    { name: "nutrition", keywords: ["سعرات", "قيم غذائية", "تغذية", "فيتامين", "بروتين", "سعرات حرارية", "قيمة غذائية", "كم سعرة"] },
    { name: "time", keywords: ["وقت", "مدة", "كم ساعة", "كم دقيقة", "مدة التحضير", "مدة الطهي", "كم يستغرق", "وقت الطهي"] },
    { name: "difficulty", keywords: ["صعوبة", "سهل", "صعب", "مستوى", "درجة الصعوبة", "مناسب للمبتدئين"] },
    { name: "overview", keywords: ["نبذة", "وصف", "عن الوصفة", "مقدمة", "تعريف", "ما هي", "ماهي", "تاريخ", "قصة"] },
  ];
  
  for (const intent of intents) {
    for (const keyword of intent.keywords) {
      if (q.includes(keyword)) {
        return intent.name;
      }
    }
  }
  
  // إذا كان السؤال يحتوي على علامة استفهام
  if (q.includes("?") || q.includes("؟") || q.includes("ما") || q.includes("كيف")) {
    return "general";
  }
  
  return "overview";
}

// البحث عن إجابة من الأسئلة الشائعة
function findAnswerInFAQ(query: string, recipe: Recipe): string | null {
  const q = query.toLowerCase();
  for (const faq of recipe.faq) {
    if (q.includes(faq.question.toLowerCase()) || 
        faq.question.toLowerCase().includes(q) ||
        q.includes(faq.answer.toLowerCase().slice(0, 30))) {
      return `**📋 سؤال شائع:** ${faq.question}\n\n**📌 الإجابة:** ${faq.answer}`;
    }
  }
  return null;
}

// تنسيق الإجابة حسب النية
function formatDirectAnswer(recipe: Recipe, intent: string, query: string): string {
  // التحقق من الأسئلة الشائعة أولاً
  const faqAnswer = findAnswerInFAQ(query, recipe);
  if (faqAnswer) return faqAnswer;
  
  switch (intent) {
    case "ingredients":
      let ingredientsText = `**🥘 مكونات ${recipe.title}:**\n\n`;
      for (const [category, items] of Object.entries(recipe.ingredients)) {
        ingredientsText += `**${category}:**\n`;
        items.forEach(item => { ingredientsText += `• ${item}\n`; });
        ingredientsText += `\n`;
      }
      if (recipe.ingredients["خيارات بديلة"]) {
        ingredientsText += `**🔄 خيارات بديلة:**\n`;
        recipe.ingredients["خيارات بديلة"].forEach(item => { ingredientsText += `• ${item}\n`; });
      }
      return ingredientsText;
      
    case "steps":
      let stepsText = `**👨‍🍳 خطوات تحضير ${recipe.title}:**\n\n`;
      recipe.steps.forEach((step, index) => {
        stepsText += `${index + 1}. ${step}\n`;
      });
      return stepsText;
      
    case "tips":
      let tipsText = `**💡 نصائح مهمة لـ ${recipe.title}:**\n\n`;
      recipe.tips.forEach((tip, index) => {
        tipsText += `${index + 1}. ${tip}\n`;
      });
      if (recipe.cooking_tips?.length) {
        tipsText += `\n**🔧 نصائح إضافية:**\n`;
        recipe.cooking_tips.slice(0, 3).forEach((tip, index) => {
          tipsText += `${index + 1}. ${tip}\n`;
        });
      }
      return tipsText;
      
    case "common_mistakes":
      let mistakesText = `**⚠️ الأخطاء الشائعة في ${recipe.title} (تجنبها):**\n\n`;
      recipe.common_mistakes.forEach((mistake, index) => {
        mistakesText += `${index + 1}. ${mistake}\n`;
      });
      return mistakesText;
      
    case "nutrition":
      let nutritionText = `**🥗 القيم الغذائية لـ ${recipe.title} (لكل حصة):**\n\n`;
      for (const [key, value] of Object.entries(recipe.nutrition)) {
        nutritionText += `• **${key}:** ${value}\n`;
      }
      return nutritionText;
      
    case "time":
      const box = recipe.data_box;
      return `**⏱️ وقت تحضير ${recipe.title}:**\n\n• وقت التحضير: ${box.prep_time_minutes} دقيقة\n• وقت الطهي: ${box.cook_time_minutes} دقيقة\n• إجمالي الوقت: ${box.total_time_minutes} دقيقة\n• عدد الحصص: ${box.servings} أشخاص\n• نوع الوجبة: ${box.meal_type}`;
      
    case "difficulty":
      return `**📊 مستوى صعوبة ${recipe.title}:** ${recipe.data_box.difficulty}\n\n${
        recipe.data_box.difficulty === "متوسط" ? "الوصفة متوسطة الصعوبة، تحتاج لخبرة بسيطة." :
        recipe.data_box.difficulty === "سهل" ? "الوصفة سهلة جداً ومناسبة للمبتدئين." :
        "الوصفة تحتاج لخبرة جيدة في الطهي."
      }`;
      
    case "overview":
      let overviewText = `**📖 عن ${recipe.title}:**\n\n${recipe.intro} \n\n${recipe.description} `  ;
      if (recipe.faq && recipe.faq.length) {
        overviewText += `\n\n**📋 أسئلة شائعة:**\n`;
        recipe.faq.forEach((f, i) => {
          overviewText += `\n${i + 1}. ❓ ${f.question}\n   ➤ ${f.answer}\n`;
        });
      }
      return overviewText;

    default:
      return `مرحباً! 😊\n\n**${recipe.title}** هي وصفة ${recipe.country} رائعة.\n\n${recipe.description.slice(0, 250)}...\n\nيمكنك أن تسألني تحديداً:\n• "مكونات ${recipe.title}"\n• "طريقة تحضير ${recipe.title}"\n• "نصائح لـ ${recipe.title}"\n• "الأخطاء الشائعة"\n• "القيم الغذائية"\n• "وقت التحضير"\n• "مستوى الصعوبة"\n\nأجب على أي سؤال بكل دقة.`;
  }
}

export function getRecipeResponse(query: string): ChatResponse {
  const recipes = getAllRecipes() as Recipe[];
  if (!recipes || recipes.length === 0) {
    return {
      answer: "عذراً، لا توجد وصفات متاحة حالياً.",
      recipeTitle: "",
      recipeSlug: "",
    };
  }
  
  const bestRecipe = extractRecipeTitle(query, recipes);
  const intent = getIntentFromQuery(query);
  const answer = formatDirectAnswer(bestRecipe, intent, query);
  
  // إضافة رابط الوصفة في نهاية الإجابة (اختياري، لكننا سنتركه أيضاً للمكون الأمامي)
  // المكون الأمامي سيعرض الرابط بشكل منفصل باستخدام recipeSlug، لذا لسنا بحاجة لتكراره هنا.
  
  return {
    answer,
    recipeTitle: bestRecipe.title,
    recipeSlug: bestRecipe.slug,
  };
}