'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Cookie, FileText, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import dynamic from "next/dynamic";
const InterstitialAd = dynamic(() => import("../Components/InterstitialAd"), {
  ssr: false,
});

const PrivacyPolicyPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      icon: Cookie,
      title: 'ملفات تعريف الارتباط (Cookies)',
      content:
        'يستخدم موقع شيف العرب ملفات تعريف الارتباط لتحسين تجربة التصفح، وتخصيص المحتوى، وتحليل حركة المرور. ويمكن للمستخدم التحكم بإعدادات الكوكيز من خلال متصفحه.',
    },
    {
      icon: FileText,
      title: 'الجهات الخارجية',
      content:
        'قد نستعين بشركات إعلانية خارجية مثل Google AdSense والتي قد تستخدم ملفات تعريف الارتباط لعرض إعلانات مخصصة. نحن لا نتحكم في بيانات هذه الشركات ونوصي بزيارة سياسة خصوصيتها للاطلاع على المزيد.',
    },
    {
      icon: Lock,
      title: 'الأمان',
      content:
        'نحن نسعى لحماية معلومات المستخدمين باستخدام إجراءات تقنية وتنظيمية مناسبة لضمان أعلى مستوى ممكن من الأمان.',
    },
    {
      icon: ShieldCheck,
      title: 'الموافقة',
      content:
        'باستخدامك موقع شيف العرب، فإنك توافق على هذه السياسة وعلى شروط جمع واستخدام المعلومات كما هو موضح.',
    },
  ];

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
      
      
      <InterstitialAd interstitialUnitID="2901613977" />

      <div className="max-w-5xl mx-auto mt-10">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          سياسة الخصوصية
        </motion.h1>

        <motion.div
          className="bg-gray-800 rounded-2xl shadow-md p-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            نحن في موقع{' '}
            <Link href={'/'} className="font-semibold text-blue-400">
              شيف العرب
            </Link>{' '}
            نلتزم بحماية خصوصية زوارنا، ونسعى لتوفير تجربة آمنة وموثوقة لجميع المستخدمين. تتناول سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي يتم جمعها من خلال الموقع.
          </p>
        </motion.div>

        {sections.map((section, idx) => (
          <motion.section
            key={idx}
            className="bg-gray-800 rounded-2xl shadow-md p-8 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <section.icon className="text-blue-400 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold text-gray-100">{section.title}</h2>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{section.content}</p>
          </motion.section>
        ))}
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 z-50"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default PrivacyPolicyPage;
