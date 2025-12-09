"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface InterstitialAdProps {
  interstitialUnitID?: string; // رقم الـ Ad Slot
}

export default function InterstitialAd({
  interstitialUnitID = "1234567890",
}: InterstitialAdProps) {
  const pathname = usePathname();
  const pushedRef = useRef(false); // علشان نتأكد إننا push مرة واحدة فقط لكل صفحة

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pushAd = () => {
      try {
        const w = window as Window & { adsbygoogle?: any[] };
        w.adsbygoogle = w.adsbygoogle || [];

        if (!pushedRef.current) {
          w.adsbygoogle.push({
            google_ad_client: "ca-pub-9717868267549745",
            google_ad_slot: interstitialUnitID,
            overlays: { bottom: true },
          });
          pushedRef.current = true;
          console.log("Interstitial ad pushed for path:", pathname);
        }
      } catch (err) {
        console.error("Interstitial Ads Error:", err);
      }
    };

    // Push بعد التأكد من تحميل الصفحة بالكامل
    if (document.readyState === "complete") {
      pushAd();
    } else {
      window.addEventListener("load", pushAd);
      return () => window.removeEventListener("load", pushAd);
    }
  }, [pathname, interstitialUnitID]);

  return null;
}
