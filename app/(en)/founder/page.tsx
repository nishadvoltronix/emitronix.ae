import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import type { Metadata } from "next";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircuitBoard,
  FileCheck2,
  Lightbulb,
  MapPin,
  ShieldAlert,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { PremiumSectionHeading } from "@/components/Premium";
import { founderProfile } from "@/data/authority";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl, site } from "@/data/site";
import { trustContentLastReviewedIso } from "@/data/trustCenter";
import { buildCanonicalUrl } from "@/lib/seoRouting";

const pageUrl = buildCanonicalUrl(founderProfile.profilePath);
const pageDescription =
  "Meet Marieswaran Sadaiappan, Founder & Managing Director of Emitronix Contracting LLC, and review the professional themes published for this profile.";
const founderContextImage = getGeneratedImage("team.engineering-leadership-site-review");

export const metadata: Metadata = {
  title: {
    absolute: `Marieswaran Sadaiappan | Founder of ${site.name}`,
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
    title: `Marieswaran Sadaiappan | Founder & Managing Director`,
    description: pageDescription,
    images: [
      {
        url: absoluteUrl(founderContextImage.og!.src),
        width: founderContextImage.og!.width,
        height: founderContextImage.og!.height,
        alt: "Construction leaders reviewing site activity in Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Marieswaran Sadaiappan | ${site.name}`,
    description: pageDescription,
    images: [absoluteUrl(founderContextImage.og!.src)],
  },
};

const leadershipIcons = [BriefcaseBusiness, Workflow, FileCheck2, CircuitBoard, Users];
const futureIcons = [Lightbulb, Workflow, CircuitBoard];

const founderJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${founderProfile.name}, ${founderProfile.jobTitle}`,
      description: pageDescription,
      dateModified: trustContentLastReviewedIso,
      lastReviewed: trustContentLastReviewedIso,
      isPartOf: {
        "@id": absoluteUrl("/#website"),
      },
      mainEntity: {
        "@id": `${pageUrl}#person`,
      },
    },
    {
      "@type": "Person",
      "@id": `${pageUrl}#person`,
      name: founderProfile.name,
      jobTitle: founderProfile.jobTitle,
      url: pageUrl,
      worksFor: {
        "@id": absoluteUrl("/#organization"),
      },
      knowsAbout: [
        "Electrical engineering",
        "Construction management",
        "Project execution",
        "Authority coordination",
        "Technical leadership",
        "Client management",
        "Innovation",
        "Digital transformation",
        "AI adoption in construction",
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") },
        { "@type": "ListItem", position: 3, name: "Founder", item: pageUrl },
      ],
    },
  ],
};

const sectionPhotos = getSectionPhotographs("/founder", 5);

