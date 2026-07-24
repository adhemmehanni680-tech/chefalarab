"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import faviconIcon from "../../../../public/favicon.webp";

const NAV_LINKS = [
  { title: "الصفحة الرئيسية", href: "/" },
  { title: "الوصفات", href: "/recipes" },
  { title: "من نحن", href: "/about_us" },
  { title: "تواصل معنا", href: "/contact_us" },
  { title: "الأسئلة الشائعة", href: "/faq" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const lastScroll = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
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
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentScroll = Math.max(0, window.scrollY);
        const nextScrolled = currentScroll > 10;
        const nextHidden =
          currentScroll > lastScroll.current && currentScroll > 100;

        setIsScrolled((current) =>
          current === nextScrolled ? current : nextScrolled,
        );
        setHideHeader((current) =>
          current === nextHidden ? current : nextHidden,
        );

        lastScroll.current = currentScroll;
        ticking.current = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      const isDark = nextTheme === "dark";

      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
      localStorage.setItem("theme", nextTheme);

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

  const navBackground = isScrolled
    ? "bg-gray-900/95 shadow-[0_2px_14px_rgba(0,0,0,0.18)] backdrop-blur-md"
    : "bg-gray-900/85 backdrop-blur-sm";

  return (
    <nav
      id="site-header"
      role="navigation"
      aria-label="التنقل الرئيسي"
      className={`${navBackground} fixed left-0 top-0 z-[60] w-full border-b border-white/10 transition-[transform,background-color,box-shadow] duration-300 ${
        hideHeader && !isMenuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-2 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          <Image
            src={faviconIcon}
            alt="شعار شيف العرب"
            width={56}
            height={56}
            preload
            className="h-14 w-14 object-contain"
          />
          <span className="font-brand text-2xl font-bold leading-none text-white md:text-[32px]">
            شيف العرب
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <ul className="relative flex items-center gap-7 font-medium text-white">
            {NAV_LINKS.map((link) => {
              const active = isActiveLink(link.href);

              return (
                <li key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block px-2 py-2 text-sm font-bold transition-colors ${
                      active
                        ? "text-orange-400"
                        : "text-white hover:text-orange-400"
                    }`}
                  >
                    {link.title}
                    <span
                      className={`absolute inset-x-2 bottom-0 h-0.5 rounded bg-orange-400 transition-transform duration-200 ${
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
            className="hidden h-10 w-10 items-center justify-center rounded-full text-xl text-white transition hover:bg-white/10 md:flex"
            aria-label={
              theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"
            }
            title={
              theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"
            }
          >
            <span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-main-menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-white transition hover:bg-white/10 md:hidden"
          >
            <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-main-menu"
        className={`overflow-hidden border-t border-white/10 bg-gray-900 transition-[max-height,opacity] duration-300 md:hidden ${
          isMenuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="p-4">
          <button
            onClick={toggleTheme}
            type="button"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 font-bold text-white transition hover:bg-white/10"
            aria-label={
              theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"
            }
          >
            <span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
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
  );
}
