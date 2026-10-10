"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";

import { adsEnabled, adsenseClient } from "@/lib/ads";
import { isAdFreePath } from "@/lib/routePolicy";

type AdSenseBannerProps = {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  style?: CSSProperties;
  className?: string;
  layoutKey?: string;
  minHeight?: number;
};

const VALID_CLIENT = /^ca-pub-\d+$/i;
const MIN_SAFE_AD_WIDTH = 200;

/**
 * Manual AdSense unit.
 *
 * - Never renders on legal/about/contact routes.
 * - Reserves vertical space before the ad arrives to limit CLS.
 * - Creates the actual <ins> only shortly before it reaches the viewport.
 * - Uses ResizeObserver instead of repeated layout polling/retry timers.
 */
export default function AdSenseBanner({
  adSlot,
  adFormat = "auto",
  style,
  className = "",
  layoutKey,
  minHeight = 90,
}: AdSenseBannerProps) {
  const pathname = usePathname();
  const blockedOnThisRoute = isAdFreePath(pathname);
  const client = adsenseClient.trim();
  const canRender =
    adsEnabled && VALID_CLIENT.test(client) && !blockedOnThisRoute;

  const containerRef = useRef<HTMLDivElement>(null);
  const adElementRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    pushedRef.current = false;
    setIsNearViewport(false);
  }, [adSlot, blockedOnThisRoute]);

  useEffect(() => {
    if (!canRender) return;

    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      {
        threshold: 0,
        rootMargin: "320px 0px",
      },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [canRender, adSlot]);

  useEffect(() => {
    if (
      !canRender ||
      !isNearViewport ||
      pushedRef.current ||
      !containerRef.current ||
      !adElementRef.current
    ) {
      return;
    }

    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    let frame = 0;
    let cancelled = false;

    const pushAd = (knownWidth?: number) => {
      if (cancelled || pushedRef.current) return;

      const availableWidth = Math.floor(
        knownWidth ?? container.clientWidth,
      );

      // Avoid "No slot size for availableWidth=0" while responsive
      // containers are still being laid out.
      if (availableWidth < MIN_SAFE_AD_WIDTH) return;

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
        resizeObserver?.disconnect();
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("AdSense slot initialization failed:", error);
        }
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width;
        pushAd(width);
      });
      resizeObserver.observe(container);
    }

    frame = window.requestAnimationFrame(() => pushAd());

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
    };
  }, [canRender, isNearViewport, adSlot, adFormat, layoutKey]);

  if (!canRender) return null;

  return (
    <div
      ref={containerRef}
      className={`flex w-full min-w-0 items-center justify-center overflow-hidden ${className}`}
      style={{
        minHeight,
        ...style,
      }}
      data-ad-container
    >
      {isNearViewport && (
        <ins
          key={adSlot}
          ref={adElementRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
          data-ad-client={client}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
          {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        />
      )}
    </div>
  );
}
