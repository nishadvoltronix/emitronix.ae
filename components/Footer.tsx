import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { socialIcons } from "@/components/SocialIcons";
import { CookieSettingsFooterButton } from "@/components/CookieConsentManager";
import { approvalServices } from "@/data/approvals";
import { arabicApprovalTitle, arabicFooterLabels, arabicNavItems, arabicServiceTitle } from "@/data/arabic";
import { navItems, services, site, socialLinks, whatsappUrl } from "@/data/site";
import { localizedPath, type Locale } from "@/lib/i18n";
import styles from "./Footer.module.css";

const companyPaths = new Set(["/about", "/industries", "/blog", "/projects", "/contact"]);
const featuredServicePaths = new Set([
  "/civil", "/main-contracting", "/warehouse-construction",
  "/industrial-buildings", "/villa-construction", "/interior",
]);
const featuredServices = services.filter((service) => featuredServicePaths.has(service.href));

export function Footer({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const currentNavItems = (isArabic ? arabicNavItems : navItems).filter((item) => companyPaths.has(item.href));
  const labels = isArabic
    ? {
        ...arabicFooterLabels,
        company: "الشركة",
        projectTitle: "هل تخطط لمشروع؟",
        projectDescription: "تحدث مع فريقنا حول متطلبات مشروعك.",
        introduction: "أعمال البناء والتشطيبات الداخلية وتنسيق الموافقات في دبي والإمارات.",
        allServices: "جميع الخدمات",
        allApprovals: "جميع الموافقات",
        careers: "الوظائف",
        office: "هاتف المكتب",
        mobile: "الهاتف المحمول",
        location: "مجمع دبي للاستثمار 02، دبي، الإمارات",
        social: "تابع إيمترونكس",
        legal: "السياسات وروابط الموقع",
      }
    : {
        company: "Company",
        services: "Services",
        approvals: "Approvals",
        contact: "Contact",
        projectTitle: "Have a project in mind?",
        projectDescription: "Discuss your plans with our team.",
        introduction: "Civil construction, interior fit-out and approval coordination in Dubai and the UAE.",
        quote: "Request a quote",
        whatsapp: "WhatsApp",
        allServices: "All services",
        allApprovals: "All approvals",
        careers: "Careers",
        office: "Office",
        mobile: "Mobile",
        location: site.location,
        social: "Follow Emitronix",
        privacyPolicy: "Privacy Policy",
        terms: "Terms & Conditions",
        cookiePolicy: "Cookie Policy",
        cookieSettings: "Cookie Settings",
        htmlSitemap: "Sitemap",
        legal: "Policies and site links",
      };
  const legalLinks = [
    { href: "/privacy-policy", label: labels.privacyPolicy },
    { href: "/terms-and-conditions", label: labels.terms },
    { href: "/cookie-policy", label: labels.cookiePolicy },
    { href: "/html-sitemap", label: labels.htmlSitemap },
  ];

  return (
    <footer dir={isArabic ? "rtl" : "ltr"} className={styles.footer}>
      <div className="container-pad">
        <div className={styles.projectRow}>
          <div>
            <h2>{labels.projectTitle}</h2>
            <p>{labels.projectDescription}</p>
          </div>
          <Link href={localizedPath("/contact", locale)} className={styles.quoteButton}>
            {labels.quote}<ArrowRight className={styles.arrow} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.main}>
          <div className={styles.brand}>
            <Link href={localizedPath("/", locale)} prefetch={false} className={styles.logoLink} aria-label={isArabic ? "إيمترونكس — الصفحة الرئيسية" : "Emitronix home"}>
              <BrandLogo variant="reversed" imageClassName={styles.logo} sizes="224px" />
            </Link>
            <p className={styles.introduction}>{labels.introduction}</p>
            <ul className={styles.socialLinks} aria-label={labels.social}>
              {socialLinks.map((item) => {
                const Icon = socialIcons[item.label];
                return (
                  <li key={item.href}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={isArabic ? `إيمترونكس على ${item.label}` : `Emitronix on ${item.label}`} title={item.label}>
                      <span className={styles.socialBadge} data-social-platform={item.label}>
                        <Icon aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav className={styles.linkGroup} aria-labelledby="footer-company-heading">
            <h3 id="footer-company-heading">{labels.company}</h3>
            <ul>
              {currentNavItems.map((item) => (
                <li key={item.href}>
                  <Link href={localizedPath(item.href, locale)} prefetch={localizedPath(item.href, locale) === localizedPath("/", locale) ? false : undefined}>{item.label}</Link>
                </li>
              ))}
              <li><Link href={localizedPath("/careers", locale)}>{labels.careers}</Link></li>
            </ul>
          </nav>

          <nav className={styles.linkGroup} aria-labelledby="footer-services-heading">
            <h3 id="footer-services-heading">{labels.services}</h3>
            <ul>
              {featuredServices.map((service) => (
                <li key={service.href}>
                  <Link href={localizedPath(service.href, locale)}>{isArabic ? arabicServiceTitle(service.href) : service.title}</Link>
                </li>
              ))}
              <li className={styles.hubLink}><Link href={localizedPath("/services", locale)}>{labels.allServices}<ArrowRight className={styles.arrow} aria-hidden="true" /></Link></li>
            </ul>
          </nav>

          <nav className={`${styles.linkGroup} ${styles.approvals}`} aria-labelledby="footer-approvals-heading">
            <h3 id="footer-approvals-heading">{labels.approvals}</h3>
            <ul>
              {approvalServices.slice(0, 6).map((service) => (
                <li key={service.href}>
                  <Link href={localizedPath(service.href, locale)}>{isArabic ? arabicApprovalTitle(service.href) : service.menuLabel}</Link>
                </li>
              ))}
              <li className={styles.hubLink}><Link href={localizedPath("/approval", locale)}>{labels.allApprovals}<ArrowRight className={styles.arrow} aria-hidden="true" /></Link></li>
            </ul>
          </nav>

          <section className={styles.contact} aria-labelledby="footer-contact-heading">
            <h3 id="footer-contact-heading">{labels.contact}</h3>
            <address className={styles.contactDetails}>
              <div>
                <span className={styles.contactLabel}>{labels.office}</span>
                <a href={site.phoneHref} dir="ltr">{site.phone}</a>
              </div>
              <div>
                <span className={styles.contactLabel}>{labels.mobile}</span>
                <a href={site.mobileHref} dir="ltr">{site.mobile}</a>
              </div>
              <a href={`mailto:${site.email}`} dir="ltr" className={styles.email}>{site.email}</a>
              <p className={styles.location}>{labels.location}</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>{labels.whatsapp}<ArrowRight className={styles.arrow} aria-hidden="true" /></a>
            </address>
          </section>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} {site.legalName}. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          <nav aria-label={labels.legal}>
            <ul className={styles.legalLinks}>
              {legalLinks.map((link) => <li key={link.href}><Link href={localizedPath(link.href, locale)}>{link.label}</Link></li>)}
              <li><CookieSettingsFooterButton label={labels.cookieSettings} /></li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
