// TermsConditionsPage
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import InterstitialAd from '../Components/InterstitialAd';

const TermsConditionsPage = () => {
  return (
    <div className="min-h-screenbg-gray-900 py-16 px-6">
      <InterstitialAd interstitialUnitID="1234567890" />
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          الشروط والأحكام
        </motion.h1>

        <motion.div
          className=" bg-gray-800 shadow-md rounded-2xl p-8 text-right space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-300 leading-relaxed">
            مرحبًا بك في موقع <Link href={'/'} className="font-semibold text-blue-700 dark:text-blue-400">شيف العرب</Link>. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام الموضحة أدناه. يرجى قراءة هذه الشروط بعناية قبل استخدام الموقع.
          </p>

          <p className="text-gray-300 leading-relaxed">
            <strong>1. قبول الشروط</strong><br />
            باستخدامك لموقع شيف العرب، فإنك تقر بأنك قرأت هذه الشروط وفهمتها وتوافق على الالتزام بها وبجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي من هذه الشروط، يُرجى التوقف عن استخدام الموقع فورًا.
          </p>

          <p className="text-gray-300 leading-relaxed">
            <strong>2. محتوى الموقع</strong><br />
            يُقدِّم موقع شيف العرب وصفات طبخ ومحتوى متعلق بالطهي والمأكولات لأغراض معرفية وترفيهية فقط. لا نضمن أن تكون النتائج مماثلة تمامًا لما هو موضح في الوصفات، ويُستخدم المحتوى على مسؤوليتك الخاصة.
          </p>

          <p className="text-gray-300 leading-relaxed">
            <strong>3. حقوق الملكية الفكرية</strong><br />
            جميع النصوص، الصور، الفيديوهات، والشعارات المعروضة على موقع شيف العرب هي ملك للموقع أو مرخَّص باستخدامها. يُحظر إعادة نشرها أو استخدامها لأغراض تجارية دون إذن كتابي مسبق.
          </p>

          <p className="text-gray-300 leading-relaxed">
            <strong>4. الروابط الخارجية</strong><br />
            قد يحتوي موقع شيف العرب على روابط لمواقع خارجية لا نديرها. نحن غير مسؤولين عن محتوى أو سياسات الخصوصية أو ممارسات تلك المواقع.
          </p>

          <p className="text-gray-300 leading-relaxed">
            <strong>5. الإعلانات</strong><br />
            قد يعرض موقع شيف العرب إعلانات من أطراف ثالثة. لا يتحمل الموقع مسؤولية عن محتوى هذه الإعلانات أو عن المنتجات والخدمات التي تروّج لها. يُنصح المستخدمون بقراءة سياسات وشروط تلك الجهات قبل التعامل معها.
          </p>

          <p className="text-gray-300 leading-relaxed">
            <strong>6. التعديلات</strong><br />
            يحتفظ موقع شيف العرب بالحق في تعديل أو تحديث هذه الشروط في أي وقت دون إشعار مسبق. يُنصح المستخدمون بزيارة هذه الصفحة بانتظام للاطلاع على أحدث التعديلات.
          </p>

          <p className="text-gray-300 leading-relaxed">
            <strong>7. التواصل معنا</strong><br />
            في حال وجود أي استفسار أو شكوى بخصوص هذه الشروط، يُرجى التواصل معنا عبر البريد الإلكتروني التالي:<br />
            📧 <span className="font-semibold"><Link
              href="mailto:contact@chefalarab.com"
              className="text-blue-400  font-semibold "
            >
              contact@chefalarab.com
            </Link></span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
