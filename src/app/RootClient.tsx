//RootClient
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import CookieConsentBanner from "./Components/CookieConsentBanner";
import SearchFloating from "./Components/SearchFloating";
import InstallAppButton from "./Components/InstallAppButton";
import PWARegister from "./Components/PWARegister";
import ScrollToTopButton from "./Components/ScrollToTopButton";

import { localAdsEnabled } from "@/lib/ads";
import { isAdFreePath } from "@/lib/routePolicy";

const LocalAdBanner = dynamic(
  () => import("./Components/LocalAdBanner/LocalAdBanner"),
  { ssr: false },
);

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function useDeferredReady(
  delay: number,
  idleTimeout = 1000,
): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const browserWindow = window as WindowWithIdleCallback;
    let idleId: number | null = null;

    const timer = window.setTimeout(() => {
      if (browserWindow.requestIdleCallback) {
        idleId = browserWindow.requestIdleCallback(
          () => setReady(true),
          { timeout: idleTimeout },
        );
        return;
      }

      setReady(true);
    }, delay);

    return () => {
      window.clearTimeout(timer);

      if (idleId !== null) {
        browserWindow.cancelIdleCallback?.(idleId);
      }
    };
  }, [delay, idleTimeout]);

  return ready;
}

export default function RootClient() {
  const pathname = usePathname();
  const loadNonCriticalUi = useDeferredReady(8000, 1500);
  const adFreeRoute = isAdFreePath(pathname);

  return (
    <>
      <CookieConsentBanner />
      <PWARegister />
      <InstallAppButton />
      <SearchFloating />

      
      <ScrollToTopButton />

      {loadNonCriticalUi && localAdsEnabled && !adFreeRoute && (
        <LocalAdBanner initialDelay={12000} />
      )}
    </>
  );
}
