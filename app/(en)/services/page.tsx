import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { ArrowRight, CalendarCheck, CheckCircle2, MessageCircle, PhoneCall } from "lucide-react";
import Link from "next/link";
import { approvalServices } from "@/data/approvals";
import { AnswerEngineSummary } from "@/components/AnswerEngineSummary";
import { CTA } from "@/components/CTA";
import { FAQSection, ProcessRail } from "@/components/ContentBlocks";
import { PremiumSectionHeading } from "@/components/Premium";
import { ServiceCard } from "@/components/ServiceCard";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl, authorities, localSeoBlocks, services, site, stats, whatsappUrl } from "@/data/site";
import { createMetadataResolver } from "@/data/seo";

export const generateMetadata = createMetadataResolver({
  title: "Civil Construction Services Dubai",
  description:
    "Explore Emitronix civil contracting, interior fit-out, villa, warehouse, commercial building and authority approval services in Dubai, UAE.",
  path: "/services",
  keywords: ["civil construction services Dubai", "building contractor Dubai", "authority approval Dubai", "interior fit-out Dubai"],
  image: getGeneratedImage("services.construction-services-dubai-hero").og!.src,
  imageAlt: getGeneratedImage("services.construction-services-dubai-hero").alt,
});

const serviceSelectionProcess = [
  "Identify the project category: villa, warehouse, commercial space, industrial facility, fit-out or authority-facing modification.",
  "Map the core service: civil contracting, authority approval coordination, interior fit-out or a combined delivery route.",
  "Review the documents needed for decision-making, including drawings, location data, NOCs, existing approvals and authority comments.",
  "Create a reviewable enquiry brief so budget, programme, consultant scope and handover requirements can be discussed against the same facts.",
];

const servicesFaqs = [
  {
    question: "Which Emitronix service should I choose first?",
    answer:
      "Choose civil contracting or main contracting for building works, warehouse construction for logistics facilities, villa construction for residential projects, interior fit-out for finished spaces and authority approvals when Dubai submissions or inspections are the main challenge.",
  },
  {
    question: "Can multiple services be combined?",
    answer:
      "Yes. Start by marking the boundaries between civil works, fit-out, MEP interfaces and approval tasks on the same scope schedule. The enquiry review then identifies design ownership, exclusions and the sequence in which each package can be released.",
  },
  {
    question: "Does Emitronix support warehouse and villa projects?",
    answer:
      "Villa, warehouse, commercial, industrial and fit-out enquiries can be reviewed. Suitability depends on the actual scope, location, authority jurisdiction, site access and the professional appointments required for that project.",
  },
  {
    question: "What information speeds up a service consultation?",
    answer:
      "Project location, drawings, current approvals, intended use, site condition, authority comments and preferred timeline help the team understand the correct service path.",
  },
];

const servicesItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Emitronix Dubai Construction Services",
  itemListElement: services.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(service.href),
    name: service.title,
    description: service.description,
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Services", item: absoluteUrl("/services") },
  ],
};

