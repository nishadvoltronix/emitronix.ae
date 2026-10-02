import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { Building2, Factory, Home, Landmark, ShieldCheck, Sparkles, Warehouse } from "lucide-react";
import Link from "next/link";
import { CTA } from "@/components/CTA";
import { FAQSection, InsightGrid, ProcessRail, TrustBar } from "@/components/ContentBlocks";
import { PremiumSectionHeading } from "@/components/Premium";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl, stats } from "@/data/site";
import { createMetadataResolver } from "@/data/seo";

export const generateMetadata = createMetadataResolver({
  title: "Dubai Construction Industries Served",
  description:
    "Construction planning for Dubai villas, warehouses, industrial and commercial buildings, retail fit-out and authority-facing projects.",
  path: "/industries",
  keywords: ["villa construction Dubai", "warehouse construction Dubai", "commercial construction Dubai", "industrial building contractor Dubai"],
  image: getGeneratedImage("company.dubai-construction-industries-hero").og!.src,
  imageAlt: getGeneratedImage("company.dubai-construction-industries-hero").alt,
});

const industries = [
  {
    title: "Luxury Villas",
    description: "Villa construction and renovation where structure, services, finish benchmarks, authority planning and occupied-neighbour controls must align.",
    icon: Home,
    href: "/civil",
  },
  {
    title: "Warehouses & Logistics",
    description: "Warehouse construction Dubai support for storage, distribution, industrial operations and free-zone environments.",
    icon: Warehouse,
    href: "/projects",
  },
  {
    title: "Commercial Buildings",
    description: "Commercial construction support for offices, showrooms, retail shells and business-ready interior interfaces.",
    icon: Landmark,
    href: "/projects",
  },
  {
    title: "Industrial Facilities",
    description: "Industrial building contractor coordination for steel structures, civil works, utility interfaces and handover readiness.",
    icon: Factory,
    href: "/projects",
  },
  {
    title: "Retail & Hospitality Fit-Out",
    description: "Premium fit-out works for retail, hospitality, offices and commercial units where sequencing matters.",
    icon: Sparkles,
    href: "/interior",
  },
  {
    title: "Authority-Facing Projects",
    description: "Projects with Dubai Municipality, DCD, DEWA, Trakhees, DDA, DIFC, Concordia-DMCC or RTA touchpoints.",
    icon: ShieldCheck,
    href: "/approval",
  },
];

const industryBenefits = [
  {
    title: "Authority exposure understood early",
    description: "Different assets can involve DM, DCD, DEWA, Trakhees, DDA, DIFC, Concordia-DMCC or RTA requirements, so jurisdiction is reviewed before assumptions are made.",
    icon: ShieldCheck,
  },
  {
    title: "Civil and fit-out interfaces aligned",
    description: "Villas, warehouses and commercial spaces often connect structure, MEP, interiors, access and completion documents into one delivery challenge.",
    icon: Building2,
  },
  {
    title: "Clear routes to relevant guidance",
    description: "Each sector connects users to the relevant civil, fit-out, planning, approval or contact pathway.",
    icon: Landmark,
  },
];

const industryProcess = [
  "Identify the asset type, operating use, location, authority jurisdiction and any landlord or master developer constraints.",
  "Match the sector to the right service path: civil contracting, fit-out, authority approvals or combined coordination.",
  "Clarify drawings, inspections, access, utility, fire-safety and handover requirements before project sequencing begins.",
  "Convert sector-specific risks into an enquiry brief with named decisions and missing evidence.",
];

