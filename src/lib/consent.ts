export type ConsentChoice =
  | "accepted"
  | "rejected";

export type GoogleConsentState =
  | "granted"
  | "denied";

const STORAGE_KEY = "cookie_consent_v1";

export const CONSENT_CHANGE_EVENT =
  "chefalarab-consent-change";

/*
 * نوع محلي خاص بهذا الملف فقط.
 * لا يعيد تعريف Window عالميًا،
 * وبالتالي لا يتعارض مع adsense.d.ts.
 */
type GoogleWindow = Window & {
  dataLayer?: unknown[];

  gtag?: (
    ...args: any[]
  ) => void;
};

/**
 * قراءة اختيار المستخدم المحفوظ.
 */
export function getStoredConsent():
  | ConsentChoice
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (
      value === "accepted" ||
      value === "rejected"
    ) {
      return value;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * حفظ اختيار المستخدم.
 */
export function storeConsent(
  choice: ConsentChoice,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      choice,
    );
  } catch {
    // تجاهل أخطاء التخزين.
  }
}

/**
 * إرجاع القرار المحفوظ،
 * أو rejected كقيمة افتراضية آمنة.
 */
export function getConsentOrDefaultDenied():
  ConsentChoice {
  return (
    getStoredConsent() ?? "rejected"
  );
}

/**
 * تحديث Google Consent Mode v2.
 */
export function applyConsent(
  choice: ConsentChoice,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const googleWindow =
    window as GoogleWindow;

  const state: GoogleConsentState =
    choice === "accepted"
      ? "granted"
      : "denied";

  googleWindow.dataLayer =
    googleWindow.dataLayer || [];

  /*
   * gtag يتم إنشاؤها في layout.tsx.
   * هذا الجزء احتياطي في حالة عدم وجودها.
   */
  if (
    typeof googleWindow.gtag !==
    "function"
  ) {
    googleWindow.gtag = (
      ...args: any[]
    ) => {
      googleWindow.dataLayer?.push(
        args,
      );
    };
  }

  googleWindow.gtag(
    "consent",
    "update",
    {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      personalization_storage: state,

      /*
       * التخزين الضروري لتشغيل الموقع
       * والأمان لا يعتمد على الإعلانات.
       */
      functionality_storage:
        "granted",

      security_storage:
        "granted",
    },
  );

  /*
   * حدث إضافي يمكن رؤيته داخل GTM Preview.
   */
  googleWindow.dataLayer.push({
    event: "consent_update",
    consent_choice: choice,
    ad_storage: state,
    analytics_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });

  window.dispatchEvent(
    new CustomEvent(
      CONSENT_CHANGE_EVENT,
      {
        detail: {
          choice,
          state,
        },
      },
    ),
  );
}