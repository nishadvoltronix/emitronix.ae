import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CheckCircle2,
  CircuitBoard,
  ClipboardCheck,
  HardHat,
  Package,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { PremiumSectionHeading } from "@/components/Premium";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import {
  founderProfile,
  leadershipFunctions,
  leadershipPublicationGate,
} from "@/data/authority";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl, site } from "@/data/site";
import { trustContentLastReviewedIso } from "@/data/trustCenter";
import { buildCanonicalUrl } from "@/lib/seoRouting";

const pageUrl = buildCanonicalUrl("/leadership");
const pageDescription =
  "Review the named founder profile and the role-based construction delivery functions presented by Emitronix Contracting LLC.";
const leadershipImage = getGeneratedImage("team.engineering-leadership-site-review");

export const metadata: Metadata = {
  title: {
    absolute: `Leadership & Delivery Functions | ${site.name}`,
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
    title: `Leadership & Delivery Functions | ${site.name}`,
    description: pageDescription,
    images: [
      {
        url: absoluteUrl(leadershipImage.og!.src),
        width: leadershipImage.og!.width,
        height: leadershipImage.og!.height,
        alt: leadershipImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Leadership & Delivery Functions | ${site.name}`,
    description: pageDescription,
    images: [absoluteUrl(leadershipImage.og!.src)],
  },
};

const functionIcons: Record<string, LucideIcon> = {
  "operations-management": Settings,
  "engineering-management": CircuitBoard,
  "civil-engineering": Building2,
  "electrical-engineering": Zap,
  "mep-engineering": Wrench,
  estimation: Calculator,
  "quality-assurance-control": BadgeCheck,
  "health-safety-environment": ShieldCheck,
  procurement: Package,
  "project-management": ClipboardCheck,
  "site-supervision": HardHat,
};

const leadershipJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Leadership and delivery functions at ${site.name}`,
      description: pageDescription,
      dateModified: trustContentLastReviewedIso,
      lastReviewed: trustContentLastReviewedIso,
      isPartOf: {
        "@id": absoluteUrl("/#website"),
      },
      about: {
        "@id": absoluteUrl("/#organization"),
      },
      mainEntity: {
        "@id": absoluteUrl("/#organization"),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") },
        { "@type": "ListItem", position: 3, name: "Leadership", item: pageUrl },
      ],
    },
  ],
};

const sectionPhotos = getSectionPhotographs("/leadership", 5);

export default function LeadershipPage() {
  return (
    <InternalPageFrame>
      <div className="bg-white text-charcoal">
        <section className="internal-page-intro premium-grid relative overflow-hidden pb-16 pt-10 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[12%] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-brand/20 to-transparent lg:block" />
            <div className="absolute bottom-20 left-0 h-px w-2/3 bg-gradient-to-r from-transparent via-brand-sky/20 to-transparent" />
          </div>

          <div className="container-pad relative">
            <nav className="mb-9 flex flex-wrap items-center gap-2 text-sm font-bold text-steel" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-brand">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/about" className="transition hover:text-brand">About</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-charcoal">Leadership</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.02fr_0.78fr] lg:items-end">
              <div className="max-w-5xl">
                <p className="premium-kicker">Leadership & delivery</p>
                <h1 className="internal-page-title mt-5 text-balance text-5xl font-semibold leading-[0.96] tracking-tight text-charcoal sm:text-7xl lg:text-8xl">
                  Leadership identity with clear publication boundaries.
                </h1>
                <p className="mt-7 max-w-4xl text-lg leading-9 text-steel">
                  {founderProfile.name} is the named Founder & Managing Director. The other sections on this page explain role-based delivery functions and do not identify current appointees, reporting lines or team size.
                </p>
              </div>

              <div className="grid gap-5">
                <figure className="relative aspect-[3/2] overflow-hidden rounded-lg border border-brand/[0.15] bg-brand-soft shadow-none">
                  <ResponsiveIllustrativeImage
                    asset={leadershipImage}
                    priority
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="absolute inset-0 block h-full w-full"
                    imageClassName="h-full w-full object-cover"
                    imageStyle={{ height: "100%", objectFit: "cover" }}
                  />
                </figure>
                <aside className="luxury-surface rounded-lg p-6 sm:p-8">
                <span className="grid h-14 w-14 place-items-center rounded-lg bg-brand text-white shadow-blue">
                  <Users className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="mt-6 premium-kicker">Named profile</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">{founderProfile.name}</h2>
                <p className="mt-2 text-base font-semibold text-brand">{founderProfile.jobTitle}</p>
                <p className="mt-4 text-sm leading-7 text-steel">
                  The founder profile contains only the professional themes supplied for publication.
                </p>
                <Link href={founderProfile.profilePath} className="premium-button mt-6 w-full">
                  View founder profile <ArrowRight className="h-4 w-4" />
                </Link>
                </aside>
              </div>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={0} sections={4} /></div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-pad">
            <PremiumSectionHeading
              eyebrow="Role-based functions"
              title="How construction delivery responsibilities are grouped."
              description="These profiles explain the purpose, responsibilities and technical interfaces of each function. They are not biographies and do not confirm a named employee, current vacancy, headcount or professional registration."
              align="center"
            />

            <div className="mt-12 grid gap-6 xl:grid-cols-2">
              {leadershipFunctions.map((deliveryFunction) => {
                const Icon = functionIcons[deliveryFunction.id] ?? Users;
                return (
                  <article key={deliveryFunction.id} id={deliveryFunction.id} className="luxury-card scroll-mt-28 rounded-lg p-6 lg:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </span>
                      <span className="w-fit rounded-full border border-brand/[0.15] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                        {deliveryFunction.profileType}
                      </span>
                    </div>

                    <h2 className="mt-6 text-3xl font-semibold tracking-tight text-charcoal">{deliveryFunction.title}</h2>
                    <p className="mt-4 text-base leading-8 text-steel">{deliveryFunction.summary}</p>

                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Core expertise</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {deliveryFunction.coreExpertise.map((item) => (
                          <span key={item} className="rounded-full border border-brand/[0.12] bg-brand-soft px-3 py-2 text-xs font-semibold text-charcoal">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.3rem] border border-brand/[0.12] bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Industry specialization</p>
                      <p className="mt-2 text-sm font-bold leading-7 text-charcoal">{deliveryFunction.specialization}</p>
                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-charcoal">Responsibilities</h3>
                        <ul className="mt-3 grid gap-3">
                          {deliveryFunction.responsibilities.map((item) => (
                            <li key={item} className="flex gap-3 text-sm leading-7 text-steel">
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-charcoal">Technical capabilities</h3>
                        <ul className="mt-3 grid gap-3">
                          {deliveryFunction.technicalCapabilities.map((item) => (
                            <li key={item} className="flex gap-3 text-sm leading-7 text-steel">
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={1} sections={4} /></div>
          </div>
        </section>

        <section className="section-pad soft-section">
          <div className="container-pad">
            <div className="grid gap-8 rounded-lg border border-amber-200 bg-amber-50/70 p-6 shadow-none lg:grid-cols-[0.72fr_1.28fr] lg:p-9">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-amber-700 shadow-sm">
                  <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Named profile gate</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
                  Function titles are not staff biographies.
                </h2>
                <p className="mt-4 text-base font-semibold leading-8 text-amber-900">
                  {leadershipPublicationGate.statement}
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {leadershipPublicationGate.fields.map((field) => (
                  <li key={field} className="flex gap-3 rounded-lg border border-amber-200 bg-white p-4 text-sm font-bold leading-6 text-charcoal">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={2} sections={4} /></div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-pad grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="premium-kicker">Authority pathways</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                Move from people and functions to verified company facts.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-steel">
                Review the published legal name, contact information, location, hours and service areas, or contact Emitronix using the verified website business record.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/company-information" className="premium-button">
                Company information <Building2 className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="premium-button-light">
                Contact Emitronix <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={3} sections={4} /></div>
          </div>
        </section>
      </div>

      <ContentReviewRecord
        title="Leadership functions content record"
        reviewScope="General editorial review of the role-based delivery functions and publication boundaries. Function descriptions are not staff biographies; names, appointments, qualifications and reporting lines require management verification before publication."
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(leadershipJsonLd) }} />
    </InternalPageFrame>
  );
}
