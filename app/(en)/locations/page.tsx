import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import { ArrowRight, Building2, CheckCircle2, Compass, MapPin } from "lucide-react";
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
  locationVerificationItems,
} from "@/data/trustCenter";
import { site } from "@/data/site";

const pageTitle = "Service Areas in the UAE | Emitronix";
const pageDescription =
  "View the verified Emitronix business location and UAE service areas, with a substantive guide for construction and engineering enquiries in Dubai.";

export const metadata = createTrustMetadata({
  path: "/locations",
  title: pageTitle,
  description: pageDescription,
});

const locationJsonLd = createTrustPageJsonLd({
  path: "/locations",
  name: "Emitronix service areas",
  description: pageDescription,
  pageType: "CollectionPage",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
  ],
});

const relatedLinks = [
  {
    label: "Construction services",
    href: "/services",
    description: "Compare the verified core service routes before preparing an enquiry.",
  },
  {
    label: "Authority approval support",
    href: "/approval",
    description: "Understand the approval-coordination service and the project information needed.",
  },
  {
    label: "Frequently asked questions",
    href: "/faqs",
    description: "Read concise answers about services, coverage, technical information and enquiries.",
  },
];

const sectionPhotos = getSectionPhotographs("/locations", 5);

export default function LocationsPage() {
  return (
    <InternalPageFrame>
      <div>
        <TrustPageHero
          eyebrow="Service areas"
          title="Published service-area coverage for project enquiries"
          summary={`The verified website business record lists ${site.location} as the published location and identifies ${site.serviceArea.join(", ")} as service areas.`}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Locations" },
          ]}
        >
          <Link href="/locations/dubai" className="premium-button">
            Explore the Dubai guide
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </TrustPageHero>

        <section className="section-pad bg-white" aria-labelledby="location-facts-heading">
          <div className="container-pad">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <p className="premium-kicker">Clear location language</p>
                <h2 id="location-facts-heading" className="mt-4 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                  A business location is not the same as a project service area.
                </h2>
                <p className="mt-5 text-base leading-8 text-steel">
                  This page keeps those facts separate. It does not imply branch offices, local registrations, guaranteed mobilisation or authority status in every listed service area.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <article className="luxury-card rounded-lg p-6">
                  <Building2 className="h-8 w-8 text-brand" aria-hidden="true" />
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">Published business location</h3>
                  <p className="mt-3 text-base leading-7 text-steel">{site.location}</p>
                </article>
                <article className="luxury-card rounded-lg p-6">
                  <Compass className="h-8 w-8 text-brand" aria-hidden="true" />
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-charcoal">Published service areas</h3>
                  <ul className="mt-4 space-y-3">
                    {site.serviceArea.map((area) => (
                      <li key={area} className="flex items-center gap-3 text-sm font-bold text-steel">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={0} sections={3} /></div>
          </div>
        </section>

        <section className="section-pad soft-section" aria-labelledby="local-guide-heading">
          <div className="container-pad">
            <div className="rounded-lg border border-brand/[0.12] bg-white p-7 shadow-none sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.68fr_1fr] lg:items-center">
                <div className="rounded-lg bg-brand-dark p-8 text-white">
                  <MapPin className="h-9 w-9 text-brand-sky" aria-hidden="true" />
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-brand-sky">Primary location guide</p>
                  <h2 id="local-guide-heading" className="mt-4 text-4xl font-semibold tracking-tight">
                    Dubai
                  </h2>
                  <p className="mt-4 text-base leading-8 text-white/80">
                    A single, substantive guide for Dubai enquiries—without duplicate district or zone pages.
                  </p>
                </div>
                <div>
                  <p className="premium-kicker">Project context</p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
                    Scope, jurisdiction and site information decide the practical route.
                  </h3>
                  <p className="mt-5 text-base leading-8 text-steel">
                    The Dubai guide connects verified services with the information an owner or consultant can prepare: location, asset type, intended use, drawings, authority or landlord status, site constraints and required outcome.
                  </p>
                  <Link href="/locations/dubai" className="mt-7 inline-flex items-center gap-2 font-semibold text-brand">
                    Read the Dubai location guide
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={1} sections={3} /></div>
          </div>
        </section>

        <section className="bg-white py-16" aria-labelledby="coverage-check-heading">
          <div className="container-pad">
            <div className="mx-auto max-w-4xl">
              <p className="premium-kicker">Before an enquiry</p>
              <h2 id="coverage-check-heading" className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
                What confirms whether a project can be considered?
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Exact project location and applicable jurisdiction",
                  "Asset type, intended use and required scope",
                  "Available drawings and current design status",
                  "Authority, utility, landlord or developer requirements",
                  "Site access, programme and known constraints",
                  "Consultant, client and contractor responsibilities",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-brand/[0.10] bg-brand-soft p-4 text-sm font-bold leading-6 text-charcoal">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-7 text-base leading-8 text-steel">
                A published service area is an invitation to discuss a relevant enquiry, not a promise that every scope, programme or location can be accepted.
              </p>
            </div>
          <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={2} sections={3} /></div>
          </div>
        </section>

        <VerificationPanel title="What is verified—and what is not yet published" items={locationVerificationItems} />
        <ContactStrip />
        <RelatedTrustLinks title="Plan the next step" links={relatedLinks} />
      </div>
      <JsonLd data={locationJsonLd} />
    </InternalPageFrame>
  );
}
