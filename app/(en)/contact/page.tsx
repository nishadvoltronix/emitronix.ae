import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { ClipboardCheck, FileText, Mail, MapPin, MessageCircle, Phone, Smartphone } from "lucide-react";
import { FAQSection, InsightGrid, ProcessRail } from "@/components/ContentBlocks";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { PremiumSectionHeading } from "@/components/Premium";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl, site, socialLinks, whatsappUrl } from "@/data/site";
import { createMetadataResolver } from "@/data/seo";

export const generateMetadata = createMetadataResolver({
  title: "Contact Emitronix Dubai",
  description: `Call Emitronix Contracting LLC in Dubai at ${site.phone} for civil contracting, villa, warehouse, authority approval and interior fit-out enquiries.`,
  path: "/contact",
  keywords: ["contact Emitronix Dubai", "Dubai contracting quote", "civil contractor contact", "Dubai Municipality approval contractor"],
  image: getGeneratedImage("company.dubai-project-consultation-hero").og!.src,
  imageAlt: getGeneratedImage("company.dubai-project-consultation-hero").alt,
});

const contactSignals = [
  { label: "Office Phone", value: site.phone, href: site.phoneHref, icon: Phone },
  { label: "Mobile", value: site.mobile, href: site.mobileHref, icon: Smartphone },
  { label: "WhatsApp", value: "Chat with Emitronix", href: whatsappUrl, icon: MessageCircle },
  { label: "Email", value: site.email, href: `mailto:${site.email}`, icon: Mail },
  { label: "Location", value: site.location, href: "/contact", icon: MapPin },
];

const enquiryGuidance = [
  {
    title: "Project location and asset type",
    description: "Mention whether the enquiry is for a villa, warehouse, commercial unit, industrial facility, retail space, fit-out or authority approval support.",
    icon: MapPin,
  },
  {
    title: "Current documents and drawings",
    description: "Share whether architectural, structural, MEP, authority comments, NOCs, tenancy or plot documents are available.",
    icon: FileText,
  },
  {
    title: "Required outcome",
    description: "Clarify whether you need a site assessment, construction proposal, approval coordination, fit-out support, renovation planning or handover help.",
    icon: ClipboardCheck,
  },
];

const contactProcess = [
  "Submit the contact form, call or email with project details and the service path you believe is relevant.",
  "Include location, drawings, authority status, intended use, timeline and any current comments or constraints.",
  "The enquiry review identifies whether civil, fit-out, approval or combined coordination is the appropriate next action.",
  "Urgent project requirements can be escalated through direct phone or email using the verified business contact details.",
];

const contactFaqs = [
  {
    question: "What is the fastest way to contact Emitronix?",
    answer: `Use the office Call button or email ${site.email}. With consent, the website form sends a structured project enquiry to the company's follow-up system.`,
  },
  {
    question: "What should I include in a construction enquiry?",
    answer:
      "Include project location, asset type, drawings available, authority status, intended service, site condition, preferred timeline and any existing authority comments.",
  },
  {
    question: "Can I request authority approval support through the contact page?",
    answer:
      "Yes. Mention the relevant authority, current comments or submission status if available, and whether the approval is connected to civil construction, fit-out or renovation work.",
  },
  {
    question: "Does Emitronix handle enquiries across Dubai?",
    answer:
      "Emitronix uses Dubai as its primary service area and supports enquiries connected to civil construction, interior fit-out, villas, warehouses, commercial works and authority coordination.",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${absoluteUrl("/contact")}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Contact", item: absoluteUrl("/contact") },
  ],
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${absoluteUrl("/contact")}#webpage`,
  url: absoluteUrl("/contact"),
  name: `Contact ${site.legalName}`,
  description: "Published contact details and project enquiry route for Emitronix Contracting LLC.",
  isPartOf: { "@id": absoluteUrl("/#website") },
  about: { "@id": absoluteUrl("/#organization") },
  sameAs: socialLinks.map((item) => item.href),
  mainEntity: { "@id": absoluteUrl("/#office-contact") },
  breadcrumb: { "@id": `${absoluteUrl("/contact")}#breadcrumb` },
  inLanguage: "en-AE",
};

export default function ContactPage() {
  const sectionPhotographs = getSectionPhotographs("/contact", 4);
  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        eyebrow="Contact"
        title="Start with the facts that control the Dubai project."
        description="Share your civil construction, fit-out, renovation or authority approval requirements. Include the project location, scope, timeline and current approval status."
        imageAsset={getGeneratedImage("company.dubai-project-consultation-hero")}
        primaryCta={{ label: "Call Emitronix", href: site.phoneHref }}
        secondaryCta={{ label: "Email Team", href: `mailto:${site.email}` }}
      />

      <section className="section-pad bg-white">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="order-2 lg:order-1">
            <PremiumSectionHeading
              eyebrow="Dubai, UAE"
              title="Talk to Emitronix."
              description="Reach out for tender invitations, site assessments, authority approval coordination or design-and-build support."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {contactSignals.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`luxury-card flex gap-4 rounded-lg p-5 ${item.label === "Location" ? "sm:col-span-2" : ""}`}
                  >
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-brand" />
                    <span>
                      <span className="block text-sm font-semibold uppercase tracking-wide text-charcoal">{item.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-steel">{item.value}</span>
                    </span>
                  </a>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm leading-7 text-steel">
              <p><span className="font-semibold text-charcoal">Hours:</span> {site.hours}</p>
              <Link href="/locations/dubai" className="font-semibold text-brand underline underline-offset-4">Dubai location details</Link>
            </div>
            <div className="mt-6 rounded-lg border border-brand/[0.14] bg-brand-soft p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-charcoal">Official profiles</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-brand/[0.12] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand transition hover:border-brand/30 hover:bg-brand hover:text-white"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <ContactForm />
            <SectionPhotograph photo={sectionPhotographs[0]} compact className="mt-6" />
          </div>
        </div>
      </section>

      <InsightGrid
        eyebrow="Before you enquire"
        title="Details to include in your project enquiry."
        description="These three points help the team understand the scope and next step."
        items={enquiryGuidance}
        tone="soft"
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[1]} compact />
      </div>

      <ProcessRail
        eyebrow="Contact process"
        title="A clearer first conversation for Dubai construction projects."
        description="The contact form turns an open enquiry into a reviewable project brief with location, scope, drawings and authority status."
        steps={contactProcess}
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[2]} compact />
      </div>

      <FAQSection accordion
        title="Contact Emitronix FAQ."
        description="Answers for project owners and consultants preparing a Dubai construction or approval enquiry."
        faqs={contactFaqs}
        schema
      />
      <div className="container-pad pb-10">
        <SectionPhotograph photo={sectionPhotographs[3]} compact />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }} />
    </InternalPageFrame>
  );
}
