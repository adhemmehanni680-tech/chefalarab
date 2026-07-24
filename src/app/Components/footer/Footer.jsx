"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import faviconIcon from "../../../../public/favicon.webp";

const FOOTER_GROUPS = [
  {
    id: "siteLinks",
    title: "روابط الموقع",
    links: [
      { title: "الرئيسية", href: "/" },
      { title: "الوصفات", href: "/recipes" },
      { title: "خريطة الموقع", href: "/sitemap.xml", external: true },
    ],
  },
  {
    id: "supportLinks",
    title: "الدعم والتواصل",
    links: [
      { title: "من نحن", href: "/about_us" },
      { title: "تواصل معنا", href: "/contact_us" },
      { title: "الأسئلة الشائعة", href: "/faq" },
    ],
  },
  {
    id: "legalLinks",
    title: "السياسات القانونية",
    links: [
      { title: "سياسة الخصوصية", href: "/privacy_policy" },
      { title: "سياسة الكوكيز", href: "/cookie_policy" },
      { title: "الشروط والأحكام", href: "/terms_conditions" },
    ],
    consent: true,
  },
];

export default function Footer() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState({
    siteLinks: false,
    supportLinks: false,
    legalLinks: false,
  });

  const isActiveLink = useCallback(
    (href) => {
      if (!pathname) return false;
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  const toggleSection = useCallback((section) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }, []);

  const renderLink = (link) => {
    const active = isActiveLink(link.href);
    const className = `transition-colors ${
      active ? "font-semibold text-orange-400" : "hover:text-orange-400"
    }`;

    if (link.external) {
      return (
        <a href={link.href} className={className}>
          {link.title}
        </a>
      );
    }

    return (
      <Link
        href={link.href}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {link.title}
      </Link>
    );
  };

  return (
    <footer id="site-footer" className="mt-10 w-full bg-gray-900 text-white">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-8 sm:flex-row sm:items-start sm:justify-between lg:py-10">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={faviconIcon}
              alt="شعار شيف العرب"
              width={60}
              height={60}
              loading="lazy"
              className="h-16 w-16 object-contain"
            />
            <span className="font-brand text-2xl font-bold">شيف العرب</span>
          </Link>
        </div>

        <div className="hidden grid-cols-3 gap-8 sm:grid">
          {FOOTER_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`footer-${group.id}`}>
              <h2
                id={`footer-${group.id}`}
                className="mb-4 text-sm font-semibold text-white"
              >
                {group.title}
              </h2>
              <ul className="space-y-2 font-medium text-gray-400">
                {group.links.map((link) => (
                  <li key={link.href}>{renderLink(link)}</li>
                ))}
                {group.consent && (
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new Event("open-consent-manager"))
                      }
                      className="text-right transition-colors hover:text-orange-400"
                    >
                      إدارة الموافقة على الكوكيز
                    </button>
                  </li>
                )}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3 sm:hidden">
          {FOOTER_GROUPS.map((group) => {
            const isOpen = Boolean(openSections[group.id]);
            const panelId = `footer-mobile-${group.id}`;

            return (
              <section key={group.id} className="border-b border-white/10 pb-3">
                <button
                  type="button"
                  onClick={() => toggleSection(group.id)}
                  className="flex w-full items-center justify-between text-lg font-semibold text-white"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  {group.title}
                  <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>

                <div
                  id={panelId}
                  className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
                    isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="mt-2 space-y-2 font-medium text-gray-400">
                    {group.links.map((link) => (
                      <li key={link.href}>{renderLink(link)}</li>
                    ))}
                    {group.consent && (
                      <li>
                        <button
                          type="button"
                          onClick={() =>
                            window.dispatchEvent(
                              new Event("open-consent-manager"),
                            )
                          }
                          className="text-right transition-colors hover:text-orange-400"
                        >
                          إدارة الموافقة على الكوكيز
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <span className="text-xs text-gray-400">
            © {new Date().getFullYear()} شيف العرب™ — جميع الحقوق محفوظة.
          </span>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/201107232016?text=مرحبا_بكم_فى_شيف_العرب"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition hover:scale-110 hover:text-green-500"
              aria-label="التواصل عبر واتساب"
              title="واتساب"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M.057 24l1.687-6.163a11.946 11.946 0 01-1.63-6.012C.114 5.305 5.48 0 12.006 0c3.2 0 6.194 1.247 8.453 3.507a11.904 11.904 0 013.513 8.493c-.003 6.526-5.379 11.891-12.006 11.891a11.954 11.954 0 01-6.936-2.55L.057 24zm6.597-3.807c1.09.323 2.24.497 3.436.497 5.406 0 9.795-4.392 9.798-9.802.003-2.62-1.02-5.082-2.878-6.935C14.2 2.02 11.736 1 9.12 1 4.72 1 .33 5.392.327 10.801c0 2.486 1.036 4.835 2.875 6.581l-.63 2.31 4.082-1.699zM17.73 14.91c-.29-.145-1.718-.846-1.986-.94-.267-.093-.46-.145-.654.146-.194.29-.75.94-.918 1.13-.17.194-.338.218-.628.073-.29-.145-1.223-.451-2.33-1.44-.861-.766-1.44-1.713-1.61-2.003-.17-.29-.018-.447.127-.592.13-.13.29-.338.435-.507.145-.17.194-.29.29-.483.097-.194.048-.364-.024-.507-.072-.145-.654-1.58-.896-2.164-.236-.567-.476-.49-.654-.5l-.558-.01c-.194 0-.507.073-.773.364s-1.014.991-1.014 2.415c0 1.423 1.038 2.797 1.183 2.991.145.194 2.04 3.12 4.938 4.377.69.297 1.228.474 1.647.607.692.22 1.323.19 1.822.115.556-.085 1.718-.7 1.958-1.38.24-.681.24-1.264.17-1.38-.072-.114-.263-.19-.553-.335z" />
              </svg>
            </a>

            <a
              href="mailto:chefalarabonline@gmail.com"
              className="text-gray-400 transition hover:scale-110 hover:text-orange-500"
              aria-label="التواصل عبر البريد الإلكتروني"
              title="البريد الإلكتروني"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 12.713l-11.714-7.713h23.428l-11.714 7.713zm-12-8.713v16h24v-16h-24zm22 2.667v.553l-10 6.586-10-6.586v-.553h20z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
