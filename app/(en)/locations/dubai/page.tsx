import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck2,
  MapPin,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import {
  ContactStrip,
  JsonLd,
  RelatedTrustLinks,
  TrustPageHero,
  VerificationPanel,
} from "@/components/TrustContentPage";
import {
  createTrustMetadata,
  createTrustPageJsonLd,
  dubaiServiceLinks,
  locationVerificationItems,
} from "@/data/trustCenter";
import { site } from "@/data/site";

const pageTitle = "Construction Services in Dubai | Emitronix";
const pageDescription =
  "A practical Dubai guide to Emitronix construction, fit-out, project management and authority-support enquiries, using verified location and contact facts.";

export const metadata = createTrustMetadata({
  path: "/locations/dubai",
  title: pageTitle,
  description: pageDescription,
});

const dubaiJsonLd = createTrustPageJsonLd({
  path: "/locations/dubai",
  name: "Emitronix construction services in Dubai",
  description: pageDescription,
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
    { name: "Dubai", path: "/locations/dubai" },
  ],
});

const planningFactors = [
  {
    title: "Location and jurisdiction",
    description:
      "Provide the exact project location and any known authority, utility, landlord or master-developer context. Requirements must be confirmed for the individual project.",
    icon: MapPin,
  },
  {
    title: "Asset and intended use",
    description:
      "State whether the enquiry concerns a villa, warehouse, commercial space, industrial building, fit-out, renovation or another verified service category.",
    icon: Building2,
  },
  {
    title: "Drawings and documents",
    description:
      "Identify the architectural, structural and MEP information available, together with current comments, approvals or gaps.",
    icon: FileCheck2,
  },
  {
    title: "Execution constraints",
    description:
      "Explain access, working hours, occupancy, logistics, programme expectations and known interfaces that may affect the delivery plan.",
    icon: Ruler,
  },
];

const enquirySteps = [
  {
    title: "Share the project context",
    description: "Send the location, asset type, intended use, available documents, current status and required outcome.",
  },
  {
    title: "Clarify roles and scope",
    description: "Identify client, consultant, landlord, authority and contractor responsibilities before treating a route as confirmed.",
  },
  {
    title: "Review delivery interfaces",
    description: "Consider civil, structural, MEP, fit-out, procurement, access, inspections and handover as connected decisions.",
  },
  {
    title: "Confirm the project route",
    description: "A project-specific proposal or appointment must define the accepted scope, programme, responsibilities and deliverables.",
  },
];

const dubaiFaqs = [
  {
    question: "What is the published Emitronix location in Dubai?",
    answer: site.location,
  },
  {
    question: "Does this page confirm that every Dubai project can be accepted?",
    answer:
      "No. Suitability depends on scope, site, programme, documents, stakeholder responsibilities and the applicable project requirements.",
  },
  {
    question: "Does Emitronix claim authority approval status on this page?",
    answer:
      "No. The page describes authority approval support as a verified service. It does not claim a licence, registration, delegation or guaranteed approval from any authority.",
  },
  {
    question: "Why is there one Dubai page rather than separate district pages?",
    answer:
      "Dubai is presented as one substantive service area. The exact location remains an input to project review because jurisdiction, access and stakeholder requirements can differ.",
  },
  {
    question: "What should I send with a Dubai project enquiry?",
    answer:
      "Share the exact location, asset type, intended use, required scope, available drawings, current authority or landlord status, programme and known site constraints.",
  },
];

const relatedLinks = [
  {
    label: "All service areas",
    href: "/locations",
    description: "See the difference between the published business location and wider UAE service areas.",
  },
  {
    label: "Authority approval support",
    href: "/approval",
    description: "Review the authority-coordination route and prepare the project-specific information it needs.",
  },
  {
    label: "Website disclaimer",
    href: "/disclaimer",
    description: "Understand why general website information does not replace project-specific professional advice.",
  },
];

const sectionPhotos = getSectionPhotographs("/locations/dubai", 5);

