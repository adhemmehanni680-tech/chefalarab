"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  /** المسافة من الأعلى التي يظهر بعدها الزر */
  threshold?: number;

  /** المسافة من الأسفل */
  bottom?: string;

  /** المسافة من اليمين */
  right?: string;

  /** محدد عنصر الفوتر */
  footerSelector?: string;

  /** زر مخصص */
  customButton?: ReactNode;
}

export default function ScrollToTopButton({
  threshold = 400,
  bottom = "bottom-28",
  right = "right-6",
  footerSelector = "#site-footer",
  customButton,
}: ScrollToTopButtonProps) {
  const [passedThreshold, setPassedThreshold] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | إظهار الزر بعد تجاوز المسافة المحددة
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateScrollState = () => {
      setPassedThreshold(window.scrollY > threshold);
      animationFrameId = null;
    };

    const handleScroll = () => {
      if (animationFrameId !== null) return;

      animationFrameId = window.requestAnimationFrame(
        updateScrollState
      );
    };

    updateScrollState();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [threshold]);

  /*
  |--------------------------------------------------------------------------
  | إخفاء الزر عند ظهور الفوتر
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const footerElement =
      document.querySelector<HTMLElement>(footerSelector);

    if (!footerElement) {
      setFooterVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.01,
        /*
         * يبدأ إخفاء الزر قبل دخول الفوتر قليلًا،
         * حتى لا يظهر الزر فوق محتوى الفوتر.
         */
        rootMargin: "0px 0px 40px 0px",
      }
    );

    observer.observe(footerElement);

    return () => {
      observer.disconnect();
    };
  }, [footerSelector]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const shouldShow = passedThreshold && !footerVisible;

  if (!shouldShow) return null;

  if (customButton) {
    return (
      <div
        onClick={scrollToTop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            scrollToTop();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="العودة للأعلى"
        className={`fixed ${bottom} ${right} z-[9999] cursor-pointer`}
      >
        {customButton}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="العودة للأعلى"
      className={`
        fixed ${bottom} ${right} z-[9999]
        flex h-12 w-12 items-center justify-center
        rounded-full
        border border-white/20
        bg-orange-500
        text-white
        shadow-xl shadow-black/20
        transition duration-300
        hover:scale-110
        hover:bg-orange-600
        active:scale-95
        focus:outline-none
        focus-visible:ring-4
        focus-visible:ring-orange-300/60
      `}
    >
      <ArrowUp size={22} strokeWidth={2.4} />
    </button>
  );
}