"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import {
  applyConsent,
  getStoredConsent,
  storeConsent,
  type ConsentChoice,
} from "@/lib/consent";

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const v = getStoredConsent();
    setOpen(!v);

    // Event لإعادة فتح البانر
    const openHandler = () => setOpen(true);
    window.addEventListener("open-consent-manager", openHandler);
    return () => window.removeEventListener("open-consent-manager", openHandler);
  }, []);

  const choose = (c: ConsentChoice) => {
    storeConsent(c);
    applyConsent(c); //   Mode v2 update
    setOpen(false);
    logConsent(c);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-700 bg-gray-900/95 backdrop-blur-md shadow-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-orange-400">
            <Cookie size={22} />
          </div>

          <div className="flex-1">
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
              نستخدم ملفات تعريف الارتباط الضرورية لتشغيل الموقع، بالإضافة إلى ملفات
              اختيارية لتحليل الأداء وعرض إعلانات (قد تكون مخصصة). يمكنك قبول أو رفض
              غير الضروري.{" "}
              <Link href="/cookie_policy" className="text-blue-400 hover:underline">
                اقرأ سياسة الكوكيز
              </Link>
              .
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => choose("accepted")}
                className="px-4 py-2 rounded-lg bg-orange-500 text-black font-semibold"
              >
                موافق
              </button>

              <button
                onClick={() => choose("rejected")}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white"
              >
                رفض غير الضروري
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// اختياري
function logConsent(choice: ConsentChoice) {
  try {
    const logs = JSON.parse(localStorage.getItem("consent_logs") || "[]");
    logs.push({ choice, date: new Date().toISOString(), userAgent: navigator.userAgent });
    localStorage.setItem("consent_logs", JSON.stringify(logs));
  } catch {
    // ignore
  }
}
