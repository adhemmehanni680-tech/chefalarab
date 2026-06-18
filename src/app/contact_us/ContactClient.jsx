// src/app/contact_us/ContactClient.jsx
"use client";


import { Mail, MessageCircle, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";

import dynamic from "next/dynamic";



const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

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
    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">تواصل معنا
        </h1>

        {/*  مقدمة  (  ) */}
        <p
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-500"
         
        >
          يسعدنا تواصلك معنا في أي وقت! إذا كان لديك اقتراح لتحسين الموقع، أو بلاغ عن مشكلة في صفحة أو وصفة، أو رغبة في طلب إضافة وصفة جديدة، أو التعاون والإعلان الرسمي، يسعدنا استقبال رسائلكم عبر الوسائل التالية. نحن نهتم بقراءة جميع الرسائل ونعمل باستمرار على تطوير تجربة "<Link href="/" className="font-semibold text-blue-400 hover:underline">
              شيف العرب
            </Link>{" "}".
        </p>

        <p
          className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-8"
         
        >
          لضمان سرعة الرد، يُفضّل أن تكتب عنوان رسالتك بوضوح (مثال: “مشكلة في وصفة” أو “اقتراح” أو
          “تعاون”). وإذا كانت الرسالة عن وصفة معينة، أرفق رابط الصفحة أو اسم الوصفة.
        </p>

        {/*  Card  */}
        <div
          dir="rtl"
          className="bg-gray-800 shadow-md rounded-2xl p-8 inline-block text-right space-y-5 w-full sm:w-auto"
         
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
        </div>
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
