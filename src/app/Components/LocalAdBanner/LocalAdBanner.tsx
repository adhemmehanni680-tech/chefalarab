"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import Image, { StaticImageData } from "next/image";
import { X, Phone, ExternalLink, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import icon_Ad from "../../../../public/ads/youssef-Z.webp";
import icon_qasr from "../../../../public/ads/qasr-alsiyramik.webp";
import icon_elmaher from "../../../../public/ads/elmaher.webp";
import icon_lavender from "../../../../public/ads/lavender.webp";
import Link from "next/link";

// ========== أنواع البيانات ==========
interface AdItem {
  id: string | number;
  imageSrc?: string | StaticImageData;
  link: string;
  altText: string;
  phone?: string | string[];   // رقم واحد أو عدة أرقام
  description?: string;
  address?: string;             // عنوان
}

interface AdBannerProProps {
  enabled?: boolean;
  adsList?: AdItem[];
  position?: "bottom-floating" | "top-inline";
  initialDelay?: number;
  reappearAfterClose?: number;
  autoCloseDelay?: number;
  className?: string;
}

// ========== الإعدادات الافتراضية ==========
const DEFAULTS = {
  enabled: true,
  position: "bottom-floating" as const,
  initialDelay: 3000,
  reappearAfterClose: 1800000,  // 30 دقيقة
  autoCloseDelay: 900000,       // 15 دقيقة
  adsList: [
    {
      id: 1,
      imageSrc: icon_Ad,
      link: "",
      altText: "Ozeed",
      phone: ["+201111157067", "+201150051351"],
      description:
        "دلوقتي مع Ozeed تقدر تقدم على وظائف حكومية وخدمات دفع فواتير وشحن باقات وتحويل كاش وكمان تنسيق ثانوي والمعاهد والكليات وتحديث بطاقة التموين وغيرها من الخدمات الحكومية. زورونا في أقرب فرع ليكم!",
      address: "مصر , المنيا , مغاغة ⬅ ش العبور بجوار حزب مستقبل وطن",
    },
    {
      id: 2,
      imageSrc: icon_qasr,
      link: "",
      altText: "قصر السراميك",
      phone: ["+201150500288", "+201010515400"],
      description:
        "مع قصر السراميك، جدد منزلك بأحدث التصاميم وأفضل الأسعار. اكتشف تشكيلتنا الواسعة من سيراميك و بورسلين مستورد و بورسلين محلي و باركيه اطقم حمامات و اكسسوارات .زورونا في فرعنا واستمتعوا بخدمة عملاء ممتازة وعروض خاصة لا تفوت!",
      address: "مصر , المنيا , العدوة ⬅ شارع مصطفي كامل بجوار جامع الحاج عدوى",
    },
    {
      id: 3,
      imageSrc: icon_elmaher,
      link: "https://www.facebook.com/share/1BZYsQV38t/",
      altText: "الماهر",
      phone: ["+201155416650", "+201037472085"],
      description:
        "فواكه وخضروات طازجة يوميًا من الماهر، مع خدمة توصيل سريعة 24 ساعة . زورونا في فرعنا واستمتعوا بأفضل جودة وأفضل الأسعار!",
      address: "مصر , المنيا , مغاغة ⬅ مول باريس",
    }, {
      id: 4,
      imageSrc: icon_lavender,
      link: "",
      altText: "لافندر",
      phone: ["+201201928497"],
      description:
        "لافندر  قاعه وسيشن وكافيه شباب وكافيه عائلات وكمان حمام سباحه للاطفال ",
      address: "مصر , المنيا , مغاغة ⬅ اول دائري ميانه بجوار معرض السيارات ",
    },
  ],
};

// ========== المكون ==========
export default function AdBannerPro({
  enabled = DEFAULTS.enabled,
  adsList = DEFAULTS.adsList,
  position = DEFAULTS.position,
  initialDelay = DEFAULTS.initialDelay,
  reappearAfterClose = DEFAULTS.reappearAfterClose,
  autoCloseDelay = DEFAULTS.autoCloseDelay,
  className = "",
}: AdBannerProProps) {
  const [showAd, setShowAd] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const bannerRef = useRef<HTMLDivElement>(null);
  const reappearTimer = useRef<NodeJS.Timeout | null>(null);
  const rotationTimer = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimer = useRef<NodeJS.Timeout | null>(null);

  const currentAd = adsList[currentIdx] || adsList[0];

  // توحيد الأرقام إلى مصفوفة
  const phones: string[] = currentAd.phone
    ? typeof currentAd.phone === "string"
      ? [currentAd.phone]
      : currentAd.phone
    : [];

  // كشف الموبايل
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // الظهور الأول
  useEffect(() => {
    if (!enabled || adsList.length === 0 || isDismissed) return;
    const timer = setTimeout(() => {
      setShowAd(true);
      setCurrentIdx(Math.floor(Math.random() * adsList.length));
    }, initialDelay);
    return () => clearTimeout(timer);
  }, [enabled, initialDelay, adsList.length, isDismissed]);

  // التنقل اليدوي
  const goToPrev = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + adsList.length) % adsList.length);
  }, [adsList.length]);

  const goToNext = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % adsList.length);
  }, [adsList.length]);

  // التدوير التلقائي
  const startRotation = useCallback(() => {
    if (rotationTimer.current) clearInterval(rotationTimer.current);
    if (adsList.length > 1) {
      rotationTimer.current = setInterval(goToNext, 10000);
    }
  }, [goToNext, adsList.length]);

  useEffect(() => {
    if (showAd) startRotation();
    return () => {
      if (rotationTimer.current) clearInterval(rotationTimer.current);
    };
  }, [showAd, startRotation]);

  const handleManualNavigation = (navFn: () => void) => {
    navFn();
    startRotation(); // إعادة تشغيل المؤقت بعد التنقل اليدوي
  };

  const handleClose = useCallback((remember = true) => {
    setShowAd(false);
    if (remember) setIsDismissed(true);
    if (reappearTimer.current) clearTimeout(reappearTimer.current);
    if (!remember) {
      reappearTimer.current = setTimeout(() => {
        setShowAd(true);
        setCurrentIdx((prev) => (prev + 1) % adsList.length);
      }, reappearAfterClose);
    }
  }, [adsList.length, reappearAfterClose]);

  // إغلاق تلقائي
  useEffect(() => {
    if (showAd && autoCloseDelay > 0) {
      autoCloseTimer.current = setTimeout(() => handleClose(false), autoCloseDelay);
    }
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, [showAd, autoCloseDelay, handleClose]);

  // ضبط المسافة في الوضع العائم
  useEffect(() => {
    if (position !== "bottom-floating" || !showAd) return;
    const timer = setTimeout(() => {
      if (bannerRef.current) {
        const height = bannerRef.current.offsetHeight + 16;
        document.body.style.paddingBottom = `${height}px`;
        document.documentElement.style.setProperty("--ad-banner-height", `${height}px`);
        document.querySelector("main")?.setAttribute("style", `padding-bottom: ${height}px`);
        document.querySelector("footer")?.setAttribute("style", `margin-bottom: ${height}px`);
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      document.body.style.paddingBottom = "0px";
      document.documentElement.style.setProperty("--ad-banner-height", "0px");
      document.querySelector("main")?.setAttribute("style", "padding-bottom: 0px");
      document.querySelector("footer")?.setAttribute("style", "margin-bottom: 0px");
    };
  }, [showAd, position]);

  // تنظيف نهائي
  useEffect(() => {
    return () => {
      document.body.style.paddingBottom = "0px";
      document.documentElement.style.setProperty("--ad-banner-height", "0px");
      document.querySelector("main")?.setAttribute("style", "padding-bottom: 0px");
      document.querySelector("footer")?.setAttribute("style", "margin-bottom: 0px");
    };
  }, []);

  if (!enabled || !showAd || !currentAd || adsList.length === 0) return null;

  // ========== محتوى الإعلان (صور فقط، وصف كامل) ==========
  const AdContent = () => (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      {/* الصورة */}
      <Link
        href={currentAd.link}
        target="_blank"
        rel="nofollow sponsored"
        className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow mt-1"
      >
        <Image
          src={currentAd.imageSrc || icon_Ad}
          alt={currentAd.altText}
          width={isMobile ? 64 : 72}
          height={isMobile ? 64 : 72}
          className="object-cover h-16 w-16 sm:h-18 sm:w-18"
          unoptimized
        />
      </Link>

      {/* النص والعنوان والوصف */}
      <div className="flex-1 min-w-0">
        <p className="text-base sm:text-lg font-bold text-white truncate">
          {currentAd.altText}
        </p>
        {currentAd.description && (
          <p className="text-sm text-gray-300 mt-0.5 whitespace-normal break-words">
            {currentAd.description}
          </p>
        )}
        {currentAd.address && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="whitespace-normal break-words text-white">
              {currentAd.address}
            </span>
          </p>
        )}
        {adsList.length > 1 && (
          <div className="flex gap-1 mt-1.5">
            {adsList.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${idx === currentIdx ? "w-6 bg-orange-400" : "w-3 bg-white/30"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ========== الأزرار الجانبية ==========
  const Actions = () => (
    <div className="flex items-center gap-2 flex-shrink-0">
      {phones.map((phone, idx) => (
        <Link
          key={phone + idx}
          href={`tel:${phone}`}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-full p-2 transition-colors"
          title={phones.length > 1 ? `رقم ${idx + 1}` : "اتصل"}
        >
          <Phone size={isMobile ? 16 : 18} />
        </Link>
      ))}
      <Link
        href={currentAd.link}
        target="_blank"
        rel="nofollow sponsored"
        className="bg-orange-400/20 hover:bg-orange-400/30 text-yellow-300 rounded-full p-2 transition-colors"
        title="زيارة الرابط"
      >
        <ExternalLink size={isMobile ? 16 : 18} />
      </Link>
      <button
        onClick={() => handleClose(false)}
        className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full p-2 transition-colors"
        aria-label="إغلاق الإعلان"
      >
        <X size={isMobile ? 16 : 18} />
      </button>
    </div>
  );

  // ========== أزرار التنقل (سهمين) ==========
  const NavigationArrows = () =>
    adsList.length > 1 ? (
      <>
        <button
          onClick={() => handleManualNavigation(goToPrev)}
          className="bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
          aria-label="السابق"
        >
          <ChevronLeft size={isMobile ? 14 : 16} className="text-white/80" />
        </button>
        <button
          onClick={() => handleManualNavigation(goToNext)}
          className="bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
          aria-label="التالي"
        >
          <ChevronRight size={isMobile ? 14 : 16} className="text-white/80" />
        </button>
      </>
    ) : null;

  // ========== التصيير ==========
  if (position === "bottom-floating") {
    return (
      <div
        ref={bannerRef}
        className={`fixed left-0 right-0 z-[100] transition-all duration-700 ease-out ${isMobile ? "bottom-16" : "bottom-0"
          } ${showAd ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} ${className}`}
      >
        <div className="flex justify-center">
          <span className="bg-orange-400 text-black text-[10px] px-3 py-0.5 rounded-full font-bold mb-1 shadow-lg">
            إعلان
          </span>
        </div>

        <div className="mx-3 mb-3 sm:mx-5 sm:mb-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center gap-3">
          <NavigationArrows />
          <AdContent />
          <Actions />
        </div>
      </div>
    );
  }

  // top-inline
  return (
    <div
      className={`my-4 mx-3 sm:mx-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-yellow-400/30 rounded-2xl shadow-xl ${className}`}
    >
      <div className="flex justify-between items-center bg-orange-400/10 px-4 py-1">
        <span className="text-yellow-400 text-xs font-bold tracking-wider">إعلان</span>
        <button onClick={() => handleClose(false)} className="text-white/50 hover:text-white">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 flex flex-wrap items-center gap-3">
        <NavigationArrows />
        <AdContent />
        <Actions />
      </div>
    </div>
  );
}