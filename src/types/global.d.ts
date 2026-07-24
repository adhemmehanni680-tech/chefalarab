export {};

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