const industryFaqs = [
  {
    question: "Which industries does Emitronix support in Dubai?",
    answer:
      "Enquiries can cover villas, warehouses, logistics assets, commercial buildings, industrial facilities, retail and hospitality fit-out, and authority-facing projects. Suitability is checked against the actual use, location, scope and appointment requirements.",
  },
  {
    question: "Do different industries need different approval paths?",
    answer:
      "Yes. Approval paths depend on location, use, fire-safety requirements, utility needs, civil modifications, landlord rules and the authority jurisdiction for the property.",
  },
  {
    question: "Can a warehouse project include fit-out and approvals?",
    answer:
      "Yes. Warehouse projects may involve civil works, interior upgrades, fire and utility coordination, authority approvals and handover documentation.",
  },
  {
    question: "Why include industries on a construction website?",
    answer:
      "Industry pages help owners and consultants understand whether the contractor’s services match their asset type before submitting an enquiry.",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Industries", item: absoluteUrl("/industries") },
  ],
};

export default function IndustriesPage() {
  const sectionPhotographs = getSectionPhotographs("/industries", 4);
  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Industries" }]}
        eyebrow="Industries"
        title="Built for Dubai's real estate, logistics and commercial economy."
        description="These project types reward early operating decisions, coordinated engineering, visible authority dependencies and close-out records prepared before handover pressure begins."
        imageAsset={getGeneratedImage("company.dubai-construction-industries-hero")}
        primaryCta={{ label: "Discuss Your Sector", href: "/contact" }}
        secondaryCta={{ label: "Planning Library", href: "/projects" }}
        metrics={stats}
      />

      <section className="section-pad bg-white">
        <div className="container-pad">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <PremiumSectionHeading
              eyebrow="Sector focus"
              title="Construction categories that need disciplined coordination."
              description="Each industry path connects to the service or approval page most relevant to the enquiry."
            />
            <SectionPhotograph photo={sectionPhotographs[0]} compact />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <Link key={industry.title} href={industry.href} className="luxury-card rounded-lg p-7">
                  <Icon className="h-9 w-9 text-brand" />
                  <h2 className="mt-6 text-3xl font-semibold tracking-tight text-charcoal">{industry.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-steel">{industry.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="blue-grid section-pad text-charcoal">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div className="space-y-6">
            <PremiumSectionHeading
              eyebrow="Market fit"
              title="From private villas to authority-controlled commercial environments."
              description="The common requirement is not only construction capability. It is coordination quality: documentation, sequencing, inspections, consultant decisions and close-out visibility."
              light
            />
            <SectionPhotograph photo={sectionPhotographs[1]} compact />
          </div>
          <div className="rounded-lg border border-brand/[0.12] bg-white/[0.82] p-8 backdrop-blur-xl">
            <Building2 className="h-12 w-12 text-brand" />
            <h2 className="mt-6 text-4xl font-semibold tracking-tight">Dubai-first construction support.</h2>
            <p className="mt-4 text-base leading-8 text-steel">
              Project owners and consultants can use the sector routes to connect civil, fit-out and approval work to the asset&apos;s operating and authority constraints.
            </p>
          </div>
        </div>
      </section>

      <InsightGrid
        eyebrow="Industry benefits"
        title="Sector pages organized around specific Dubai project risks."
        description="The same contractor can feel very different depending on the asset type. Emitronix frames each sector around the decisions that affect project momentum."
        items={industryBenefits}
        tone="soft"
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[2]} compact />
      </div>

      <ProcessRail
        eyebrow="Sector process"
        title="From asset type to the right service path."
        description="A villa, warehouse, commercial building or authority-facing unit needs a different enquiry conversation. This process keeps the first step clear."
        steps={industryProcess}
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[3]} compact />
      </div>

      <TrustBar
        eyebrow="Industry trust"
        title="Published project categories and enquiry pathways."
        points={[
          "Villas and residential projects",
          "Warehouses and logistics environments",
          "Commercial and retail interiors",
          "Authority-facing construction scopes",
        ]}
      />

      <FAQSection accordion
        title="Dubai construction industries FAQ."
        description="Useful answers for users matching their asset type to a construction or approval service."
        faqs={industryFaqs}
        schema
      />

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </InternalPageFrame>
  );
}
