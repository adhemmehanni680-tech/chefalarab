"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PAGE_LINKS = [
  { title: "من نحن", href: "/about_us" },
  { title: "تواصل معنا", href: "/contact_us" },
  { title: "الأسئلة الشائعة", href: "/faq" },
  { title: "سياسة الخصوصية", href: "/privacy_policy" },
];

const CLASSIFICATION_SECTIONS = [
  {
    title: "حسب الوجبة",
    items: [["🍳 الإفطار", "الإفطار"], ["🍲 الغداء", "الغداء"], ["🌙 العشاء", "العشاء"]],
  },
  {
    title: "حسب النوع",
    items: [
      ["🥩 أطباق رئيسية", "أطباق-رئيسية"], ["🥗 سلطات", "السلطات"],
      ["🍰 حلويات", "desserts", "group"], ["🥐 مخبوزات ومعجنات", "المخبوزات والمعجنات"],
      ["🥣 شوربات", "شوربة"], ["🥤 مشروبات", "drinks", "group"],
    ],
  },
  {
    title: "حسب المناسبة",
    items: [
      ["🌙 وصفات رمضان", "المطبخ الرمضانى"],
      ["🕌 أكلات عيد الأضحى", "أكلات عيدالأضحى"],
      ["🎂 أعياد ميلاد", "birthdays", "group"],
    ],
  },
].map((section) => ({
  ...section,
  items: section.items.map(([title, value, type]) => ({
    title,
    href:
      type === "group"
        ? `/recipes?group=${encodeURIComponent(value)}&source=classifications`
        : `/recipes?category=${encodeURIComponent(value)}&source=classifications`,
  })),
}));

const DISCOVER_ITEMS = [
  { title: "🆕 أحدث الوصفات", href: "/recipes?discover=latest" },
  { title: "⚡ وصفات سريعة", href: "/recipes?discover=quick" },
  { title: "👨‍👩‍👧 وصفات عائلية", href: "/recipes?discover=family" },
  { title: "🌱 وصفات نباتية", href: `/recipes?category=${encodeURIComponent("أكلات نباتية")}&source=discover` },
];

const filterHref = (key, value) => `/recipes?${key}=${encodeURIComponent(value)}`;

function hrefIsActive(href, pathname, searchParams) {
  const [targetPath, targetQuery = ""] = href.split("?");
  if (pathname !== targetPath) return false;

  const expected = new URLSearchParams(targetQuery);
  const current = new URLSearchParams(searchParams);
  current.delete("page");

  if (Array.from(expected.keys()).length !== Array.from(current.keys()).length) return false;
  return [...expected.entries()].every(([key, value]) => current.get(key) === value);
}

function menuIsActive(menu, isActive) {
  if (menu.items?.some((item) => isActive(item.href))) return true;
  if (menu.sections?.some((section) => section.items.some((item) => isActive(item.href)))) return true;
  if (menu.groups?.some((group) =>
    isActive(filterHref("country", group.title)) ||
    group.recipes.some((recipe) => isActive(`/recipe/${encodeURIComponent(recipe.slug)}`)),
  )) return true;
  return Boolean(menu.footer && isActive(menu.footer.href));
}

