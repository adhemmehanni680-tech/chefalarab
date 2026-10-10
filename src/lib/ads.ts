const adsEnabledValue = process.env.NEXT_PUBLIC_ADS_ENABLED
  ?.trim()
  .toLowerCase();

const localAdsEnabledValue = process.env.NEXT_PUBLIC_LOCAL_ADS_ENABLED
  ?.trim()
  .toLowerCase();

/*
 * Google AdSense is enabled only when explicitly set to true.
 * Missing/invalid configuration therefore fails closed.
 */
export const adsEnabled = adsEnabledValue === "true";

/*
 * Local floating promotions are intentionally independent from AdSense.
 * They default to OFF because floating promotions add JavaScript, can cover
 * content on small screens, and are not needed during an AdSense review.
 */
export const localAdsEnabled = localAdsEnabledValue === "true";

export const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ||
  "ca-pub-9717868267549745";
