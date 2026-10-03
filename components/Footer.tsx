import { ArrowRight, Mail, MapPin, MessageCircle, Phone, Smartphone } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { CookieSettingsFooterButton } from "@/components/CookieConsentManager";
import { approvalServices } from "@/data/approvals";
import { arabicApprovalTitle, arabicFooterLabels, arabicNavItems, arabicServiceTitle } from "@/data/arabic";
import { navItems, services, site, socialLinks, whatsappUrl } from "@/data/site";
import { localizedPath, type Locale } from "@/lib/i18n";

const sectorLinks = [
  { label: "Luxury Villas", href: "/industries" },
  { label: "Warehouse & Logistics", href: "/industries" },
  { label: "Commercial Buildings", href: "/industries" },
  { label: "Retail & Hospitality", href: "/industries" },
];

export function Footer({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const currentNavItems = isArabic ? arabicNavItems : navItems;
  const labels = isArabic
    ? arabicFooterLabels
    : {
        navigation: "Navigation",
        services: "Services",
        approvals: "Approvals",
        industries: "Industries",
        contact: "Contact",
        resources: "Resources",
        htmlSitemap: "HTML Sitemap",
        cookiePolicy: "Cookie Policy",
        privacyPolicy: "Privacy Policy",
        terms: "Terms & Conditions",
        cookieSettings: "Cookie Settings",
        startProject: "Start a project",
        startProjectTitle: "Bring engineering clarity to your next Dubai build.",
        quote: "Request a Quote",
        whatsapp: "WhatsApp Us",
        callOffice: "Call Office",
        footerTagline: "Construction, engineering and project information for Dubai and the UAE",
      };
  const currentSectorLinks = isArabic
    ? [
        { label: "الفلل الفاخرة", href: "/industries" },
        { label: "المستودعات واللوجستيات", href: "/industries" },
        { label: "المباني التجارية", href: "/industries" },
        { label: "التجزئة والضيافة", href: "/industries" },
      ]
    : sectorLinks;

  return (
    <footer dir={isArabic ? "rtl" : "ltr"} className="bg-white text-charcoal">
      <div className="container-pad pb-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-brand/[0.15] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_58%,#eaf5ff_100%)] shadow-luxe">
          <div className="grid gap-10 border-b border-brand/[0.12] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <BrandLogo
                className="block"
                imageClassName="h-14 w-auto object-contain sm:h-16"
                sizes="(min-width: 640px) 274px, 240px"
              />
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6f86]">
                {isArabic
                  ? "شركة مقاولات متميزة في دبي للأعمال المدنية، تنسيق موافقات الجهات، التشطيبات الداخلية، الفلل، المستودعات ودعم المشاريع التجارية."
                  : "Dubai construction company for civil contracting, authority approval coordination, interior fit-out, villa, warehouse and commercial project support."}
              </p>
            </div>
            <div className="rounded-[2rem] border border-brand/[0.15] bg-white/80 p-6 text-charcoal shadow-panel backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-brand">{labels.startProject}</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight">{labels.startProjectTitle}</h2>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={localizedPath("/contact", locale)} className="premium-button">
                  {labels.quote} <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={site.phoneHref} className="premium-button-light">
                  {labels.callOffice} <Phone className="h-4 w-4" />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">
                  {labels.whatsapp} <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-2 lg:grid-cols-5 lg:p-10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-charcoal">{labels.navigation}</h3>
              <ul className="mt-5 grid gap-3 text-sm font-bold text-[#5f6f86]">
                {currentNavItems.map((item) => (
                  <li key={item.href}>
                    <Link href={localizedPath(item.href, locale)} prefetch={localizedPath(item.href, locale) === localizedPath("/", locale) ? false : undefined} className="transition hover:text-brand">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {!currentNavItems.some((item) => item.href === "/resources") ? (
                  <li>
                    <Link href={localizedPath("/resources", locale)} className="transition hover:text-brand">
                      {labels.resources}
                    </Link>
                  </li>
                ) : null}
                {!isArabic ? (
                  <>
                    <li><Link href="/founder" className="transition hover:text-brand">Founder</Link></li>
                    <li><Link href="/leadership" className="transition hover:text-brand">Leadership</Link></li>
                    <li><Link href="/company-information" className="transition hover:text-brand">Company Information</Link></li>
                    <li><Link href="/locations/dubai" className="transition hover:text-brand">Dubai Service Area</Link></li>
                    <li><Link href="/faqs" className="transition hover:text-brand">FAQs</Link></li>
                    <li><Link href="/careers" className="transition hover:text-brand">Careers</Link></li>
                  </>
                ) : null}
                <li>
                  <Link href={localizedPath("/html-sitemap", locale)} className="transition hover:text-brand">
                    {labels.htmlSitemap}
                  </Link>
                </li>
                <li>
                  <Link href={localizedPath("/cookie-policy", locale)} className="transition hover:text-brand">
                    {labels.cookiePolicy}
                  </Link>
                </li>
                <li>
                  <Link href={localizedPath("/privacy-policy", locale)} className="transition hover:text-brand">
                    {labels.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link href={localizedPath("/terms-and-conditions", locale)} className="transition hover:text-brand">
                    {labels.terms}
                  </Link>
                </li>
                {!isArabic ? (
                  <>
                    <li><Link href="/editorial-policy" className="transition hover:text-brand">Editorial Policy</Link></li>
                    <li><Link href="/technical-review-policy" className="transition hover:text-brand">Technical Review Policy</Link></li>
                    <li><Link href="/corrections-policy" className="transition hover:text-brand">Corrections Policy</Link></li>
                    <li><Link href="/disclaimer" className="transition hover:text-brand">Disclaimer</Link></li>
                    <li><Link href="/accessibility" className="transition hover:text-brand">Accessibility</Link></li>
                  </>
                ) : null}
                <li>
                  <CookieSettingsFooterButton label={labels.cookieSettings} />
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-charcoal">{labels.services}</h3>
              <ul className="mt-5 grid gap-3 text-sm font-bold text-[#5f6f86]">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link href={localizedPath(service.href, locale)} className="transition hover:text-brand">
                      {isArabic ? arabicServiceTitle(service.href) : service.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={localizedPath("/approval", locale)} className="transition hover:text-brand">
                    {isArabic ? "موافقات الجهات" : "Authority Approvals"}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-charcoal">{labels.approvals}</h3>
              <ul className="mt-5 grid gap-3 text-sm font-bold text-[#5f6f86]">
                {approvalServices.slice(0, 6).map((service) => (
                  <li key={service.slug}>
                    <Link href={localizedPath(service.href, locale)} className="transition hover:text-brand">
                      {isArabic ? arabicApprovalTitle(service.href) : service.menuLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-charcoal">{labels.industries}</h3>
              <ul className="mt-5 grid gap-3 text-sm font-bold text-[#5f6f86]">
                {currentSectorLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={localizedPath(item.href, locale)} className="transition hover:text-brand">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-charcoal">{labels.contact}</h3>
              <ul className="mt-5 grid gap-4 text-sm font-bold text-[#5f6f86]">
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-brand">{isArabic ? "هاتف المكتب" : "Office"}</span>
                    <a href={site.phoneHref} dir="ltr" className="mt-1 block transition hover:text-brand">{site.phone}</a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-brand">{isArabic ? "الهاتف المحمول" : "Mobile"}</span>
                    <a href={site.mobileHref} dir="ltr" className="mt-1 block transition hover:text-brand">{site.mobile}</a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <a href={`mailto:${site.email}`} className="transition hover:text-brand">{site.email}</a>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{isArabic ? "مجمع دبي للاستثمار 02، دبي، الإمارات" : site.location}</span>
                </li>
              </ul>
              {!isArabic && socialLinks.length > 0 ? (
                <div className="mt-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-charcoal">Follow Emitronix</h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {socialLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Emitronix on ${item.label}`}
                          className="grid h-10 w-10 place-items-center rounded-xl border border-brand/[0.12] bg-brand-soft text-brand transition hover:border-brand/30 hover:bg-brand hover:text-white"
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand/[0.12] px-6 py-5 text-xs font-bold uppercase tracking-[0.18em] text-[#5f6f86] sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <span>&copy; {new Date().getFullYear()} {site.legalName}. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
            <span>{labels.footerTagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
