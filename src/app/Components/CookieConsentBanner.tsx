"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";

import {
  applyConsent,
  getStoredConsent,
  storeConsent,
  type ConsentChoice,
} from "@/lib/consent";
import { isAdFreePath } from "@/lib/routePolicy";

type ConsentProvider = "checking" | "google" | "custom";

type TcfTcData = {
  gdprApplies?: boolean;
  listenerId?: number;
};

type TcfApi = (
  command: string,
  version: number,
  callback: (data: unknown, success?: boolean) => void,
  parameter?: unknown,
) => void;

type GoogleFcCallbackEntry =
  | (() => void)
  | {
      CONSENT_API_READY?: () => void;
      CONSENT_DATA_READY?: () => void;
      CONSENT_MODE_DATA_READY?: () => void;
    };

type GoogleFc = {
  callbackQueue?: GoogleFcCallbackEntry[];
  showRevocationMessage?: () => void;
};

declare global {
  interface Window {
    __tcfapi?: TcfApi;
    googlefc?: GoogleFc;
  }
}

/*
 * Keep this short.
 *
 * A long wait can make the consent UI appear late and become a Lighthouse
 * LCP candidate. This component never blocks the page content or navigation.
 */
const GOOGLE_CMP_DECISION_TIMEOUT = 2500;

/* =========================================================
   Google CMP helpers
   ========================================================= */

function isGoogleCmpPreview(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);

    const forceShow = params.get("fc") === "alwaysshow";
    const type = params.get("fctype");

    return forceShow && (type === null || type === "gdpr");
  } catch {
    return false;
  }
}

function ensureGoogleCallbackQueue(): GoogleFcCallbackEntry[] {
  window.googlefc = window.googlefc || {};

  window.googlefc.callbackQueue =
    window.googlefc.callbackQueue || [];

  return window.googlefc.callbackQueue;
}

function openGoogleCmpPrivacySettings(): void {
  const openGoogleSettings = () => {
    const showRevocationMessage =
      window.googlefc?.showRevocationMessage;

    if (typeof showRevocationMessage === "function") {
      showRevocationMessage.call(window.googlefc);
    }
  };

  /*
   * Google CMP may already be ready.
   */
  openGoogleSettings();

  /*
   * Otherwise wait until Google signals that its consent API is ready.
   */
  if (
    typeof window.googlefc?.showRevocationMessage !== "function"
  ) {
    ensureGoogleCallbackQueue().push({
      CONSENT_API_READY: openGoogleSettings,
    });
  }
}

/* =========================================================
   IAB TCF watcher
   ========================================================= */

/**
 * Watches for an IAB TCF CMP without blocking the page.
 *
 * If Google CMP loads after the local timeout, the listener remains active
 * temporarily and can still switch the provider to Google. This helps avoid
 * showing two consent interfaces at the same time.
 */
function watchTcf(
  onResult: (gdprApplies: boolean) => void,
): () => void {
  let active = true;
  let listenerId: number | undefined;
  let attached = false;

  const attachTcfListener = () => {
    if (
      !active ||
      attached ||
      typeof window.__tcfapi !== "function"
    ) {
      return;
    }

    try {
      window.__tcfapi(
        "addEventListener",
        2,
        (data, success) => {
          if (
            !active ||
            success === false ||
            !data ||
            typeof data !== "object"
          ) {
            return;
          }

          const tcData = data as TcfTcData;

          if (typeof tcData.listenerId === "number") {
            listenerId = tcData.listenerId;
          }

          if (typeof tcData.gdprApplies === "boolean") {
            onResult(tcData.gdprApplies);
          }
        },
      );

      attached = true;
    } catch {
      /*
       * Google CMP may not be fully initialized yet.
       * Polling / callbackQueue can retry later.
       */
    }
  };

  /*
   * Try immediately.
   */
  attachTcfListener();

  /*
   * Try again when Google CMP says its consent API is ready.
   */
  ensureGoogleCallbackQueue().push({
    CONSENT_API_READY: attachTcfListener,
  });

  /*
   * Short lightweight polling window for CMP implementations that expose
   * __tcfapi after hydration without firing Google's callback immediately.
   */
  const pollTimer = window.setInterval(
    attachTcfListener,
    150,
  );

  const stopPollTimer = window.setTimeout(() => {
    window.clearInterval(pollTimer);
  }, 12000);

  return () => {
    active = false;

    window.clearInterval(pollTimer);
    window.clearTimeout(stopPollTimer);

    if (
      typeof listenerId === "number" &&
      typeof window.__tcfapi === "function"
    ) {
      try {
        window.__tcfapi(
          "removeEventListener",
          2,
          () => {},
          listenerId,
        );
      } catch {
        /*
         * Ignore CMP cleanup failures.
         */
      }
    }
  };
}

/* =========================================================
   Component
   ========================================================= */

