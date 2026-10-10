// adsbygoogle
export {};

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
    gtag?: (...args: any[]) => void;
  }
}