export default function ServicesPage() {
  const sectionPhotographs = getSectionPhotographs("/services", 4);
  const phoneHref = site.phoneHref;

  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        eyebrow="Services"
        title="A complete construction platform for Dubai projects."
        description="Emitronix aligns civil contracting, fit-out delivery and authority approval coordination so project owners can move from scope definition to handover with clearer control."
        imageAsset={getGeneratedImage("services.construction-services-dubai-hero")}
        primaryCta={{ label: "Request Consultation", href: "/contact" }}
        secondaryCta={{ label: "Scope Planning Library", href: "/projects" }}
        metrics={stats}
      />

      <AnswerEngineSummary
        question="Which construction services does Emitronix provide in Dubai?"
        answer="The published service scope covers civil and main contracting, warehouses, villas, commercial and industrial buildings, interior fit-out, renovation, structural works, design and build, project management and authority-approval coordination in Dubai."
        facts={[
          "Recommended starting point for building works: civil contracting, main contracting or the matching asset-specific service page.",
          "Recommended starting point for approvals: the authority approval hub or the relevant authority guide.",
          "Useful enquiry details: location, drawings, intended use, authority status, site condition and required timeline.",
          `Verified contact route: office Call Now action or ${site.email}`,
        ]}
        cta={{ label: "Send project details", href: "/contact" }}
      />

      <section className="section-pad bg-white">
        <div className="container-pad">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <PremiumSectionHeading
              eyebrow="Core services"
              title="Civil, main contracting, warehouse, villa and fit-out scopes with visible responsibilities."
              description="Each service guide identifies the decisions, drawings, authority interfaces, site controls and handover evidence that should be defined before work advances."
            />
            <SectionPhotograph photo={sectionPhotographs[0]} compact />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container-pad">
          <div className="grid gap-4 rounded-lg border border-brand/[0.15] bg-brand-soft p-5 shadow-none lg:grid-cols-[1fr_auto] lg:items-center lg:p-7">
            <div>
              <p className="premium-kicker">Service enquiry</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
                Compare scopes, then request a quote or site visit.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/contact" className="premium-button">
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact?intent=site-visit" className="premium-button-light">
                Request a Site Visit <CalendarCheck className="h-4 w-4" />
              </Link>
              <a href={phoneHref} className="premium-button-light">
                Call Now <PhoneCall className="h-4 w-4" />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">
                WhatsApp Us <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="blue-grid section-pad text-charcoal">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <PremiumSectionHeading
              eyebrow="Dubai approval menu"
              title="Authority approval services built into project planning."
              description="Approval support covers Dubai Municipality, DDA, DCD, DEWA, Trakhees, DIFC, Concordia-DMCC and RTA workflows."
              light
            />
            <SectionPhotograph photo={sectionPhotographs[1]} compact />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {approvalServices.map((service) => (
              <Link key={service.slug} href={service.href} className="rounded-lg border border-brand/[0.12] bg-white/[0.82] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-brand/25 hover:bg-white hover:text-brand">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">Approval</p>
                <h2 className="mt-4 text-xl font-semibold tracking-tight">{service.menuLabel}</h2>
                <p className="mt-3 text-sm leading-7 opacity-80">{service.metaDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProcessRail
        eyebrow="Service selection"
        title="Choose the right Dubai construction pathway before site decisions begin."
        description="A clear service path helps owners and consultants avoid treating civil works, fit-out, authority approvals and handover as disconnected tasks."
        steps={serviceSelectionProcess}
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[2]} compact />
      </div>

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="Local project pathways"
            title="Search by the problem you need solved."
            description="These Dubai-focused entry points help owners and consultants find the right scope quickly."
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {localSeoBlocks.map((block) => (
              <Link key={block.title} href={block.href} className="luxury-card rounded-lg p-6">
                <CheckCircle2 className="h-7 w-7 text-brand" />
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{block.title}</h2>
                <p className="mt-3 text-sm leading-7 text-steel">{block.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand">
                  {block.linkLabel} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <PremiumSectionHeading
              eyebrow="Authority bodies"
              title="Dubai agencies and authority interfaces we coordinate with."
              description="The applicable route depends on location, use, proposed work and consultant responsibility. Confirm those facts before assigning submission dates or starting authority-dependent work."
            />
            <SectionPhotograph photo={sectionPhotographs[3]} compact />
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {authorities.map((authority) => {
              const Icon = authority.icon;
              return (
                <article key={authority.name} className="luxury-card rounded-lg p-6">
                  <Icon className="h-8 w-8 text-brand" />
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{authority.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel">{authority.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <FAQSection accordion
        title="Construction services Dubai FAQ."
        description="Answers for users comparing civil contractors, approval coordinators and fit-out partners in Dubai."
        faqs={servicesFaqs}
        schema
      />

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesItemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </InternalPageFrame>
  );
}
