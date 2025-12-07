// PrivacyPolicyPage
'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Cookie, FileText } from 'lucide-react';
import Link from 'next/link';
import InterstitialAd from '../Components/InterstitialAd';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-6">
          <InterstitialAd interstitialUnitID="1234567890" />
      <div className="max-w-5xl mx-auto">
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
          <p className="text-lg text-gray-300 leading-relaxed">
            نحن في موقع <Link href={'/'} className="font-semibold text-blue-400">شيف العرب</Link> نلتزم بحماية خصوصية زوارنا، ونسعى لتوفير تجربة آمنة وموثوقة لجميع المستخدمين. تتناول سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي يتم جمعها من خلال الموقع.
          </p>
        </motion.div>

        {/* Sections */}
        {[
          { icon: Cookie, title: 'ملفات تعريف الارتباط (Cookies)', content: 'يستخدم موقع شيف العرب ملفات تعريف الارتباط لتحسين تجربة التصفح، وتخصيص المحتوى، وتحليل حركة المرور. ويمكن للمستخدم التحكم بإعدادات الكوكيز من خلال متصفحه.' },
          { icon: FileText, title: 'الجهات الخارجية', content: 'قد نستعين بشركات إعلانية خارجية مثل Google AdSense والتي قد تستخدم ملفات تعريف الارتباط لعرض إعلانات مخصصة. نحن لا نتحكم في بيانات هذه الشركات ونوصي بزيارة سياسة خصوصيتها للاطلاع على المزيد.' },
          { icon: Lock, title: 'الأمان', content: 'نحن نسعى لحماية معلومات المستخدمين باستخدام إجراءات تقنية وتنظيمية مناسبة لضمان أعلى مستوى ممكن من الأمان.' },
          { icon: ShieldCheck, title: 'الموافقة', content: 'باستخدامك موقع شيف العرب، فإنك توافق على هذه السياسة وعلى شروط جمع واستخدام المعلومات كما هو موضح.' }
        ].map((section, idx) => (
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
            <p className="text-gray-300 leading-relaxed">{section.content}</p>
          </motion.section>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
