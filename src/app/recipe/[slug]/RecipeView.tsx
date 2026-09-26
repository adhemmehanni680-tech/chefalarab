import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  ChefHat,
  ChevronDown,
  Clock3,
  Gauge,
  ListTree,
  MapPin,
  Tag,
  Users,
 
  UtensilsCrossed,
} from "lucide-react";

import AdSenseBanner from "@/app/Components/AdSenseBanner";
import { adsEnabled } from "@/lib/ads";
import type { RecipeData } from "@/lib/recipesData";

type RelatedRecipe = {
  id?: number;
  title: string;
  slug: string;
  country?: string;
  category?: string[] | string;
  tags?: string[] | string;
  img?: string | {
    url?: string;
    "url-card"?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

type IngredientGroup = {
  title: string;
  items: string[];
};

type GuideItem = {
  id: string;
  label: string;
  icon: string;
  show: boolean;
};

type FaqItem = {
  question: string;
  answer: string;
};

const FALLBACK_IMAGE = "/Heeder.webp";
const IMAGE_QUALITY = 72;
const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'%3E%3Crect width='16' height='10' fill='%23121b29'/%3E%3Crect x='0' y='8' width='16' height='2' fill='%23f97316'/%3E%3C/svg%3E";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  const single = asString(value);
  return single ? [single] : [];
}

function normalizeImageUrl(value: unknown): string | null {
  const clean = asString(value).replace(/\\/g, "/");
  if (!clean) return null;
  if (/^https?:\/\//i.test(clean)) return clean;
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function recipeImage(recipe: RecipeData): { src: string; alt: string } {
  const img = recipe.img;
  if (typeof img === "string") {
    return {
      src: normalizeImageUrl(img) || FALLBACK_IMAGE,
      alt: recipe.title,
    };
  }

  return {
    src: normalizeImageUrl(img?.url) || normalizeImageUrl(img?.["url-card"]) || FALLBACK_IMAGE,
    alt: asString(img?.alt) || `صورة وصفة ${recipe.title}`,
  };
}

function relatedImage(recipe: RelatedRecipe): { src: string; alt: string } {
  const img = recipe.img;
  if (typeof img === "string") {
    return { src: normalizeImageUrl(img) || FALLBACK_IMAGE, alt: recipe.title };
  }

  return {
    src: normalizeImageUrl(img?.["url-card"]) || normalizeImageUrl(img?.url) || FALLBACK_IMAGE,
    alt: asString(img?.alt) || `صورة وصفة ${recipe.title}`,
  };
}

function ingredientItemText(value: unknown): string | null {
  if (typeof value === "string") {
    const text = value.trim();
    return text || null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const main =
    asString(record.text) ||
    asString(record.item) ||
    asString(record.ingredient) ||
    asString(record.name);

  if (!main) return null;

  const amount = asString(record.amount) || asString(record.quantity);
  const unit = asString(record.unit);
  const note = asString(record.note) || asString(record.notes);
  const quantity = [amount, unit].filter(Boolean).join(" ");

  return [quantity, main, note ? `(${note})` : ""].filter(Boolean).join(" ");
}

function ingredientItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => ingredientItems(item));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    const nested =
      record.items ??
      record.ingredients ??
      record.values ??
      record.list;

    if (nested !== undefined) {
      return ingredientItems(nested);
    }

    const direct = ingredientItemText(value);
    if (direct) return [direct];

    return Object.values(record).flatMap((item) => ingredientItems(item));
  }

  const single = ingredientItemText(value);
  return single ? [single] : [];
}

function normalizeIngredients(value: unknown): IngredientGroup[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    const groups: IngredientGroup[] = [];
    let currentTitle = "المكونات الأساسية";
    let currentItems: string[] = [];

    const flush = () => {
      if (!currentItems.length) return;
      groups.push({ title: currentTitle, items: currentItems });
      currentItems = [];
    };

    for (const entry of value) {
      if (typeof entry === "string") {
        const text = entry.trim();
        if (!text) continue;

        if (/[:：]\s*$/.test(text)) {
          flush();
          currentTitle = text.replace(/[:：]\s*$/, "").trim() || "المكونات الأساسية";
          continue;
        }

        currentItems.push(text);
        continue;
      }

      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const nestedTitle =
          asString(record.title) ||
          asString(record.name) ||
          asString(record.group) ||
          asString(record.label);
        const nestedItems = ingredientItems(
          record.items ?? record.ingredients ?? record.values ?? record.list,
        );

        if (nestedItems.length) {
          flush();
          groups.push({
            title: nestedTitle || "المكونات الأساسية",
            items: nestedItems,
          });
        }
      }
    }

    flush();
    return groups;
  }

  if (typeof value === "object") {
    const groups = Object.entries(value as Record<string, unknown>)
      .map(([title, groupValue]) => ({
        title: title.trim() || "المكونات الأساسية",
        items: ingredientItems(groupValue),
      }))
      .filter((group) => group.items.length > 0);

    const preferredOrder = [
      "المكونات الأساسية",
      "إضافات احترافية اختيارية",
      "خيارات بديلة",
    ];

    return groups.sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.title);
      const bIndex = preferredOrder.indexOf(b.title);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }

  const single = ingredientItemText(value);
  return single ? [{ title: "المكونات الأساسية", items: [single] }] : [];
}

