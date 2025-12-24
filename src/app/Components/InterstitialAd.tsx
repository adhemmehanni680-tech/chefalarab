// src/app/Components/InterstitialAd
"use client";

import { useEffect } from "react";
import { adsEnabled } from "@/lib/ads";

type InterstitialAdProps = {
  interstitialUnitID?: string;
};

export default function InterstitialAd({ interstitialUnitID }: InterstitialAdProps) {
  useEffect(() => {
    //     
    if (!adsEnabled) return;

    
    // const script = document.createElement("script");
    // script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    // script.async = true;
    // script.setAttribute("data-ad-client", "ca-pub-XXXXXXX");
    // document.body.appendChild(script);

    return () => {
      // تنظيف أي سكريبت لو حبيت
    };
  }, [interstitialUnitID]);

  // ✅ حالياً الإعلانات مقفولة
  if (!adsEnabled) return null;

  // ⚠️ هنا مش هيظهر أي شيء لأننا مغلقين الإعلانات
  return null;
}
