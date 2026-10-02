import { InternalPageFrame } from "@/components/InternalPageFrame";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  HardHat,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { FAQSection } from "@/components/ContentBlocks";
import { PremiumSectionHeading } from "@/components/Premium";
import { ProjectsPortfolio } from "@/components/ProjectsPortfolio";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import { getGeneratedImage } from "@/data/generatedImages";
import {
  projectFaqs,
  projectTimeline,
  verifiedCaseStudyPublicationRequirements,
} from "@/data/projects";
import { createMetadataResolver } from "@/data/seo";
import { absoluteUrl, site } from "@/data/site";
import { trustContentLastReviewedIso } from "@/data/trustCenter";

const portfolioHeroImage = getGeneratedImage("projects.portfolio-planning-dubai-hero");

export const generateMetadata = createMetadataResolver({
  title: "Construction Scope Planning Library | Dubai",
  description:
    "Illustrative Dubai construction planning scenarios for civil, MEP, fit-out, renovation, maintenance and approval coordination. These are not completed-project case studies.",
  path: "/projects",
  image: portfolioHeroImage.og!.src,
  imageAlt: portfolioHeroImage.alt,
});

const capabilities = [
  {
    title: "Civil and building scope",
    description:
      "Typical planning inputs include drawings, site condition, access, structural interfaces, sequencing, inspection points and handover records.",
    icon: HardHat,
  },
  {
    title: "MEP and fit-out interfaces",
    description:
      "Ceiling zones, utilities, equipment, fire-life-safety interfaces, finishes and operational constraints must be coordinated as one scope.",
    icon: Building2,
  },
  {
    title: "Approval coordination",
    description:
      "The applicable authority, consultant role, NOCs, technical submissions and inspection responsibilities must be confirmed for each project.",
    icon: FileCheck2,
  },
  {
    title: "Quality and handover",
    description:
      "Inspection records, testing, snags, as-built information, warranties and close-out responsibilities should be planned before completion.",
    icon: ClipboardCheck,
  },
];

const pageUrl = absoluteUrl("/projects");

const pageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Emitronix construction scope planning library",
      description:
        "Illustrative planning scenarios for common Dubai construction scopes. The scenarios are educational and are not presented as completed Emitronix projects.",
      isPartOf: { "@id": absoluteUrl("/#website") },
      about: capabilities.map((item) => ({ "@type": "Thing", name: item.title })),
      inLanguage: "en-AE",
      dateModified: trustContentLastReviewedIso,
      lastReviewed: trustContentLastReviewedIso,
      breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Scope Planning Library", item: pageUrl },
      ],
    },
  ],
};

export default function ProjectsPage() {
  return (
    <InternalPageFrame>
      <section className="internal-page-intro relative overflow-hidden bg-brand-dark text-white">
        <ResponsiveIllustrativeImage
          asset={portfolioHeroImage}
          priority
          sizes="100vw"
          className="absolute inset-0 block h-full w-full"
          imageClassName="h-full w-full object-cover"
          imageStyle={{ height: "100%", objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,0.94)_0%,rgba(18,58,115,0.78)_55%,rgba(11,31,58,0.52)_100%)]" />
        <div className="container-pad relative py-24 sm:py-32 lg:py-40">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-white/75" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Scope Planning Library</span>
          </nav>
          <div className="mt-12 max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-sky">Illustrative planning resources</p>
            <h1 className="internal-page-title mt-6 text-balance text-5xl font-semibold leading-[0.96] tracking-tight sm:text-7xl lg:text-8xl">
              Construction scope planning scenarios
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-white/85 sm:text-xl sm:leading-9">
              A practical library for understanding the documents, interfaces and delivery questions that commonly shape Dubai construction enquiries.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="#scenario-library" className="premium-button">
                Explore scenarios <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur-xl transition hover:bg-white hover:text-brand focus-ring">
                Discuss an actual scope
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-pad">
          <div className="grid gap-5 rounded-lg border border-amber-300 bg-amber-50 p-6 shadow-none md:grid-cols-[auto_1fr] md:items-start">
            <ShieldCheck className="h-9 w-9 text-amber-700" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Evidence and image notice</h2>
              <p className="mt-3 max-w-5xl text-sm leading-7 text-charcoal/80">
                Every scenario and image on this page is illustrative. It does not identify a completed Emitronix project, client, site, result, testimonial or before-and-after record. Verified case studies will be published only after evidence review and publication consent.
              </p>
              <p className="mt-5 text-sm font-semibold text-amber-900">
                TODO — management evidence required before any completed-project case study is published:
              </p>
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {verifiedCaseStudyPublicationRequirements.map((requirement) => (
                  <li key={requirement} className="flex gap-3 rounded-lg border border-amber-200 bg-white p-4 text-sm font-bold leading-6 text-charcoal">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="How to use this library"
            title="Start with scope clarity, not an assumed project history."
            description="The scenarios help an owner or consultant prepare a better first discussion. Final scope, availability, authority responsibilities, prices and programmes remain project-specific."
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="luxury-card rounded-lg p-6">
                  <Icon className="h-8 w-8 text-brand" aria-hidden="true" />
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div id="scenario-library" className="scroll-mt-28">
        <ProjectsPortfolio />
      </div>

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="Delivery framework"
            title="A general route from enquiry to handover planning."
            description="This sequence is educational. The appointed project team must confirm the actual consultant, contractor, authority and client responsibilities."
            align="center"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {projectTimeline.map((item) => (
              <article key={item.phase} className="luxury-card grid gap-5 rounded-lg p-6 sm:grid-cols-[auto_1fr]">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand text-sm font-semibold text-white">
                  {item.phase}
                </span>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-charcoal">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContentReviewRecord
        title="Scope planning library content record"
        reviewScope="General editorial review of the illustrative scenario labels, evidence notice, planning framework and project-specific disclaimers. No scenario is presented as a completed Emitronix project, client engagement, outcome or testimonial."
        showVerificationTodo={false}
      />

      <FAQSection accordion
        eyebrow="Planning library FAQ"
        title="How to interpret these scenarios."
        description="Clear answers about evidence, images, locations and project-specific review."
        faqs={projectFaqs}
        schema
      />

      <section className="section-pad bg-white">
        <div className="container-pad">
          <div className="rounded-lg border border-brand/[0.15] bg-brand-soft p-7 shadow-none lg:p-12">
            <CheckCircle2 className="h-10 w-10 text-brand" aria-hidden="true" />
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
              Have a real project to assess?
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-steel">
              Share the location, drawings, intended use, site condition, current authority comments and preferred timeline. The review can then identify the first unresolved dependency instead of assuming the project is ready to price or start.
            </p>
            <Link href="/contact" className="premium-button mt-7">
              Submit project information <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
    </InternalPageFrame>
  );
}
