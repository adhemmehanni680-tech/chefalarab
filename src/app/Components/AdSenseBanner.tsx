"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { adsEnabled } from "@/lib/ads";

type AdSenseBannerProps = {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  style?: CSSProperties;
  className?: string;
  layoutKey?: string;
  minHeight?: number;
};

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9717868267549745";
const MIN_SAFE_AD_WIDTH = 250;

export default function AdSenseBanner({
  adSlot,
  adFormat = "auto",
  style,
  className = "",
  layoutKey,
  minHeight = 90,
}: AdSenseBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adElementRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const [isNearViewport, setIsNearViewport] = useState(false);

  const adAttributes = useMemo(
    () =>
      layoutKey
        ? ({ "data-ad-layout-key": layoutKey } as Record<string, string>)
        : {},
    [layoutKey],
  );

  useEffect(() => {
    if (!adsEnabled || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0,
        rootMargin: "320px 0px",
      },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      !adsEnabled ||
      !isNearViewport ||
      pushedRef.current ||
      !containerRef.current ||
      !adElementRef.current
    ) {
      return;
    }

    const container = containerRef.current;
    let retryTimer: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;
    let attempts = 0;

    const clearRetry = () => {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const pushAd = () => {
      if (cancelled || pushedRef.current) return;

      const availableWidth = Math.floor(container.getBoundingClientRect().width);

      // AdSense throws "No slot size" when the component is mounted while a
      // sidebar/accordion is collapsed. Wait until a real usable width exists.
      if (availableWidth < MIN_SAFE_AD_WIDTH) {
        attempts += 1;
        clearRetry();

        if (attempts < 40) {
          retryTimer = window.setTimeout(pushAd, 250);
        }
        return;
      }

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
        clearRetry();
        resizeObserver?.disconnect();
      } catch (error) {
        attempts += 1;

        if (process.env.NODE_ENV !== "production") {
          console.warn("AdSense slot initialization was delayed:", error);
        }

        clearRetry();
        if (attempts < 40) {
          retryTimer = window.setTimeout(pushAd, 300);
        }
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (!pushedRef.current) pushAd();
      });
      resizeObserver.observe(container);
    }

    // Give layout, fonts, and sidebar transitions one frame to settle.
    const frame = window.requestAnimationFrame(pushAd);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      clearRetry();
      resizeObserver?.disconnect();
    };
  }, [isNearViewport, adSlot, adFormat, layoutKey]);

  if (!adsEnabled) return null;

  return (
    <div
      ref={containerRef}
      className={`flex w-full min-w-0 items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight, ...style }}
      data-ad-container
    >
      {isNearViewport && (
        <ins
          ref={adElementRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
          {...adAttributes}
        />
      )}
    </div>
  );
}
