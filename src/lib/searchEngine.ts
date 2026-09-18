import "server-only";

import recipesData from "@/data/recipes-catalog.json";

type RawRecipe = {
  id?: number | string;
  title?: string;
  slug?: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;
};

export type SearchResult = {
  id: number | string;
  title: string;
  slug: string;
  country: string;
  category: string;
};

type IndexedRecipe = {
  id: number | string;
  title: string;
  slug: string;
  country: string;
  category: string;
  titleNorm: string;
  titleTokens: string[];
  titleTokenSet: Set<string>;
  keywordsNorm: string;
  keywordTokens: string[];
  keywordTokenSet: Set<string>;
};

const STOP_WORDS = new Set([
  "طريقه",
  "عمل",
  "وصفه",
  "تحضير",
  "كيفيه",
  "كيف",
  "ازاي",
  "اريد",
  "عايز",
  "عاوزه",
  "ابغي",
  "ممكن",
]);

const SYNONYM_GROUPS = [
  ["دجاج", "فراخ", "فراخي"],
  ["لحم", "لحمه"],
  ["ارز", "رز"],
  ["بطاطس", "بطاطا"],
  ["طماطم", "بندوره"],
  ["جبنه", "جبن"],
  ["مكرونه", "باستا"],
  ["شوربه", "حساء"],
  ["فطور", "فطار", "افطار"],
  ["حلويات", "حلوي", "حلو", "حلي", "تحليه"],
  ["سمك", "اسماك"],
  ["جمبري", "روبيان", "قريدس"],
  ["باذنجان", "بتنجان"],
  ["فلفل", "فليفله"],
  ["زبادي", "لبن رائب", "لبن رايب"],
  ["خبز", "عيش", "رغيف"],
  ["صلصه", "صوص", "صوصات"],
  ["مشوي", "مشويه"],
  ["مقلي", "مقليه"],
  ["مخبوز", "مخبوزه"],
  ["حار", "حاره", "سبايسي"],
  ["سريع", "سريعه"],
  ["سهل", "سهله"],
] as const;

const SYNONYM_MAP = new Map<string, string[]>();

export function normalizeArabic(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ـ/g, "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const group of SYNONYM_GROUPS) {
  const normalizedGroup = [...new Set(group.map(normalizeArabic).filter(Boolean))];
  for (const word of normalizedGroup) {
    SYNONYM_MAP.set(word, normalizedGroup);
  }
}

function toArray(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return value ? [String(value)] : [];
}

function tokenize(value: unknown): string[] {
  const normalized = normalizeArabic(value);
  return normalized ? normalized.split(" ").filter(Boolean) : [];
}

function meaningfulTokens(value: unknown): string[] {
  const tokens = tokenize(value);
  const useful = tokens.filter((token) => !STOP_WORDS.has(token));
  return useful.length > 0 ? useful : tokens;
}

function wordVariants(word: string): string[] {
  const normalized = normalizeArabic(word);
  if (!normalized) return [];

  const variants = new Set<string>([normalized]);

  if (normalized.startsWith("ال") && normalized.length > 4) {
    variants.add(normalized.slice(2));
  }

  if (normalized.startsWith("و") && normalized.length > 4) {
    variants.add(normalized.slice(1));
  }

  const queue = [...variants];
  for (const item of queue) {
    for (const synonym of SYNONYM_MAP.get(item) ?? []) {
      variants.add(synonym);
    }
  }

  return [...variants];
}

function levenshteinDistance(first: string, second: string): number {
  if (first === second) return 0;
  if (!first) return second.length;
  if (!second) return first.length;

  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let diagonal = previous[0];
    previous[0] = firstIndex;

    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const oldValue = previous[secondIndex];
      const insertion = previous[secondIndex - 1] + 1;
      const deletion = oldValue + 1;
      const replacement =
        diagonal + (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1);

      previous[secondIndex] = Math.min(insertion, deletion, replacement);
      diagonal = oldValue;
    }
  }

  return previous[second.length];
}

function isCloseWord(queryWord: string, recipeWord: string): boolean {
  if (queryWord.length < 4 || recipeWord.length < 4) return false;
  if (Math.abs(queryWord.length - recipeWord.length) > 2) return false;

  const maxDistance = Math.max(queryWord.length, recipeWord.length) >= 7 ? 2 : 1;
  return levenshteinDistance(queryWord, recipeWord) <= maxDistance;
}

