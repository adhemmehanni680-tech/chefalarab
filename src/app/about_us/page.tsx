// AboutPage.jsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from "next/dynamic";
const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), {
  ssr: false,
});
const AdSenseBanner = dynamic(() => import("../Components/AdSenseBanner"), {
  ssr: false,
});

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6">
       <InterstitialAd interstitialUnitID="1234567890" />
       <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        * {
            max-width: 100vw !important;
        }
      `}</style>
      <div className="max-w-5xl mx-auto text-center mt-10">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          من نحن
        </motion.h1>

        <motion.div
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md p-8 text-gray-800 dark:text-gray-300 text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p>
            <Link href={'/'} className="font-semibold text-blue-500 dark:text-blue-400">
              شيف العرب
            </Link>{" "}
            هو موقع متخصص في تقديم وصفات الطبخ العربية والعالمية بشكل مبسط وسهل، مع التركيز على جودة المحتوى ودقته. نسعى لتقديم أفضل التجارب للمهتمين بالمطبخ، سواء كانوا مبتدئين أو محترفين. نهدف إلى نشر ثقافة الطبخ الصحي والمتوازن، بالإضافة إلى تقديم مقالات متعلقة بعالم الطبخ والمكونات وطرق التحضير. رؤيتنا هي أن يكون شيف العرب المصدر الأول للوصفات الموثوقة والمجربة في العالم العربي.
          </p>
        </motion.div>
      </div>
          <div className="flex justify-center my-8">
                <AdSenseBanner
  adSlot="2901613977"
  adFormat="fluid"
  layoutKey="-fc+5g+70-cl-1m"
  style={{ display: "block" }}
/>

                   </div>
    </div>
  );
};

export default AboutPage;
