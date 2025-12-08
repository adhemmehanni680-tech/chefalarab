"use client";

import { useEffect } from "react";

interface Props {
  adSlot: string;
  style?: React.CSSProperties;
}

export default function AdSenseBanner({ adSlot, style }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Adsense Error:", e);
      }
    }
  }, []);

  return (
    <div className="flex justify-center my-4 w-full">
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minHeight: 200,
          ...style,
        }}
        data-ad-client="ca-pub-9717868267549745"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on" // افصل هذا عند نشر الإعلان الحقيقي
      ></ins>
    </div>
  );
}
