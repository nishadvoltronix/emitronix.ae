import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { PremiumSectionHeading } from "@/components/Premium";
import { companyFacts } from "@/data/authority";
import { absoluteUrl, brandAssets, site } from "@/data/site";
import { trustContentLastReviewedIso } from "@/data/trustCenter";
import { buildCanonicalUrl } from "@/lib/seoRouting";

const pageUrl = buildCanonicalUrl("/company-information");
const pageDescription =
  "Review the published legal name, website, contact details, Dubai location, business hours and service areas for Emitronix Contracting LLC.";

export const metadata: Metadata = {
  title: {
    absolute: `Company Information | ${site.legalName}`,
  },
  description: pageDescription,
  alternates: {
    canonical: pageUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: pageUrl,
    siteName: site.name,
    title: `Company Information | ${site.name}`,
    description: pageDescription,
    images: [
      {
        url: absoluteUrl(brandAssets.socialCard),
        width: 1200,
        height: 630,
        alt: "Dubai commercial building and warehouse construction scene",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Company Information | ${site.name}`,
    description: pageDescription,
    images: [absoluteUrl(brandAssets.socialCard)],
  },
};

const identityIcons = [Building2, FileText, Globe2];
const contactIcons = [Phone, Smartphone, Mail, MapPin, Clock];

const companyInformationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Company information for ${site.legalName}`,
      description: pageDescription,
      dateModified: trustContentLastReviewedIso,
      lastReviewed: trustContentLastReviewedIso,
      isPartOf: {
        "@id": absoluteUrl("/#website"),
      },
      mainEntity: {
        "@id": absoluteUrl("/#organization"),
      },
      about: {
        "@id": absoluteUrl("/#organization"),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") },
        { "@type": "ListItem", position: 3, name: "Company Information", item: pageUrl },
      ],
    },
  ],
};

const sectionPhotos = getSectionPhotographs("/company-information", 5);

export default function CompanyInformationPage() {
  return (
    <InternalPageFrame>
      <div className="bg-white text-charcoal">
        <section className="internal-page-intro premium-grid relative overflow-hidden pb-16 pt-10 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-28 h-px w-2/3 bg-gradient-to-r from-transparent via-brand/[0.24] to-transparent" />
            <div className="absolute bottom-16 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-sky/20 to-transparent" />
          </div>

          <div className="container-pad relative">
            <nav className="mb-9 flex flex-wrap items-center gap-2 text-sm font-bold text-steel" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-brand">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/about" className="transition hover:text-brand">About</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-charcoal">Company Information</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.06fr_0.74fr] lg:items-center">
              <div className="max-w-5xl">
                <p className="premium-kicker">Company information</p>
                <h1 className="internal-page-title mt-5 text-balance text-5xl font-semibold leading-[0.96] tracking-tight text-charcoal sm:text-7xl lg:text-8xl">
                  Published business facts in one clear place.
                </h1>
                <p className="mt-7 max-w-4xl text-lg leading-9 text-steel">
                  This page presents the legal name, brand name, website, contact details, published Dubai location, business hours and service areas maintained in the verified website business record.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/contact" className="premium-button">
                    Contact Emitronix <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/founder" className="premium-button-light">
                    Founder profile <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <aside className="luxury-surface rounded-lg p-6 sm:p-8" aria-label="Emitronix identity">
                <div className="rounded-lg border border-brand/[0.12] bg-white p-5 shadow-sm">
                  <BrandLogo
                    alt="Emitronix — Building the Future"
                    className="block w-full"
                    priority
                    imageClassName="h-auto w-full object-contain"
                    sizes="(min-width: 1024px) 420px, 100vw"
                  />
                </div>
                <p className="mt-7 premium-kicker">Legal business name</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">{site.legalName}</h2>
                <div className="mt-6 flex items-start gap-3 rounded-lg border border-brand/[0.12] bg-brand-soft p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <p className="text-sm font-bold leading-7 text-charcoal">{site.location}</p>
                </div>
              </aside>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={0} sections={6} /></div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-pad">
            <PremiumSectionHeading
              eyebrow="Identity"
              title="Published company identity."
              description="These values come from the verified website business record used throughout the site."
              align="center"
            />
            <dl className="mt-12 grid gap-5 md:grid-cols-3">
              {companyFacts.identity.map((fact, index) => {
                const Icon = identityIcons[index];
                const value = fact.href ? (
                  <a href={fact.href} className="break-words transition hover:text-brand">
                    {fact.value}
                  </a>
                ) : fact.value;

                return (
                  <div key={fact.label} className="luxury-card rounded-lg p-6">
                    <Icon className="h-8 w-8 text-brand" aria-hidden="true" />
                    <dt className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-brand">{fact.label}</dt>
                    <dd className="mt-3 text-xl font-semibold leading-8 text-charcoal">{value}</dd>
                  </div>
                );
              })}
            </dl>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={1} sections={6} /></div>
          </div>
        </section>

        <section className="section-pad soft-section">
          <div className="container-pad grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <PremiumSectionHeading
              eyebrow="Contact details"
              title="Direct business contact information."
              description="Use the published phone number, email address and location for company or project enquiries during the listed business hours."
            />
            <dl className="grid gap-4 sm:grid-cols-2">
              {companyFacts.contact.map((fact, index) => {
                const Icon = contactIcons[index];
                const value = fact.href ? (
                  <a href={fact.href} className="break-words transition hover:text-brand">
                    {fact.value}
                  </a>
                ) : fact.value;

                return (
                  <div
                    key={fact.label}
                    className={`rounded-lg border border-brand/[0.12] bg-white p-6 shadow-none ${index === companyFacts.contact.length - 1 ? "sm:col-span-2" : ""}`}
                  >
                    <Icon className="h-7 w-7 text-brand" aria-hidden="true" />
                    <dt className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-brand">{fact.label}</dt>
                    <dd className="mt-3 text-base font-semibold leading-7 text-charcoal">{value}</dd>
                  </div>
                );
              })}
            </dl>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={2} sections={6} /></div>
          </div>
        </section>

        <section className="blue-grid section-pad">
          <div className="container-pad grid gap-10 lg:grid-cols-2">
            <div>
              <PremiumSectionHeading
                eyebrow="Published service areas"
                title="Locations in the verified website record."
                description="The list below reflects the published service-area values and does not add office, branch or local-registration claims."
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {companyFacts.serviceAreas.map((area) => (
                  <div key={area} className="flex items-center gap-3 rounded-lg border border-brand/[0.12] bg-white/[0.88] p-4 shadow-sm">
                    <MapPin className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                    <span className="text-sm font-semibold text-charcoal">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <PremiumSectionHeading
                eyebrow="Service directory"
                title="Published core service pages."
                description="Open a service page to review its scope and enquiry pathway."
              />
              <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Published core services">
                {companyFacts.serviceLinks.map((service) => (
                  <Link key={service.href} href={service.href} className="premium-menu-link">
                    {service.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={3} sections={6} /></div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-pad">
            <div className="grid gap-8 rounded-lg border border-amber-200 bg-amber-50/70 p-6 shadow-none lg:grid-cols-[0.72fr_1.28fr] lg:p-9">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-amber-700 shadow-sm">
                  <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Company disclosure gate</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
                  Unpublished company details are not inferred.
                </h2>
                <p className="mt-4 text-base font-semibold leading-8 text-amber-900">
                  {companyFacts.publicationGate.statement}
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {companyFacts.publicationGate.fields.map((field) => (
                  <li key={field} className="flex gap-3 rounded-lg border border-amber-200 bg-white p-4 text-sm font-bold leading-6 text-charcoal">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={4} sections={6} /></div>
          </div>
        </section>

        <section className="section-pad soft-section">
          <div className="container-pad grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="premium-kicker">Company pathways</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                Continue to the founder, leadership functions or contact page.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/founder" className="premium-button">
                Founder profile <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/leadership" className="premium-button-light">
                Leadership functions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ContentReviewRecord
        title="Company information content record"
        reviewScope="General editorial review against the centralized website business record. Incorporation history, licence identifiers, insurance, exact office address, map coordinates, social profiles and Google Business Profile data remain unpublished until documentary verification."
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(companyInformationJsonLd) }} />
    </InternalPageFrame>
  );
}
