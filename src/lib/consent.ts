// lib/consent

export type ConsentChoice = "accepted" | "rejected";

const STORAGE_KEY = "cookie_consent_v1";

/**
 * جلب قرار المستخدم من localStorage
 */
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;

  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

/**
 * حفظ قرار المستخدم
 */
export function storeConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // ignore
  }
}

/**
 * إرجاع القرار أو rejected كـ default (Consent Mode v2)
 */
export function getConsentOrDefaultDenied(): ConsentChoice {
  const v = getStoredConsent();
  return v ?? "rejected";
}

/**
 * تحديث Google Consent Mode v2
 * يعمل مع:
 * - Google Tag Manager
 * - GA4
 * - AdSense
 */
export function applyConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;

  const granted = choice === "accepted";

  //   gtag (لو موجود)
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
  if (typeof gtag === "function") {
    gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });
  }

  //  دعم Google Tag Manager مباشرة
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event: "consent_update",
    consent_choice: choice,
    ad_storage: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
  });
}
