"use client";

import React from "react";
import Script from "next/script";
import CookieConsentBanner from "./Components/CookieConsentBanner";

interface RootClientProps {
  children: React.ReactNode;
}

export default function RootClient({ children }: RootClientProps) {
  // GTM Container ID (لازم يكون متعرّف في env)
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID!;
  const ADSENSE_CLIENT =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9717868267549745";

  return (
    <>
      {/* =========================
          Consent default (قبل أي Tags)
          ========================= */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // Default consent: denied
          gtag('consent', 'default', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
        `}
      </Script>

      {/* =========================
          Cookie Consent Banner
          (لازم يعمل gtag('consent','update', ...) عند القبول/الرفض)
          ========================= */}
      <CookieConsentBanner />

      {/* =========================
          Google Tag Manager
          ========================= */}
      <Script id="gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>

      {/* =========================
          Google AdSense
          ========================= */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
      />

      {children}
    </>
  );
}
