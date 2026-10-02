import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  HardHat,
  HelpCircle,
  Home,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { AnswerEngineSummary } from "@/components/AnswerEngineSummary";
import {
  ContactStrip,
  JsonLd,
  RelatedTrustLinks,
  TrustPageHero,
} from "@/components/TrustContentPage";
import { site } from "@/data/site";
import {
  createTrustMetadata,
  createTrustPageJsonLd,
  faqCategories,
  faqContentLastReviewedIso,
  faqContentLastReviewedLabel,
  publicFaqs,
} from "@/data/trustCenter";

const pageTitle = "Dubai Construction FAQs | Emitronix Contracting LLC";
const pageDescription =
  "Answers about civil contracting, warehouse and villa construction, interior fit-out, Dubai authority approvals, quotations and project enquiries.";

export const metadata = createTrustMetadata({
  path: "/faqs",
  title: pageTitle,
  description: pageDescription,
});

const faqJsonLd = createTrustPageJsonLd({
  path: "/faqs",
  name: "Dubai construction frequently asked questions",
  description: pageDescription,
  pageType: "FAQPage",
  dateModified: faqContentLastReviewedIso,
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Dubai construction FAQs", path: "/faqs" },
  ],
  faqs: publicFaqs,
});

const faqGroups = faqCategories.map((category) => ({
  ...category,
  faqs: publicFaqs.filter((faq) => faq.category === category.id),
}));

const serviceEntryPoints = [
  {
    title: "Building and civil works",
    description:
      "Start here for civil contracting, main contracting and commercial building enquiries.",
    icon: HardHat,
    links: [
      { label: "Civil contracting", href: "/civil" },
      { label: "Main contracting", href: "/main-contracting" },
      { label: "Commercial buildings", href: "/commercial-buildings" },
    ],
  },
  {
    title: "Warehouses and industrial facilities",
    description:
      "Use these routes for logistics, storage, factory, workshop and operational-building scopes.",
    icon: Warehouse,
    links: [
      { label: "Warehouse construction", href: "/warehouse-construction" },
      { label: "Industrial buildings", href: "/industrial-buildings" },
    ],
  },
  {
    title: "Villas, renovation and interiors",
    description:
      "Choose the route that matches a new villa, an existing-building upgrade or an interior space.",
    icon: Home,
    links: [
      { label: "Villa construction", href: "/villa-construction" },
      { label: "Building renovation", href: "/building-renovation" },
      { label: "Interior fit-out", href: "/interior" },
    ],
  },
  {
    title: "Integrated delivery and approvals",
    description:
      "Review coordinated design, turnkey, project-management and Dubai authority pathways.",
    icon: FileCheck2,
    links: [
      { label: "Design and build", href: "/design-build" },
      { label: "Turnkey construction", href: "/turnkey-construction" },
      { label: "Authority approvals", href: "/approval" },
    ],
  },
] as const;

const enquiryChecklist = [
  "Project location and asset type",
  "Intended use and required scope",
  "Current drawings and consultant status",
  "Authority, landlord or master-developer comments",
  "Site condition, access details and photographs",
  "Preferred programme and known constraints",
] as const;

const relatedLinks = [
  {
    label: "Construction services",
    href: "/services",
    description:
      "Compare Emitronix service pathways for civil, warehouse, villa, commercial, industrial, fit-out and coordinated delivery enquiries.",
  },
  {
    label: "Dubai authority approvals",
    href: "/approval",
    description:
      "Review the published Dubai Municipality, DDA, DCD, DEWA, Trakhees, DIFC, Concordia-DMCC and RTA coordination routes.",
  },
  {
    label: "Dubai service area",
    href: "/locations/dubai",
    description:
      "Check the published Dubai location, service-area context and business-information boundaries.",
  },
];

const sectionPhotos = getSectionPhotographs("/faqs", 5);

