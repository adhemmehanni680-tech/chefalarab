"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface InterstitialAdProps {
  interstitialUnitID?: string; // رقم الـ Ad Slot
}

export default function InterstitialAd({
  interstitialUnitID = "1234567890",
}: InterstitialAdProps) {
  const pathname = usePathname(); // علشان نرصد تغيّر الصفحات

  useEffect(() => {
    // نتأكد إننا على المتصفح مش السيرفر
    if (typeof window === "undefined") return;

    try {
      const w = window as any;
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({
        google_ad_client: "ca-pub-9717868267549745", // رقم حساب AdSense بتاعك
        google_ad_slot: interstitialUnitID,          // وحدة الإعلان (لو عندك Slot مخصص)
        overlays: { bottom: true },                  // Anchor / Interstitial بالأسفل
      });
    } catch (e) {
      console.error("Interstitial Ads Error:", e);
    }
  }, [pathname, interstitialUnitID]); // كل ما المسار يتغير نحاول نفعّل الإعلان تاني

  return null;
}
