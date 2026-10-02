import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { ArrowRight, ClipboardCheck, FileCheck2, Layers3 } from "lucide-react";
import Link from "next/link";
import { CTA } from "@/components/CTA";
import { FAQSection, ProcessRail } from "@/components/ContentBlocks";
import { PremiumSectionHeading } from "@/components/Premium";
import { blogPosts } from "@/data/blog";
import { getGeneratedImage } from "@/data/generatedImages";
import { createMetadataResolver } from "@/data/seo";
import { absoluteUrl, services, stats } from "@/data/site";

export const generateMetadata = createMetadataResolver({
  title: "Dubai Construction Knowledge Center",
  description:
    "Practical Dubai knowledge for construction, civil engineering, MEP, electrical, fit-out, warehouses, approvals, planning, QA/QC and site safety.",
  path: "/resources",
  image: getGeneratedImage("company.construction-technical-resources-dubai-hero").og!.src,
  imageAlt: getGeneratedImage("company.construction-technical-resources-dubai-hero").alt,
});

const topics = [
  {
    title: "Construction fundamentals",
    description: "Scope, drawings, roles, procurement, execution controls, inspections and handover as one connected delivery path.",
    href: "/blog/complete-guide-civil-construction-dubai-2026",
    icon: ClipboardCheck,
  },
  {
    title: "Civil engineering and structural works",
    description: "Buildability, site conditions, concrete, masonry, structural interfaces, inspection points and drawing coordination.",
    href: "/structural-works",
    icon: Layers3,
  },
  {
    title: "MEP coordination",
    description: "How mechanical, electrical and plumbing routes interact with structure, ceilings, equipment, access and close-out.",
    href: "/project-management",
    icon: Layers3,
  },
  {
    title: "Electrical engineering and power",
    description: "Load information, distribution interfaces, utility coordination, documents and electrical readiness.",
    href: "/dewa-approvals",
    icon: FileCheck2,
  },
  {
    title: "Interior fit-out",
    description: "Layout, finishes, services, landlord requirements, inspection readiness and handover planning.",
    href: "/interior",
    icon: Layers3,
  },
  {
    title: "Warehouse construction",
    description: "Use, access, structure, slab, utilities, fire-life-safety interfaces, logistics and completion.",
    href: "/warehouse-construction",
    icon: ClipboardCheck,
  },
  {
    title: "Commercial buildings",
    description: "Scope and stakeholder questions for offices, retail, mixed commercial areas and occupied-building work.",
    href: "/commercial-buildings",
    icon: Layers3,
  },
  {
    title: "Industrial buildings",
    description: "Operational use, equipment, utilities, access, drainage, safety interfaces and future change.",
    href: "/industrial-buildings",
    icon: ClipboardCheck,
  },
  {
    title: "Building renovation",
    description: "Existing-condition review, demolition boundaries, concealed risks, temporary protection and coordinated upgrades.",
    href: "/building-renovation",
    icon: Layers3,
  },
  {
    title: "Authority approvals",
    description: "Documents, NOCs, consultant roles, comments, inspections and the limits of approval coordination.",
    href: "/approval",
    icon: FileCheck2,
  },
  {
    title: "Construction planning",
    description: "A route from brief and design maturity through procurement, mobilization, sequence and handover.",
    href: "/design-build",
    icon: ClipboardCheck,
  },
  {
    title: "Engineering standards",
    description: "How to identify the controlling specification, approved drawing, authority requirement and current primary source.",
    href: "/technical-review-policy",
    icon: FileCheck2,
  },
  {
    title: "Project management",
    description: "Programme, responsibilities, decisions, risks, changes, reporting and completion information.",
    href: "/project-management",
    icon: ClipboardCheck,
  },
  {
    title: "Site safety",
    description: "Risk awareness, activity planning, access, workforce communication and escalation as role-based controls.",
    href: "/leadership#health-safety-environment",
    icon: Layers3,
  },
  {
    title: "Quality assurance and control",
    description: "Inspection points, material records, corrective actions, snag closure and handover evidence.",
    href: "/leadership#quality-assurance-control",
    icon: ClipboardCheck,
  },
];

const resourceProcess = [
  "Define the project question: scope, design, authority route, site execution, quality, safety or handover.",
  "Read the relevant overview and note which facts remain project-specific, including location, intended use, drawings and appointed-party responsibilities.",
  "Check the controlling information: current authority publication, approved drawing, project specification, contract document or manufacturer literature where applicable.",
  "Use the contact route only after gathering enough information for a useful, project-specific first review.",
];

