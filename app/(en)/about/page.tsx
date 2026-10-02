import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { BadgeCheck, Building2, ClipboardCheck, FileCheck2, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { CTA } from "@/components/CTA";
import { FAQSection, ProcessRail, TrustBar } from "@/components/ContentBlocks";
import { FeatureGrid, ImagePanel, PremiumSectionHeading } from "@/components/Premium";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl, site, stats, whyChoose } from "@/data/site";
import { trustContentLastReviewedIso } from "@/data/trustCenter";
import { createMetadataResolver } from "@/data/seo";

export const generateMetadata = createMetadataResolver({
  title: "About Emitronix Contracting LLC Dubai",
  description:
    "Learn about Emitronix Contracting LLC, a Dubai contracting company for civil construction, approvals, fit-out, villa, warehouse and commercial projects.",
  path: "/about",
  keywords: ["Emitronix Dubai", "Dubai contracting company", "civil construction company UAE", "authority approvals Dubai"],
  image: getGeneratedImage("company.engineering-coordination-dubai-hero").og!.src,
  imageAlt: getGeneratedImage("company.engineering-coordination-dubai-hero").alt,
});

const operatingPrinciples = [
  {
    title: "Buildability before beauty",
    description: "Project outcomes improve when drawings, sequence, authority dependencies and site constraints are understood early.",
    icon: Building2,
  },
  {
    title: "Authority-ready thinking",
    description: "Dubai approval requirements are treated as part of the project path, not as an afterthought after mobilization.",
    icon: FileCheck2,
  },
  {
    title: "Clear stakeholder rhythm",
    description: "Owners, consultants and site teams need a common view of decisions, documentation and next actions.",
    icon: Users,
  },
  {
    title: "Handover discipline",
    description: "Completion, inspection readiness, snag closure and documentation are built into the delivery standard.",
    icon: ClipboardCheck,
  },
];

const aboutProcess = [
  "Clarify the project brief, location, drawings, stakeholder roles and authority exposure before commitments are made.",
  "Translate the scope into civil, fit-out, approval, MEP and handover requirements that can be tracked.",
  "Coordinate communication between owners, consultants and site teams so decisions stay visible.",
  "Plan completion around inspections, snag control, documentation and operational readiness.",
];

const aboutFaqs = [
  {
    question: "What does Emitronix Contracting LLC do in Dubai?",
    answer:
      "Emitronix Contracting LLC supports civil construction, building contracting, interior fit-out, villa, warehouse, commercial and authority approval coordination enquiries in Dubai and the UAE.",
  },
  {
    question: "Where is Emitronix located?",
    answer: `Emitronix uses ${site.location} as the verified location in the website business information source.`,
  },
  {
    question: "Does Emitronix handle approval coordination?",
    answer:
      "Approval coordination can cover DM, DCD, DEWA, Trakhees, DDA and related interfaces when they apply to the location and work. The first review confirms jurisdiction, appointed-party duties, current drawings and the formal submission route.",
  },
  {
    question: "Why is early scope clarity important?",
    answer:
      "Early clarity helps owners and consultants understand drawings, approvals, civil interfaces, site constraints and handover requirements before they become expensive execution issues.",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${absoluteUrl("/about")}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") },
  ],
};

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${absoluteUrl("/about")}#webpage`,
  url: absoluteUrl("/about"),
  name: `About ${site.legalName}`,
  description: "Company overview, operating principles, published business facts and authority profiles for Emitronix Contracting LLC.",
  isPartOf: { "@id": absoluteUrl("/#website") },
  about: { "@id": absoluteUrl("/#organization") },
  breadcrumb: { "@id": `${absoluteUrl("/about")}#breadcrumb` },
  inLanguage: "en-AE",
  dateModified: trustContentLastReviewedIso,
  lastReviewed: trustContentLastReviewedIso,
};

