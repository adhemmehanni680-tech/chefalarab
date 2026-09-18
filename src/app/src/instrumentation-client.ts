// /src/instrumentation-client.ts

type DataLayerEntry =
  | unknown[]
  | Record<string, unknown>;

type ClientWindow =
  Window &
  typeof globalThis & {
    dataLayer?: DataLayerEntry[];

    gtag?: (
      ...args: unknown[]
    ) => void;
  };

const DEFAULT_CONSENT_WAIT_MS =
  500;

/* =========================================================
   Google Consent Mode v2
   ========================================================= */

function initializeConsentMode() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    const clientWindow =
      window as ClientWindow;

    clientWindow.dataLayer =
      clientWindow.dataLayer || [];

    /*
     * إنشاء gtag stub قبل تحميل
     * GTM / GA4 / Google tags.
     */
    if (
      typeof clientWindow.gtag !==
      "function"
    ) {
      clientWindow.gtag = (
        ...args: unknown[]
      ) => {
        clientWindow.dataLayer?.push(
          args,
        );
      };
    }

    /*
     * مهم جدًا:
     *
     * لا نقرأ cookie_consent_v1 هنا.
     *
     * البداية دائمًا denied.
     *
     * بعد ذلك:
     *
     * 1- Google CMP يحدث الموافقة
     *    للمستخدم الأوروبي.
     *
     * 2- CookieConsentBanner يحدث
     *    الموافقة لباقي المستخدمين.
     */
    clientWindow.gtag(
      "consent",
      "default",
      {
        ad_storage:
          "denied",

        analytics_storage:
          "denied",

        ad_user_data:
          "denied",

        ad_personalization:
          "denied",

        personalization_storage:
          "denied",

        /*
         * ضروري لتشغيل الموقع.
         */
        functionality_storage:
          "granted",

        /*
         * ضروري للأمان.
         */
        security_storage:
          "granted",

        /*
         * نعطي CMP وقتًا قصيرًا
         * لتحديث الإشارات.
         *
         * بعد ذلك تظل الحالة denied
         * إلى أن يصل consent update.
         */
        wait_for_update:
          DEFAULT_CONSENT_WAIT_MS,
      },
    );
  } catch (error) {
    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.error(
        "Consent Mode initialization failed:",
        error,
      );
    }
  }
}

/* =========================================================
   Run before React hydration
   ========================================================= */

initializeConsentMode();

export {};