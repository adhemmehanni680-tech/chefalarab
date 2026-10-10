export {};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

declare global {
  interface Window {
    __chefPwaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

if (typeof window !== "undefined") {
  window.__chefPwaInstallPrompt ??= null;

  window.addEventListener(
    "beforeinstallprompt",
    (event) => {
      event.preventDefault();

      window.__chefPwaInstallPrompt =
        event as BeforeInstallPromptEvent;

      window.dispatchEvent(
        new Event("chef-pwa-install-ready"),
      );
    },
  );

  window.addEventListener(
    "appinstalled",
    () => {
      window.__chefPwaInstallPrompt = null;

      window.dispatchEvent(
        new Event("chef-pwa-installed"),
      );
    },
  );
}