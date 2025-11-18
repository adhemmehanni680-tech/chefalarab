"use client";

import { useEffect } from "react";

interface Props {
  adSlot: string;
  style?: React.CSSProperties;
}

export default function AdSenseBanner({ adSlot, style }: Props) {
  useEffect(() => {
  try {
    // @ts-ignore
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error("Adsense Error:", e);
  }
}, []);


  return (
    <div className="flex justify-center my-4 w-full mr-10">
      <ins
        className="adsbygoogle"
        style={style || { display: "block", width: "100%", height: 90 }}
        data-ad-client="ca-pub-3940256099942544"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on" // إعلان تجريبي دائم
      ></ins>
    </div>
  );
}
