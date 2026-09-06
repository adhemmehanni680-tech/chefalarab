"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useState,
} from "react";

import CookieConsentBanner from "./Components/CookieConsentBanner";
import PWARegister from "./Components/PWARegister";

import {
  adsEnabled,
} from "@/lib/ads";

/* =========================================================
   Dynamic components
   ========================================================= */

const SearchFloating =
  dynamic(
    () =>
      import(
        "./Components/SearchFloating"
      ),
    {
      ssr: false,
    },
  );

const ScrollToTopButton =
  dynamic(
    () =>
      import(
        "./Components/ScrollToTopButton"
      ),
    {
      ssr: false,
    },
  );

const LocalAdBanner =
  dynamic(
    () =>
      import(
        "./Components/LocalAdBanner/LocalAdBanner"
      ),
    {
      ssr: false,
    },
  );

const InstallAppButton =
  dynamic(
    () =>
      import(
        "./Components/InstallAppButton"
      ),
    {
      ssr: false,
    },
  );

/* =========================================================
   Window types
   ========================================================= */

type WindowWithIdleCallback =
  Window & {
    requestIdleCallback?: (
      callback:
        IdleRequestCallback,
      options?:
        IdleRequestOptions,
    ) => number;

    cancelIdleCallback?: (
      handle: number,
    ) => void;
  };

/* =========================================================
   Root Client
   ========================================================= */

export default function RootClient() {
  const [
    loadSecondaryUi,
    setLoadSecondaryUi,
  ] =
    useState(false);

  useEffect(() => {
    const browserWindow =
      window as WindowWithIdleCallback;

    /*
     * العناصر غير المهمة لأول Paint
     * يتم تحميلها عند هدوء المتصفح.
     */

    if (
      browserWindow.requestIdleCallback
    ) {
      const idleId =
        browserWindow.requestIdleCallback(
          () => {
            setLoadSecondaryUi(
              true,
            );
          },
          {
            timeout:
              1400,
          },
        );

      return () => {
        browserWindow.cancelIdleCallback?.(
          idleId,
        );
      };
    }

    const timer =
      window.setTimeout(
        () => {
          setLoadSecondaryUi(
            true,
          );
        },
        700,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, []);

  return (
    <>
      {/* =====================================================
          Cookie Consent
          ===================================================== */}

      <CookieConsentBanner />

      {/* =====================================================
          PWA
          ===================================================== */}

      <PWARegister />

      {/* =====================================================
          Important floating UI

          تظهر مباشرة بدون انتظار requestIdleCallback.
          ===================================================== */}

      <SearchFloating />

      <ScrollToTopButton />

      {/* =====================================================
          Secondary UI
          ===================================================== */}

      {loadSecondaryUi && (
        <>
          <InstallAppButton />

          {adsEnabled && (
            <LocalAdBanner />
          )}
        </>
      )}
    </>
  );
}