export default function DubaiLocationPage() {
  return (
    <InternalPageFrame>
      <div>
        <TrustPageHero
          eyebrow="Dubai service area"
          title="Construction and engineering support in Dubai"
          summary={`${site.legalName} publishes ${site.location} as its verified website location and supports enquiries across its verified construction, fit-out, project-management and authority-coordination services.`}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Locations", href: "/locations" },
            { label: "Dubai" },
          ]}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="premium-button">
              Discuss a Dubai project
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/services" className="premium-button-light">
              Compare services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </TrustPageHero>

        <section className="border-b border-brand/[0.10] bg-white py-8" aria-label="Verified Dubai business information">
          <div className="container-pad grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg bg-brand-soft p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-steel">Published location</p>
                <p className="mt-1 text-sm font-bold leading-6 text-charcoal">{site.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-brand-soft p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-steel">Business hours</p>
                <p className="mt-1 text-sm font-bold leading-6 text-charcoal">{site.hours}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-brand-soft p-4">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-steel">Service-area status</p>
                <p className="mt-1 text-sm font-bold leading-6 text-charcoal">Dubai is listed in the verified service-area source.</p>
              </div>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={0} sections={5} /></div>
          </div>
        </section>

        <section className="section-pad bg-white" aria-labelledby="dubai-planning-heading">
          <div className="container-pad">
            <div className="max-w-4xl">
              <p className="premium-kicker">Start with the project</p>
              <h2 id="dubai-planning-heading" className="mt-4 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                The correct Dubai route depends on more than a city name.
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel">
                A useful first review connects the location to the asset, intended use, design status, stakeholder responsibilities and required outcome. It does not infer authority requirements or approval status from a neighbourhood.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {planningFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <article key={factor.title} className="luxury-card rounded-lg p-6">
                    <Icon className="h-8 w-8 text-brand" aria-hidden="true" />
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">{factor.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-steel">{factor.description}</p>
                  </article>
                );
              })}
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={1} sections={5} /></div>
          </div>
        </section>

        <section className="section-pad soft-section" aria-labelledby="dubai-services-heading">
          <div className="container-pad">
            <div className="max-w-4xl">
              <p className="premium-kicker">Service pathways</p>
              <h2 id="dubai-services-heading" className="mt-4 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                Choose a service by scope, then confirm the interfaces.
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel">
                These pathways come from the website’s verified core service source. A page explains the service category; only project documents can confirm the accepted scope.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {dubaiServiceLinks.map((service) => (
                <Link key={service.href} href={service.href} className="luxury-card group rounded-lg p-6">
                  <CheckCircle2 className="h-7 w-7 text-brand" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">{service.label}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-steel">{service.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                    Review service
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
              <Link href="/approval" className="luxury-card group rounded-lg p-6">
                <FileCheck2 className="h-7 w-7 text-brand" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">Authority approval support</h3>
                <p className="mt-3 text-sm leading-7 text-steel">
                  Review the verified approval-support service without assuming the applicable authority, submission path or outcome.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  Review approval support
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={2} sections={5} /></div>
          </div>
        </section>

        <section className="section-pad bg-white" aria-labelledby="dubai-process-heading">
          <div className="container-pad grid gap-10 lg:grid-cols-[0.42fr_1fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="premium-kicker">Enquiry workflow</p>
              <h2 id="dubai-process-heading" className="mt-4 text-4xl font-semibold tracking-tight text-charcoal">
                From location to a defined next step.
              </h2>
              <p className="mt-5 text-base leading-8 text-steel">
                This sequence helps an initial conversation become specific without treating a website visit as a project appointment.
              </p>
            </div>
            <ol className="space-y-5">
              {enquirySteps.map((step, index) => (
                <li key={step.title} className="rounded-lg border border-brand/[0.10] bg-brand-soft p-6">
                  <div className="flex items-start gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-charcoal">{step.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-steel">{step.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={3} sections={5} /></div>
          </div>
        </section>

        <section className="section-pad soft-section" aria-labelledby="dubai-faq-heading">
          <div className="container-pad">
            <div className="mx-auto max-w-4xl text-center">
              <p className="premium-kicker">Dubai questions</p>
              <h2 id="dubai-faq-heading" className="mt-4 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                Clear location answers without unsupported claims.
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
              {dubaiFaqs.map((faq) => (
                <article key={faq.question} className="rounded-lg border border-brand/[0.10] bg-white p-6 shadow-none">
                  <h3 className="text-xl font-semibold tracking-tight text-charcoal">{faq.question}</h3>
                  <p className="mt-4 text-sm leading-7 text-steel">{faq.answer}</p>
                </article>
              ))}
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={4} sections={5} /></div>
          </div>
        </section>

        <VerificationPanel title="Dubai information publication status" items={locationVerificationItems} />
        <ContactStrip />
        <RelatedTrustLinks title="Continue planning" links={relatedLinks} />
      </div>
      <JsonLd data={dubaiJsonLd} />
    </InternalPageFrame>
  );
}
