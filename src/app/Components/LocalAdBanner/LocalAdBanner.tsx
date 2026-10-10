"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone,
  X,
} from "lucide-react";

/* ===============================
   Types
================================ */

interface AdItem {
  id: string | number;
  imageSrc?: string;
  link: string;
  altText: string;
  phone?: string | string[];
  description?: string;
  address?: string;
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

/* ===============================
   Default Settings
================================ */

const DEFAULTS = {
  enabled: true,
  position: "bottom-floating" as const,
  initialDelay: 3000,
  reappearAfterClose: 1_800_000, // 30 دقيقة
  autoCloseDelay: 900_000, // 15 دقيقة

  adsList: [
    {
      id: 1,
      imageSrc: "/ads/youssef-Z.webp",
      link: "",
      altText: "Ozeed",
      phone: ["+201111157067", "+201150051351"],
      description:
        "دلوقتي مع Ozeed تقدر تقدم على وظائف حكومية وخدمات دفع فواتير وشحن باقات وتحويل كاش وكمان تنسيق ثانوي والمعاهد والكليات وتحديث بطاقة التموين وغيرها من الخدمات الحكومية. زورونا في أقرب فرع ليكم!",
      address: "مصر، المنيا، مغاغة — شارع العبور بجوار حزب مستقبل وطن",
    },
    {
      id: 2,
      imageSrc: "/ads/qasr-alsiyramik.webp",
      link: "",
      altText: "قصر السراميك",
      phone: ["+201150500288", "+201010515400"],
      description:
        "مع قصر السراميك، جدد منزلك بأحدث التصاميم وأفضل الأسعار. اكتشف تشكيلتنا الواسعة من السيراميك والبورسلين المستورد والمحلي والباركيه وأطقم الحمامات والإكسسوارات.",
      address:
        "مصر، المنيا، العدوة — شارع مصطفى كامل بجوار جامع الحاج عدوي",
    },
    {
      id: 3,
      imageSrc: "/ads/elmaher.webp",
      link: "https://www.facebook.com/share/1BZYsQV38t/",
      altText: "الماهر",
      phone: ["+201155416650", "+201037472085"],
      description:
        "فواكه وخضروات طازجة يوميًا من الماهر، مع خدمة توصيل سريعة على مدار 24 ساعة. زورونا واستمتعوا بأفضل جودة وأفضل الأسعار.",
      address: "مصر، المنيا، مغاغة — مول باريس",
    },
    {
      id: 4,
      imageSrc: "/ads/lavender.webp",
      link: "",
      altText: "لافندر",
      phone: ["+201201928497"],
      description:
        "لافندر قاعة وسيشن وكافيه للشباب والعائلات، بالإضافة إلى حمام سباحة للأطفال.",
      address:
        "مصر، المنيا، مغاغة — أول دائري ميانة بجوار معرض السيارات",
    },
  ] satisfies AdItem[],
};

/* ===============================
   Component
================================ */

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
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [failedImageId, setFailedImageId] = useState<
    string | number | null
  >(null);

  const bannerRef = useRef<HTMLDivElement>(null);

  const reappearTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const rotationTimer = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const currentAd = adsList[currentIdx] ?? adsList[0];

  const phones = useMemo<string[]>(() => {
    if (!currentAd?.phone) {
      return [];
    }

    return typeof currentAd.phone === "string"
      ? [currentAd.phone]
      : currentAd.phone;
  }, [currentAd]);

  const hasExternalLink = Boolean(currentAd?.link?.trim());

  /* ===============================
     Keep Index Valid
  ================================ */

  useEffect(() => {
    if (adsList.length === 0) {
      setCurrentIdx(0);
      return;
    }

    if (currentIdx >= adsList.length) {
      setCurrentIdx(0);
    }
  }, [adsList.length, currentIdx]);

  /* ===============================
     Initial Appearance
  ================================ */

