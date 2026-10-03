import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileCheck2,
  HardHat,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { CareerApplicationForm } from "@/components/CareerApplicationForm";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl, site } from "@/data/site";
import { createMetadataResolver } from "@/data/seo";

export const generateMetadata = createMetadataResolver({
  title: "Construction Career Interest | Emitronix Dubai",
  description:
    "Register interest in future construction, engineering, project management and site supervision opportunities with Emitronix in Dubai.",
  path: "/careers",
  keywords: [
    "Emitronix careers",
    "construction jobs in Dubai",
    "civil engineering jobs Dubai",
    "site supervisor jobs Dubai",
    "project management careers UAE",
  ],
  image: getGeneratedImage("team.construction-team-dubai").og!.src,
  imageAlt: getGeneratedImage("team.construction-team-dubai").alt,
});

type CareerCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const whyWorkWithUs: CareerCard[] = [
  {
    title: "Dubai project exposure",
    description:
      "Work around civil construction, fit-out, approval coordination and site delivery requirements across Dubai and the UAE.",
    icon: Building2,
  },
  {
    title: "Professional site discipline",
    description:
      "Join a culture that values drawing control, practical coordination, safety awareness and handover readiness.",
    icon: HardHat,
  },
  {
    title: "Clear communication",
    description:
      "Structured updates, consultant coordination and document visibility help teams move with confidence.",
    icon: Users,
  },
  {
    title: "Growth-focused environment",
    description:
      "Bring construction experience, technical curiosity and ownership to a growing Dubai contracting company.",
    icon: Sparkles,
  },
];

const openings = [
  {
    title: "Civil Engineering & Site Execution",
    description:
      "For engineers and site professionals with construction coordination, drawings, quantities, inspections or execution experience.",
    icon: HardHat,
    tags: ["Civil works", "Site coordination", "Dubai projects"],
  },
  {
    title: "Site Supervision & Safety Coordination",
    description:
      "For supervisors and safety-aware field teams who can support daily site control, quality checks and workforce coordination.",
    icon: ShieldCheck,
    tags: ["Supervision", "Safety", "Quality control"],
  },
  {
    title: "Project Management & Document Control",
    description:
      "For coordinators who can manage schedules, drawings, authority comments, procurement follow-up and client communication.",
    icon: ClipboardCheck,
    tags: ["Planning", "Documents", "Reporting"],
  },
  {
    title: "Fit-Out & Authority Coordination",
    description:
      "For professionals familiar with interior fit-out, MEP interfaces, Dubai authority workflows and project close-out support.",
    icon: FileCheck2,
    tags: ["Fit-out", "Approvals", "Handover"],
  },
];

const applicationHighlights = [
  "Construction, engineering, project management and site supervision profiles",
  "Dubai or UAE project experience is helpful where relevant",
  "CV upload supports PDF, DOC and DOCX formats",
  "Applications are reviewed against suitable project requirements",
];

const careersJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Careers at Emitronix Contracting LLC",
  url: absoluteUrl("/careers"),
  description:
    "Construction, engineering, project management and site supervision career application page for Emitronix Contracting LLC in Dubai, UAE.",
  about: {
    "@id": absoluteUrl("/#organization"),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Careers", item: absoluteUrl("/careers") },
  ],
};