function normalizeRecipeIngredients(recipe: RecipeData): IngredientGroup[] {
  const groups = normalizeIngredients(recipe.ingredients);
  const titles = new Set(groups.map((group) => group.title));

  const extraSources: Array<[string, unknown]> = [
    [
      "المكونات الأساسية",
      recipe["المكونات الأساسية"] ??
        recipe.basic_ingredients ??
        recipe.main_ingredients ??
        recipe.ingredients_basic,
    ],
    [
      "إضافات احترافية اختيارية",
      recipe["إضافات احترافية اختيارية"] ??
        recipe.optional_additions ??
        recipe.professional_additions ??
        recipe.ingredient_additions,
    ],
    [
      "خيارات بديلة",
      recipe["خيارات بديلة"] ??
        recipe.alternative_ingredients ??
        recipe.ingredient_alternatives ??
        recipe.substitutions,
    ],
  ];

  for (const [title, source] of extraSources) {
    if (titles.has(title)) continue;

    const items = ingredientItems(source);
    if (!items.length) continue;

    groups.push({ title, items });
    titles.add(title);
  }

  const preferredOrder = [
    "المكونات الأساسية",
    "إضافات احترافية اختيارية",
    "خيارات بديلة",
  ];

  return groups.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.title);
    const bIndex = preferredOrder.indexOf(b.title);

    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function normalizeFaq(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const record = item as Record<string, unknown>;
    const question = asString(record.question);
    const answer = asString(record.answer);

    return question && answer ? [{ question, answer }] : [];
  });
}

function cleanStep(step: string): string {
  return step.replace(/^\s*[٠-٩0-9]+\s*[.\-:)،]?\s*/, "").trim();
}