export default function AboutPage() {
  const sectionPhotographs = getSectionPhotographs("/about", 3);
  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="About Emitronix"
        title="A Dubai contractor built around scope clarity."
        description={`${site.legalName} brings together civil contracting, building construction, interior fit-out and authority approval coordination for clients across Dubai and the UAE.`}
        imageAsset={getGeneratedImage("company.engineering-coordination-dubai-hero")}
        primaryCta={{ label: "Talk to Emitronix", href: site.phoneHref }}
        secondaryCta={{ label: "Explore Services", href: "/services" }}
        metrics={stats}
      />

      <section className="section-pad bg-white">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <PremiumSectionHeading
              eyebrow="Company standard"
              title="Trust-based construction delivery for Dubai projects."
              description="The operating focus is coordinated engineering, authority readiness, site supervision and decision-led communication for owners and consultants."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {whyChoose.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="luxury-card rounded-lg p-5">
                    <Icon className="h-7 w-7 text-brand" />
                    <h2 className="mt-4 text-lg font-semibold tracking-tight text-charcoal">{item.title}</h2>
                  </article>
                );
              })}
            </div>
          </div>
          <ImagePanel
            asset={getGeneratedImage("company.civil-site-review-dubai")}
            label="Site coordination"
            title="Civil works, fit-out and approval-ready delivery."
          />
        </div>
      </section>

      <section className="blue-grid section-pad text-charcoal">
        <div className="container-pad">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <PremiumSectionHeading
              eyebrow="Operating principles"
              title="A delivery system that keeps complex Dubai scopes visible."
              description="The design of the company experience is simple: make the right information visible early, then keep the project moving with discipline."
              light
            />
            <SectionPhotograph photo={sectionPhotographs[0]} compact />
          </div>
          <div className="mt-12">
            <FeatureGrid features={operatingPrinciples} />
          </div>
        </div>
      </section>

      <ProcessRail
        eyebrow="How we work"
        title="A disciplined operating model for Dubai construction decisions."
        description="The company experience is built around early visibility: scope, authority requirements, site interfaces and close-out obligations are treated as one connected system."
        steps={aboutProcess}
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[1]} compact />
      </div>

      <section className="section-pad bg-white">
        <div className="container-pad grid gap-8 md:grid-cols-3">
          {[
            { title: "Founder profile", body: "Meet Marieswaran Sadaiappan and review the published professional focus areas and verification boundaries.", href: "/founder", icon: BadgeCheck },
            { title: "Leadership functions", body: "Understand the role-based operational, engineering, QA/QC, HSE, procurement and site-delivery functions.", href: "/leadership", icon: ShieldCheck },
            { title: "Company information", body: `Review the published legal name, contact details, location, hours and service areas for ${site.name}.`, href: "/company-information", icon: Building2 },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="luxury-card rounded-lg p-6">
                <Icon className="h-8 w-8 text-brand" />
                {index === 1 ? <SectionPhotograph photo={sectionPhotographs[2]} compact className="mt-5" /> : null}
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-steel">{item.body}</p>
                <span className="mt-5 inline-flex text-sm font-semibold uppercase tracking-wide text-brand">Read profile →</span>
              </Link>
            );
          })}
        </div>
      </section>

      <TrustBar
        eyebrow="Company trust"
        title="Verified facts, consistent contact data and specific scope language."
        points={[
          site.legalName,
          site.location,
          { label: site.phone, href: site.phoneHref },
          site.email,
        ]}
      />

      <ContentReviewRecord
        title="About Emitronix content record"
        reviewScope="General editorial review of the published company identity, operating principles, service descriptions and verification boundaries. Company history dates and milestones remain unpublished until management evidence is available."
      />

      <FAQSection accordion
        title="About Emitronix FAQ."
        description="Helpful answers for owners and consultants researching a Dubai construction company."
        faqs={aboutFaqs}
        schema
      />

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }} />
    </InternalPageFrame>
  );
}
