"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { title: "الصفحة الرئيسية", href: "/" },
  { title: "الوصفات", href: "/recipes" },
  { title: "من نحن", href: "/about_us" },
  { title: "تواصل معنا", href: "/contact_us" },
  { title: "الأسئلة الشائعة", href: "/faq" },
  { title: "سياسة الخصوصية", href: "/privacy_policy" },
];

export default function Header() {
  const pathname = usePathname();
  const frameRef = useRef(null);
  const previousScrollYRef = useRef(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsHeaderVisible(true);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const updateScrollState = () => {
      frameRef.current = null;

      const currentScrollY = Math.max(window.scrollY, 0);
      const previousScrollY = previousScrollYRef.current;
      const scrollDifference = currentScrollY - previousScrollY;

      setIsScrolled(currentScrollY > 24);

      if (isMenuOpen || currentScrollY <= 12) {
        setIsHeaderVisible(true);
      } else if (scrollDifference > 5 && currentScrollY > 80) {
        setIsHeaderVisible(false);
      } else if (scrollDifference < -5) {
        setIsHeaderVisible(true);
      }

      previousScrollYRef.current = currentScrollY;
    };

    const handleScroll = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateScrollState);
    };

    previousScrollYRef.current = Math.max(window.scrollY, 0);
    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isMenuOpen]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      const isDark = nextTheme === "dark";

      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";

      try {
        localStorage.setItem("theme", nextTheme);
      } catch {
        // The theme still works for the current session if storage is unavailable.
      }

      return nextTheme;
    });
  }, []);

  const isActiveLink = useCallback(
    (href) => {
      if (!pathname) return false;
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  return (
    <>
      <header
        id="site-header"
        className={`fixed inset-x-0 top-0 z-[100] w-full border-b transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out ${
          isHeaderVisible
            ? "translate-y-0"
            : "pointer-events-none -translate-y-full"
        } ${
          isScrolled
            ? "border-orange-500/15 bg-gray-950/90 shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            : "border-white/10 bg-gray-900/95 shadow-[0_2px_14px_rgba(0,0,0,0.18)] backdrop-blur-md"
        }`}
      >
        <nav aria-label="التنقل الرئيسي">
          <div
            className={`mx-auto flex max-w-screen-xl items-center justify-between px-3 transition-[padding] duration-300 sm:px-4 ${
              isScrolled ? "py-1" : "py-2"
            }`}
          >
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              aria-label="العودة إلى الصفحة الرئيسية"
            >
              <Image
                src="/favicon.webp"
                alt="شعار شيف العرب"
                width={56}
                height={56}
                priority
                sizes="(max-width: 767px) 48px, 56px"
                className={`object-contain transition-[width,height,transform] duration-300 ${
                  isScrolled ? "h-11 w-11" : "h-14 w-14"
                }`}
              />

              <span
                className={`font-brand font-bold leading-none text-white transition-[font-size] duration-300 ${
                  isScrolled ? "text-xl md:text-2xl" : "text-2xl md:text-[32px]"
                }`}
              >
                شيف العرب
              </span>
            </Link>

            <div className="hidden flex-1 items-center justify-center md:flex">
              <ul className="relative flex items-center gap-4 font-medium text-white lg:gap-7">
                {NAV_LINKS.map((link) => {
                  const active = isActiveLink(link.href);

                  return (
                    <li key={link.href} className="group relative">
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`relative block rounded-lg px-2 py-2 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-400 ${
                          active
                            ? "text-orange-400"
                            : "text-white hover:text-orange-400"
                        }`}
                      >
                        {link.title}
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-2 bottom-0 h-0.5 origin-center rounded-full bg-orange-400 transition-transform duration-200 ${
                            active
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="hidden h-10 w-10 items-center justify-center rounded-full text-xl text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-orange-400 md:flex"
                aria-label={
                  theme === "light"
                    ? "تفعيل الوضع الليلي"
                    : "تفعيل الوضع النهاري"
                }
                title={
                  theme === "light"
                    ? "تفعيل الوضع الليلي"
                    : "تفعيل الوضع النهاري"
                }
              >
                <span aria-hidden="true">
                  {theme === "light" ? "🌙" : "☀️"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-main-menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-orange-400 md:hidden"
              >
                <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
              </button>
            </div>
          </div>

          <div
            id="mobile-main-menu"
            className={`overflow-hidden border-t bg-gray-950/95 backdrop-blur-xl transition-[max-height,opacity,border-color] duration-300 md:hidden ${
              isMenuOpen
                ? "max-h-[520px] border-white/10 opacity-100"
                : "max-h-0 border-transparent opacity-0"
            }`}
            aria-hidden={!isMenuOpen}
          >
            <div className="p-4">
              <button
                onClick={toggleTheme}
                type="button"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 font-bold text-white transition hover:bg-white/10"
                aria-label={
                  theme === "light"
                    ? "تفعيل الوضع الليلي"
                    : "تفعيل الوضع النهاري"
                }
              >
                <span aria-hidden="true">
                  {theme === "light" ? "🌙" : "☀️"}
                </span>
                {theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
              </button>

              <ul className="space-y-1 text-center font-bold text-white">
                {NAV_LINKS.map((link) => {
                  const active = isActiveLink(link.href);

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-xl px-3 py-2.5 transition ${
                          active
                            ? "bg-orange-500 text-white"
                            : "hover:bg-white/10 hover:text-orange-400"
                        }`}
                      >
                        {link.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div
        aria-hidden="true"
        className="h-[72px] w-full shrink-0"
      />
    </>
  );
}
