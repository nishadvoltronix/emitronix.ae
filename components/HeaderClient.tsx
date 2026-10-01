"use client";

import { ArrowRight, Building2, ChevronDown, FileCheck2, Languages, Menu, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useHydrationSafePathname } from "@/components/useHydrationSafePathname";
import type { NavItem } from "@/data/site";
import { alternateLocalePath, isArabicPath, localizedPath, toEnglishPath } from "@/lib/i18n";

export type HeaderServiceLink = {
  slug: string;
  title: string;
  href: string;
};

export type HeaderApprovalLink = {
  slug: string;
  menuLabel: string;
  href: string;
};

export type HeaderContact = {
  phone: string;
  phoneHref: string;
  email: string;
  location: string;
};

const industryLinks = [
  { label: "Luxury Villas", href: "/industries" },
  { label: "Warehouses", href: "/industries" },
  { label: "Commercial Buildings", href: "/industries" },
  { label: "Retail Fit-Out", href: "/industries" },
];

export function HeaderClient({
  navItems,
  arabicNavItems,
  services,
  arabicServices,
  approvalServices,
  arabicApprovalServices,
  contact,
}: {
  navItems: NavItem[];
  arabicNavItems: NavItem[];
  services: HeaderServiceLink[];
  arabicServices: HeaderServiceLink[];
  approvalServices: HeaderApprovalLink[];
  arabicApprovalServices: HeaderApprovalLink[];
  contact: HeaderContact;
}) {
  const browserPathname = usePathname();
  const pathname = useHydrationSafePathname(browserPathname);
  const isArabic = isArabicPath(pathname);
  const activePathname = toEnglishPath(pathname);
  const locale = isArabic ? "ar" : "en";
  const currentNavItems = isArabic ? arabicNavItems : navItems;
  const currentServices = isArabic ? arabicServices : services;
  const currentApprovalServices = isArabic ? arabicApprovalServices : approvalServices;
  const languageHref = alternateLocalePath(pathname);
  const copy = isArabic
    ? {
        homeLabel: "الصفحة الرئيسية",
        quote: "عرض سعر",
        services: "الخدمات الأساسية",
        servicesDescription: "مقاولات، تشطيبات وتحكم في التسليم",
        allServices: "منصة الخدمات الكاملة",
        approvals: "موافقات دبي",
        approvalsDescription: "مسارات تنسيق الجهات",
        allApprovals: "كل خدمات الموافقات",
        sectorFocus: "القطاعات",
        sectorTitle: "بيئات المشاريع في دبي.",
        toggleNav: "فتح أو إغلاق القائمة",
        completeServices: "منصة الخدمات الكاملة",
        language: "English",
        languageLabel: "تغيير اللغة إلى الإنجليزية",
        industryLinks: [
          { label: "الفلل الفاخرة", href: "/industries" },
          { label: "المستودعات", href: "/industries" },
          { label: "المباني التجارية", href: "/industries" },
          { label: "التشطيبات التجارية", href: "/industries" },
        ],
      }
    : {
        homeLabel: "Emitronix home",
        quote: "Request Quote",
        services: "Core services",
        servicesDescription: "Construction, fit-out and delivery control",
        allServices: "Complete services platform",
        approvals: "Dubai approvals",
        approvalsDescription: "Authority coordination pathways",
        allApprovals: "All approval services",
        sectorFocus: "Sector focus",
        sectorTitle: "Dubai project environments.",
        toggleNav: "Toggle navigation",
        completeServices: "Complete Services Platform",
        language: "العربية",
        languageLabel: "Switch language to Arabic",
        industryLinks,
      };
  const [open, setOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const transparent = pathname === "/" && !scrolled && !open && !megaOpen;
  const closeTimer = useRef<number | null>(null);
  const megaOpenedByHover = useRef(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const serviceDetailPaths = services.flatMap((item) => {
    const hrefSlug = item.href.replace(/^\//, "");
    return Array.from(new Set([item.href, `/services/${item.slug}`, `/services/${hrefSlug}`]));
  });
  const approvalPaths = ["/approval", "/approvals", ...approvalServices.map((item) => item.href)];
  const servicePaths = ["/services", ...serviceDetailPaths];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileServicesOpen(false);
    setMegaOpen(false);
    megaOpenedByHover.current = false;
    clearCloseTimer();
  }, [pathname]);

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!megaOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      clearCloseTimer();
      setMegaOpen(false);
      megaOpenedByHover.current = false;
      megaButtonRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!megaMenuRef.current?.contains(event.target as Node)) {
        clearCloseTimer();
        megaOpenedByHover.current = false;
        setMegaOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [megaOpen]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setMobileServicesOpen(false);
      mobileMenuButtonRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function isActive(href: string) {
    if (href === "/services") return servicePaths.includes(activePathname);
    if (href === "/approval") return approvalPaths.includes(activePathname);
    return activePathname === href;
  }

  function isCurrentPage(href: string) {
    return activePathname === href;
  }

  function clearCloseTimer() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMegaMenu() {
    clearCloseTimer();
    if (!megaOpen) {
      megaOpenedByHover.current = true;
      setMegaOpen(true);
    }
  }

  function closeMegaMenu() {
    clearCloseTimer();
    megaOpenedByHover.current = false;
    setMegaOpen(false);
  }

  function scheduleMegaClose() {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      if (!megaMenuRef.current?.contains(document.activeElement)) {
        megaOpenedByHover.current = false;
        setMegaOpen(false);
      }
      closeTimer.current = null;
    }, 250);
  }

  return (
    <header
      dir={isArabic ? "rtl" : "ltr"}
      data-header-transparent={transparent}
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        transparent
          ? "border-white/20 bg-transparent shadow-none"
          : scrolled || (pathname === "/" && (open || megaOpen))
          ? "border-brand/[0.15] bg-white/[0.92] shadow-[0_18px_70px_rgba(25,73,145,0.10)] backdrop-blur-2xl"
          : "border-brand/[0.08] bg-white/[0.82] shadow-none backdrop-blur-xl"
      }`}
    >
      <div className="container-pad">
        <div className="relative flex h-20 items-center justify-between gap-4">
          <Link
            href={localizedPath("/", locale)}
            className="flex shrink-0 items-center rounded-xl focus-ring"
            aria-label={copy.homeLabel}
            aria-current={isCurrentPage("/") ? "page" : undefined}
          >
            <BrandLogo
              variant={transparent ? "reversed" : "primary"}
              className="block shrink-0"
              imageClassName="h-12 w-auto object-contain sm:h-14 lg:h-16 min-[1440px]:h-12 2xl:h-14"
              sizes="(min-width: 1536px) 240px, (min-width: 1440px) 206px, (min-width: 1024px) 274px, (min-width: 640px) 240px, 206px"
              priority
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 min-[1440px]:flex" aria-label="Primary navigation">
            {currentNavItems.map((item) => {
              const active = isActive(item.href);
              const baseClass = `inline-flex h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-bold uppercase tracking-[0.02em] transition focus-ring ${
                transparent
                  ? active
                    ? "bg-white/15 text-white"
                    : "text-white hover:bg-white/15"
                  : active
                    ? "bg-brand text-white shadow-blue"
                    : "text-charcoal/[0.78] hover:bg-brand-soft hover:text-brand"
              }`;

              if (item.href === "/services") {
                return (
                  <div
                    key={item.href}
                    ref={megaMenuRef}
                    className="-my-4 shrink-0 py-4"
                    onMouseEnter={openMegaMenu}
                    onMouseLeave={scheduleMegaClose}
                    onFocus={clearCloseTimer}
                    onBlur={(event) => {
                      const nextTarget = event.relatedTarget as Node | null;
                      if (!nextTarget || !event.currentTarget.contains(nextTarget)) scheduleMegaClose();
                    }}
                  >
                    <button
                      ref={megaButtonRef}
                      type="button"
                      className={baseClass}
                      aria-expanded={megaOpen}
                      aria-controls="desktop-services-menu"
                      aria-current={isCurrentPage("/services") ? "page" : undefined}
                      onClick={() => {
                        clearCloseTimer();
                        setMegaOpen(megaOpenedByHover.current || !megaOpen);
                        megaOpenedByHover.current = false;
                      }}
                    >
                      {item.label}
                      <ChevronDown size={14} strokeWidth={2.4} aria-hidden="true" className={`shrink-0 transition duration-300 ${megaOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      id="desktop-services-menu"
                      className={`absolute left-1/2 top-full z-50 w-[min(100%,980px)] -translate-x-1/2 pt-3 transition duration-300 ${
                        megaOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
                      }`}
                      aria-hidden={!megaOpen}
                      inert={!megaOpen}
                      onClick={(event) => {
                        if ((event.target as Element).closest("a")) closeMegaMenu();
                      }}
                    >
                      <div className="premium-menu-panel max-h-[calc(100dvh-104px)] overflow-y-auto overscroll-contain">
                        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.82fr]">
                          <div className="rounded-[1.6rem] border border-brand/10 bg-pearl p-4">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-brand shadow-sm">
                                <Building2 className="h-5 w-5" />
                              </span>
                              <div>
                              <p className="premium-kicker">{copy.services}</p>
                                <p className="mt-1 text-xs font-bold text-steel">{copy.servicesDescription}</p>
                              </div>
                            </div>
                            <div className="mt-5 grid max-h-72 gap-2 overflow-auto pr-1">
                              <Link
                                href={localizedPath("/services", locale)}
                                className="premium-menu-link"
                                aria-current={isCurrentPage("/services") ? "page" : undefined}
                              >
                                {copy.allServices} <ArrowRight className="h-4 w-4" />
                              </Link>
                              {currentServices.map((service) => (
                                <Link
                                  key={service.slug}
                                  href={localizedPath(service.href, locale)}
                                  className="premium-menu-link"
                                  aria-current={isCurrentPage(service.href) ? "page" : undefined}
                                >
                                  {service.title}
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[1.6rem] border border-brand/10 bg-pearl p-4">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-brand shadow-sm">
                                <FileCheck2 className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="premium-kicker">{copy.approvals}</p>
                                <p className="mt-1 text-xs font-bold text-steel">{copy.approvalsDescription}</p>
                              </div>
                            </div>
                            <div className="mt-5 grid max-h-72 gap-2 overflow-auto pr-1">
                              <Link
                                href={localizedPath("/approval", locale)}
                                className="premium-menu-link"
                                aria-current={isCurrentPage("/approval") ? "page" : undefined}
                              >
                                {copy.allApprovals} <ArrowRight className="h-4 w-4" />
                              </Link>
                              {currentApprovalServices.map((service) => (
                                <Link
                                  key={service.slug}
                                  href={localizedPath(service.href, locale)}
                                  className="premium-menu-link"
                                  aria-current={isCurrentPage(service.href) ? "page" : undefined}
                                >
                                  {service.menuLabel}
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[1.6rem] border border-brand/10 bg-[linear-gradient(145deg,#f8fbff_0%,#ffffff_100%)] p-5">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white shadow-sm">
                              <Sparkles className="h-5 w-5" />
                            </span>
                            <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-steel">{copy.sectorFocus}</p>
                            <p className="mt-2 text-2xl font-black tracking-tight text-charcoal">{copy.sectorTitle}</p>
                            <div className="mt-5 grid gap-2">
                              {copy.industryLinks.map((link) => (
                                <Link key={link.label} href={localizedPath(link.href, locale)} className="premium-menu-link">
                                  {link.label}
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={localizedPath(item.href, locale)}
                  className={baseClass}
                  aria-current={isCurrentPage(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 min-[1440px]:flex">
            <Link
              href="/search"
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition focus-ring ${
                transparent
                  ? "border-white/45 bg-transparent text-white hover:bg-white/15"
                  : "border-brand/[0.15] bg-white text-brand hover:bg-brand-soft"
              }`}
              aria-label={isArabic ? "البحث في الموقع" : "Search the website"}
              aria-current={isCurrentPage("/search") ? "page" : undefined}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={localizedPath("/contact", locale)}
              className="premium-button h-11 shrink-0 whitespace-nowrap px-5 py-0 text-xs"
              aria-current={isCurrentPage("/contact") ? "page" : undefined}
            >
              {copy.quote} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <Link
              href={languageHref}
              prefetch={false}
              className={`h-11 shrink-0 whitespace-nowrap px-4 py-0 text-xs ${
                transparent
                  ? "inline-flex items-center justify-center gap-2 rounded-full border border-white/45 bg-transparent font-black uppercase tracking-wide text-white transition duration-300 hover:bg-white/15 focus-ring"
                  : "premium-button-light"
              }`}
              aria-label={copy.languageLabel}
            >
              <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
              {copy.language}
            </Link>
          </div>

          <button
            ref={mobileMenuButtonRef}
            type="button"
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition focus-ring min-[1440px]:hidden ${
              transparent
                ? "border-white/45 bg-transparent text-white hover:bg-white/15"
                : "border-brand/[0.15] bg-white/[0.9] text-charcoal shadow-sm backdrop-blur-xl hover:border-brand/[0.35] hover:bg-brand-soft hover:text-brand"
            }`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation-menu"
            aria-label={copy.toggleNav}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain border-t border-brand/[0.15] bg-white/[0.96] shadow-luxe backdrop-blur-2xl min-[1440px]:hidden">
          <nav id="mobile-navigation-menu" className="container-pad grid gap-2 py-5" aria-label="Mobile navigation">
            {currentNavItems.map((item) => {
              const active = isActive(item.href);
              if (item.href === "/services") {
                return (
                  <div key={item.href}>
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((value) => !value)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wide transition ${
                        active ? "bg-brand text-white" : "text-charcoal hover:bg-brand-soft hover:text-brand"
                      }`}
                      aria-expanded={mobileServicesOpen}
                      aria-controls="mobile-services-menu"
                      aria-current={isCurrentPage("/services") ? "page" : undefined}
                    >
                      {item.label}
                      <ChevronDown size={16} className={`transition duration-300 ${mobileServicesOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      id="mobile-services-menu"
                      className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                        mobileServicesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                      aria-hidden={!mobileServicesOpen}
                      inert={!mobileServicesOpen}
                    >
                      <div className="min-h-0">
                        <div className="mt-2 grid gap-2 rounded-[1.5rem] border border-brand/[0.15] bg-brand-soft p-3">
                          <Link
                            href={localizedPath("/services", locale)}
                            onClick={() => setOpen(false)}
                            className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-charcoal shadow-sm"
                            tabIndex={mobileServicesOpen ? undefined : -1}
                            aria-current={isCurrentPage("/services") ? "page" : undefined}
                          >
                            {copy.completeServices}
                          </Link>
                          {currentServices.map((service) => (
                            <Link
                              key={service.slug}
                              href={localizedPath(service.href, locale)}
                              onClick={() => setOpen(false)}
                              className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-charcoal shadow-sm"
                              tabIndex={mobileServicesOpen ? undefined : -1}
                              aria-current={isCurrentPage(service.href) ? "page" : undefined}
                            >
                              {service.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.href}>
                  <Link
                    href={localizedPath(item.href, locale)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wide transition ${
                      active ? "bg-brand text-white" : "text-charcoal hover:bg-brand-soft hover:text-brand"
                    }`}
                    aria-current={isCurrentPage(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
            <Link
              href={localizedPath("/contact", locale)}
              onClick={() => setOpen(false)}
              className="premium-button mt-2"
              aria-current={isCurrentPage("/contact") ? "page" : undefined}
            >
              {copy.quote} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="premium-button-light"
              aria-current={isCurrentPage("/search") ? "page" : undefined}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              {isArabic ? "البحث في الموقع" : "Search the website"}
            </Link>
            <Link
              href={languageHref}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="premium-button-light"
            >
              <Languages className="h-4 w-4" />
              {copy.language}
            </Link>
            <div className="mt-3 grid gap-2 border-t border-brand/[0.15] pt-4 text-sm font-bold text-steel">
              <a href={contact.phoneHref} dir="ltr">{contact.phone}</a>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <span>{isArabic ? "مجمع دبي للاستثمار 02، دبي، الإمارات" : contact.location}</span>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