function formatMinutes(value: unknown): string | null {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 0) return null;
  if (minutes === 0) return "0 دقيقة";
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} س ${rest} د` : `${hours} ساعة`;
}

function displayValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function formatDate(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function machineDate(value: unknown): string | undefined {
  const text = asString(value);
  if (!text) return undefined;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function SectionHeading({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-500 text-xl text-white shadow-md shadow-orange-500/20">
        {icon}
      </span>
      <h2 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{children}</h2>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Guide({ items }: { items: GuideItem[] }) {
  const visible = items.filter((item) => item.show);
  if (!visible.length) return null;

  return (
    <>
      {/*
       * Desktop:
       * الدليل يظل داخل عمود الصفحة ويستخدم sticky، لذلك يتحرك مع الزائر
       * طوال محتوى الوصفة، لكنه يتوقف تلقائيًا عند نهاية الـ grid قبل الفوتر.
       * وجوده داخل المحتوى يمنعه أيضًا من الصعود فوق منطقة صورة الوصفة.
       */}
      <aside
        className="relative hidden xl:block"
        aria-label="دليل أقسام الوصفة"
      >
        <div
          id="recipe-desktop-guide"
          className="w-full max-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl border border-slate-700 bg-[#162235] shadow-2xl shadow-slate-950/20"
        >
          <div className="flex items-center justify-center gap-2 bg-orange-500 px-4 py-3.5 text-white">
            <ListTree className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="text-sm font-black">دليل أقسام الوصفة</span>
          </div>

          <nav className="max-h-[calc(100vh-10.5rem)] space-y-2 overflow-y-auto p-2.5 [scrollbar-color:#334155_#162235] [scrollbar-width:thin]">
            {visible.map((item, index) => (
              <a
                key={item.id}
                href={`#recipe-section-${item.id}`}
                data-recipe-guide-link={item.id}
                data-active={index === 0 ? "true" : "false"}
                className="group flex w-full items-center gap-2.5 rounded-2xl bg-[#1d2a3c] px-2.5 py-2.5 text-right text-xs font-black text-slate-200 transition-all duration-200 hover:bg-[#26364b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-orange-500/20"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#101827] text-lg transition-colors group-data-[active=true]:bg-white/20">
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1 truncate text-[14px]">
                  {item.label}
                </span>

                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2c3c51] text-[11px] text-slate-300 transition-colors group-data-[active=true]:bg-white group-data-[active=true]:font-black group-data-[active=true]:text-orange-500">
                  {index + 1}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/*
       * Mobile:
       * زر ثابت أسفل الشاشة مثل زر الصعود للأعلى. عند فتحه تظهر القائمة
       * لأعلى بدل أن تأخذ مساحة من الصفحة. لا يحتاج State أو مكتبة Animation.
       */}
      <details
        id="recipe-mobile-guide"
        className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[70] xl:hidden transition-[opacity,transform,visibility] duration-200 ease-out data-[footer-near=true]:pointer-events-none data-[footer-near=true]:invisible data-[footer-near=true]:translate-y-4 data-[footer-near=true]:opacity-0"
      >
        <summary
          aria-label="فتح دليل أقسام الوصفة"
          className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-2xl shadow-slate-950/30 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 dark:ring-offset-slate-950 [&::-webkit-details-marker]:hidden"
        >
          <ListTree className="h-5 w-5" aria-hidden="true" />
          <span>دليل الأقسام</span>
          <ChevronDown
            className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="invisible pointer-events-none absolute bottom-full left-0 mb-3 w-[min(88vw,330px)] origin-bottom-left translate-y-2 scale-[0.97] overflow-hidden rounded-3xl border border-slate-700 bg-[#162235] opacity-0 shadow-2xl shadow-slate-950/40 transition-[opacity,transform,visibility] duration-200 ease-out group-open:visible group-open:pointer-events-auto group-open:translate-y-0 group-open:scale-100 group-open:opacity-100">
          <div className="flex items-center justify-center gap-2 bg-orange-500 px-4 py-3.5 text-white">
            <ListTree className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="text-sm font-black">دليل أقسام الوصفة</span>
          </div>

          <nav
            className="max-h-[min(66vh,560px)] space-y-2 overflow-y-auto p-2.5 [overscroll-behavior:contain] [scrollbar-color:#334155_#162235] [scrollbar-width:thin]"
            aria-label="دليل أقسام الوصفة للموبايل"
          >
            {visible.map((item, index) => (
              <a
                key={item.id}
                href={`#recipe-section-${item.id}`}
                data-recipe-mobile-guide-link={item.id}
                data-active={index === 0 ? "true" : "false"}
                className="group/link flex w-full items-center gap-2.5 rounded-2xl bg-[#1d2a3c] px-2.5 py-2.5 text-right text-xs font-black text-slate-100 transition-colors hover:bg-[#26364b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#101827] text-lg group-data-[active=true]/link:bg-white/20">
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1 truncate text-[14px]">
                  {item.label}
                </span>

                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2c3c51] text-[11px] text-slate-200 group-data-[active=true]/link:bg-white group-data-[active=true]/link:text-orange-500">
                  {index + 1}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </details>

      {/*
       * ScrollSpy + fast navigation + mobile footer guard.
       * - يحدد القسم الحالي بدقة أثناء السكرول.
       * - الانتقال عند الضغط سريع وناعم بدل smooth البطيء الافتراضي.
       * - زر الموبايل يختفي تلقائيًا قبل دخول الفوتر إلى الشاشة.
       */}
      <Script id="recipe-guide-scrollspy" strategy="afterInteractive">
        {`
          (() => {
            if (window.__recipeGuideScrollSpyCleanup) {
              window.__recipeGuideScrollSpyCleanup();
            }

            const mobileGuide = document.getElementById('recipe-mobile-guide');
            const desktopLinks = Array.from(
              document.querySelectorAll('[data-recipe-guide-link]')
            );
            const mobileLinks = Array.from(
              document.querySelectorAll('[data-recipe-mobile-guide-link]')
            );
            const allLinks = [...desktopLinks, ...mobileLinks];

            if (!allLinks.length) return;

            const getLinkId = (link) =>
              link.getAttribute('data-recipe-guide-link') ||
              link.getAttribute('data-recipe-mobile-guide-link');

            const ids = [...new Set(allLinks.map(getLinkId).filter(Boolean))];
            const sections = ids
              .map((id) => ({
                id,
                element: document.getElementById('recipe-section-' + id),
              }))
              .filter((item) => item.element);

            if (!sections.length) return;

            let currentId = null;
            let scrollRaf = 0;
            let navigationRaf = 0;
            let navigationToken = 0;
            let programmaticTarget = null;
            let footerObserver = null;

            const setActive = (id) => {
              if (!id) return;

              currentId = id;

              allLinks.forEach((link) => {
                const active = getLinkId(link) === id;
                link.dataset.active = active ? 'true' : 'false';

                if (active) {
                  link.setAttribute('aria-current', 'location');

                  // حرّك قائمة الدليل نفسها فقط عند الحاجة، من غير تحريك الصفحة.
                  const nav = link.closest('nav');
                  if (nav && nav.scrollHeight > nav.clientHeight) {
                    const navRect = nav.getBoundingClientRect();
                    const linkRect = link.getBoundingClientRect();

                    if (linkRect.top < navRect.top + 6) {
                      nav.scrollTo({
                        top: Math.max(0, nav.scrollTop - (navRect.top - linkRect.top) - 10),
                        behavior: 'smooth',
                      });
                    } else if (linkRect.bottom > navRect.bottom - 6) {
                      nav.scrollTo({
                        top: nav.scrollTop + (linkRect.bottom - navRect.bottom) + 10,
                        behavior: 'smooth',
                      });
                    }
                  }
                } else {
                  link.removeAttribute('aria-current');
                }
              });
            };

            const closeMobileGuide = () => {
              if (mobileGuide && mobileGuide.tagName === 'DETAILS') {
                mobileGuide.removeAttribute('open');
              }
            };

            const updateActiveFromScroll = () => {
              scrollRaf = 0;

              // أثناء الانتقال بالضغط على الدليل، ثبّت اللون على القسم المختار
              // بدل المرور بصريًا على كل الأقسام أثناء الأنيميشن.
              if (programmaticTarget) return;

              const probe = Math.max(
                112,
                Math.min(156, Math.round(window.innerHeight * 0.18))
              );

              let activeId = sections[0].id;

              for (const section of sections) {
                const rect = section.element.getBoundingClientRect();

                if (rect.top <= probe) {
                  activeId = section.id;
                } else {
                  break;
                }
              }

              // في آخر الصفحة أبقِ آخر قسم هو النشط.
              const documentBottom =
                document.documentElement.scrollHeight -
                (window.scrollY + window.innerHeight);

              if (documentBottom <= 6) {
                activeId = sections[sections.length - 1].id;
              }

              if (activeId !== currentId) {
                setActive(activeId);
              }
            };

            const scheduleActiveUpdate = () => {
              if (scrollRaf) return;
              scrollRaf = window.requestAnimationFrame(updateActiveFromScroll);
            };

            const stopNavigation = () => {
              navigationToken += 1;
              programmaticTarget = null;

              if (navigationRaf) {
                window.cancelAnimationFrame(navigationRaf);
                navigationRaf = 0;
              }
            };

            const fastScrollTo = (targetTop, id) => {
              stopNavigation();

              navigationToken += 1;
              const token = navigationToken;
              programmaticTarget = id;

              const startY = window.scrollY;
              const destination = Math.max(0, targetTop);
              const distance = destination - startY;
              const reducedMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
              ).matches;

              if (reducedMotion || Math.abs(distance) < 8) {
                window.scrollTo(0, destination);
                programmaticTarget = null;
                setActive(id);
                scheduleActiveUpdate();
                return;
              }

              // انتقال سريع، مع مدة محدودة حتى للمسافات الطويلة.
              const duration = Math.min(
                230,
                Math.max(150, Math.abs(distance) * 0.085)
              );
              const startedAt = performance.now();
              const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

              const frame = (now) => {
                if (token !== navigationToken) return;

                const progress = Math.min(1, (now - startedAt) / duration);
                window.scrollTo(
                  0,
                  startY + distance * easeOutQuart(progress)
                );

                if (progress < 1) {
                  navigationRaf = window.requestAnimationFrame(frame);
                  return;
                }

                navigationRaf = 0;
                programmaticTarget = null;
                setActive(id);
                scheduleActiveUpdate();
              };

              navigationRaf = window.requestAnimationFrame(frame);
            };

            const navigate = (event) => {
              const link = event.currentTarget;
              const id = getLinkId(link);
              const target = id
                ? document.getElementById('recipe-section-' + id)
                : null;

              if (!target || !id) return;

              event.preventDefault();

              // اللون يتغير فورًا ويظل ثابتًا حتى نهاية الانتقال.
              setActive(id);
              closeMobileGuide();

              const desktop = window.matchMedia('(min-width: 1280px)').matches;
              const offset = desktop ? 104 : 84;
              const targetTop =
                window.scrollY + target.getBoundingClientRect().top - offset;

              fastScrollTo(targetTop, id);
              history.replaceState(null, '', '#recipe-section-' + id);
            };

            allLinks.forEach((link) => {
              link.addEventListener('click', navigate);
            });

            const handleOutsideClick = (event) => {
              if (
                mobileGuide &&
                mobileGuide.hasAttribute('open') &&
                !mobileGuide.contains(event.target)
              ) {
                closeMobileGuide();
              }
            };

            const handleEscape = (event) => {
              if (event.key === 'Escape') closeMobileGuide();
            };

            const handleManualNavigationInterrupt = () => {
              if (programmaticTarget) {
                stopNavigation();
                scheduleActiveUpdate();
              }
            };

            /*
             * نفس فكرة SearchFloating و ScrollToTopButton:
             * عند اقتراب/ظهور #site-footer يختفي زر الدليل تمامًا.
             */
            const footer =
              document.getElementById('site-footer') ||
              document.querySelector('footer');

            const setMobileGuideFooterHidden = (hidden) => {
              if (!mobileGuide) return;

              mobileGuide.dataset.footerNear = hidden ? 'true' : 'false';

              if (hidden) {
                closeMobileGuide();
                mobileGuide.hidden = true;
              } else {
                mobileGuide.hidden = false;
              }
            };

            const updateFooterFallback = () => {
              if (!mobileGuide || !footer) return;

              const rect = footer.getBoundingClientRect();
              const hide =
                rect.top <= window.innerHeight + 100 &&
                rect.bottom >= -20;

              setMobileGuideFooterHidden(hide);
            };

            if (mobileGuide && footer && 'IntersectionObserver' in window) {
              footerObserver = new IntersectionObserver(
                ([entry]) => {
                  setMobileGuideFooterHidden(Boolean(entry && entry.isIntersecting));
                },
                {
                  root: null,
                  threshold: 0,
                  // يختفي قبل دخول الفوتر بحوالي 100px.
                  rootMargin: '0px 0px 100px 0px',
                }
              );

              footerObserver.observe(footer);
            } else {
              updateFooterFallback();
            }

            const handleScroll = () => {
              scheduleActiveUpdate();

              // fallback إضافي حتى يظل السلوك صحيحًا في كل المتصفحات.
              updateFooterFallback();
            };

            document.addEventListener('click', handleOutsideClick, {
              passive: true,
            });
            document.addEventListener('keydown', handleEscape);
            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', handleScroll, { passive: true });
            window.addEventListener('wheel', handleManualNavigationInterrupt, {
              passive: true,
            });
            window.addEventListener('touchstart', handleManualNavigationInterrupt, {
              passive: true,
            });

            const hashId = location.hash.startsWith('#recipe-section-')
              ? location.hash.replace('#recipe-section-', '')
              : null;

            if (hashId && ids.includes(hashId)) {
              setActive(hashId);
            } else {
              updateActiveFromScroll();
            }

            updateFooterFallback();

            window.__recipeGuideScrollSpyCleanup = () => {
              stopNavigation();

              if (scrollRaf) {
                window.cancelAnimationFrame(scrollRaf);
              }

              allLinks.forEach((link) => {
                link.removeEventListener('click', navigate);
              });

              document.removeEventListener('click', handleOutsideClick);
              document.removeEventListener('keydown', handleEscape);
              window.removeEventListener('scroll', handleScroll);
              window.removeEventListener('resize', handleScroll);
              window.removeEventListener('wheel', handleManualNavigationInterrupt);
              window.removeEventListener('touchstart', handleManualNavigationInterrupt);

              if (footerObserver) {
                footerObserver.disconnect();
              }

              if (mobileGuide) {
                mobileGuide.hidden = false;
                delete mobileGuide.dataset.footerNear;
              }

              delete window.__recipeGuideScrollSpyCleanup;
            };
          })();
        `}
      </Script>

      {/*
       * Desktop follower:
       * نستخدم تحريكًا خفيفًا بـ requestAnimationFrame بدل الاعتماد على sticky فقط،
       * لأن overflow في أي ancestor داخل المشروع يمكن أن يمنع sticky من العمل.
       * الدليل يبدأ داخل عموده، يثبت مع السكرول، ثم يتوقف عند نهاية محتوى الوصفة
       * قبل الفوتر.
       */}
      <Script id="recipe-guide-desktop-follower" strategy="afterInteractive">
        {`
          (() => {
            if (window.__recipeGuideFollowerCleanup) {
              window.__recipeGuideFollowerCleanup();
            }

            const boundary = document.getElementById('recipe-guide-boundary');
            const guide = document.getElementById('recipe-desktop-guide');
            if (!boundary || !guide) return;

            const media = window.matchMedia('(min-width: 1280px)');
            const topOffset = 96;
            let rafId = 0;

            const resetGuide = () => {
              guide.style.position = '';
              guide.style.top = '';
              guide.style.left = '';
              guide.style.width = '';
              guide.style.zIndex = '';
            };

            const updateGuide = () => {
              rafId = 0;

              if (!media.matches) {
                resetGuide();
                return;
              }

              const boundaryRect = boundary.getBoundingClientRect();
              const boundaryTop = window.scrollY + boundaryRect.top;
              const boundaryHeight = boundary.offsetHeight;
              const boundaryBottom = boundaryTop + boundaryHeight;
              const guideHeight = guide.offsetHeight;
              const desiredTop = window.scrollY + topOffset;

              if (!boundaryHeight || !guideHeight) return;

              // قبل الوصول إلى الدليل: يظل في مكانه الطبيعي تحت صورة الوصفة.
              if (desiredTop <= boundaryTop) {
                guide.style.position = 'absolute';
                guide.style.top = '0px';
                guide.style.left = '0px';
                guide.style.width = '100%';
                guide.style.zIndex = '20';
                return;
              }

              // عند نهاية محتوى الوصفة: يتوقف داخل العمود ولا يدخل فوق الفوتر.
              if (desiredTop + guideHeight >= boundaryBottom) {
                guide.style.position = 'absolute';
                guide.style.top = Math.max(0, boundaryHeight - guideHeight) + 'px';
                guide.style.left = '0px';
                guide.style.width = '100%';
                guide.style.zIndex = '20';
                return;
              }

              // أثناء قراءة الوصفة: يتحرك مع الزائر.
              guide.style.position = 'fixed';
              guide.style.top = topOffset + 'px';
              guide.style.left = boundaryRect.left + 'px';
              guide.style.width = boundaryRect.width + 'px';
              guide.style.zIndex = '40';
            };

            const scheduleUpdate = () => {
              if (rafId) return;
              rafId = window.requestAnimationFrame(updateGuide);
            };

            window.addEventListener('scroll', scheduleUpdate, { passive: true });
            window.addEventListener('resize', scheduleUpdate, { passive: true });

            const resizeObserver = typeof ResizeObserver !== 'undefined'
              ? new ResizeObserver(scheduleUpdate)
              : null;

            resizeObserver?.observe(boundary);
            resizeObserver?.observe(guide);

            if (typeof media.addEventListener === 'function') {
              media.addEventListener('change', scheduleUpdate);
            } else if (typeof media.addListener === 'function') {
              media.addListener(scheduleUpdate);
            }

            scheduleUpdate();

            window.__recipeGuideFollowerCleanup = () => {
              if (rafId) window.cancelAnimationFrame(rafId);
              window.removeEventListener('scroll', scheduleUpdate);
              window.removeEventListener('resize', scheduleUpdate);
              resizeObserver?.disconnect();

              if (typeof media.removeEventListener === 'function') {
                media.removeEventListener('change', scheduleUpdate);
              } else if (typeof media.removeListener === 'function') {
                media.removeListener(scheduleUpdate);
              }

              resetGuide();
              delete window.__recipeGuideFollowerCleanup;
            };
          })();
        `}
      </Script>
    </>
  );
}

