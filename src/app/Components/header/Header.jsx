// Header.jsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import favicon_icon from "../../../../public/favicon.webp";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScroll = useRef(0);
  const ticking = useRef(false);
  const [hideHeader, setHideHeader] = useState(false);

  /* ------------------------------- Theme + Scroll ------------------------------- */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const autoTheme = prefersDark ? "dark" : "light";
      setTheme(autoTheme);
      document.documentElement.classList.toggle("dark", autoTheme === "dark");
    }

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const current = window.scrollY;
        setHideHeader(current > lastScroll.current && current > 80);
        setIsScrolled(current > 10);
        lastScroll.current = current;
        ticking.current = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  /* ------------------------------- Nav Background ------------------------------- */
  const navBg =
    isScrolled
      ? "bg-gray-900/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
      : "bg-gray-900/80";

  const links = [
    { title: "الصفحة الرئيسية", href: "/" },
    { title: "من نحن", href: "/about_us" },
    { title: "تواصل معنا", href: "/contact_us" },
    { title: "الوصفات", href: "/recipes" },
    { title: "الاسئلة الشائعة", href: "/faq" },
  ];

  const isActiveLink = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      role="navigation"
      aria-label="التنقل الرئيسي"
      className={`${navBg} fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-800
      transition-all duration-500 transform ${hideHeader ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
            aria-label="العودة للصفحة الرئيسية"
          >
            <Image
              src={favicon_icon}
              alt="Chefalarab Logo"
              width={64}
              height={64}
              priority
              loading="eager"
              className="h-16 w-16"
            />
            <span className="font-brand text-3xl md:text-[34px] font-bold text-white leading-none">شيف العرب</span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center flex-1 justify-center">
          <ul className="flex space-x-8 rtl:space-x-reverse font-medium text-white relative">
            {links.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <li key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-2 py-1 transition-all duration-300 ${
                      isActive
                        ? "text-orange-400 font-semibold drop-shadow-lg scale-105"
                        : "text-white hover:text-orange-400 hover:scale-105"
                    }`}
                  >
                    {link.title}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-orange-400 rounded transition-all duration-300 ${
                        isActive
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="hidden md:flex items-center justify-center mr-4 md:mr-8 w-10 h-10 rounded-full text-xl transition-transform hover:scale-110"
          aria-label="تبديل الوضع الليلي"
        >
         <div className="flex items-center justify-center w-full h-full transition-transform duration-300">
  {theme === "light" ? "🌙" : "☀️"}
</div>
        </button>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="فتح وإغلاق القائمة"
          className="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="p-4 flex flex-col space-y-3">
            {/* Mobile Theme Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="text-gray-700 dark:text-yellow-300 hover:text-orange-500 transition-all duration-500 text-xl w-full text-right"
              aria-label="تبديل الوضع الليلي"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Mobile Links */}
            <ul className="flex flex-col space-y-2 text-gray-900 dark:text-white font-medium mt-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActiveLink(link.href) ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}