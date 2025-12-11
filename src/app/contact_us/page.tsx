'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from "next/dynamic";
const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), {
  ssr: false,
});
const AdSenseBanner = dynamic(() => import("../Components/AdSenseBanner"), {
  ssr: false,
});
const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6">
      <InterstitialAd interstitialUnitID="2901613977" />
      <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        * {
            max-width: 100vw !important;
        }
      `}</style>
      <div className="max-w-4xl mx-auto text-center mt-10">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          تواصل معنا
        </motion.h1>

        <motion.p
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          يسعدنا تواصلك معنا في أي وقت! إذا كان لديك اقتراحات، استفسارات، أو ترغب في التعاون معنا، يمكنك مراسلتنا عبر الوسائل التالية:
        </motion.p>

        <motion.div
          className="bg-gray-800 shadow-md rounded-2xl p-8 inline-block text-left space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <Mail className="text-blue-600" />
            <Link
              href="mailto:chefalarabonline@gmail.com"
              className="text-blue-400 font-semibold"
            >
              chefalarabonline@gmail.com
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <MessageCircle className="text-green-600" />
            <Link
              target="_blank"
              href="https://wa.me/201107232016?text="
              rel="noopener noreferrer"
              className="text-green-700 dark:text-green-400 font-semibold"
            >
              تواصل معنا عبر واتس آب
            </Link>
          </div>
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

export default ContactPage;
