"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [hideButton, setHideButton] = useState(true);

  useEffect(() => {
    const installedBefore =
      localStorage.getItem("pwa-installed") === "true" ||
      localStorage.getItem("pwa-install-dismissed") === "true";

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const userAgent = window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setIsIOS(ios);
    setIsStandalone(standalone);

    if (standalone || installedBefore) {
      setHideButton(true);
      return;
    }

    if (ios) {
      setHideButton(false);
      return;
    }

    const beforeInstallHandler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setHideButton(false);
    };

    const installedHandler = () => {
      localStorage.setItem("pwa-installed", "true");
      setHideButton(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      localStorage.setItem("pwa-installed", "true");
      setHideButton(true);
    }

    setDeferredPrompt(null);
  };

  const handleClose = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setHideButton(true);
  };

  if (hideButton || isStandalone) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-1/2 z-[9999] flex w-[92%] max-w-sm -translate-x-1/2 items-center gap-2 rounded-full border border-orange-100 bg-white/95 px-3 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.14)] backdrop-blur-md md:hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 3v11m0 0 4-4m-4 4-4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="min-w-0 flex-1 text-xs font-medium leading-5 text-gray-700">
          من Safari: مشاركة ثم إضافة للشاشة الرئيسية
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg leading-none text-gray-500 transition hover:bg-gray-200"
          aria-label="إغلاق"
        >
          ×
        </button>
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full border border-orange-100 bg-white/95 px-2 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.14)] backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={handleInstall}
        className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3v11m0 0 4-4m-4 4-4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <span>تثبيت التطبيق</span>
      </button>

      <button
        type="button"
        onClick={handleClose}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg leading-none text-gray-500 transition hover:bg-gray-200"
        aria-label="إغلاق"
      >
        ×
      </button>
    </div>
  );
}