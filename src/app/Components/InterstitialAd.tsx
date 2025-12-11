"use client";

import { useEffect } from "react";

interface InterstitialAdProps {
  interstitialUnitID?: string; // مش هنستخدمه دلوقتي
}

export default function InterstitialAd(_props: InterstitialAdProps) {
  // نسيب جوجل AdSense Auto Ads تدير الإعلانات البينية (Vignette / Anchor)
  // الكومبوننت ده موجود بس عشان لو حابب تنظّم الكود أو توقفه بسهولة بعدين.
  useEffect(() => {
    // مش هنستدعي adsbygoogle.push() هنا
  }, []);

  return null;
}