const SEARCH_INDEX: IndexedRecipe[] = (recipesData as RawRecipe[])
  .filter((recipe) => recipe.title && recipe.slug)
  .map((recipe) => {
    const title = String(recipe.title);
    const slug = String(recipe.slug);
    const country = String(recipe.country ?? "");
    const categories = toArray(recipe.category);
    const tags = toArray(recipe.tags);
    const category = categories[0]?.replace(/-/g, " ") ?? "";
    const titleNorm = normalizeArabic(title);
    const titleTokens = [...new Set(tokenize(titleNorm))];
    const keywordsNorm = normalizeArabic([title, country, ...categories, ...tags].join(" "));
    const keywordTokens = [...new Set(tokenize(keywordsNorm))];

    return {
      id: recipe.id ?? slug,
      title,
      slug,
      country,
      category,
      titleNorm,
      titleTokens,
      titleTokenSet: new Set(titleTokens),
      keywordsNorm,
      keywordTokens,
      keywordTokenSet: new Set(keywordTokens),
    };
  });

function scoreToken(
  token: string,
  recipe: IndexedRecipe,
  allowFuzzy: boolean,
): number {
  let best = 0;

  for (const variant of wordVariants(token)) {
    if (recipe.titleTokenSet.has(variant)) best = Math.max(best, 48);
    if (recipe.titleNorm.startsWith(variant)) best = Math.max(best, 42);
    if (recipe.titleNorm.includes(variant)) best = Math.max(best, 36);

    if (
      recipe.titleTokens.some(
        (titleToken) => titleToken.startsWith(variant) || variant.startsWith(titleToken),
      )
    ) {
      best = Math.max(best, 30);
    }

    if (recipe.keywordTokenSet.has(variant)) best = Math.max(best, 22);
    if (recipe.keywordsNorm.includes(variant)) best = Math.max(best, 15);
  }

  if (best > 0 || !allowFuzzy) return best;

  for (const variant of wordVariants(token)) {
    if (recipe.titleTokens.some((titleToken) => isCloseWord(variant, titleToken))) {
      return 17;
    }
  }

  return 0;
}

function scoreRecipe(
  recipe: IndexedRecipe,
  rawQuery: string,
  allowFuzzy: boolean,
): number | null {
  const normalizedQuery = normalizeArabic(rawQuery);
  const queryTokens = meaningfulTokens(rawQuery);

  if (!normalizedQuery || queryTokens.length === 0) return null;

  const meaningfulPhrase = queryTokens.join(" ");
  let score = 0;
  let matchedTokens = 0;

  for (const phrase of new Set([normalizedQuery, meaningfulPhrase])) {
    if (!phrase) continue;
    if (recipe.titleNorm === phrase) score += 180;
    else if (recipe.titleNorm.startsWith(phrase)) score += 120;
    else if (recipe.titleNorm.includes(phrase)) score += 85;
    else if (recipe.keywordsNorm.includes(phrase)) score += 34;
  }

  for (const token of queryTokens) {
    const tokenScore = scoreToken(token, recipe, allowFuzzy);
    if (tokenScore > 0) {
      matchedTokens += 1;
      score += tokenScore;
    }
  }

  if (matchedTokens === 0) return null;

  const coverage = matchedTokens / queryTokens.length;
  score += Math.round(coverage * 45);
  if (coverage === 1) score += 45;

  return score;
}

const RESULT_CACHE = new Map<string, SearchResult[]>();
const MAX_RESULT_CACHE_ENTRIES = 100;

function rankRecipes(query: string, limit: number, allowFuzzy: boolean): SearchResult[] {
  return SEARCH_INDEX.map((recipe) => ({
    recipe,
    score: scoreRecipe(recipe, query, allowFuzzy),
  }))
    .filter(
      (item): item is { recipe: IndexedRecipe; score: number } => item.score !== null,
    )
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return first.recipe.title.length - second.recipe.title.length;
    })
    .slice(0, limit)
    .map(({ recipe }) => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      country: recipe.country,
      category: recipe.category,
    }));
}

export function searchRecipes(query: string, limit = 10): SearchResult[] {
  const safeQuery = String(query ?? "").trim().slice(0, 80);
  const normalizedQuery = normalizeArabic(safeQuery);
  if (normalizedQuery.length < 2) return [];

  const safeLimit = Math.min(Math.max(limit, 1), 12);
  const cacheKey = `${normalizedQuery}:${safeLimit}`;
  const cached = RESULT_CACHE.get(cacheKey);
  if (cached) return cached;

  let results = rankRecipes(safeQuery, safeLimit, false);

  // لا نشغّل مقارنة الأخطاء الإملائية المكلفة إلا عندما تكون النتائج المباشرة قليلة.
  if (results.length < Math.min(safeLimit, 5)) {
    results = rankRecipes(safeQuery, safeLimit, true);
  }

  if (RESULT_CACHE.size >= MAX_RESULT_CACHE_ENTRIES) {
    const oldestKey = RESULT_CACHE.keys().next().value;
    if (oldestKey) RESULT_CACHE.delete(oldestKey);
  }

  RESULT_CACHE.set(cacheKey, results);
  return results;
}
