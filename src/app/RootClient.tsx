"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CookieConsentBanner from "./Components/CookieConsentBanner";
import PWARegister from "./Components/PWARegister";
import { adsEnabled } from "@/lib/ads";

const SearchFloating = dynamic(() => import("./Components/SearchFloating"), {
  ssr: false,
});

const ScrollToTopButton = dynamic(
  () => import("./Components/ScrollToTopButton"),
  { ssr: false },
);

const LocalAdBanner = dynamic(
  () => import("./Components/LocalAdBanner/LocalAdBanner"),
  { ssr: false },
);

const InstallAppButton = dynamic(
  () => import("./Components/InstallAppButton"),
  { ssr: false },
);

export default function RootClient() {
  const [loadSecondaryUi, setLoadSecondaryUi] = useState(false);

  useEffect(() => {
    const windowWithIdle = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (windowWithIdle.requestIdleCallback) {
      const idleId = windowWithIdle.requestIdleCallback(
        () => setLoadSecondaryUi(true),
        { timeout: 1600 },
      );

      return () => windowWithIdle.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(() => setLoadSecondaryUi(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <CookieConsentBanner />
      <PWARegister />

      {loadSecondaryUi && (
        <>
          <InstallAppButton />
          <SearchFloating />
          {adsEnabled && <LocalAdBanner />}
          <ScrollToTopButton />
        </>
      )}
    </>
  );
}
