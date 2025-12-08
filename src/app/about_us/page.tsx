//AboutPage
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import InterstitialAd from '../Components/InterstitialAd';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6">
        <InterstitialAd interstitialUnitID="1234567890" />
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold ttext-gray-100 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          من نحن
        </motion.h1>

        <motion.p
          className="text-lg text-gray-300 leading-relaxed bg-gray-800 rounded-2xl shadow-md p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link href={'/'} className="font-semibold text-blue-400">
            شيف العرب
          </Link>{" "}
          هو موقع متخصص في تقديم وصفات الطبخ العربية والعالمية بشكل مبسط وسهل، مع التركيز على جودة المحتوى ودقته. نسعى لتقديم أفضل التجارب للمهتمين بالمطبخ، سواء كانوا مبتدئين أو محترفين. نهدف إلى نشر ثقافة الطبخ الصحي والمتوازن، بالإضافة إلى تقديم مقالات متعلقة بعالم الطبخ والمكونات وطرق التحضير. رؤيتنا هي أن يكون شيف العرب المصدر الأول للوصفات الموثوقة والمجربة في العالم العربي.
        </motion.p>
      </div>
    </div>
  );
};

export default AboutPage;
