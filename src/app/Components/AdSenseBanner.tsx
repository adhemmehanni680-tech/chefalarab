"use client";

import { useEffect, useRef, useState } from "react";

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSenseBanner({
  adSlot,
  adFormat = "auto",
  style,
  className = "",
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!adRef.current || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(adRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || loadedRef.current) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      loadedRef.current = true;
    } catch (e) {
      console.error("Adsense Error:", e);
    }
  }, [visible]);

  const responsiveStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    minHeight: typeof window !== "undefined" && window.innerWidth < 768 ? 90 : 200,
    ...style,
  };

  return (
    <div ref={adRef} className={`flex justify-center my-4 w-full ${className}`}>
      {visible && (
        <ins
          className="adsbygoogle"
          style={responsiveStyle}
          data-ad-client="ca-pub-9717868267549745"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        ></ins>
      )}
    </div>
  );
}
