"use client";

import React from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import CookieConsentBanner from "./Components/CookieConsentBanner";
import PWARegister from "@/app/Components/PWARegister";
import { adsEnabled } from "@/lib/ads";

const SearchFloating = dynamic(() => import("./Components/SearchFloating"), { ssr: false });
const ScrollToTopButton = dynamic(() => import("./Components/ScrollToTopButton"), { ssr: false });
const LocalAdBanner = dynamic(() => import("./Components/LocalAdBanner/LocalAdBanner"), { ssr: false });
const InstallAppButton = dynamic(() => import("./Components/InstallAppButton"), { ssr: false });

interface Props {
  children: React.ReactNode;
}

export default function RootClient({ children }: Props) {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const ADSENSE_CLIENT =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9717868267549745";

  return (
    <>
      <Script id="consent-default" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: 'denied',
          analytics_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      `}</Script>

      <CookieConsentBanner />

      {GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),
            dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}</Script>
      )}

      {adsEnabled && (
        <Script
          id="google-adsense"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      )}

      <PWARegister />
      {children}
      <InstallAppButton />
      <SearchFloating />
      {adsEnabled && <LocalAdBanner />}
      <ScrollToTopButton />
    </>
  );
}
