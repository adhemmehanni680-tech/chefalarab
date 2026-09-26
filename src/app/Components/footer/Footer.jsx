"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConsentSettingsButton from "../ConsentSettingsButton";

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

function isActivePath(pathname, href) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";

  // صفحة تفاصيل أي وصفة تتبع قسم الوصفات في الفوتر.
  if (href === "/recipes" && pathname.startsWith("/recipe/")) return true;

  return pathname === href || pathname.startsWith(`${href}/`);
}

function FooterLink({ link, pathname }) {
  const active = isActivePath(pathname, link.href);
  const className = `relative inline-flex rounded-lg border-r-2 px-2.5 py-1.5 outline-none transition-[color,background-color,border-color] duration-200 focus-visible:ring-2 focus-visible:ring-orange-400 ${
    active
      ? "border-orange-400 bg-orange-500/10 font-bold text-orange-300"
      : "border-transparent text-gray-400 hover:border-orange-400/40 hover:bg-white/[0.04] hover:text-orange-400"
  }`;

  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        aria-current={active ? "page" : undefined}
      >
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
}

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer id="site-footer" className="mt-10 w-full bg-gray-900 text-white">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-8 sm:flex-row sm:items-start sm:justify-between lg:py-10">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            aria-label="شيف العرب - الصفحة الرئيسية"
          >
            <Image
              src="/favicon.webp"
              alt="شعار شيف العرب"
              width={60}
              height={60}
              loading="lazy"
              sizes="60px"
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
              <ul className="space-y-1 font-medium">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink link={link} pathname={pathname} />
                  </li>
                ))}
                {group.consent && (
                  <li className="px-2.5 py-1.5">
                    <ConsentSettingsButton className="text-right text-gray-400 transition-colors hover:text-orange-400" />
                  </li>
                )}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3 sm:hidden">
          {FOOTER_GROUPS.map((group) => (
            <details key={group.id} className="group border-b border-white/10 pb-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
                {group.title}
                <span aria-hidden="true" className="text-2xl leading-none group-open:hidden">
                  +
                </span>
                <span aria-hidden="true" className="hidden text-2xl leading-none group-open:inline">
                  −
                </span>
              </summary>
              <ul className="mt-3 space-y-1 font-medium">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink link={link} pathname={pathname} />
                  </li>
                ))}
                {group.consent && (
                  <li className="px-2.5 py-1.5">
                    <ConsentSettingsButton className="text-right text-gray-400 transition-colors hover:text-orange-400" />
                  </li>
                )}
              </ul>
            </details>
          ))}
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
              className="text-gray-400 transition hover:text-green-500"
              aria-label="التواصل عبر واتساب"
              title="واتساب"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.946 11.946 0 01-1.63-6.012C.114 5.305 5.48 0 12.006 0c3.2 0 6.194 1.247 8.453 3.507a11.904 11.904 0 013.513 8.493c-.003 6.526-5.379 11.891-12.006 11.891a11.954 11.954 0 01-6.936-2.55L.057 24zm6.597-3.807c1.09.323 2.24.497 3.436.497 5.406 0 9.795-4.392 9.798-9.802.003-2.62-1.02-5.082-2.878-6.935C14.2 2.02 11.736 1 9.12 1 4.72 1 .33 5.392.327 10.801c0 2.486 1.036 4.835 2.875 6.581l-.63 2.31 4.082-1.699zM17.73 14.91c-.29-.145-1.718-.846-1.986-.94-.267-.093-.46-.145-.654.146-.194.29-.75.94-.918 1.13-.17.194-.338.218-.628.073-.29-.145-1.223-.451-2.33-1.44-.861-.766-1.44-1.713-1.61-2.003-.17-.29-.018-.447.127-.592.13-.13.29-.338.435-.507.145-.17.194-.29.29-.483.097-.194.048-.364-.024-.507-.072-.145-.654-1.58-.896-2.164-.236-.567-.476-.49-.654-.5l-.558-.01c-.194 0-.507.073-.773.364s-1.014.991-1.014 2.415c0 1.423 1.038 2.797 1.183 2.991.145.194 2.04 3.12 4.938 4.377.69.297 1.228.474 1.647.607.692.22 1.323.19 1.822.115.556-.085 1.718-.7 1.958-1.38.24-.681.24-1.264.17-1.38-.072-.114-.263-.19-.553-.335z" />
              </svg>
            </a>

            <a
              href="mailto:chefalarabonline@gmail.com"
              className="text-gray-400 transition hover:text-orange-500"
              aria-label="التواصل عبر البريد الإلكتروني"
              title="البريد الإلكتروني"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12.713l-11.714-7.713h23.428l-11.714 7.713zm-12-8.713v16h24v-16h-24zm22 2.667v.553l-10 6.586-10-6.586v-.553h20z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
