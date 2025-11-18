"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface InterstitialAdProps {
  interstitialUnitID?: string;
}

export default function InterstitialAd({ interstitialUnitID = "1234567890" }: InterstitialAdProps) {
  const pathname = usePathname(); // مراقبة تغيير المسار

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({
        overlays: { bottom: true },
        google_ad_client: "ca-pub-3940256099942544",
        google_ad_slot: interstitialUnitID,
      });
    } catch (e) {
      console.error("Interstitial Ads Error:", e);
    }
  }, [pathname, interstitialUnitID]); // كل مرة يتغير المسار
  return null;
}
