import { HelpCircle, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ContactClient() {
  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-gray-50 px-4 py-16 text-gray-900 dark:bg-[#0b1220] dark:text-gray-100 sm:px-6"
    >
      <div className="mx-auto mt-8 max-w-4xl text-center">
        <nav
          aria-label="مسار التنقل"
          className="mb-6 flex items-center gap-2 text-right text-sm font-semibold text-gray-500 dark:text-gray-400"
        >
          <Link
            href="/"
            className="rounded-md outline-none transition-colors hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-400 dark:hover:text-orange-400"
          >
            الرئيسية
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-gray-800 dark:text-gray-200">
            تواصل معنا
          </span>
        </nav>

        <h1 className="text-3xl font-black sm:text-4xl">
          تواصل مع شيف العرب
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-700 dark:text-gray-300 sm:text-lg">
          يسعدنا تواصلك مع <Link href="/" className="font-bold text-orange-600 hover:underline dark:text-orange-400">شيف العرب</Link> بخصوص اقتراح، مشكلة في صفحة أو وصفة، طلب إضافة وصفة، تعاون، أو استفسار عام.
        </p>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
          اكتب عنوان رسالتك بوضوح، وإذا كان استفسارك متعلقًا بوصفة محددة أرفق اسم الوصفة أو رابط الصفحة لتسهيل المراجعة.
        </p>

        <section
          aria-labelledby="contact-methods"
          className="mx-auto mt-8 w-full max-w-2xl rounded-3xl border border-gray-900 bg-white p-6 text-right shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          <h2 id="contact-methods" className="mb-5 text-xl font-black">
            وسائل التواصل
          </h2>

          <address className="space-y-4 not-italic">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/70">
              <Mail className="shrink-0 text-orange-500" aria-hidden="true" />
              <a
                href="mailto:chefalarabonline@gmail.com"
                className="break-all font-bold text-blue-600 hover:underline dark:text-blue-400"
                aria-label="مراسلة شيف العرب عبر البريد الإلكتروني"
              >
                chefalarabonline@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/70">
              <MessageCircle className="shrink-0 text-green-500" aria-hidden="true" />
              <a
                target="_blank"
                href="https://wa.me/201107232016?text=مرحبا_بكم_فى_شيف_العرب"
                rel="noopener noreferrer"
                className="font-bold text-green-700 hover:underline dark:text-green-400"
                aria-label="التواصل مع شيف العرب عبر واتساب"
              >
                تواصل معنا عبر واتساب
              </a>
            </div>
          </address>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-900 p-4 dark:border-gray-700">
              <HelpCircle className="mt-0.5 shrink-0 text-orange-500" aria-hidden="true" />
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                وقت الرد المعتاد من 24 إلى 48 ساعة حسب ضغط الرسائل.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-900 p-4 dark:border-gray-700">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                لا ترسل كلمات مرور أو بيانات مالية أو أي معلومات حساسة عبر الرسائل.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