  useEffect(() => {
    if (!enabled || adsList.length === 0 || isDismissed) {
      return;
    }

    const initialTimer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * adsList.length);

      setCurrentIdx(randomIndex);
      setShowAd(true);
    }, Math.max(0, initialDelay));

    return () => {
      clearTimeout(initialTimer);
    };
  }, [adsList.length, enabled, initialDelay, isDismissed]);

  /* ===============================
     Navigation
  ================================ */

  const goToPrev = useCallback(() => {
    if (adsList.length <= 1) {
      return;
    }

    setCurrentIdx((previousIndex) => {
      return (
        (previousIndex - 1 + adsList.length) %
        adsList.length
      );
    });
  }, [adsList.length]);

  const goToNext = useCallback(() => {
    if (adsList.length <= 1) {
      return;
    }

    setCurrentIdx((previousIndex) => {
      return (previousIndex + 1) % adsList.length;
    });
  }, [adsList.length]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= adsList.length) {
        return;
      }

      setCurrentIdx(index);
    },
    [adsList.length],
  );

  /* ===============================
     Automatic Rotation
  ================================ */

  const stopRotation = useCallback(() => {
    if (rotationTimer.current) {
      clearInterval(rotationTimer.current);
      rotationTimer.current = null;
    }
  }, []);

  const startRotation = useCallback(() => {
    stopRotation();

    if (adsList.length <= 1) {
      return;
    }

    rotationTimer.current = setInterval(() => {
      goToNext();
    }, 10_000);
  }, [adsList.length, goToNext, stopRotation]);

  useEffect(() => {
    if (showAd && !isNearFooter) {
      startRotation();
    } else {
      stopRotation();
    }

    return stopRotation;
  }, [
    isNearFooter,
    showAd,
    startRotation,
    stopRotation,
  ]);

  const handleManualNavigation = useCallback(
    (navigationFunction: () => void) => {
      navigationFunction();
      startRotation();
    },
    [startRotation],
  );

  const handleIndicatorClick = useCallback(
    (index: number) => {
      goToIndex(index);
      startRotation();
    },
    [goToIndex, startRotation],
  );

  /* ===============================
     Close Advertisement
  ================================ */

  const handleClose = useCallback(
    (remember = false) => {
      setShowAd(false);
      setIsNearFooter(false);

      stopRotation();

      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
        autoCloseTimer.current = null;
      }

      if (reappearTimer.current) {
        clearTimeout(reappearTimer.current);
        reappearTimer.current = null;
      }

      if (remember) {
        setIsDismissed(true);
        return;
      }

      if (!enabled || adsList.length === 0) {
        return;
      }

      reappearTimer.current = setTimeout(() => {
        setCurrentIdx((previousIndex) => {
          return (previousIndex + 1) % adsList.length;
        });

        setShowAd(true);
      }, Math.max(0, reappearAfterClose));
    },
    [
      adsList.length,
      enabled,
      reappearAfterClose,
      stopRotation,
    ],
  );

  /* ===============================
     Automatic Close
  ================================ */

  useEffect(() => {
    if (!showAd || autoCloseDelay <= 0) {
      return;
    }

    autoCloseTimer.current = setTimeout(() => {
      handleClose(false);
    }, autoCloseDelay);

    return () => {
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
        autoCloseTimer.current = null;
      }
    };
  }, [autoCloseDelay, handleClose, showAd]);

  /* ===============================
     Hide Before Footer
  ================================ */

  useEffect(() => {
    if (position !== "bottom-floating" || !showAd) {
      setIsNearFooter(false);
      return;
    }

    let footerObserver: IntersectionObserver | null = null;
    let pageObserver: MutationObserver | null = null;

    const startFooterObserver = () => {
      const footer = document.querySelector<HTMLElement>(
        "#site-footer, footer",
      );

      if (!footer) {
        return false;
      }

      footerObserver = new IntersectionObserver(
        ([entry]) => {
          setIsNearFooter(entry.isIntersecting);
        },
        {
          root: null,
          threshold: 0,
          /*
           * يجعل الإعلان يختفي قبل ظهور الفوتر بمسافة بسيطة،
           * حتى لا يحدث أي تداخل بصري بينهما.
           */
          rootMargin: "0px 0px 32px 0px",
        },
      );

      footerObserver.observe(footer);

      return true;
    };

    const footerFound = startFooterObserver();

    /*
     * في حالة تحميل الفوتر بعد الكومبوننت،
     * ننتظر ظهوره ثم نبدأ المراقبة.
     */
    if (!footerFound) {
      pageObserver = new MutationObserver(() => {
        if (startFooterObserver()) {
          pageObserver?.disconnect();
          pageObserver = null;
        }
      });

      pageObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      footerObserver?.disconnect();
      pageObserver?.disconnect();
    };
  }, [position, showAd]);

  /* ===============================
     Final Cleanup
  ================================ */

  useEffect(() => {
    return () => {
      if (reappearTimer.current) {
        clearTimeout(reappearTimer.current);
      }

      if (rotationTimer.current) {
        clearInterval(rotationTimer.current);
      }

      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    };
  }, []);

  if (
    !enabled ||
    !showAd ||
    !currentAd ||
    adsList.length === 0
  ) {
    return null;
  }

  /* ===============================
     Advertisement Image
  ================================ */

  const AdvertisementImage = () => {
    const imageSource =
      failedImageId === currentAd.id
        ? "/favicon.webp"
        : currentAd.imageSrc || "/favicon.webp";

    const imageElement = (
      <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-lg sm:h-24 sm:w-24">
        <Image
          src={imageSource}
          alt={currentAd.altText}
          fill
          sizes="(max-width: 640px) 80px, 96px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setFailedImageId(currentAd.id)}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />
      </div>
    );

    if (!hasExternalLink) {
      return (
        <div className="group shrink-0">
          {imageElement}
        </div>
      );
    }

    return (
      <Link
        href={currentAd.link}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="group shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
        aria-label={`زيارة إعلان ${currentAd.altText}`}
      >
        {imageElement}
      </Link>
    );
  };

  /* ===============================
     Advertisement Content
  ================================ */

  const AdvertisementContent = () => (
    <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
      <AdvertisementImage />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-black text-white sm:text-xl">
            {currentAd.altText}
          </h2>

          <span className="hidden rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-0.5 text-[10px] font-bold text-orange-300 sm:inline-flex">
            موصى به
          </span>
        </div>

        {currentAd.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300 sm:line-clamp-3 sm:text-sm sm:leading-6">
            {currentAd.description}
          </p>
        )}

        {currentAd.address && (
          <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-slate-400 sm:text-xs">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400" />

            <span className="line-clamp-2 text-slate-300">
              {currentAd.address}
            </span>
          </div>
        )}

        {adsList.length > 1 && (
          <div
            className="mt-3 flex items-center gap-1.5"
            aria-label="اختيار الإعلان"
          >
            {adsList.map((ad, index) => {
              const isActive = index === currentIdx;

              return (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => handleIndicatorClick(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-7 bg-orange-400"
                      : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`عرض الإعلان ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* ===============================
     Navigation Buttons
  ================================ */

  const NavigationArrows = () => {
    if (adsList.length <= 1) {
      return null;
    }

    return (
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1">
        <button
          type="button"
          onClick={() => handleManualNavigation(goToPrev)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          aria-label="الإعلان السابق"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => handleManualNavigation(goToNext)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          aria-label="الإعلان التالي"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    );
  };

  /* ===============================
     Action Buttons
  ================================ */

  const Actions = () => (
    <div className="flex flex-wrap items-center gap-2">
      {phones.map((phone, index) => (
        <Link
          key={`${phone}-${index}`}
          href={`tel:${phone}`}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 text-xs font-bold text-emerald-300 transition-all hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-400/20 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          title={
            phones.length > 1
              ? `اتصال بالرقم ${index + 1}`
              : "اتصال"
          }
          aria-label={
            phones.length > 1
              ? `اتصال بالرقم ${index + 1}`
              : "اتصال"
          }
        >
          <Phone className="h-4 w-4" />

          <span className="hidden sm:inline">
            {phones.length > 1
              ? `اتصال ${index + 1}`
              : "اتصال"}
          </span>
        </Link>
      ))}

      {hasExternalLink && (
        <Link
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 text-xs font-bold text-orange-300 transition-all hover:-translate-y-0.5 hover:border-orange-400/40 hover:bg-orange-400/20 hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          aria-label={`زيارة رابط ${currentAd.altText}`}
        >
          <ExternalLink className="h-4 w-4" />

          <span className="hidden sm:inline">
            زيارة
          </span>
        </Link>
      )}

      <button
        type="button"
        onClick={() => handleClose(false)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="إغلاق الإعلان مؤقتًا"
        title="إغلاق الإعلان"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  /* ===============================
     Floating Advertisement
  ================================ */

  if (position === "bottom-floating") {
    return (
      <div
        ref={bannerRef}
        dir="rtl"
        aria-hidden={isNearFooter}
        className={`pointer-events-none fixed inset-x-0 bottom-3 z-[100] px-3 transition-all duration-500 ease-out sm:bottom-4 sm:px-5 ${
          isNearFooter
            ? "translate-y-[calc(100%+2rem)] opacity-0"
            : "translate-y-0 opacity-100"
        } ${className}`}
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-2 flex justify-center">
            <span className="rounded-full border border-orange-300/30 bg-orange-400 px-3 py-1 text-[10px] font-black text-slate-950 shadow-lg shadow-orange-500/20">
              إعلان ممول
            </span>
          </div>

          <div
            className="pointer-events-auto relative overflow-hidden rounded-[26px] border border-white/15 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 shadow-[0_24px_80px_-20px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
            onMouseEnter={stopRotation}
            onMouseLeave={startRotation}
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="h-1 w-full bg-gradient-to-l from-transparent via-orange-400 to-transparent" />

            <div className="relative flex flex-col gap-3 p-3 sm:p-4">
              <AdvertisementContent />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                <NavigationArrows />
                <Actions />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     Inline Advertisement
  ================================ */

  return (
    <div
      dir="rtl"
      className={`relative my-5 overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-xl dark:border-white/10 ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2">
        <span className="text-[11px] font-black tracking-wide text-orange-300">
          إعلان ممول
        </span>

        <button
          type="button"
          onClick={() => handleClose(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          aria-label="إغلاق الإعلان"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative flex flex-col gap-4 p-4">
        <AdvertisementContent />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <NavigationArrows />
          <Actions />
        </div>
      </div>
    </div>
  );
}