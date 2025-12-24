// AdSenseBanner
"use client";

import React, { useEffect, useRef, useState } from "react";
import { adsEnabled } from "@/lib/ads";

type AdSenseBannerProps = {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
  layoutKey?: string;
};

export default function AdSenseBanner({
  adSlot,
  adFormat = "auto",
  style,
  className = "",
  layoutKey,
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // ✅ guard داخل الـ effect (مش return قبل hooks)
    if (!adsEnabled) return;
    if (!adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!adsEnabled) return;
    if (!visible || loadedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      loadedRef.current = true;
    } catch (e) {
      console.error("Adsense Error:", e);
    }
  }, [visible]);

  const responsiveStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    ...style,
  };

  return (
    <div ref={adRef} className={`flex justify-center my-4 w-full ${className}`}>
      {/* ✅ بدل return قبل hooks */}
      {adsEnabled && visible && (
        <ins
          className="adsbygoogle"
          style={responsiveStyle}
          data-ad-client="ca-pub-9717868267549745"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
          {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        />
      )}
    </div>
  );
}