export default function FounderPage() {
  return (
    <InternalPageFrame>
      <div className="bg-white text-charcoal">
        <section className="internal-page-intro premium-grid relative overflow-hidden pb-16 pt-10 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-32 h-px w-2/3 bg-gradient-to-r from-transparent via-brand/[0.24] to-transparent" />
            <div className="absolute bottom-20 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-sky/20 to-transparent" />
          </div>

          <div className="container-pad relative">
            <nav className="mb-9 flex flex-wrap items-center gap-2 text-sm font-bold text-steel" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-brand">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/about" className="transition hover:text-brand">About</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-charcoal">Founder</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.72fr] lg:items-center">
              <div className="max-w-5xl">
                <p className="premium-kicker">Founder profile</p>
                <h1 className="internal-page-title mt-5 text-balance text-5xl font-semibold leading-[0.96] tracking-tight text-charcoal sm:text-7xl lg:text-8xl">
                  {founderProfile.name}
                </h1>
                <p className="mt-5 text-xl font-semibold tracking-tight text-brand sm:text-2xl">
                  {founderProfile.jobTitle}
                </p>
                <p className="mt-7 max-w-4xl text-lg leading-9 text-steel">
                  {founderProfile.professionalSummary}
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/leadership" className="premium-button">
                    Leadership functions <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/company-information" className="premium-button-light">
                    Company information <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <aside className="luxury-surface rounded-lg p-6 sm:p-8" aria-label="Founder identity summary">
                <div className="grid h-28 w-28 place-items-center rounded-lg bg-brand text-4xl font-semibold tracking-tight text-white shadow-blue">
                  MS
                </div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-brand">Published identity</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">{founderProfile.name}</h2>
                <div className="mt-6 grid gap-3">
                  {founderProfile.identityDetails.map((detail) => (
                    <div key={detail.label} className="rounded-lg border border-brand/[0.12] bg-white p-4 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">{detail.label}</p>
                      <p className="mt-1 text-sm font-bold leading-6 text-charcoal">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={0} sections={5} /></div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-pad">
            <PremiumSectionHeading
              eyebrow="Professional focus"
              title="Engineering perspective connected to construction delivery."
              description="The profile is intentionally limited to the professional themes supplied for publication, without inferred credentials, timelines or project claims."
              align="center"
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {founderProfile.leadershipThemes.map((theme, index) => {
                const Icon = leadershipIcons[index];
                return (
                  <article key={theme.title} className="luxury-card rounded-lg p-6">
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{theme.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-steel">{theme.description}</p>
                  </article>
                );
              })}
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={1} sections={5} /></div>
          </div>
        </section>

        <section className="blue-grid section-pad">
          <div className="container-pad grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <PremiumSectionHeading
              eyebrow="Forward-looking themes"
              title="Innovation with a practical construction purpose."
              description="These themes describe the profile’s stated interest in innovation, digital transformation and responsible AI adoption in construction."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {founderProfile.futureFocusedThemes.map((theme, index) => {
                const Icon = futureIcons[index];
                return (
                  <article key={theme.title} className="rounded-lg border border-brand/[0.12] bg-white/[0.88] p-6 shadow-none backdrop-blur-xl">
                    <Icon className="h-8 w-8 text-brand" aria-hidden="true" />
                    <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{theme.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-steel">{theme.description}</p>
                  </article>
                );
              })}
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={2} sections={5} /></div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-pad">
            <div className="grid gap-8 rounded-lg border border-amber-200 bg-amber-50/70 p-6 shadow-none lg:grid-cols-[0.72fr_1.28fr] lg:p-9">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-amber-700 shadow-sm">
                  <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Publication boundary</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
                  Profile details intentionally withheld.
                </h2>
                <p className="mt-4 text-base font-semibold leading-8 text-amber-900">
                  {founderProfile.publicationGate.statement}
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {founderProfile.publicationGate.fields.map((field) => (
                  <li key={field} className="flex gap-3 rounded-lg border border-amber-200 bg-white p-4 text-sm font-bold leading-6 text-charcoal">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={3} sections={5} /></div>
          </div>
        </section>

        <section className="soft-section py-16 lg:py-20">
          <div className="container-pad">
            <div className="grid gap-8 rounded-lg border border-brand/[0.15] bg-white/[0.9] p-6 shadow-none lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
              <div>
                <p className="premium-kicker">Continue exploring</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal">
                  Review the company facts and delivery functions.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-steel">
                  Company contact information is maintained in the verified website business record, while unnamed leadership disciplines are presented only as role-based functions.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/company-information" className="premium-button">
                  Company facts <Building2 className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="premium-button-light">
                  Contact Emitronix <MapPin className="h-4 w-4" />
                </Link>
              </div>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={4} sections={5} /></div>
          </div>
        </section>
      </div>

      <ContentReviewRecord
        title="Founder profile content record"
        reviewScope="General editorial review of the founder identity, published role and professional focus areas. Education, employment chronology, experience duration, registrations and individual credentials remain behind the visible management-verification gate."
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(founderJsonLd) }} />
    </InternalPageFrame>
  );
}
