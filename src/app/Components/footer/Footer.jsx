// Footer
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import favicon_icon from "../../../../public/favicon.webp";

export default function Footer() {
  const pathname = usePathname();

  const links = [
    { title: "الرئيسية", href: "/" },
    { title: "الوصفات", href: "/recipe" },
    { title: "من نحن", href: "/about_us" },
    { title: "تواصل معنا", href: "/contact_us" },
    { title: "سياسة الخصوصية", href: "/privacy_policy" },
    { title: "سياسة الكوكيز", href: "/cookie_policy" },
    { title: "الشروط والأحكام", href: "/terms_conditions" },
    { title: "الأسئلة الشائعة", href: "/faq" },
    { title: "خريطة الموقع", href: "/sitemap.xml", external: true },
  ];

  const isActiveLink = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const renderLink = (link) => {
    const active = isActiveLink(link.href);
    const commonClass = `transition-colors ${active ? "text-orange-400 font-semibold" : "hover:text-orange-400"}`;

    if (link.external) {
      return (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={commonClass}
        >
          {link.title}
        </a>
      );
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        className={commonClass}
        aria-current={active ? "page" : undefined}
      >
        {link.title}
      </Link>
    );
  };

  // ✅ إدارة collapse لكل قسم على الموبايل
  const [openSections, setOpenSections] = useState({
    siteLinks: false,
    supportLinks: false,
    legalLinks: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-900 w-full mt-10">
      <div className="max-w-screen-xl mx-auto px-4 py-8 lg:py-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8">
        {/* شعار الموقع */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <Image
              src={favicon_icon}
              alt="Chefalarab Logo"
              width={60}
              height={60}
              className="h-16 w-16"
              priority
            />
            <span className="text-2xl font-bold text-white">شيف العرب</span>
          </Link>
        </div>

        {/* روابط الفوتر */}
        <div className="w-full sm:w-auto">
          {/* Desktop Grid */}
          <div className="hidden sm:grid grid-cols-3 gap-8">
            {/* روابط الموقع */}
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase text-white">روابط الموقع</h2>
              <ul className="text-gray-400 font-medium space-y-2">
                {links.filter((l) => ["الرئيسية", "الوصفات", "خريطة الموقع"].includes(l.title))
                  .map((link) => <li key={link.href}>{renderLink(link)}</li>)}
              </ul>
            </div>

            {/* الدعم والتواصل */}
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase text-white">الدعم والتواصل</h2>
              <ul className="text-gray-400 font-medium space-y-2">
                {links.filter((l) => ["من نحن", "تواصل معنا","الأسئلة الشائعة"].includes(l.title))
                  .map((link) => <li key={link.href}>{renderLink(link)}</li>)}
              </ul>
            </div>

            {/* سياسات قانونية */}
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase text-white">سياسات قانونية</h2>
              <ul className="text-gray-400 font-medium space-y-2">
                {links.filter((l) => ["سياسة الخصوصية", "سياسة الكوكيز", "الشروط والأحكام"].includes(l.title))
                  .map((link) => <li key={link.href}>{renderLink(link)}</li>)}
                <li>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event("open-consent-manager"))}
                    className="hover:text-orange-400 transition-colors text-right"
                  >
                    إدارة الموافقة على الكوكيز
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Collapse */}
          <div className="sm:hidden flex flex-col gap-3">
            {/* روابط الموقع */}
            <div>
              <button
                onClick={() => toggleSection("siteLinks")}
                className="w-full flex justify-between items-center text-white font-semibold text-lg"
              >
                روابط الموقع
                <span>{openSections.siteLinks ? "−" : "+"}</span>
              </button>
              {openSections.siteLinks && (
                <ul className="mt-2 text-gray-400 font-medium space-y-2">
                  {links.filter((l) => ["الرئيسية", "الوصفات", "خريطة الموقع"].includes(l.title))
                    .map((link) => <li key={link.href}>{renderLink(link)}</li>)}
                </ul>
              )}
            </div>

            {/* الدعم والتواصل */}
            <div>
              <button
                onClick={() => toggleSection("supportLinks")}
                className="w-full flex justify-between items-center text-white font-semibold text-lg"
              >
                الدعم والتواصل
                <span>{openSections.supportLinks ? "−" : "+"}</span>
              </button>
              {openSections.supportLinks && (
                <ul className="mt-2 text-gray-400 font-medium space-y-2">
                  {links.filter((l) => ["من نحن", "تواصل معنا","الأسئلة الشائعة"].includes(l.title))
                    .map((link) => <li key={link.href}>{renderLink(link)}</li>)}
                </ul>
              )}
            </div>

            {/* سياسات قانونية */}
            <div>
              <button
                onClick={() => toggleSection("legalLinks")}
                className="w-full flex justify-between items-center text-white font-semibold text-lg"
              >
                السياسات القانونية
                <span>{openSections.legalLinks ? "−" : "+"}</span>
              </button>
              {openSections.legalLinks && (
                <ul className="mt-2 text-gray-400 font-medium space-y-2">
                  {links.filter((l) => ["سياسة الخصوصية", "سياسة الكوكيز", "الشروط والأحكام"].includes(l.title))
                    .map((link) => <li key={link.href}>{renderLink(link)}</li>)}
                  <li>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new Event("open-consent-manager"))}
                      className="hover:text-orange-400 transition-colors text-right"
                    >
                      إدارة الموافقة على الكوكيز
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />

      <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <span className="text-xs text-gray-400 sm:text-left">
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="hover:text-orange-400">
            شيف العرب™
          </Link>{" "}
          — جميع الحقوق محفوظة.
        </span>

        <div className="flex gap-4">
          {/* WhatsApp */}
          <Link
            href="https://wa.me/201107232016?text=مرحبا_بكم_فى_شيف_العرب"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-500 transition-colors transform hover:scale-110"
            aria-label="WhatsApp"
            title="واتساب"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163a11.946 11.946 0 01-1.63-6.012C.114 5.305 5.48 0 12.006 0c3.2 0 6.194 1.247 8.453 3.507a11.904 11.904 0 013.513 8.493c-.003 6.526-5.379 11.891-12.006 11.891a11.954 11.954 0 01-6.936-2.55L.057 24zm6.597-3.807c1.09.323 2.24.497 3.436.497 5.406 0 9.795-4.392 9.798-9.802.003-2.62-1.02-5.082-2.878-6.935C14.2 2.02 11.736 1 9.12 1 4.72 1 .33 5.392.327 10.801c0 2.486 1.036 4.835 2.875 6.581l-.63 2.31 4.082-1.699zM17.73 14.91c-.29-.145-1.718-.846-1.986-.94-.267-.093-.46-.145-.654.146-.194.29-.75.94-.918 1.13-.17.194-.338.218-.628.073-.29-.145-1.223-.451-2.33-1.44-.861-.766-1.44-1.713-1.61-2.003-.17-.29-.018-.447.127-.592.13-.13.29-.338.435-.507.145-.17.194-.29.29-.483.097-.194.048-.364-.024-.507-.072-.145-.654-1.58-.896-2.164-.236-.567-.476-.49-.654-.5l-.558-.01c-.194 0-.507.073-.773.364s-1.014.991-1.014 2.415c0 1.423 1.038 2.797 1.183 2.991.145.194 2.04 3.12 4.938 4.377.69.297 1.228.474 1.647.607.692.22 1.323.19 1.822.115.556-.085 1.718-.7 1.958-1.38.24-.681.24-1.264.17-1.38-.072-.114-.263-.19-.553-.335z"/>
            </svg>
          </Link>

          {/* Email */}
          <Link
            href="mailto:chefalarabonline@gmail.com"
            className="text-gray-400 hover:text-orange-500 transition-colors transform hover:scale-110"
            aria-label="Email"
            title="بريد إلكتروني"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12.713l-11.714-7.713h23.428l-11.714 7.713zm-12-8.713v16h24v-16h-24zm22 2.667v.553l-10 6.586-10-6.586v-.553h20z"/>
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
