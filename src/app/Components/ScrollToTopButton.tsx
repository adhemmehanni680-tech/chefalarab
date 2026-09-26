"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  threshold?: number;
  bottom?: string;
  right?: string;
  footerSelector?: string;
  customButton?: ReactNode;
}

function getScrollTop(): number {
  return Math.max(
    window.scrollY || 0,
    document.scrollingElement?.scrollTop || 0,
    document.documentElement.scrollTop || 0,
    document.body.scrollTop || 0,
  );
}

function setScrollTop(value: number): void {
  const scrollingElement =
    document.scrollingElement || document.documentElement;

  scrollingElement.scrollTop = value;
  document.documentElement.scrollTop = value;
  document.body.scrollTop = value;
}

export default function ScrollToTopButton({
  threshold = 400,
  bottom = "bottom-2",
  right = "right-6",
  footerSelector = "#site-footer",
  customButton,
}: ScrollToTopButtonProps) {
  const animationFrameRef = useRef<number | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);

  const [passedThreshold, setPassedThreshold] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      setPassedThreshold(getScrollTop() > threshold);
      animationFrameRef.current = null;
    };

    const handleScroll = () => {
      if (animationFrameRef.current !== null) return;

      animationFrameRef.current =
        window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, true);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [threshold]);

  useEffect(() => {
    const footerElement =
      document.querySelector<HTMLElement>(footerSelector);

    if (!footerElement || !("IntersectionObserver" in window)) {
      setFooterVisible(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      {
        root: null,
        threshold: 0.01,
        rootMargin: "0px 0px 40px 0px",
      },
    );

    observer.observe(footerElement);
    return () => observer.disconnect();
  }, [footerSelector]);

  useEffect(
    () => () => {
      if (scrollAnimationRef.current !== null) {
        window.cancelAnimationFrame(scrollAnimationRef.current);
      }
    },
    [],
  );

  const scrollToTop = useCallback(() => {
    if (scrollAnimationRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationRef.current);
    }

    const startPosition = getScrollTop();

    if (startPosition <= 0) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setScrollTop(0);
      window.scrollTo(0, 0);
      return;
    }

    const duration = Math.min(
      700,
      Math.max(300, startPosition * 0.28),
    );
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextPosition = Math.round(
        startPosition * (1 - easedProgress),
      );

      setScrollTop(nextPosition);

      if (progress < 1 && getScrollTop() > 0) {
        scrollAnimationRef.current =
          window.requestAnimationFrame(animateScroll);
        return;
      }

      setScrollTop(0);
      window.scrollTo(0, 0);
      scrollAnimationRef.current = null;
    };

    scrollAnimationRef.current =
      window.requestAnimationFrame(animateScroll);
  }, []);

  const handleCustomKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    scrollToTop();
  };

  const shouldShow = passedThreshold && !footerVisible;

  if (!shouldShow) return null;

  if (customButton) {
    return (
      <div
        onClick={scrollToTop}
        onKeyDown={handleCustomKeyDown}
        role="button"
        tabIndex={0}
        aria-label="العودة للأعلى"
        className={`fixed ${bottom} ${right} z-[9999] cursor-pointer touch-manipulation`}
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
      title="العودة للأعلى"
      className={`
        fixed ${bottom} ${right} z-[9999]
        flex h-14 w-14 touch-manipulation select-none
        items-center justify-center rounded-2xl
        border border-white/20 bg-orange-500 text-white
        shadow-xl shadow-black/20 transition duration-300
        hover:scale-110 hover:bg-orange-600 active:scale-95
        focus:outline-none focus-visible:ring-4
        focus-visible:ring-orange-300/60
      `}
      style={{
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
      }}
    >
      <ArrowUp size={24} strokeWidth={2.6} aria-hidden="true" />
    </button>
  );
}
