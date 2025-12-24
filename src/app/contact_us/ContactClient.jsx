// src/app/contact_us/ContactClient.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { adsEnabled } from "@/lib/ads";


const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), {
  ssr: false,
});
const AdSenseBanner = dynamic(() => import("../Components/AdSenseBanner"), {
  ssr: false,
});
const showAdsOnThisPage = false;

export default function ContactClient() {

  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6 overflow-x-hidden">
      <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        * {
          max-width: 100vw !important;
        }
      `}</style>

      {/*     */} 
      {adsEnabled && showAdsOnThisPage && <InterstitialAd interstitialUnitID="2901613977" />}

      <div className="max-w-4xl mx-auto text-center mt-10">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          تواصل معنا
        </motion.h1>

        {/*  مقدمة  (  ) */}
        <motion.p
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          يسعدنا تواصلك معنا في أي وقت! إذا كان لديك اقتراح لتحسين الموقع، أو بلاغ عن مشكلة
          في صفحة/وصفة، أو رغبة في التعاون والإعلان بشكل رسمي، يمكنك مراسلتنا عبر الوسائل التالية.
          نحن نهتم بقراءة كل الرسائل والعمل على تحسين تجربة شيف العرب باستمرار.
        </motion.p>

        <motion.p
          className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          لضمان سرعة الرد، يُفضّل أن تكتب عنوان رسالتك بوضوح (مثال: “مشكلة في وصفة” أو “اقتراح” أو
          “تعاون”). وإذا كانت الرسالة عن وصفة معينة، أرفق رابط الصفحة أو اسم الوصفة.
        </motion.p>

        {/*  Card  */}
        <motion.div
          dir="rtl"
          className="bg-gray-800 shadow-md rounded-2xl p-8 inline-block text-right space-y-5 w-full sm:w-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-3 justify-start">
            <Mail className="text-blue-500" />
            <Link
              href="mailto:chefalarabonline@gmail.com"
              className="text-blue-400 font-semibold hover:underline break-all"
              aria-label="مراسلة شيف العرب عبر البريد الإلكتروني"
              title="مراسلة شيف العرب عبر البريد الإلكتروني"
            >
              chefalarabonline@gmail.com
            </Link>
          </div>

          <div className="flex items-center gap-3 justify-start">
            <MessageCircle className="text-green-500" />
            <Link
              target="_blank"
              href="https://wa.me/201107232016?text= مرحبا_بكم_فى_شيف_العرب "
              rel="noopener noreferrer"
              className="text-green-400 font-semibold hover:underline"
              aria-label="التواصل مع شيف العرب عبر واتساب"
              title="التواصل مع شيف العرب عبر واتساب"
            >
              تواصل معنا عبر واتس آب
            </Link>
          </div>

          {/*  معلومات    */}
          <div className="pt-2 space-y-3">
            <div className="flex items-start gap-3">
              <HelpCircle className="text-orange-400 mt-0.5" />
              <p className="text-sm text-gray-300 leading-relaxed">
                وقت الرد التقريبي: من 24 إلى 48 ساعة حسب ضغط الرسائل.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="text-lime-400 mt-0.5" />
              <p className="text-sm text-gray-300 leading-relaxed">
                ملاحظة: لا نطلب منك أي بيانات حساسة. رجاءً لا ترسل كلمات مرور أو معلومات مالية في الرسائل.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/*  Banner  */}
      {adsEnabled && showAdsOnThisPage && (
        <div className="flex justify-center my-8">
          <AdSenseBanner
            adSlot="2901613977"
            adFormat="fluid"
            layoutKey="-fc+5g+70-cl-1m"
            style={{ display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
