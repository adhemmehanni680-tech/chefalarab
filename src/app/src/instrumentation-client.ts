type DataLayerEntry =
  | unknown[]
  | Record<string, unknown>;

type ClientWindow = Window &
  typeof globalThis & {
    dataLayer?: DataLayerEntry[];
    gtag?: (...args: unknown[]) => void;
  };

const clientWindow =
  window as ClientWindow;

/* =========================================================
   Google Consent Mode v2
   ========================================================= */

function initializeConsentMode() {
  try {
    clientWindow.dataLayer =
      clientWindow.dataLayer || [];

    if (!clientWindow.gtag) {
      clientWindow.gtag = (
        ...args: unknown[]
      ) => {
        clientWindow.dataLayer?.push(args);
      };
    }

    let storedConsent: string | null =
      null;

    try {
      storedConsent =
        window.localStorage.getItem(
          "cookie_consent_v1"
        );
    } catch {
      storedConsent = null;
    }

    const consentGranted =
      storedConsent === "accepted";

    const optionalStorageState:
      | "granted"
      | "denied" =
      consentGranted
        ? "granted"
        : "denied";

    clientWindow.gtag(
      "consent",
      "default",
      {
        ad_storage:
          optionalStorageState,

        analytics_storage:
          optionalStorageState,

        ad_user_data:
          optionalStorageState,

        ad_personalization:
          optionalStorageState,

        personalization_storage:
          optionalStorageState,

        functionality_storage:
          "granted",

        security_storage:
          "granted",

        wait_for_update: 500,
      }
    );
  } catch (error) {
    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      console.error(
        "Consent Mode initialization failed:",
        error
      );
    }
  }
}

/* =========================================================
   Theme Initialization
   ========================================================= */

function initializeTheme() {
  try {
    const savedTheme =
      window.localStorage.getItem(
        "theme"
      );

    const prefersDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    const isDark =
      savedTheme === "dark" ||
      (savedTheme !== "light" &&
        prefersDark);

    document.documentElement.classList.toggle(
      "dark",
      isDark
    );

    document.documentElement.style.colorScheme =
      isDark
        ? "dark"
        : "light";
  } catch {
    const prefersDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    document.documentElement.classList.toggle(
      "dark",
      prefersDark
    );

    document.documentElement.style.colorScheme =
      prefersDark
        ? "dark"
        : "light";
  }
}

/* =========================================================
   Run before React hydration
   ========================================================= */

initializeConsentMode();
initializeTheme();

export {};