function RelatedCard({ recipe }: { recipe: RelatedRecipe }) {
  const image = relatedImage(recipe);
  const remote = /^https?:\/\//i.test(image.src);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Link
        href={`/recipe/${encodeURIComponent(String(recipe.slug))}`}
        prefetch={false}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 260px"
            quality={IMAGE_QUALITY}
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            decoding="async"
            unoptimized={remote}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-3">
          {recipe.country && <div className="mb-1 text-xs font-black text-orange-600 dark:text-orange-400">{recipe.country}</div>}
          <h3 className="line-clamp-2 text-sm font-black leading-6 text-slate-950 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
            {recipe.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

export default function RecipeView({
  recipe,
  relatedRecipes = [],
}: {
  recipe: RecipeData;
  relatedRecipes?: RelatedRecipe[];
}) {
  const image = recipeImage(recipe);
  const remoteImage = /^https?:\/\//i.test(image.src);
  const intro = asString(recipe.intro);
  const description = asString(recipe.description);
  const ingredients = normalizeRecipeIngredients(recipe);
  const steps = asStringList(recipe.steps).map(cleanStep).filter(Boolean);
  const recipeTips = asStringList(recipe.tips);
  const tips = recipeTips.length > 0 ? recipeTips : asStringList(recipe.cooking_tips);
  const mistakes = asStringList(recipe.common_mistakes);
  const faq = normalizeFaq(recipe.faq);
  const nutritionEntries =
    recipe.nutrition && typeof recipe.nutrition === "object"
      ? Object.entries(recipe.nutrition).filter(([, value]) => value !== null && value !== undefined && value !== "")
      : [];
  const categories = asStringList(recipe.category);
  const tags = asStringList(recipe.tags).slice(0, 8);
  const dataBox = recipe.data_box || {};
  const rawUpdatedDate = recipe.updated_at || recipe.created_at;
  const updatedDate = formatDate(rawUpdatedDate);
  const updatedDateTime = machineDate(rawUpdatedDate);

  type RawInfoItem = {
    label: string;
    value: string | null;
    icon: ReactNode;
  };

  type InfoItem = {
    label: string;
    value: string;
    icon: ReactNode;
  };

  const rawInfo: RawInfoItem[] = [
    {
      label: "التحضير",
      value: formatMinutes(dataBox.prep_time_minutes),
      icon: <Clock3 className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "الطهي",
      value: formatMinutes(dataBox.cook_time_minutes),
      icon: <ChefHat className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "الإجمالي",
      value: formatMinutes(dataBox.total_time_minutes),
      icon: <Clock3 className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "الحصص",
      value: displayValue(dataBox.servings),
      icon: <Users className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "الصعوبة",
      value: displayValue(dataBox.difficulty),
      icon: <Gauge className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "نوع الطبق",
      value: displayValue(dataBox.dish_type || dataBox.meal_type),
      icon: <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  const info = rawInfo.filter(
    (item): item is InfoItem => item.value !== null,
  );

  const guideItems: GuideItem[] = [
    { id: "description", label: "وصف الوصفة", icon: "🍽️", show: Boolean(description) },
    { id: "data", label: "بيانات الوصفة", icon: "⏱️", show: info.length > 0 },
    { id: "ingredients", label: "المكونات", icon: "🥣", show: ingredients.length > 0 },
    { id: "steps", label: "خطوات التحضير", icon: "🍳", show: steps.length > 0 },
    { id: "tips", label: "النصائح", icon: "💡", show: tips.length > 0 },
    { id: "mistakes", label: "الأخطاء الشائعة", icon: "⚠️", show: mistakes.length > 0 },
    { id: "nutrition", label: "القيمة الغذائية", icon: "🍏", show: nutritionEntries.length > 0 },
    { id: "faq", label: "أسئلة شائعة", icon: "❓", show: faq.length > 0 },
    { id: "related", label: "وصفات مشابهة", icon: "🍽️", show: relatedRecipes.length > 0 },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-orange-50 pb-14 text-slate-900 dark:bg-slate-950 dark:text-white">
      <article>
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-7">
            <nav aria-label="مسار التنقل" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-orange-600">الرئيسية</Link>
              <span>/</span>
              <Link href="/recipes" className="hover:text-orange-600">الوصفات</Link>
              {categories[0] && (
                <>
                  <span>/</span>
                  <Link
                    href={`/recipes?category=${encodeURIComponent(categories[0])}`}
                    prefetch={false}
                    className="hover:text-orange-600"
                  >
                    {categories[0].replace(/-/g, " ")}
                  </Link>
                </>
              )}
            </nav>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-center">
              <div>
               
                <div className="mb-3 flex flex-wrap gap-2">
                 
                  {recipe.country && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {recipe.country}
                    </span>
                  )}
                  {dataBox.meal_type && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {String(dataBox.meal_type)}
                    </span>
                    
                  )}
                </div>

                <h1 className="text-3xl font-black leading-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                  {recipe.title}
                </h1>

                {(description || intro) && (
                  <p className="mt-4 max-w-3xl text-sm font-bold leading-8 text-slate-600 dark:text-slate-300 sm:text-base">
                    {description || intro}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {updatedDate && (
                    <span>
                      آخر تحديث:{" "}
                      <time dateTime={updatedDateTime}>{updatedDate}</time>
                    </span>
                  )}
                  {tags.slice(0, 4).map((tag) => (
                    <Link
                      key={tag}
                      href={`/recipes?tag=${encodeURIComponent(tag)}`}
                      prefetch={false}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 hover:text-orange-600 dark:bg-slate-900 dark:hover:text-orange-400"
                    >
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {tag}
                    </Link>
                  ))}
               
                </div>
                 {/* <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                         <User className="h-6 w-6 rounded-full text-xs font-black text-orange-900  dark:text-orange-500" ></User>
                <p className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-900 dark:bg-orange-500/10 dark:text-orange-500"> 
                Adhem Mehanni</p>
             
                </div> */}
              </div>

              <div className="relative aspect-[3/2] overflow-hidden rounded-[30px] bg-slate-200 shadow-2xl dark:bg-slate-800">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 94vw, 520px"
                  quality={IMAGE_QUALITY}
                  preload
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  decoding="async"
                  unoptimized={remoteImage}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <div dir="ltr" className="mx-auto grid max-w-7xl gap-6 px-3 py-6 sm:px-4 sm:py-8 xl:grid-cols-[225px_minmax(0,1fr)]">
          <div id="recipe-guide-boundary" dir="rtl" className="relative h-full min-h-0">
            <Guide items={guideItems} />
          </div>

          <div dir="rtl" className="min-w-0">

              {description && (
                <section id="recipe-section-description" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="🍽️">وصف الوصفة</SectionHeading>
                  <p className="text-sm font-bold leading-8 text-slate-700 dark:text-slate-200 sm:text-base">
                    {description}
                  </p>
                </section>
              )}

              {info.length > 0 && (
                <section id="recipe-section-data" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="⏱️">بيانات الوصفة</SectionHeading>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {info.map((item) => (
                      <InfoCard key={item.label} icon={item.icon} label={item.label} value={item.value} />
                    ))}
                  </div>
                </section>
              )}

              {ingredients.length > 0 && (
                <section id="recipe-section-ingredients" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="🥣">المكونات</SectionHeading>

                  <div className="space-y-4">
                    {ingredients.map((group, groupIndex) => {
                      const title = group.title || "المكونات";
                      const isMainGroup =
                        title.includes("المكونات الأساسية") ||
                        (!title.includes("إضافات احترافية اختيارية") &&
                          !title.includes("خيارات بديلة") &&
                          groupIndex === 0);
                      const groupIcon = title.includes("خيارات بديلة")
                        ? "↔"
                        : title.includes("إضافات احترافية اختيارية")
                          ? "+"
                          : "🥣";

                      return (
                        <details
                          key={`${title}-${groupIndex}`}
                          name="recipe-ingredients-accordion"
                          open={isMainGroup}
                          className="group overflow-hidden rounded-2xl border border-slate-300 bg-slate-50/80 shadow-sm transition-shadow duration-200 open:shadow-md dark:border-slate-700 dark:bg-slate-950/70"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-transparent bg-orange-50 px-4 py-3 text-base font-black text-orange-700 transition-colors duration-200 hover:bg-orange-100 group-open:border-slate-300 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/15 dark:group-open:border-slate-700 [&::-webkit-details-marker]:hidden">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/10 text-sm text-orange-600 transition-transform duration-200 group-open:scale-105 dark:bg-orange-400/10 dark:text-orange-300">
                                {groupIcon}
                              </span>
                              <span className="truncate">{title}</span>
                              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {group.items.length}
                              </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400">
                              <span className="hidden sm:inline group-open:hidden">فتح</span>
                              <span className="hidden sm:group-open:inline">إغلاق</span>
                              <ChevronDown
                                className="h-5 w-5 transition-transform duration-200 group-open:rotate-180"
                                aria-hidden="true"
                              />
                            </span>
                          </summary>

                          <div className="border-t border-slate-200/70 p-3 dark:border-slate-800">
                            <ul className="grid gap-2 sm:grid-cols-2">
                              {group.items.map((item, index) => (
                                <li
                                  key={`${item}-${index}`}
                                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold leading-7 text-slate-800 transition-colors duration-150 hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/5"
                                >
                                  <span className="me-2 text-orange-500">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </section>
              )}

              {adsEnabled && ingredients.length > 0 && steps.length > 0 && (
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900" aria-label="إعلان">
                  <div className="mb-1 text-center text-[10px] font-bold text-slate-400">إعلان</div>
                  <AdSenseBanner adSlot="2901613977" minHeight={90} />
                </div>
              )}

              {steps.length > 0 && (
                <section id="recipe-section-steps" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="🍳">خطوات التحضير</SectionHeading>
                  <ol className="space-y-3">
                    {steps.map((step, index) => (
                      <li key={`${step}-${index}`} className="relative rounded-2xl border border-slate-300 bg-slate-50 py-3 pe-4 ps-14 text-sm font-bold leading-8 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:text-base">
                        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-black text-white">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {tips.length > 0 && (
                <section id="recipe-section-tips" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="💡">نصائح لنجاح الوصفة</SectionHeading>
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={`${tip}-${index}`} className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-bold leading-7 text-slate-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-slate-100">
                        <span className="me-2 text-emerald-600">✓</span>{tip}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {mistakes.length > 0 && (
                <section id="recipe-section-mistakes" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="⚠️">الأخطاء الشائعة</SectionHeading>
                  <ul className="space-y-2">
                    {mistakes.map((mistake, index) => (
                      <li key={`${mistake}-${index}`} className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm font-bold leading-7 text-slate-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-slate-100">
                        <span className="me-2">⚠️</span>{mistake}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {nutritionEntries.length > 0 && (
                <section id="recipe-section-nutrition" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="🍏">القيمة الغذائية</SectionHeading>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {nutritionEntries.map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-950">
                        <dt className="text-xs font-black text-orange-600 dark:text-orange-400">{key}</dt>
                        <dd className="mt-1 text-sm font-black text-slate-900 dark:text-white">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {faq.length > 0 && (
                <section id="recipe-section-faq" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="❓">أسئلة شائعة</SectionHeading>
                  <div className="space-y-2">
                    {faq.map((item, index) => (
                      <details key={`${item.question}-${index}`} className="group overflow-hidden rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black leading-7 text-slate-900 dark:text-white sm:text-base">
                          {item.question}
                        </summary>
                        <div className="border-t border-slate-300 px-4 py-3 text-sm font-bold leading-7 text-slate-700 dark:border-slate-700 dark:text-slate-200">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {relatedRecipes.length > 0 && (
                <section id="recipe-section-related" className="mt-5 scroll-mt-24 rounded-3xl border-2 border-slate-400/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                  <SectionHeading icon="🍽️">وصفات مشابهة قد تعجبك</SectionHeading>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {relatedRecipes.slice(0, 8).map((related) => (
                      <RelatedCard key={`${related.id || related.slug}`} recipe={related} />
                    ))}
                  </div>
                </section>
              )}
          </div>
        </div>
      </article>
    </main>
  );
}