function Chevron({ open }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuLink({ item, close, compact = false, active = false }) {
  return (
    <Link href={item.href} onClick={close} aria-current={active ? "page" : undefined} className={`group/item flex items-center gap-2 rounded-xl border text-right font-bold leading-6 outline-none transition focus-visible:ring-2 focus-visible:ring-orange-400 ${active ? "border-orange-400/30 bg-orange-500/15 text-orange-300" : "border-transparent text-gray-200 hover:border-orange-400/20 hover:bg-orange-500/10 hover:text-orange-300"} ${compact ? "px-2.5 py-1.5 text-xs" : "min-h-11 px-3 py-2.5 text-sm"}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition group-hover/item:bg-orange-400 ${active ? "bg-orange-400" : "bg-gray-600"}`} />
      <span>{item.title}</span>
    </Link>
  );
}

function DesktopMenuContent({ menu, close, isActive }) {
  if (menu.groups) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-3">
        {menu.groups.map((group) => (
          <section key={group.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <Link href={filterHref("country", group.title)} onClick={close} aria-current={isActive(filterHref("country", group.title)) ? "page" : undefined} className={`mb-2 block border-b pb-2 text-sm font-black transition ${isActive(filterHref("country", group.title)) ? "border-orange-400/40 text-orange-300" : "border-white/10 text-orange-400 hover:text-orange-300"}`}>
              {group.title}
            </Link>
            <div className="space-y-0.5">
              {group.recipes.map((recipe) => (
                <MenuLink key={recipe.slug} item={{ title: recipe.title, href: `/recipe/${encodeURIComponent(recipe.slug)}` }} close={close} compact active={isActive(`/recipe/${encodeURIComponent(recipe.slug)}`)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (menu.sections) {
    return (
      <div className="grid grid-cols-3 gap-4 p-5">
        {menu.sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <h3 className="mb-2 border-b border-white/10 px-2 pb-3 text-sm font-black text-orange-400">{section.title}</h3>
            <div className="space-y-1">
              {section.items.map((item) => <MenuLink key={item.href} item={item} close={close} active={isActive(item.href)} />)}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 p-4 lg:grid-cols-4">
      {menu.items.map((item) => <MenuLink key={`${item.href}-${item.title}`} item={item} close={close} active={isActive(item.href)} />)}
    </div>
  );
}

function DesktopDropdown({ menu, openMenu, setOpenMenu, compact, isActive, forceActive = false }) {
  const open = openMenu === menu.id;
  const active = forceActive || menuIsActive(menu, isActive);
  const count = menu.groups ? menu.groups.length : menu.sections ? menu.sections.reduce((total, section) => total + section.items.length, 0) : menu.items.length;

  return (
    <li className="relative" onMouseEnter={() => setOpenMenu(menu.id)} onMouseLeave={() => setOpenMenu(null)}>
      <button type="button" onClick={() => setOpenMenu(open ? null : menu.id)} aria-expanded={open} aria-controls={`desktop-menu-${menu.id}`} className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-[13px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-400 xl:px-2 xl:text-sm ${open || active ? "bg-orange-500/10 text-orange-400" : "text-white hover:text-orange-400"}`}>
        {menu.title}<Chevron open={open} />
      </button>

      <div id={`desktop-menu-${menu.id}`} className={`fixed left-1/2 z-[110] w-[min(94vw,1000px)] -translate-x-1/2 px-3 transition-[top,opacity,transform,visibility] duration-200 ${compact ? "top-[58px]" : "top-[76px]"} ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0b1220] shadow-[0_24px_70px_rgba(0,0,0,0.55)] ring-1 ring-black/20">
          <div className="h-1 bg-gradient-to-l from-orange-600 via-orange-400 to-amber-300" />
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5">
            <div><p className="text-xs font-bold text-orange-400">شيف العرب</p><h2 className="mt-0.5 text-lg font-black text-white">{menu.title}</h2></div>
            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">{count} اختيار</span>
          </div>
          <div className="max-h-[min(65vh,520px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <DesktopMenuContent menu={menu} close={() => setOpenMenu(null)} isActive={isActive} />
          </div>
          {menu.footer && (
            <div className="border-t border-white/10 bg-white/[0.025] p-3 text-center">
              <Link href={menu.footer.href} onClick={() => setOpenMenu(null)} aria-current={isActive(menu.footer.href) ? "page" : undefined} className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-black text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${isActive(menu.footer.href) ? "bg-orange-600 ring-2 ring-orange-300/50" : "bg-orange-500 hover:bg-orange-600"}`}>{menu.footer.title}</Link>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function MobileMenuContent({ menu, close, isActive }) {
  if (menu.groups) {
    return menu.groups.map((group) => (
      <section key={group.title} className="border-b border-white/10 p-2 last:border-0">
        <Link href={filterHref("country", group.title)} onClick={close} aria-current={isActive(filterHref("country", group.title)) ? "page" : undefined} className={`block rounded-lg px-2 py-2 text-right text-sm font-black ${isActive(filterHref("country", group.title)) ? "bg-orange-500/15 text-orange-300" : "text-orange-400"}`}>{group.title}</Link>
        {group.recipes.map((recipe) => (
          <Link key={recipe.slug} href={`/recipe/${encodeURIComponent(recipe.slug)}`} onClick={close} aria-current={isActive(`/recipe/${encodeURIComponent(recipe.slug)}`) ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-right text-xs font-semibold leading-5 ${isActive(`/recipe/${encodeURIComponent(recipe.slug)}`) ? "bg-orange-500 text-white" : "text-gray-200 hover:bg-white/10"}`}>{recipe.title}</Link>
        ))}
      </section>
    ));
  }

  if (menu.sections) {
    return menu.sections.map((section) => (
      <section key={section.title} className="border-b border-white/10 p-2 last:border-0">
        <h3 className="px-2 py-2 text-right text-sm font-black text-orange-400">{section.title}</h3>
        {section.items.map((item) => <Link key={item.href} href={item.href} onClick={close} aria-current={isActive(item.href) ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-right text-sm font-semibold ${isActive(item.href) ? "bg-orange-500 text-white" : "text-gray-200 hover:bg-white/10"}`}>{item.title}</Link>)}
      </section>
    ));
  }

  return menu.items.map((item) => <Link key={`${item.href}-${item.title}`} href={item.href} onClick={close} aria-current={isActive(item.href) ? "page" : undefined} className={`block rounded-lg px-3 py-2.5 text-right text-sm font-semibold transition ${isActive(item.href) ? "bg-orange-500 text-white" : "text-gray-200 hover:bg-orange-500 hover:text-white"}`}>{item.title}</Link>);
}

function MobileDropdown({ menu, openMenu, setOpenMenu, isActive, forceActive = false }) {
  const open = openMenu === menu.id;
  const active = forceActive || menuIsActive(menu, isActive);
  const close = () => setOpenMenu(null);

  return (
    <li className="overflow-hidden rounded-xl bg-white/[0.04]">
      <button type="button" onClick={() => setOpenMenu(open ? null : menu.id)} aria-expanded={open} aria-controls={`mobile-submenu-${menu.id}`} className={`flex w-full items-center justify-between px-4 py-3 font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400 ${active ? "bg-orange-500/15 text-orange-300" : "text-white hover:bg-white/10"}`}>
        {menu.title}<Chevron open={open} />
      </button>
      <div id={`mobile-submenu-${menu.id}`} className={`grid transition-[grid-template-rows,opacity] duration-200 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="max-h-[55dvh] overflow-y-auto border-t border-white/10 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <MobileMenuContent menu={menu} close={close} isActive={isActive} />
            {menu.footer && <Link href={menu.footer.href} onClick={close} aria-current={isActive(menu.footer.href) ? "page" : undefined} className={`mt-2 block rounded-xl px-4 py-2.5 text-center text-sm font-black text-white ${isActive(menu.footer.href) ? "bg-orange-600 ring-2 ring-orange-300/50" : "bg-orange-500"}`}>{menu.footer.title}</Link>}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function HeaderClient({ kitchens, categories }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const currentParams = useMemo(() => new URLSearchParams(searchKey), [searchKey]);
  const isActiveHref = useCallback(
    (href) => hrefIsActive(href, pathname, currentParams),
    [pathname, currentParams],
  );
  const headerRef = useRef(null);
  const frameRef = useRef(null);
  const previousScrollYRef = useRef(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [theme, setTheme] = useState("light");

  const menus = useMemo(() => [
    { id: "recipes", title: "الوصفات", items: categories.map((category) => ({ title: category.replaceAll("-", " "), href: filterHref("category", category) })) },
    { id: "kitchens", title: "المطابخ", groups: kitchens, footer: { title: "عرض كل المطابخ", href: "/recipes?view=kitchens" } },
    { id: "categories", title: "التصنيفات", sections: CLASSIFICATION_SECTIONS, footer: { title: "تصفح كل التصنيفات", href: "/recipes?view=categories" } },
    { id: "discover", title: "اكتشف", items: DISCOVER_ITEMS, footer: { title: "تصفح جميع الوسوم", href: "/recipes?view=tags" } },
  ], [categories, kitchens]);

  useEffect(() => { setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light"); }, []);
  useEffect(() => { setIsMenuOpen(false); setOpenDesktopMenu(null); setOpenMobileMenu(null); setIsHeaderVisible(true); }, [pathname, searchKey]);

  useEffect(() => {
    const handlePointerDown = (event) => { if (headerRef.current && !headerRef.current.contains(event.target)) setOpenDesktopMenu(null); };
    const handleKeyDown = (event) => { if (event.key === "Escape") { setIsMenuOpen(false); setOpenDesktopMenu(null); setOpenMobileMenu(null); } };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("pointerdown", handlePointerDown); document.removeEventListener("keydown", handleKeyDown); };
  }, []);

  useEffect(() => {
    const updateScrollState = () => {
      frameRef.current = null;
      const currentScrollY = Math.max(window.scrollY, 0);
      const difference = currentScrollY - previousScrollYRef.current;
      setIsScrolled(currentScrollY > 24);
      if (isMenuOpen || openDesktopMenu || currentScrollY <= 12) setIsHeaderVisible(true);
      else if (difference > 5 && currentScrollY > 80) setIsHeaderVisible(false);
      else if (difference < -5) setIsHeaderVisible(true);
      previousScrollYRef.current = currentScrollY;
    };
    const handleScroll = () => { if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(updateScrollState); };
    previousScrollYRef.current = Math.max(window.scrollY, 0);
    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { window.removeEventListener("scroll", handleScroll); if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current); };
  }, [isMenuOpen, openDesktopMenu]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      const isDark = nextTheme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
      try { localStorage.setItem("theme", nextTheme); } catch {}
      return nextTheme;
    });
  }, []);

  const closeMobile = () => { setIsMenuOpen(false); setOpenMobileMenu(null); };

  return (
    <>
      <header ref={headerRef} id="site-header" className={`fixed inset-x-0 top-0 z-[100] w-full border-b transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out ${isHeaderVisible ? "translate-y-0" : "pointer-events-none -translate-y-full"} ${isScrolled ? "border-orange-500/15 bg-gray-950/90 shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl" : "border-white/10 bg-gray-900/95 shadow-[0_2px_14px_rgba(0,0,0,0.18)] backdrop-blur-md"}`}>
        <nav aria-label="التنقل الرئيسي">
          <div className={`mx-auto flex max-w-[1500px] items-center justify-between px-3 transition-[padding] duration-300 sm:px-4 ${isScrolled ? "py-1" : "py-2"}`}>
            <Link href="/" className="flex shrink-0 items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-orange-400" aria-label="العودة إلى الصفحة الرئيسية">
              <Image src="/favicon.webp" alt="شعار شيف العرب" width={56} height={56} priority sizes="(max-width: 1023px) 48px, 56px" className={`object-contain transition-[width,height] duration-300 ${isScrolled ? "h-11 w-11" : "h-14 w-14"}`} />
              <span className={`font-brand font-bold leading-none text-white transition-[font-size] duration-300 ${isScrolled ? "text-xl xl:text-2xl" : "text-2xl xl:text-[30px]"}`}>شيف العرب</span>
            </Link>

            <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
              <ul className="flex items-center gap-0.5 font-medium text-white xl:gap-1.5">
                <li><Link href="/" className={`whitespace-nowrap rounded-lg px-1.5 py-2 text-[13px] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-400 xl:px-2 xl:text-sm ${pathname === "/" ? "text-orange-400" : "text-white hover:text-orange-400"}`}>الصفحة الرئيسية</Link></li>
                {menus.map((menu) => <DesktopDropdown key={menu.id} menu={menu} openMenu={openDesktopMenu} setOpenMenu={setOpenDesktopMenu} compact={isScrolled} isActive={isActiveHref} forceActive={menu.id === "recipes" && (pathname.startsWith("/recipe/") || isActiveHref("/recipes"))} />)}
                {PAGE_LINKS.map((link) => <li key={link.href}><Link href={link.href} className={`whitespace-nowrap rounded-lg px-1.5 py-2 text-[12px] font-bold outline-none transition-colors hover:text-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400 xl:px-2 xl:text-[13px] ${pathname === link.href ? "text-orange-400" : "text-white"}`}>{link.title}</Link></li>)}
              </ul>
            </div>

            <div className="flex items-center gap-1">
              <button type="button" onClick={toggleTheme} className="hidden h-10 w-10 items-center justify-center rounded-full text-xl text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-orange-400 lg:flex" aria-label={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}><span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span></button>
              <button type="button" onClick={() => setIsMenuOpen((current) => !current)} aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={isMenuOpen} aria-controls="mobile-main-menu" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-orange-400 lg:hidden"><span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span></button>
            </div>
          </div>

          <div id="mobile-main-menu" className={`overflow-hidden border-t bg-[#070d18]/[0.98] backdrop-blur-xl transition-[max-height,opacity,border-color] duration-300 lg:hidden ${isMenuOpen ? "max-h-[calc(100dvh-72px)] border-white/10 opacity-100" : "max-h-0 border-transparent opacity-0"}`} aria-hidden={!isMenuOpen}>
            <div className="max-h-[calc(100dvh-80px)] overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button onClick={toggleTheme} type="button" className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 font-bold text-white transition hover:bg-white/10"><span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>{theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}</button>
              <ul className="space-y-2 text-center text-white">
                <li><Link href="/" onClick={closeMobile} className={`block rounded-xl px-3 py-3 font-bold transition ${pathname === "/" ? "bg-orange-500 text-white" : "bg-white/[0.04] hover:bg-white/10 hover:text-orange-400"}`}>الصفحة الرئيسية</Link></li>
                {menus.map((menu) => <MobileDropdown key={menu.id} menu={menu} openMenu={openMobileMenu} setOpenMenu={setOpenMobileMenu} isActive={isActiveHref} forceActive={menu.id === "recipes" && (pathname.startsWith("/recipe/") || isActiveHref("/recipes"))} />)}
                {PAGE_LINKS.map((link) => <li key={link.href}><Link href={link.href} onClick={closeMobile} className={`block rounded-xl px-3 py-3 font-bold transition ${pathname === link.href ? "bg-orange-500 text-white" : "bg-white/[0.04] hover:bg-white/10 hover:text-orange-400"}`}>{link.title}</Link></li>)}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <div aria-hidden="true" className="h-[72px] w-full shrink-0" />
    </>
  );
}
