"use client";

import {
  useEffect,
  useState,
} from "react";

type BeforeInstallPromptEvent =
  Event & {
    prompt: () => Promise<void>;

    userChoice: Promise<{
      outcome:
        | "accepted"
        | "dismissed";

      platform: string;
    }>;
  };

declare global {
  interface Window {
    __chefPwaInstallPrompt?:
      | BeforeInstallPromptEvent
      | null;
  }
}

const DISMISS_KEY =
  "pwa-install-dismissed-until";

const DISMISS_DURATION =
  7 * 24 * 60 * 60 * 1000;

function readStorage(
  key: string,
): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(
  key: string,
  value: string,
): void {
  try {
    localStorage.setItem(
      key,
      value,
    );
  } catch {
    // Ignore blocked storage.
  }
}

function removeStorage(
  key: string,
): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore blocked storage.
  }
}

function isStandalone(): boolean {
  const displayStandalone =
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

  const iosStandalone =
    (
      navigator as Navigator & {
        standalone?: boolean;
      }
    ).standalone === true;

  return (
    displayStandalone ||
    iosStandalone
  );
}

function isIOSDevice(): boolean {
  const ua =
    navigator.userAgent.toLowerCase();

  return (
    /iphone|ipad|ipod/.test(ua) ||
    (
      navigator.platform ===
        "MacIntel" &&
      navigator.maxTouchPoints > 1
    )
  );
}