export default function CareersPage() {
  const sectionPhotographs = getSectionPhotographs("/careers", 4);
  return (
    <InternalPageFrame>
      <div className="bg-white text-charcoal">
        <section className="internal-page-intro premium-grid relative overflow-hidden pb-16 pt-10 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-32 h-px w-2/3 bg-gradient-to-r from-transparent via-brand/[0.28] to-transparent" />
            <div className="absolute bottom-20 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-brand/[0.14] to-transparent" />
          </div>

          <div className="container-pad relative">
            <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-bold text-steel" aria-label="Breadcrumb">
            <Link href="/" prefetch={false} className="transition hover:text-brand">Home</Link>
              <span aria-hidden="true">/</span>
              <span className="text-charcoal">Careers</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="max-w-4xl">
                <p className="premium-kicker">Construction Careers Dubai</p>
                <h1 className="internal-page-title mt-5 text-balance text-5xl font-semibold leading-[0.96] tracking-tight text-charcoal sm:text-7xl lg:text-8xl">
                  Build Your Career With Emitronix
                </h1>
                <p className="mt-7 max-w-3xl text-lg leading-8 text-steel sm:text-xl sm:leading-9">
                  Register your interest in future construction, engineering, project coordination and site-delivery opportunities with Emitronix.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a href="#career-application" className="premium-button">
                    Register Interest <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="#current-openings" className="premium-button-light">
                    View Talent Areas <BriefcaseBusiness className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-brand/[0.15] bg-pearl shadow-none lg:min-h-[560px]">
                <ResponsiveIllustrativeImage
                  asset={getGeneratedImage("team.construction-team-dubai")}
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="absolute inset-0 block h-full w-full"
                  imageClassName="h-full w-full object-cover"
                  imageStyle={{ height: "100%", objectFit: "cover" }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/88 via-white/32 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/70 bg-white/[0.82] p-5 shadow-none backdrop-blur-2xl">
                  <p className="premium-kicker">Dubai, UAE</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">Construction roles built around discipline, trust and site clarity.</h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-pad">
            <div className="mx-auto max-w-5xl text-center">
              <p className="premium-kicker">Why Work With Us</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
                A premium construction environment for people who value clarity.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-steel sm:text-lg">
                Emitronix looks for professionals who care about practical site decisions, documented communication and reliable project coordination.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {whyWorkWithUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="luxury-card rounded-lg p-6">
                    {index === 0 || index === 2 ? <div className="mb-5"><SectionPhotograph photo={sectionPhotographs[index === 0 ? 0 : 1]} compact /></div> : null}
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-steel">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="current-openings" className="soft-section section-pad scroll-mt-28">
          <div className="container-pad">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="premium-kicker">Talent Areas</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-charcoal sm:text-5xl">
                  Register interest in role areas that match your experience.
                </h2>
              </div>
              <p className="max-w-3xl text-base leading-8 text-steel">
                These are professional interest areas, not confirmed vacancies or job offers. Submit your CV only if you want the team to consider it when a suitable requirement is verified.
              </p>
            </div>

            <div className="mt-6 max-w-3xl"><SectionPhotograph photo={sectionPhotographs[2]} compact /></div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {openings.map((opening) => {
                const Icon = opening.icon;
                return (
                  <article key={opening.title} className="rounded-lg border border-brand/[0.12] bg-white p-6 shadow-none transition duration-300 hover:-translate-y-1 hover:border-brand/[0.25] hover:shadow-none">
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                        <Icon className="h-7 w-7" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-semibold tracking-tight text-charcoal">{opening.title}</h3>
                          <span className="rounded-full border border-brand/[0.15] bg-pearl px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                            Dubai, UAE
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-steel">{opening.description}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {opening.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="career-application" className="blue-grid section-pad scroll-mt-28">
          <div className="container-pad grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="premium-kicker">Application Form</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-charcoal sm:text-5xl">
                Submit your profile for Dubai construction opportunities.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-steel">
                Complete the form with your experience, location, salary expectation and notice period so Emitronix can review your suitability if a relevant requirement becomes available. Submission does not guarantee contact, interview or employment.
              </p>

              <div className="mt-8 grid gap-3">
                {applicationHighlights.map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white/[0.82] p-4 shadow-sm backdrop-blur-xl">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <p className="text-sm font-bold leading-6 text-charcoal">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-lg border border-brand/[0.15] bg-white/[0.82] p-5 shadow-none backdrop-blur-xl">
                <div className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" />
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal">Company Location</h3>
                    <p className="mt-1 text-sm leading-6 text-steel">{site.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <CareerApplicationForm email={site.email} />
              <SectionPhotograph photo={sectionPhotographs[3]} compact />
            </div>
          </div>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(careersJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </InternalPageFrame>
  );
}
