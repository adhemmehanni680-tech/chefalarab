const adsEnabledValue =
  process.env.NEXT_PUBLIC_ADS_ENABLED
    ?.trim()
    .toLowerCase();

/*
 * الإعلانات لا تعمل إلا عند كتابة true صراحة.
 * لو المتغير غير موجود، تظل الإعلانات متوقفة.
 */
export const adsEnabled =
  adsEnabledValue === "true";

export const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT
    ?.trim() ||
  "ca-pub-9717868267549745";