export default function InstallAppButton() {
  const [
    promptEvent,
    setPromptEvent,
  ] =
    useState<BeforeInstallPromptEvent | null>(
      null,
    );

  const [
    standalone,
    setStandalone,
  ] = useState(true);

  const [
    ios,
    setIos,
  ] = useState(false);

  const [
    dismissed,
    setDismissed,
  ] = useState(true);

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    iosHelp,
    setIosHelp,
  ] = useState(false);

  useEffect(() => {
    const currentlyStandalone =
      isStandalone();

    const currentlyIOS =
      isIOSDevice();

    setStandalone(
      currentlyStandalone,
    );

    setIos(currentlyIOS);

    /*
     * تنظيف مفاتيح النسخة القديمة.
     */
    removeStorage(
      "pwa-installed",
    );

    removeStorage(
      "pwa-install-dismissed",
    );

    const rawDismissed =
      readStorage(DISMISS_KEY);

    const dismissedUntil =
      Number(rawDismissed || 0);

    const stillDismissed =
      Number.isFinite(
        dismissedUntil,
      ) &&
      dismissedUntil >
        Date.now();

    if (!stillDismissed) {
      removeStorage(
        DISMISS_KEY,
      );
    }

    setDismissed(
      stillDismissed,
    );

    /*
     * لو event حصل قبل تحميل
     * الـComponent هنلاقيه هنا.
     */
    if (
      window.__chefPwaInstallPrompt
    ) {
      setPromptEvent(
        window
          .__chefPwaInstallPrompt,
      );
    }

    const handleReady = () => {
      const captured =
        window
          .__chefPwaInstallPrompt;

      if (captured) {
        setPromptEvent(
          captured,
        );
      }
    };

    const handleInstalled =
      () => {
        setStandalone(true);
        setPromptEvent(null);

        window
          .__chefPwaInstallPrompt =
          null;

        removeStorage(
          DISMISS_KEY,
        );
      };

    window.addEventListener(
      "chef-pwa-install-ready",
      handleReady,
    );

    window.addEventListener(
      "chef-pwa-installed",
      handleInstalled,
    );

    /*
     * Fallback في حالة
     * instrumentation لم يعمل.
     */
    const directHandler = (
      event: Event,
    ) => {
      event.preventDefault();

      const installEvent =
        event as BeforeInstallPromptEvent;

      window
        .__chefPwaInstallPrompt =
        installEvent;

      setPromptEvent(
        installEvent,
      );
    };

    window.addEventListener(
      "beforeinstallprompt",
      directHandler,
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled,
    );

    setReady(true);

    return () => {
      window.removeEventListener(
        "chef-pwa-install-ready",
        handleReady,
      );

      window.removeEventListener(
        "chef-pwa-installed",
        handleInstalled,
      );

      window.removeEventListener(
        "beforeinstallprompt",
        directHandler,
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled,
      );
    };
  }, []);

  const handleInstall =
    async () => {
      if (ios) {
        setIosHelp(true);
        return;
      }

      const installPrompt =
        promptEvent ||
        window
          .__chefPwaInstallPrompt;

      /*
       * لو المتصفح لم يعتبر
       * الموقع installable،
       * لا يمكن إجباره على
       * إظهار native prompt.
       */
      if (!installPrompt) {
        return;
      }

      try {
        await installPrompt.prompt();

        const result =
          await installPrompt
            .userChoice;

        /*
         * نفس event لا يمكن
         * استخدامه مرتين.
         */
        setPromptEvent(null);

        window
          .__chefPwaInstallPrompt =
          null;

        if (
          result.outcome ===
          "accepted"
        ) {
          setStandalone(true);

          removeStorage(
            DISMISS_KEY,
          );
        }
      } catch {
        setPromptEvent(null);

        window
          .__chefPwaInstallPrompt =
          null;
      }
    };

  const handleClose = () => {
    writeStorage(
      DISMISS_KEY,
      String(
        Date.now() +
          DISMISS_DURATION,
      ),
    );

    setDismissed(true);
  };

  if (
    !ready ||
    standalone ||
    dismissed
  ) {
    return null;
  }

  /*
   * في Chromium:
   * لا نظهر زر تثبيت وهمي.
   *
   * يظهر فقط لما يكون
   * native install prompt
   * جاهز فعلًا.
   */
  if (!ios && !promptEvent) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="
        fixed
        bottom-20
        left-3
        z-[80]
        w-[min(360px,calc(100vw-1.5rem))]
        overflow-hidden
        rounded-2xl
        border
        border-orange-200
        bg-white/95
        shadow-[0_12px_40px_rgba(0,0,0,0.16)]
        backdrop-blur-md

        dark:border-slate-700
        dark:bg-slate-900/95
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          p-2
        "
      >
        <button
          type="button"
          onClick={
            handleInstall
          }
          className="
            flex
            min-h-11
            flex-1
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-orange-500
            px-4
            py-2.5
            text-sm
            font-black
            text-white
            shadow-sm
            transition
            duration-150

            hover:bg-orange-600
            active:scale-[0.98]
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="
                M12 3v11
                m0 0 4-4
                m-4 4-4-4
              "
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="
                M5 14v4
                a2 2 0 0 0 2 2
                h10
                a2 2 0 0 0 2-2
                v-4
              "
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <span>
            تثبيت تطبيق شيف العرب
          </span>
        </button>

        <button
          type="button"
          onClick={
            handleClose
          }
          aria-label="إغلاق اقتراح تثبيت التطبيق"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-slate-100
            text-xl
            text-slate-500
            transition

            hover:bg-slate-200

            dark:bg-slate-800
            dark:text-slate-300
            dark:hover:bg-slate-700
          "
        >
          ×
        </button>
      </div>

      {ios &&
        iosHelp && (
          <div
            className="
              border-t
              border-orange-100
              bg-orange-50/80
              px-4
              py-3
              text-xs
              font-bold
              leading-6
              text-slate-700

              dark:border-slate-700
              dark:bg-slate-950/70
              dark:text-slate-200
            "
          >
            من Safari اضغط
            <strong className="mx-1 text-orange-600">
              مشاركة
            </strong>
            ثم
            <strong className="mx-1 text-orange-600">
              إضافة إلى الشاشة الرئيسية
            </strong>
            .
          </div>
        )}
    </div>
  );
}