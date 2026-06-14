// Components/AdSenseBanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { adsEnabled } from "@/lib/ads";

type AdSenseBannerProps = {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const adLoaded = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!adsEnabled || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!adsEnabled || !isVisible || adLoaded.current || !containerRef.current) return;
    if (containerRef.current.querySelector("ins")) return;

    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.style.width = "100%";
    ins.style.maxWidth = "100%";
    ins.style.boxSizing = "border-box";
    ins.setAttribute("data-ad-client", "ca-pub-9717868267549745");
    ins.setAttribute("data-ad-slot", adSlot);
    ins.setAttribute("data-ad-format", adFormat);
    ins.setAttribute("data-full-width-responsive", "true");
    if (layoutKey) ins.setAttribute("data-ad-layout-key", layoutKey);

    containerRef.current.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adLoaded.current = true;
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [isVisible, adSlot, adFormat, layoutKey]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-center my-4 ${className}`}
      style={{ overflow: "hidden", minHeight: "60px", ...style }}
    />
  );
}