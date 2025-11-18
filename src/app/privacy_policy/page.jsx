'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Cookie, Users, FileText } from 'lucide-react';
import Link from 'next/link';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* العنوان الرئيسي */}
        <motion.h1
          className="text-4xl font-bold text-gray-900 text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          سياسة الخصوصية
        </motion.h1>

        {/* المقدمة */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-gray-700 leading-relaxed">
            نحن في موقع <Link href={'/'} className="font-semibold text-blue-700">شيف العرب</Link> نلتزم بحماية خصوصية زوارنا، 
            ونسعى لتوفير تجربة آمنة وموثوقة لجميع المستخدمين. تتناول سياسة الخصوصية هذه كيفية جمع 
            واستخدام وحماية المعلومات التي يتم جمعها من خلال الموقع.
          </p>
        </motion.div>

      

        {/* الكوكيز */}
        <motion.section
          className="bg-white rounded-2xl shadow-md p-8 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Cookie className="text-yellow-500" />
            <h2 className="text-2xl font-semibold text-gray-900">ملفات تعريف الارتباط (Cookies)</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            يستخدم موقع شيف العرب ملفات تعريف الارتباط لتحسين تجربة التصفح، وتخصيص المحتوى، 
            وتحليل حركة المرور. ويمكن للمستخدم التحكم بإعدادات الكوكيز من خلال متصفحه.
          </p>
        </motion.section>

        {/* الجهات الخارجية */}
        <motion.section
          className="bg-white rounded-2xl shadow-md p-8 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-900">الجهات الخارجية</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            قد نستعين بشركات إعلانية خارجية مثل Google AdSense والتي قد تستخدم ملفات تعريف الارتباط 
            لعرض إعلانات مخصصة. نحن لا نتحكم في بيانات هذه الشركات ونوصي بزيارة سياسة خصوصيتها للاطلاع على المزيد.
          </p>
        </motion.section>

        {/* الأمان */}
        <motion.section
          className="bg-white rounded-2xl shadow-md p-8 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Lock className="text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">الأمان</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            نحن نسعى لحماية معلومات المستخدمين باستخدام إجراءات تقنية وتنظيمية مناسبة لضمان أعلى مستوى ممكن من الأمان.
          </p>
        </motion.section>

        {/* الموافقة */}
        <motion.section
          className="bg-white rounded-2xl shadow-md p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">الموافقة</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            باستخدامك موقع شيف العرب، فإنك توافق على هذه السياسة وعلى شروط جمع واستخدام المعلومات كما هو موضح.
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