export default function CookieConsentBanner() {
  const pathname = usePathname();

  const [provider, setProvider] =
    useState<ConsentProvider>("checking");

  const [open, setOpen] = useState(false);

  const [manuallyOpened, setManuallyOpened] =
    useState(false);

  const providerRef =
    useRef<ConsentProvider>("checking");

  const initializedCustomRef = useRef(false);

  const adFreeRoute = isAdFreePath(pathname);

  /* =======================================================
     Detect Google CMP / custom consent provider
     ======================================================= */

  useEffect(() => {
    /*
     * Google Funding Choices preview mode.
     */
    if (isGoogleCmpPreview()) {
      providerRef.current = "google";

      setProvider("google");
      setOpen(false);
      setManuallyOpened(false);

      return;
    }

    let settled = false;

    /*
     * Important:
     *
     * These functions intentionally do NOT start with "use".
     * Names beginning with "use" are interpreted by ESLint as React Hooks.
     */
    const activateCustomProvider = () => {
      if (settled) {
        return;
      }

      settled = true;

      providerRef.current = "custom";

      setProvider("custom");
    };

    const activateGoogleProvider = () => {
      settled = true;

      providerRef.current = "google";

      setProvider("google");
      setOpen(false);
      setManuallyOpened(false);
    };

    const stopWatchingTcf = watchTcf(
      (gdprApplies) => {
        if (gdprApplies) {
          activateGoogleProvider();
          return;
        }

        activateCustomProvider();
      },
    );

    /*
     * Don't hold rendering while waiting for Google CMP.
     *
     * If no applicable Google/IAB CMP is detected quickly,
     * use the local consent UI.
     */
    const decisionTimer = window.setTimeout(
      activateCustomProvider,
      GOOGLE_CMP_DECISION_TIMEOUT,
    );

    return () => {
      window.clearTimeout(decisionTimer);
      stopWatchingTcf();
    };
  }, []);

  /* =======================================================
     Initialize custom consent
     ======================================================= */

  useEffect(() => {
    if (
      provider !== "custom" ||
      initializedCustomRef.current
    ) {
      return;
    }

    initializedCustomRef.current = true;

    const storedConsent = getStoredConsent();

    /*
     * Returning visitor:
     * restore the previously selected choice.
     */
    if (storedConsent) {
      applyConsent(storedConsent);
      setOpen(false);

      return;
    }

    /*
     * Privacy-first default.
     *
     * Analytics / ad consent remains denied until the visitor accepts,
     * while the site's content and navigation remain fully accessible.
     */
    applyConsent("rejected");
    setOpen(true);
  }, [provider]);

  /* =======================================================
     Global privacy-settings event
     ======================================================= */

  useEffect(() => {
    const openConsentManager = () => {
      /*
       * European visitor handled by Google-certified CMP.
       */
      if (providerRef.current === "google") {
        openGoogleCmpPrivacySettings();
        return;
      }

      /*
       * Other visitors use Chef Al Arab's local consent UI.
       */
      setManuallyOpened(true);
      setOpen(true);
    };

    window.addEventListener(
      "open-consent-manager",
      openConsentManager,
    );

    return () => {
      window.removeEventListener(
        "open-consent-manager",
        openConsentManager,
      );
    };
  }, []);

  /* =======================================================
     User choice
     ======================================================= */

  const choose = (choice: ConsentChoice): void => {
    /*
     * Never let the local UI override Google CMP.
     */
    if (providerRef.current !== "custom") {
      return;
    }

    storeConsent(choice);
    applyConsent(choice);

    setOpen(false);
    setManuallyOpened(false);
  };

  /* =======================================================
     Visibility rules
     ======================================================= */

  if (
    provider !== "custom" ||
    !open ||
    (adFreeRoute && !manuallyOpened)
  ) {
    return null;
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <aside
      dir="rtl"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="
        fixed
        inset-x-3
        bottom-3
        z-[100]
        mx-auto
        max-w-3xl
        rounded-2xl
        border
        border-slate-200
        bg-white/95
        p-4
        shadow-2xl
        shadow-slate-950/20
        backdrop-blur-md
        dark:border-slate-700
        dark:bg-slate-900/95
        sm:bottom-5
        sm:p-5
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            grid
            h-11
            w-11
            shrink-0
            place-items-center
            rounded-xl
            bg-orange-50
            text-orange-600
            dark:bg-orange-500/10
            dark:text-orange-400
          "
        >
          <Cookie
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-bold
              text-emerald-700
              dark:text-emerald-300
            "
          >
            <ShieldCheck
              className="h-4 w-4"
              aria-hidden="true"
            />

            ملفات الموقع الضرورية مفعّلة دائمًا
          </div>

          <h2
            id="cookie-consent-title"
            className="
              mt-1
              text-lg
              font-black
              text-slate-950
              dark:text-white
            "
          >
            إعدادات الخصوصية والكوكيز
          </h2>

          <p
            id="cookie-consent-description"
            className="
              mt-1
              text-sm
              font-medium
              leading-6
              text-slate-600
              dark:text-slate-300
            "
          >
            يمكنك السماح بملفات التحليلات والإعلانات أو
            رفضها. لن يمنعك هذا الإشعار من قراءة المحتوى
            أو استخدام الموقع.
          </p>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-x-4
              gap-y-2
              text-xs
              font-bold
            "
          >
            <Link
              href="/privacy_policy"
              className="
                text-orange-600
                hover:underline
                dark:text-orange-400
              "
            >
              سياسة الخصوصية
            </Link>

            <Link
              href="/cookie_policy"
              className="
                text-orange-600
                hover:underline
                dark:text-orange-400
              "
            >
              سياسة الكوكيز
            </Link>
          </div>
        </div>
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
          sm:flex
          sm:justify-end
        "
      >
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="
            min-h-11
            rounded-xl
            border
            border-slate-300
            bg-white
            px-5
            py-2.5
            text-sm
            font-extrabold
            text-slate-800
            transition
            hover:bg-slate-100
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-orange-500
            dark:border-slate-600
            dark:bg-slate-800
            dark:text-white
            dark:hover:bg-slate-700
          "
        >
          رفض الاختياري
        </button>

        <button
          type="button"
          onClick={() => choose("accepted")}
          className="
            min-h-11
            rounded-xl
            bg-orange-600
            px-5
            py-2.5
            text-sm
            font-extrabold
            text-white
            transition
            hover:bg-orange-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-orange-500
            focus-visible:ring-offset-2
            dark:ring-offset-slate-900
          "
        >
          قبول الكل
        </button>
      </div>
    </aside>
  );
}