export default function FaqPage() {
  return (
    <InternalPageFrame>
      <div>
        <TrustPageHero
          eyebrow="Dubai project answers"
          title="Dubai construction frequently asked questions"
          summary="Practical answers for owners, consultants, tenants and project teams choosing a construction service, preparing an enquiry or reviewing Dubai approval coordination."
          lastReviewedLabel={faqContentLastReviewedLabel}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Dubai construction FAQs" },
          ]}
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="premium-button">
              Ask about a project
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/services" className="premium-button-light">
              Compare services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </TrustPageHero>

        <AnswerEngineSummary
          eyebrow="Direct answer"
          question="What does this Dubai construction FAQ help you decide?"
          answer={`${site.legalName} uses this page to help project teams identify the most relevant service, understand general approval boundaries, prepare useful enquiry information and verify published company details before contacting the team.`}
          facts={[
            `Published location: ${site.location}`,
            "Service routes include civil, warehouses, villas, commercial and industrial buildings, fit-out, renovation and project management",
            "Approval coordination is confirmed by project location, use, scope and appointed-party responsibilities",
            "Website answers are general guidance; drawings, quotations, programmes and authority outcomes remain project-specific",
          ]}
          cta={{ label: "Send project details", href: "/contact" }}
        />

        <section
          id="service-guide"
          className="section-pad bg-white"
          aria-labelledby="service-guide-heading"
        >
          <div className="container-pad">
            <div className="mx-auto max-w-4xl text-center">
              <p className="premium-kicker">Choose a starting point</p>
              <h2
                id="service-guide-heading"
                className="mt-4 text-balance text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl"
              >
                Find the service route that fits your project.
              </h2>
              <p className="mt-5 text-base leading-8 text-steel sm:text-lg">
                These pathways organize the published services without replacing a review of your
                location, drawings, intended use, authority status and scope boundaries.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {serviceEntryPoints.map((entry) => {
                const Icon = entry.icon;

                return (
                  <article key={entry.title} className="luxury-card rounded-lg p-6 sm:p-7">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">
                      {entry.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-steel">{entry.description}</p>
                    <nav
                      className="mt-5 flex flex-wrap gap-2"
                      aria-label={`${entry.title} service links`}
                    >
                      {entry.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center gap-2 rounded-full border border-brand/[0.14] bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-soft"
                        >
                          {link.label}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ))}
                    </nav>
                  </article>
                );
              })}
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={0} sections={3} /></div>
          </div>
        </section>

        <section className="border-y border-brand/[0.10] bg-brand-soft py-12">
          <div className="container-pad grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <p className="premium-kicker">Before requesting a quote</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
                Prepare a useful construction enquiry.
              </h2>
              <p className="mt-4 text-base leading-8 text-steel">
                Complete starting information helps the first review focus on the practical project
                route instead of missing basics.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {enquiryChecklist.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white p-4 text-sm font-bold leading-7 text-charcoal"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={1} sections={3} /></div>
          </div>
        </section>

        <section
          className="section-pad soft-section"
          aria-labelledby="faq-list-heading"
        >
          <div className="container-pad grid gap-10 lg:grid-cols-[0.34fr_1fr] lg:items-start">
            <aside className="lg:sticky lg:top-28">
              <p className="premium-kicker">On this page</p>
              <h2
                id="faq-list-heading"
                className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
              >
                Construction questions organized by decision.
              </h2>
              <p className="mt-5 text-base leading-8 text-steel">
                Start with the category closest to your current decision. Detailed service and
                approval pages remain the canonical source for each specialist topic.
              </p>
              <nav className="mt-6 grid gap-2" aria-label="FAQ categories">
                {faqGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={`#faq-${group.id}`}
                    className="flex items-center justify-between rounded-lg border border-brand/[0.12] bg-white px-4 py-3 text-sm font-semibold text-charcoal transition hover:border-brand/30 hover:bg-brand-soft hover:text-brand"
                  >
                    <span>{group.label}</span>
                    <span className="text-xs text-brand">{group.faqs.length}</span>
                  </Link>
                ))}
              </nav>
              <Link
                href="/disclaimer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"
              >
                Read the information limits
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </aside>

            <div className="space-y-12">
              {faqGroups.map((group) => (
                <section
                  key={group.id}
                  id={`faq-${group.id}`}
                  className="scroll-mt-28"
                  aria-labelledby={`faq-${group.id}-heading`}
                >
                  <div className="mb-6">
                    <p className="premium-kicker">{group.label}</p>
                    <h2
                      id={`faq-${group.id}-heading`}
                      className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
                    >
                      {group.title}
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-steel">
                      {group.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {group.faqs.map((faq, index) => (
                      <details
                        key={faq.question}
                        open={index === 0}
                        className="group rounded-lg border border-brand/[0.10] bg-white p-6 shadow-none"
                      >
                        <summary className="flex cursor-pointer list-none items-start gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4">
                          <HelpCircle
                            className="mt-0.5 h-6 w-6 shrink-0 text-brand"
                            aria-hidden="true"
                          />
                          <span className="flex-1 text-xl font-semibold tracking-tight text-charcoal">
                            {faq.question}
                          </span>
                          <span
                            className="mt-1 text-xl font-semibold text-brand transition-transform group-open:rotate-45"
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </summary>
                        <div className="ml-10 mt-5 border-t border-brand/[0.10] pt-5">
                          <p className="text-base leading-8 text-steel">{faq.answer}</p>
                          <div className="mt-5 flex flex-wrap gap-3">
                            {faq.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="inline-flex items-center gap-2 rounded-full border border-brand/[0.14] bg-brand-soft px-4 py-2 text-sm font-semibold text-brand transition hover:bg-white"
                              >
                                {link.label}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={2} sections={3} /></div>
          </div>
        </section>

        <ContactStrip />
        <RelatedTrustLinks title="Continue planning your Dubai project" links={relatedLinks} />
      </div>
      <JsonLd data={faqJsonLd} />
    </InternalPageFrame>
  );
}
