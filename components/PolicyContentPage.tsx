import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { CalendarDays, Cookie, FileText, Languages, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import styles from "./InternalPage.module.css";
import { type CookieLanguage, type CookiePolicyPageKey, type LocalizedPolicyPage } from "@/data/cookieConsentDefaults";
import { absoluteUrl, site } from "@/data/site";
import { policyPageRoutes } from "@/lib/policyPages";

const pageLabels: Record<CookiePolicyPageKey, Record<CookieLanguage, string>> = {
  cookiePolicy: {
    en: "Cookie Policy",
    ar: "سياسة ملفات الارتباط",
  },
  privacyPolicy: {
    en: "Privacy Policy",
    ar: "سياسة الخصوصية",
  },
  terms: {
    en: "Terms & Conditions",
    ar: "الشروط والأحكام",
  },
};

const complianceLabels = {
  en: {
    eyebrow: "Website transparency",
    languageSwitch: "Arabic version",
    contact: "For privacy or cookie questions, contact Emitronix using the published contact details on the website.",
    legalNote: "This page is maintained for website transparency and may be updated when policies, tools or legal requirements change.",
  },
  ar: {
    eyebrow: "شفافية الموقع",
    languageSwitch: "English version",
    contact: "لأي أسئلة حول الخصوصية أو ملفات الارتباط، يرجى التواصل مع Emitronix عبر بيانات الاتصال المنشورة في الموقع.",
    legalNote: "تتم صيانة هذه الصفحة لدعم شفافية الموقع وقد يتم تحديثها عند تغير السياسات أو الأدوات أو المتطلبات القانونية.",
  },
};

function formatDate(value: string, language: CookieLanguage) {
  return new Intl.DateTimeFormat(language === "ar" ? "ar-AE" : "en-AE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function PolicyContentPage({
  pageKey,
  page,
  language,
  updatedAt,
}: {
  pageKey: CookiePolicyPageKey;
  page: LocalizedPolicyPage[CookieLanguage];
  language: CookieLanguage;
  updatedAt: string;
}) {
  const isRtl = language === "ar";
  const alternateLanguage = language === "ar" ? "en" : "ar";
  const currentHref = policyPageRoutes[pageKey][language];
  const pageUrl = absoluteUrl(currentHref);
  const sectionPhotos = getSectionPhotographs(currentHref, 5);
  const homeHref = language === "ar" ? "/ar" : "/";
  const homeLabel = language === "ar" ? "الرئيسية" : "Home";

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.description,
        inLanguage: language === "ar" ? "ar-AE" : "en-AE",
        dateModified: updatedAt,
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: homeLabel,
            item: absoluteUrl(homeHref),
          },
          { "@type": "ListItem", position: 2, name: page.title, item: pageUrl },
        ],
      },
    ],
  };
  const safePageJsonLd = JSON.stringify(pageJsonLd).replace(/</g, "\\u003c");

  return (
    <InternalPageFrame lang={language === "ar" ? "ar-AE" : "en-AE"} dir={isRtl ? "rtl" : "ltr"}>
    <article lang={language === "ar" ? "ar-AE" : "en-AE"} dir={isRtl ? "rtl" : "ltr"} className="bg-white text-charcoal">
      <section className={styles.policyHero}>
        <div className="container-pad">
          <div className={styles.policyBody}>
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-steel" aria-label={language === "ar" ? "مسار التنقل" : "Breadcrumb"}>
              <Link href={homeHref} prefetch={false} className="transition hover:text-brand">
                {homeLabel}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-charcoal">{page.title}</span>
            </nav>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="premium-kicker">{complianceLabels[language].eyebrow}</p>
              <Link href={policyPageRoutes[pageKey][alternateLanguage]} className="premium-button-light">
                <Languages className="h-4 w-4" />
                {complianceLabels[language].languageSwitch}
              </Link>
            </div>
            <h1 className={styles.editorialTitle}>
              {page.title}
            </h1>
            <p className={styles.editorialDescription}>{page.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className={styles.policyStatus}>
                <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                {page.lastUpdatedLabel}: {formatDate(updatedAt, language)}
              </span>
              <span className={styles.policyStatus}>
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                {language === "ar" ? "ضوابط الخصوصية والموافقة" : "Privacy and consent controls"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-pad">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="luxury-card rounded-lg p-6">
                <Cookie className="h-8 w-8 text-brand" />
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">{site.name}</h2>
                <p className="mt-3 text-sm leading-7 text-steel">{complianceLabels[language].legalNote}</p>
                <div className="mt-6 grid gap-2">
                  {(Object.keys(policyPageRoutes) as CookiePolicyPageKey[]).map((key) => (
                    <Link
                      key={key}
                      href={policyPageRoutes[key][language]}
                      aria-current={key === pageKey ? "page" : undefined}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                        key === pageKey
                          ? "border-brand bg-brand text-white shadow-blue"
                          : "border-brand/[0.12] bg-white text-charcoal hover:bg-brand-soft hover:text-brand"
                      }`}
                    >
                      {pageLabels[key][language]}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            <div className="grid gap-5">
              {page.sections.map((section, index) => (
                <section key={section.heading} className="luxury-card rounded-lg p-6 lg:p-8">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-charcoal">{section.heading}</h2>
                      <p className="mt-4 whitespace-pre-line text-base leading-8 text-steel">{section.body}</p>
                      <SectionPhotoPlacement photos={sectionPhotos} index={index} sections={page.sections.length} locale={language} />
                    </div>
                  </div>
                </section>
              ))}

              <section className="rounded-lg border border-brand/[0.15] bg-brand-soft p-6 lg:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-charcoal">{site.legalName}</h2>
                <p className="mt-4 text-base leading-8 text-steel">{complianceLabels[language].contact}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={`mailto:${site.email}`} className="premium-button-light">{site.email}</a>
                  <a href={site.phoneHref} className="premium-button">{site.phone}</a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safePageJsonLd }} />
    </article>
    </InternalPageFrame>
  );
}
