import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/data/site";

export const warehouseServiceKeywords = [
  "Warehouse Construction Dubai",
  "Warehouse Contractor Dubai",
  "Warehouse Construction Company Dubai",
  "Warehouse Construction Companies in Dubai",
  "Industrial Warehouse Construction UAE",
] as const;

const industrialAreas = [
  "Dubai Investment Park (DIP)",
  "Jebel Ali",
  "JAFZA",
  "Dubai South",
  "Al Quoz",
  "Ras Al Khor",
  "Other industrial areas across Dubai and the UAE",
];

const focusAreas = [
  "Warehouse planning and execution",
  "Civil and structural coordination",
  "Steel warehouse construction support",
  "MEP coordination",
  "Site preparation and foundation works",
  "Fire safety planning",
  "Utility coordination",
  "Industrial warehouse development",
  "Commercial warehouse construction",
  "Project handover support",
];

const contentLinkClass = "font-semibold text-brand underline decoration-brand/40 underline-offset-4 transition hover:decoration-brand focus-ring";

export function WarehouseServiceOverview() {
  return (
    <article className="luxury-card rounded-lg p-6 lg:p-8" aria-labelledby="warehouse-company">
      <p className="premium-kicker">Warehouse construction</p>
      <h2 id="warehouse-company" className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
        Warehouse Construction Company in Dubai
      </h2>
      <div className="mt-6 grid gap-5 text-base leading-8 text-steel">
        <p>
          Emitronix supports industrial and commercial warehouse construction in Dubai, coordinating
          site preparation, foundations, civil and structural works, MEP, authority requirements and
          handover. The scope is planned around how the facility will operate.
        </p>
        <p>
          For logistics warehouses, distribution centres, manufacturing units and commercial storage,
          this means checking storage capacity, equipment movement, loading areas, ventilation,
          fire safety and future expansion before construction begins.
        </p>
        <p>
          For coordinated delivery, explore our{" "}
          <Link href="/main-contracting" className={contentLinkClass}>Main Contractor Dubai</Link>{" "}
          and <Link href="/civil" className={contentLinkClass}>Civil Contracting Dubai</Link> services.
          Depending on the location and project scope, planning may also involve{" "}
          <Link href="/dewa-approvals" className={contentLinkClass}>DEWA Approvals</Link>,{" "}
          <Link href="/trakhees-approvals" className={contentLinkClass}>Trakhees Approvals</Link>, and{" "}
          <Link href="/dubai-municipality-approval" className={contentLinkClass}>Municipality Approvals</Link>.
        </p>
      </div>
    </article>
  );
}

export function WarehouseServiceSections() {
  return (
    <>
      <section id="warehouse-industrial-areas" className="section-pad bg-white" aria-labelledby="warehouse-industrial-areas-title">
        <div className="container-pad grid gap-10 lg:grid-cols-2">
          <div>
            <p className="premium-kicker">Dubai industrial areas</p>
            <h2 id="warehouse-industrial-areas-title" className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              Warehouse Construction Across Dubai&apos;s Industrial Areas
            </h2>
            <p className="mt-6 text-base leading-8 text-steel">
              We support warehouse projects across these industrial areas. Site conditions,
              infrastructure access and the applicable authority route must be checked for each
              plot; a location alone does not determine its approval requirements.
            </p>
          </div>
          <div className="luxury-card rounded-lg p-6 lg:p-8">
            <p className="text-base leading-8 text-steel">We work with businesses planning warehouse developments in:</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {industrialAreas.map((area) => (
                <li key={area} className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white p-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span className="text-sm font-semibold leading-7 text-charcoal">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="warehouse-contractor" className="section-pad soft-section" aria-labelledby="warehouse-contractor-title">
        <div className="container-pad">
          <div className="max-w-4xl">
            <p className="premium-kicker">Our approach</p>
            <h2 id="warehouse-contractor-title" className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              Warehouse Contractor in Dubai: Scope and Coordination
            </h2>
            <p className="mt-6 text-base leading-8 text-steel">
              When comparing warehouse construction companies in Dubai, confirm the scope,
              trade responsibilities and handover requirements. Our focus for industrial warehouse
              construction in the UAE covers:
            </p>
          </div>
          <div className="mt-8 luxury-card rounded-lg p-6 lg:p-8">
            <ul className="grid gap-3 sm:grid-cols-2">
              {focusAreas.map((area) => (
                <li key={area} className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white p-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span className="text-sm font-semibold leading-7 text-charcoal">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="warehouse-enquiry" className="bg-white py-8" aria-labelledby="warehouse-enquiry-title">
        <div className="container-pad">
          <div className="rounded-lg border border-brand/[0.15] bg-brand-soft p-6 lg:p-8">
            <p className="premium-kicker">Start your warehouse project</p>
            <h2 id="warehouse-enquiry-title" className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              Ready to Build Your Warehouse in Dubai?
            </h2>
            <p className="mt-5 max-w-4xl text-base leading-8 text-steel">
              Share the plot location, intended use and available drawings for a new warehouse,
              expansion or facility upgrade. We can review the scope, site conditions and timeline.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/contact" className="premium-button">
                Request a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/contact?intent=site-visit" className="premium-button-light">
                Schedule a Site Visit <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">
                WhatsApp Our Team <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
