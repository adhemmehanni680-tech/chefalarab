'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Link from 'next/link';

const TermsConditionsPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      title: 'قبول الشروط',
      content:
        'باستخدامك لموقع شيف العرب، فإنك تقر بأنك قرأت هذه الشروط وفهمتها وتوافق على الالتزام بها.',
    },
    {
      title: 'محتوى الموقع',
      content:
        'يُقدِّم موقع شيف العرب وصفات طبخ لأغراض معرفية فقط، ويُستخدم المحتوى على مسؤوليتك الخاصة.',
    },
    {
      title: 'حقوق الملكية الفكرية',
      content: 'جميع المحتويات المعروضة هي ملك للموقع، ولا يجوز إعادة نشرها دون إذن كتابي.',
    },
    {
      title: 'الروابط الخارجية',
      content: 'لسنا مسؤولين عن محتوى أو سياسات المواقع الخارجية.',
    },
    {
      title: 'الإعلانات',
      content: 'قد يعرض الموقع إعلانات من أطراف ثالثة ولسنا مسؤولين عن محتواها.',
    },
    {
      title: 'التعديلات',
      content: 'يحق للموقع تعديل هذه الشروط في أي وقت.',
    },
    {
      title: 'التواصل معنا',
      content: (
        <>
          📧{' '}
          <Link href="mailto:chefalarabonline@gmail.com" className="text-blue-400 font-semibold">
            chefalarabonline@gmail.com
          </Link>
        </>
      ),
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

      <div className="max-w-5xl mx-auto mt-10">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          الشروط والأحكام
        </motion.h1>

        {sections.map((section, idx) => (
          <motion.section
            key={idx}
            className="bg-gray-800 rounded-2xl shadow-md p-8 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
          >
            <h2 className="text-2xl font-semibold text-gray-100 mb-2">{section.title}</h2>
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

export default TermsConditionsPage;
