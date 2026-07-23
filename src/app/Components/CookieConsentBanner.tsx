"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Check,
  Cookie,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  applyConsent,
  getStoredConsent,
  storeConsent,
  type ConsentChoice,
} from "@/lib/consent";

/* =========================================================
   الصفحات التي يجب أن يستطيع المستخدم قراءتها قبل الاختيار
   ========================================================= */

const LEGAL_ROUTES = [
  "/cookie_policy",
  "/privacy_policy",
  "/terms_conditions",
];

/* =========================================================
   Cookie Consent
   ========================================================= */

export default function CookieConsentBanner() {
  const pathname = usePathname();

  /*
   * تبدأ بـ true حتى تظهر شاشة الحماية مباشرة،
   * ولا توجد لحظة يستطيع فيها المستخدم الضغط على الموقع.
   */
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [manuallyOpened, setManuallyOpened] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  const isLegalPage = LEGAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  /*
   * نسمح بقراءة صفحات السياسات بدون موافقة.
   * عند الانتقال لأي صفحة أخرى تعود شاشة الاختيار.
   */
  const shouldShow =
    open && (!isLegalPage || manuallyOpened);

  /* =========================================================
     قراءة الاختيار المحفوظ
     ========================================================= */

  useEffect(() => {
    setMounted(true);

    const storedConsent = getStoredConsent();

    if (storedConsent) {
      applyConsent(storedConsent);
      setOpen(false);
    } else {
      /*
       * رفض مبدئي للكوكيز غير الضرورية إلى أن يختار المستخدم.
       * لا يتم حفظ هذا الرفض كاختيار للمستخدم.
       */
      applyConsent("rejected");
      setOpen(true);
    }

    const openHandler = () => {
      setManuallyOpened(true);
      setOpen(true);
    };

    window.addEventListener("open-consent-manager", openHandler);

    return () => {
      window.removeEventListener("open-consent-manager", openHandler);
    };
  }, []);

  /* =========================================================
     منع التمرير والتفاعل مع الموقع
     ========================================================= */

  useEffect(() => {
    if (!mounted || !shouldShow) return;

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;

    /*
     * منع تحرك الصفحة عند اختفاء شريط التمرير.
     */
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    /*
     * تعطيل جميع عناصر الصفحة الموجودة خلف نافذة الموافقة.
     */
    const overlay = document.getElementById("cookie-consent-overlay");

    const disabledElements: Array<{
      element: HTMLElement;
      hadInert: boolean;
      previousAriaHidden: string | null;
    }> = [];

    if (overlay) {
      Array.from(document.body.children).forEach((child) => {
        if (!(child instanceof HTMLElement)) return;
        if (child === overlay) return;
        if (child.contains(overlay)) return;

        disabledElements.push({
          element: child,
          hadInert: child.hasAttribute("inert"),
          previousAriaHidden: child.getAttribute("aria-hidden"),
        });

        child.setAttribute("inert", "");
        child.setAttribute("aria-hidden", "true");
      });
    }

    /*
     * وضع المؤشر داخل النافذة تلقائيًا.
     */
    const focusFrame = window.requestAnimationFrame(() => {
      acceptButtonRef.current?.focus();
    });

    /*
     * حبس التنقل بالكيبورد داخل نافذة الموافقة،
     * ومنع إغلاقها بزر Escape.
     */
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          [
            "button:not([disabled])",
            "a[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
        ),
      ).filter(
        (element) =>
          element.offsetWidth > 0 ||
          element.offsetHeight > 0 ||
          element === document.activeElement,
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown, true);

      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = "";
      body.style.paddingRight = previousBodyPaddingRight;

      disabledElements.forEach(
        ({
          element,
          hadInert,
          previousAriaHidden,
        }) => {
          if (!hadInert) {
            element.removeAttribute("inert");
          }

          if (previousAriaHidden === null) {
            element.removeAttribute("aria-hidden");
          } else {
            element.setAttribute(
              "aria-hidden",
              previousAriaHidden,
            );
          }
        },
      );
    };
  }, [mounted, shouldShow]);

  /* =========================================================
     حفظ الاختيار
     ========================================================= */

  const choose = (choice: ConsentChoice) => {
    try {
      storeConsent(choice);
      applyConsent(choice);
      logConsent(choice);

      setOpen(false);
      setManuallyOpened(false);
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    }
  };

  /*
   * منع الضغط على الخلفية أو أي حدث قد يغلق النافذة.
   */
  const preventDialogClose = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  if (!shouldShow) return null;

  const consentContent = (
    <div
      id="cookie-consent-overlay"
      dir="rtl"
      role="presentation"
      className="
        fixed inset-0 z-[2147483647]
        flex min-h-[100dvh] items-center justify-center
        overflow-y-auto px-3 py-5 sm:px-6 sm:py-8
      "
    >
      {/* خلفية مظلمة تمنع رؤية الصفحة بوضوح */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0
          bg-slate-950/90
          backdrop-blur-xl
        "
      />

      {/* تأثيرات جمالية */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-[-140px] top-[-140px]
          h-[360px] w-[360px] rounded-full
          bg-orange-500/20 blur-[110px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute bottom-[-160px] right-[-130px]
          h-[400px] w-[400px] rounded-full
          bg-amber-400/10 blur-[120px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute right-[20%] top-[20%]
          h-[280px] w-[280px] rounded-full
          bg-sky-500/10 blur-[120px]
        "
      />

      {/* الإطار الخارجي المتدرج */}
      <div
        className="
          relative z-10 w-full max-w-3xl
          rounded-[30px]
          bg-gradient-to-br
          from-orange-400/80
          via-white/15
          to-slate-700/40
          p-[1px]
          shadow-[0_30px_100px_rgba(0,0,0,0.65)]
        "
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          onKeyDown={preventDialogClose}
          className="
            relative overflow-hidden rounded-[29px]
            border border-white/5
            bg-[linear-gradient(145deg,rgba(15,23,42,0.99),rgba(2,6,23,0.99))]
          "
        >
          {/* الزخرفة العلوية */}
          <div
            aria-hidden="true"
            className="
              absolute inset-x-0 top-0 h-32
              bg-gradient-to-b from-orange-500/10 to-transparent
            "
          />

          <div className="relative p-5 sm:p-7 lg:p-9">
            {/* رأس النافذة */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="
                    absolute inset-0 scale-150 rounded-full
                    bg-orange-500/25 blur-2xl
                  "
                />

                <div
                  className="
                    relative flex h-16 w-16 items-center justify-center
                    rounded-2xl
                    border border-orange-300/30
                    bg-gradient-to-br from-orange-400 to-orange-600
                    text-slate-950
                    shadow-[0_14px_40px_rgba(249,115,22,0.32)]
                    sm:h-[72px] sm:w-[72px]
                  "
                >
                  <Cookie
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    strokeWidth={2.2}
                  />
                </div>

                <span
                  className="
                    absolute -bottom-1 -left-1
                    flex h-7 w-7 items-center justify-center
                    rounded-full border-4 border-slate-950
                    bg-emerald-500 text-white
                  "
                >
                  <LockKeyhole className="h-3.5 w-3.5" />
                </span>
              </div>

              <div
                className="
                  mt-5 inline-flex items-center gap-2
                  rounded-full border border-orange-400/20
                  bg-orange-400/10 px-3 py-1.5
                  text-xs font-bold text-orange-300
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
                خصوصيتك واختيارك أولًا
              </div>

              <h2
                id="cookie-consent-title"
                className="
                  mt-4 max-w-2xl
                  text-2xl font-black leading-tight text-white
                  sm:text-3xl
                "
              >
                اختر إعدادات الخصوصية للمتابعة
              </h2>

              <p
                id="cookie-consent-description"
                className="
                  mt-3 max-w-2xl
                  text-sm leading-7 text-slate-300
                  sm:text-base sm:leading-8
                "
              >
                لن تتمكن من تصفح أو استخدام الموقع قبل تحديد
                اختيارك. نستخدم ملفات ضرورية لتشغيل الموقع،
                وملفات اختيارية لتحليل الأداء وعرض الإعلانات.
              </p>
            </div>

            {/* شرح أنواع الملفات */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div
                className="
                  rounded-2xl border border-emerald-400/15
                  bg-emerald-400/[0.06] p-4
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex h-10 w-10 shrink-0 items-center justify-center
                      rounded-xl border border-emerald-400/20
                      bg-emerald-400/10 text-emerald-400
                    "
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      ملفات ضرورية
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      مطلوبة للأمان وحفظ اختيارك وتشغيل الوظائف
                      الأساسية للموقع.
                    </p>

                    <span
                      className="
                        mt-2 inline-flex items-center gap-1.5
                        text-xs font-semibold text-emerald-400
                      "
                    >
                      <Check className="h-3.5 w-3.5" />
                      مفعّلة دائمًا
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="
                  rounded-2xl border border-sky-400/15
                  bg-sky-400/[0.06] p-4
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex h-10 w-10 shrink-0 items-center justify-center
                      rounded-xl border border-sky-400/20
                      bg-sky-400/10 text-sky-400
                    "
                  >
                    <BarChart3 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      ملفات اختيارية
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      تُستخدم لقياس الأداء وتحسين المحتوى وعرض
                      الإعلانات طبقًا لاختيارك.
                    </p>

                    <span
                      className="
                        mt-2 inline-flex items-center gap-1.5
                        text-xs font-semibold text-sky-400
                      "
                    >
                      <LockKeyhole className="h-3.5 w-3.5" />
                      تحتاج إلى موافقتك
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* روابط السياسات */}
            <div
              className="
                mt-5 rounded-2xl border border-white/[0.07]
                bg-white/[0.035] px-4 py-3
              "
            >
              <p className="text-center text-xs leading-6 text-slate-400 sm:text-sm">
                يمكنك مراجعة التفاصيل قبل اختيارك من خلال{" "}
                <Link
                  href="/cookie_policy"
                  className="
                    font-semibold text-orange-300
                    underline decoration-orange-400/30
                    underline-offset-4
                    transition-colors hover:text-orange-200
                  "
                >
                  سياسة ملفات الارتباط
                </Link>
                {"، "}
                <Link
                  href="/privacy_policy"
                  className="
                    font-semibold text-orange-300
                    underline decoration-orange-400/30
                    underline-offset-4
                    transition-colors hover:text-orange-200
                  "
                >
                  سياسة الخصوصية
                </Link>
                {" و "}
                <Link
                  href="/terms_conditions"
                  className="
                    font-semibold text-orange-300
                    underline decoration-orange-400/30
                    underline-offset-4
                    transition-colors hover:text-orange-200
                  "
                >
                  الشروط والأحكام
                </Link>
                .
              </p>
            </div>

            {/* أزرار الاختيار */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                ref={acceptButtonRef}
                type="button"
                onClick={() => choose("accepted")}
                className="
                  group inline-flex min-h-14 w-full
                  items-center justify-center gap-2.5
                  rounded-2xl
                  border border-orange-300/30
                  bg-gradient-to-r from-orange-500 to-amber-500
                  px-5 py-3
                  text-sm font-black text-slate-950
                  shadow-[0_14px_35px_rgba(249,115,22,0.22)]
                  transition
                  hover:-translate-y-0.5
                  hover:from-orange-400 hover:to-amber-400
                  hover:shadow-[0_18px_42px_rgba(249,115,22,0.32)]
                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-orange-400/30
                  active:translate-y-0
                  sm:text-base
                "
              >
                <Check
                  className="
                    h-5 w-5 transition-transform
                    group-hover:scale-110
                  "
                />
                قبول جميع الملفات
              </button>

              <button
                type="button"
                onClick={() => choose("rejected")}
                className="
                  inline-flex min-h-14 w-full
                  items-center justify-center gap-2.5
                  rounded-2xl
                  border border-slate-600
                  bg-slate-800/90
                  px-5 py-3
                  text-sm font-bold text-white
                  shadow-lg
                  transition
                  hover:-translate-y-0.5
                  hover:border-slate-500
                  hover:bg-slate-700
                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-slate-500/30
                  active:translate-y-0
                  sm:text-base
                "
              >
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                المتابعة بالضروري فقط
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-500 sm:text-xs">
              سيتم حفظ اختيارك على هذا الجهاز، ويمكنك تغييره
              لاحقًا من إعدادات الخصوصية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /*
   * أثناء SSR يظهر العنصر في مكان الكومبوننت مباشرة،
   * وبعد تحميل الصفحة يتم نقله إلى body لضمان أعلى z-index.
   */
  if (!mounted) {
    return consentContent;
  }

  return createPortal(consentContent, document.body);
}

/* =========================================================
   تسجيل مبسط للاختيار على الجهاز
   ========================================================= */

function logConsent(choice: ConsentChoice) {
  try {
    const storageKey = "consent_logs";
    const currentLogs = JSON.parse(
      localStorage.getItem(storageKey) || "[]",
    );

    const logs = Array.isArray(currentLogs)
      ? currentLogs
      : [];

    logs.push({
      choice,
      date: new Date().toISOString(),
      policyVersion: "1.0",
    });

    /*
     * الاحتفاظ بآخر 50 اختيارًا فقط لمنع تضخم localStorage.
     */
    localStorage.setItem(
      storageKey,
      JSON.stringify(logs.slice(-50)),
    );
  } catch {
    // تجاهل أخطاء التخزين
  }
}