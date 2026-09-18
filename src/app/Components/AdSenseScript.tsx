"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

import { adsEnabled, adsenseClient } from "@/lib/ads";
import { isAdFreePath } from "@/lib/routePolicy";

const VALID_CLIENT = /^ca-pub-\d+$/i;

export default function AdSenseScript() {
  const pathname = usePathname();
  const client = adsenseClient.trim();

  if (
    !adsEnabled ||
    !VALID_CLIENT.test(client) ||
    isAdFreePath(pathname)
  ) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      strategy="lazyOnload"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
      crossOrigin="anonymous"
    />
  );
}
