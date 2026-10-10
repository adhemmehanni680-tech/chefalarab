// /src/lib/consent.ts

export type ConsentChoice =
  | "accepted"
  | "rejected";

export type GoogleConsentState =
  | "granted"
  | "denied";

const STORAGE_KEY =
  "cookie_consent_v1";

export const CONSENT_CHANGE_EVENT =
  "chefalarab-consent-change";

/* =========================================================
   Google types
   ========================================================= */

type DataLayerEntry =
  | unknown[]
  | Record<string, unknown>;

type GoogleWindow =
  Window &
  typeof globalThis & {
    dataLayer?: DataLayerEntry[];

    gtag?: (
      ...args: unknown[]
    ) => void;
  };

/* =========================================================
   Helpers
   ========================================================= */

function getGoogleWindow():
  GoogleWindow | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const googleWindow =
    window as GoogleWindow;

  googleWindow.dataLayer =
    googleWindow.dataLayer || [];

  if (
    typeof googleWindow.gtag !==
    "function"
  ) {
    googleWindow.gtag = (
      ...args: unknown[]
    ) => {
      googleWindow.dataLayer?.push(
        args,
      );
    };
  }

  return googleWindow;
}

/* =========================================================
   قراءة اختيار المستخدم
   ========================================================= */

export function getStoredConsent():
  | ConsentChoice
  | null {
  if (
    typeof window === "undefined"
  ) {
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

/* =========================================================
   حفظ الاختيار
   ========================================================= */

export function storeConsent(
  choice: ConsentChoice,
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      choice,
    );
  } catch {
    /*
     * قد يكون localStorage
     * محظورًا في بعض المتصفحات.
     */
  }
}

/* =========================================================
   القيمة الافتراضية
   ========================================================= */

export function getConsentOrDefaultDenied():
  ConsentChoice {
  return (
    getStoredConsent() ??
    "rejected"
  );
}

/* =========================================================
   تطبيق Google Consent Mode v2
   ========================================================= */

export function applyConsent(
  choice: ConsentChoice,
): void {
  const googleWindow =
    getGoogleWindow();

  if (!googleWindow) {
    return;
  }

  const state:
    GoogleConsentState =
    choice === "accepted"
      ? "granted"
      : "denied";

  /*
   * تحديث Consent Mode.
   *
   * ملاحظة:
   * هذه الدالة تُستخدم مع
   * بانر شيف العرب فقط.
   *
   * المستخدم الأوروبي الذي يديره
   * Google CMP لا يجب أن يصل
   * إلى هذه الدالة أثناء التهيئة.
   */
  googleWindow.gtag?.(
    "consent",
    "update",
    {
      /*
       * Consent Mode v2
       */
      ad_storage:
        state,

      analytics_storage:
        state,

      ad_user_data:
        state,

      ad_personalization:
        state,

      /*
       * تخزين اختياري إضافي.
       */
      personalization_storage:
        state,

      /*
       * وظائف الموقع الأساسية.
       */
      functionality_storage:
        "granted",

      /*
       * الحماية والأمان.
       */
      security_storage:
        "granted",
    },
  );

  /* =======================================================
     حدث GTM إضافي
     ======================================================= */

  googleWindow.dataLayer?.push({
    event:
      "consent_update",

    consent_choice:
      choice,

    ad_storage:
      state,

    analytics_storage:
      state,

    ad_user_data:
      state,

    ad_personalization:
      state,
  });

  /* =======================================================
     حدث داخلي للموقع
     ======================================================= */

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