const resourceFaqs = [
  {
    question: "What is the Emitronix Knowledge Center?",
    answer:
      "It is a directory of practical construction and engineering explanations connected to service pages, long-form articles, role-based team information and website policies.",
  },
  {
    question: "Does the Knowledge Center replace an engineer, consultant or authority?",
    answer:
      "No. The content is general educational information. Approved drawings, project specifications, appointed professionals and current authority requirements take precedence.",
  },
  {
    question: "Which topic should I start with?",
    answer:
      "Start with the decision you need to make. Use construction fundamentals for an early brief, authority approvals for a jurisdiction question, or a specific service resource for a defined scope.",
  },
  {
    question: "How is technical content reviewed?",
    answer:
      "The technical review policy explains risk-based checks, source boundaries and the distinction between editorial review, technical review and project-specific professional advice.",
  },
  {
    question: "How can I report an error?",
    answer:
      "Use the corrections policy and published contact details. Include the page URL, disputed wording and a primary source or project-specific controlling document where possible.",
  },
  {
    question: "Can I contact Emitronix after reading a resource?",
    answer:
      "Yes. Share the exact location, intended use, drawings, current status, required scope and timeline so the first discussion can focus on the actual project.",
  },
];

const pageUrl = absoluteUrl("/resources");

const knowledgeCenterJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Emitronix Dubai Construction Knowledge Center",
      description: "Construction and engineering topic directory for Dubai project planning.",
      isPartOf: { "@id": absoluteUrl("/#website") },
      inLanguage: "en-AE",
      breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Knowledge Center", item: pageUrl },
      ],
    },
  ],
};

export default function ResourcesPage() {
  const sectionPhotographs = getSectionPhotographs("/resources", 4);
  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        eyebrow="Knowledge Center"
        title="Practical construction and engineering knowledge for Dubai projects."
        description="Plain-language pathways across civil engineering, MEP, electrical, fit-out, warehouses, commercial and industrial buildings, renovation, approvals, planning, safety and quality."
        imageAsset={getGeneratedImage("company.construction-technical-resources-dubai-hero")}
        primaryCta={{ label: "Explore Topics", href: "#topic-directory" }}
        secondaryCta={{ label: "Read Articles", href: "/blog" }}
        metrics={stats}
      />

      <section id="topic-directory" className="section-pad scroll-mt-28 bg-white">
        <div className="container-pad">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <PremiumSectionHeading
              eyebrow="Topic directory"
              title="Find the context behind the next project decision."
              description="Each pathway starts with a useful definition and connects to a detailed service, guide, policy or role-based resource. Project-specific documents and appointed professionals remain controlling."
            />
            <SectionPhotograph photo={sectionPhotographs[0]} compact />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link key={topic.title} href={topic.href} className="luxury-card rounded-lg p-6">
                  <Icon className="h-8 w-8 text-brand" aria-hidden="true" />
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{topic.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel">{topic.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand">
                    Open resource <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="blue-grid section-pad text-charcoal">
        <div className="container-pad grid gap-12 lg:grid-cols-2">
          <div>
            <div className="space-y-6">
              <PremiumSectionHeading eyebrow="Service resources" title="Detailed scope pages." />
              <SectionPhotograph photo={sectionPhotographs[1]} compact />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <Link key={service.slug} href={service.href} className="rounded-lg border border-brand/[0.12] bg-white/[0.82] p-4 font-bold transition hover:bg-white hover:text-brand">
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="space-y-6">
              <PremiumSectionHeading eyebrow="Long-form learning" title="Construction articles." />
              <SectionPhotograph photo={sectionPhotographs[2]} compact />
            </div>
            <div className="mt-8 grid gap-3">
              {blogPosts.slice(0, 6).map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-lg border border-brand/[0.12] bg-white/[0.82] p-4 transition hover:bg-white">
                  <h3 className="font-semibold text-charcoal">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-steel">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProcessRail
        eyebrow="Research workflow"
        title="Move from general guidance to controlling project information."
        description="Useful content should improve the questions a project team asks, while keeping authority, design, contract and site responsibilities explicit."
        steps={resourceProcess}
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[3]} compact />
      </div>

      <section className="bg-white py-10">
        <div className="container-pad">
          <div className="grid gap-5 rounded-lg border border-brand/[0.15] bg-brand-soft p-6 shadow-none lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="premium-kicker">Publication standards</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">See how content is written, reviewed and corrected.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/editorial-policy" className="premium-button-light">Editorial policy</Link>
              <Link href="/technical-review-policy" className="premium-button-light">Technical review</Link>
              <Link href="/corrections-policy" className="premium-button-light">Corrections</Link>
            </div>
          </div>
        </div>
      </section>

      <FAQSection accordion
        title="Construction Knowledge Center FAQ."
        description="Answers about topic selection, technical boundaries, review and corrections."
        faqs={resourceFaqs}
        schema
      />

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(knowledgeCenterJsonLd) }} />
    </InternalPageFrame>
  );
}
