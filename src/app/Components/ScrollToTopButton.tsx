// app/Components/ScrollToTopButton.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  /** المسافة من الأعلى التي يظهر عندها الزر (بكسل) */
  threshold?: number;
  /** المسافة من الأسفل */
  bottom?: string;
  /** المسافة من اليمين */
  right?: string;
  /** زر مخصص */
  customButton?: React.ReactNode;
}

export default function ScrollToTopButton({
  threshold = 400,
  bottom = "bottom-4",
  right = "right-6",
  customButton,
}: ScrollToTopButtonProps) {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!showScroll) return null;

  if (customButton) {
    return <div onClick={scrollToTop}>{customButton}</div>;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${bottom} ${right} z-[9999] bg-lime-500 hover:bg-lime-600 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:scale-110`}
      aria-label="العودة للأعلى"
    >
      <ArrowUp size={22} />
    </button>
  );
}