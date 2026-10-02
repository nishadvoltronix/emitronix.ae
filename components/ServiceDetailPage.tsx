import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { ArrowRight, CalendarCheck, MessageCircle, PhoneCall } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { ContactForm } from "@/components/ContactForm";
import { FAQSection } from "@/components/ContentBlocks";
import { PremiumSectionHeading } from "@/components/Premium";
import { SectionPhotograph } from "@/components/SectionPhotograph";
import { approvalServices } from "@/data/approvals";
import { getInternalServiceImage, getSectionPhotographs, getUniquePhotoAttribution } from "@/data/pagePhotography";
import { buildServiceExpandedFaqs, getServiceDeepContent } from "@/data/serviceDeepContent";
import { getServiceVideo } from "@/data/serviceVideos";
import {
  absoluteUrl,
  services as allServices,
  site,
  type Service,
  whatsappUrl,
} from "@/data/site";
import { trustContentLastReviewedIso } from "@/data/trustCenter";
import { warehouseAuthorityPages } from "@/data/warehouseSeo";

const cityServiceAreas = new Set(["Dubai", "Abu Dhabi", "Sharjah"]);

type ServiceDetailPageProps = {
  service: Service;
  overviewContent?: ReactNode;
  afterOverview?: ReactNode;
  showVideo?: boolean;
};

function labelFromHref(href: string) {
  if (href === "/approval") return "Authority Approvals";
  return href.replace("/", "").replace(/-/g, " ");
}

export function ServiceDetailPage({ service, overviewContent, afterOverview, showVideo = true }: ServiceDetailPageProps) {
  const phoneHref = site.phoneHref;
  const deepContent = getServiceDeepContent(service);
  const expandedFaqs = buildServiceExpandedFaqs(service);
  const pageUrl = absoluteUrl(service.href);
  const serviceImage = getInternalServiceImage(service.href);
  const sectionPhotographs = getSectionPhotographs(service.href, 4, [serviceImage.src]);
  const primaryImageUrl = absoluteUrl(serviceImage.src);
  const serviceVideo = showVideo ? getServiceVideo(service.href) : undefined;
  const isWarehouseService = service.href === "/warehouse-construction";
  const relatedLinks = service.relatedHrefs.map((href) => {
    const relatedService = allServices.find((item) => item.href === href);
    const relatedApproval = approvalServices.find((item) => item.href === href);

    return {
      href,
      title: relatedService?.title ?? relatedApproval?.menuLabel ?? labelFromHref(href),
      description:
        relatedService?.description ??
        relatedApproval?.metaDescription ??
        "Related Dubai construction and authority coordination resource from Emitronix.",
    };
  });
  const tableOfContents = [
    ...(serviceVideo
      ? [{ label: "Visual Briefing", href: "#warehouse-video" }]
      : []),
    { label: "Overview", href: "#overview" },
    { label: "Budget questions", href: "#answers" },
    { label: "Project decisions", href: "#topical-authority" },
    { label: "Documents", href: "#documents" },
    { label: "Methodology", href: "#methodology" },
    { label: "Technical scope", href: "#knowledge" },
    { label: "Field Briefing", href: "#field-briefing" },
    { label: "Dubai Standards", href: "#dubai-standards" },
    { label: "Timeline & Cost", href: "#timeline-cost" },
    { label: "Mistakes", href: "#mistakes" },
    { label: "FAQ", href: "#faq" },
  ];
  const imageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${pageUrl}#primaryimage`,
    url: primaryImageUrl,
    contentUrl: primaryImageUrl,
    name: `${service.title} construction image`,
    caption: serviceImage.alt,
    description: serviceImage.alt,
    width: serviceImage.width,
    height: serviceImage.height,
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: deepContent.seoTitle,
    description: deepContent.metaDescription,
    inLanguage: "en-AE",
    dateModified: trustContentLastReviewedIso,
    lastReviewed: trustContentLastReviewedIso,
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
    about: [
      { "@type": "Thing", name: service.title },
      { "@type": "Thing", name: deepContent.primaryKeyword },
      ...deepContent.authorityTouchpoints.slice(0, 4).map((item) => ({ "@type": "Thing", name: item.title })),
    ],
    primaryImageOfPage: {
      "@id": `${pageUrl}#primaryimage`,
    },
    breadcrumb: {
      "@id": `${pageUrl}#breadcrumb`,
    },
    mainEntity: {
      "@id": `${pageUrl}#service`,
    },
    ...(serviceVideo
      ? {
          video: {
            "@id": `${pageUrl}#service-video`,
          },
        }
      : {}),
  };
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: `${service.title} in Dubai`,
    alternateName: deepContent.primaryKeyword,
    description: deepContent.metaDescription,
    url: pageUrl,
    image: {
      "@id": `${pageUrl}#primaryimage`,
    },
    areaServed: site.serviceArea.map((name) => ({
      "@type": cityServiceAreas.has(name) ? "City" : "Country",
      name,
    })),
    provider: {
      "@id": absoluteUrl("/#organization"),
      name: site.legalName,
      telephone: site.phoneE164,
      email: site.email,
      url: site.url,
    },
    mainEntityOfPage: {
      "@id": `${pageUrl}#webpage`,
    },
    serviceType: service.title,
    audience: service.whoNeeds.map((item) => ({
      "@type": "Audience",
      audienceType: item,
    })),
    isRelatedTo: relatedLinks.map((item) => ({
      "@type": "WebPage",
      name: item.title,
      url: absoluteUrl(item.href),
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Services", item: absoluteUrl("/services") },
      { "@type": "ListItem", position: 3, name: service.title, item: pageUrl },
    ],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#deliverables`,
    name: `${service.title} knowledge and deliverables`,
    itemListElement: [...deepContent.deliverables, ...deepContent.documents].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item,
    })),
  };
  const videoJsonLd = serviceVideo
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "@id": `${pageUrl}#service-video`,
        name: serviceVideo.title,
        description: serviceVideo.description,
        thumbnailUrl: absoluteUrl(serviceVideo.posterSrc),
        contentUrl: absoluteUrl(serviceVideo.mp4Src),
        uploadDate: serviceVideo.uploadDate,
        duration: serviceVideo.duration,
        width: serviceVideo.width,
        height: serviceVideo.height,
        inLanguage: "en-AE",
        isFamilyFriendly: true,
        representativeOfPage: true,
        publisher: {
          "@id": absoluteUrl("/#organization"),
        },
        mainEntityOfPage: {
          "@id": `${pageUrl}#webpage`,
        },
      }
    : null;

  const resourceLinks = Array.from(new Map([
    ...deepContent.internalLinkBlocks,
    ...relatedLinks,
    { href: "/industries", title: "Industries", description: "Project environments and operational requirements." },
    { href: "/projects", title: "Planning library", description: "Scope-planning resources for your next project." },
  ].map((item) => [item.href, item])).values());

  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]}
        eyebrow={`Emitronix ${service.shortTitle}`}
        title={`${service.title} Dubai`}
        description={service.details}
        image={serviceImage.src}
        imageAlt={serviceImage.alt}
        imageCaption={serviceImage.caption}
        imageAttribution={getUniquePhotoAttribution(serviceImage)}
        imagePosition={serviceImage.objectPosition}
        primaryCta={{ label: "Request a Quote", href: "/contact" }}
        secondaryCta={{ label: "Planning Library", href: "/projects" }}
        showPlanningSummary={false}
      />

      <nav className="container-pad flex flex-wrap gap-x-5 gap-y-3 py-6 text-sm font-semibold" aria-label={`${service.title} page sections`}>
        {tableOfContents.map((item) => <a key={item.href} href={item.href} className="text-brand underline underline-offset-4">{item.label}</a>)}
      </nav>

      <section id="overview" className="section-pad bg-white">
        <div className="container-pad grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            {overviewContent ?? (
              <>
                <PremiumSectionHeading eyebrow="Service overview" title={`${service.title}: scope and approach`} description={deepContent.aiAnswer} />
                <p className="mt-5 leading-7 text-steel">{deepContent.buyerPromise}</p>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Scope highlights">
                  {service.highlights.map((item) => <li key={item} className="rounded-lg bg-brand-soft px-3 py-2 text-sm font-semibold text-charcoal">{item}</li>)}
                </ul>
              </>
            )}
          </div>
          <div className="space-y-6">
            <SectionPhotograph photo={sectionPhotographs[0]} compact />
            <aside className="rounded-lg border border-brand/[0.15] bg-platinum p-6" aria-labelledby="project-fit-heading">
              <h2 id="project-fit-heading" className="text-2xl font-semibold text-charcoal">Who this service supports</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">
                {service.whoNeeds.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <details className="mt-5 border-t border-brand/[0.15] pt-4">
                <summary className="cursor-pointer font-semibold text-brand">Industry considerations</summary>
                <div className="mt-4 space-y-4">
                  {deepContent.industries.map((item) => <article key={item.title}><h3 className="font-semibold text-charcoal">{item.title}</h3><p className="mt-2 text-sm leading-7 text-steel">{item.description}</p></article>)}
                </div>
              </details>
            </aside>
          </div>
        </div>
      </section>

      {afterOverview}

      <section id="documents" className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading eyebrow="Scope and records" title="Documents and deliverables" description="Confirm the required package against the project scope, appointed parties and authority route." />
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <article className="luxury-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-charcoal">Documents to prepare</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{deepContent.documents.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className="luxury-card rounded-lg p-6">
              <h3 className="text-xl font-semibold text-charcoal">Delivery records and outputs</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{deepContent.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>
        </div>
      </section>

      <section id="methodology" className="section-pad bg-white">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
          <div className="space-y-6">
            <PremiumSectionHeading eyebrow="Methodology" title={`How we approach ${service.shortTitle.toLowerCase()}`} />
            <SectionPhotograph photo={sectionPhotographs[1]} compact />
          </div>
          <ol className="grid gap-4">
            {service.methodology.map((item, index) => <li key={item} className="flex gap-4 rounded-lg border border-brand/[0.15] p-5"><span className="text-lg font-semibold text-brand" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p className="text-sm leading-7 text-charcoal">{item}</p></li>)}
          </ol>
        </div>
      </section>

      <section id="knowledge" className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading eyebrow="Technical guidance" title="Resolve the technical scope before work starts" />
          <div id="field-briefing" className="mt-6 grid items-start gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <SectionPhotograph photo={sectionPhotographs[2]} />
            <div className="grid gap-5 md:grid-cols-2">
              {deepContent.technicalTopics.map((topic) => (
                <article key={topic.title} className="luxury-card rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-charcoal">{topic.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-steel">{topic.summary}</p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{topic.points.map((point) => <li key={point}>{point}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="topical-authority" className="section-pad bg-white">
        <div className="container-pad">
          <PremiumSectionHeading eyebrow="Project decisions" title="What changes the delivery route" />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {deepContent.decisionFactors.map((item) => <article key={item.title} className="luxury-card rounded-lg p-6"><h3 className="text-xl font-semibold text-charcoal">{item.title}</h3><p className="mt-3 text-sm leading-7 text-steel">{item.description}</p></article>)}
          </div>
          <details id="mistakes" className="mt-6 rounded-lg border border-brand/[0.15] p-5">
            <summary className="cursor-pointer font-semibold text-brand">Scope risks, controls and quality checks</summary>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[...deepContent.painPoints, ...deepContent.solutionBlocks].map((item) => <article key={item.title}><h3 className="font-semibold text-charcoal">{item.title}</h3><p className="mt-2 text-sm leading-7 text-steel">{item.description}</p></article>)}
              <article><h3 className="font-semibold text-charcoal">Quality checks</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{service.qualityStandards.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article><h3 className="font-semibold text-charcoal">Mistakes to avoid</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{service.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article>
                <h3 className="font-semibold text-charcoal">Checks before the next activity</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">
                  <li>Record each open decision&apos;s owner, due date, supporting evidence and dependent activity.</li>
                  <li>Check procurement inputs against current drawing revisions and authority comments before ordering.</li>
                  <li>Complete inspections and record outcomes before concealment or irreversible work.</li>
                </ul>
              </article>
            </div>
          </details>
        </div>
      </section>

      <section id="dubai-standards" className="section-pad soft-section">
        <div className="container-pad grid gap-8 lg:grid-cols-2">
          <div>
            <PremiumSectionHeading eyebrow="Dubai requirements" title="Confirm the applicable authority route" description="Emitronix provides construction and coordination support. Formal approvals, technical submissions and inspection outcomes remain with the relevant authority and properly appointed professionals; outcomes and review periods are not guaranteed." />
            <p className="mt-4 text-sm leading-7 text-steel">Possible interfaces: {deepContent.authorityTouchpoints.slice(0, 6).map((item) => item.title).join(", ")}. Applicability depends on the site, proposed work and appointment scope.</p>
            <p className="mt-3 text-sm leading-7 text-steel">Published enquiry coverage: {site.serviceArea.join(", ")}. Availability is subject to scope and site review.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-charcoal">Planning requirements</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{service.dubaiRegulations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="timeline-cost" className="section-pad bg-white">
        <div id="answers" className="container-pad">
          <PremiumSectionHeading eyebrow="Budget and programme" title="Timeline and cost factors" description="Durations and prices depend on the actual site, design, procurement and authority requirements. These are planning variables, not a project quotation or guaranteed programme." />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <article>
              <h3 className="text-xl font-semibold text-charcoal">What affects pricing</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{service.costFactors.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <details className="rounded-lg border border-brand/[0.15] p-5">
              <summary className="cursor-pointer font-semibold text-brand">View programme planning variables</summary>
              <div className="mt-4 overflow-x-auto" role="region" aria-label={`${service.title} timeline planning variables`} tabIndex={0}>
                <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                  <caption className="sr-only">{service.title} timeline planning variables</caption>
                  <thead className="bg-brand-soft"><tr><th scope="col" className="p-3">Phase</th><th scope="col" className="p-3">Typical Duration</th><th scope="col" className="p-3">What Changes It</th></tr></thead>
                  <tbody className="divide-y divide-brand/10">{service.timeline.map((item) => <tr key={item.phase} className="align-top"><th scope="row" className="p-3 font-semibold text-charcoal">{item.phase}</th><td className="p-3 text-brand">{item.typicalDuration}</td><td className="p-3 leading-7 text-steel">{item.notes}</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          </div>
        </div>
      </section>

      {serviceVideo ? (
        <section id="warehouse-video" className="container-pad pb-8">
          <details className="rounded-lg border border-brand/[0.15] p-5">
            <summary className="cursor-pointer font-semibold text-brand">Illustrative technical video: {serviceVideo.title}</summary>
            <div className="mt-5 grid gap-6 md:grid-cols-[0.6fr_1.4fr]">
              <video controls playsInline preload="none" poster={serviceVideo.posterSrc} width={serviceVideo.width} height={serviceVideo.height} aria-label={serviceVideo.ariaLabel} className="max-h-[32rem] w-full rounded-lg bg-charcoal object-contain">
                <source src={serviceVideo.webmSrc} type="video/webm" />
                <source src={serviceVideo.mp4Src} type="video/mp4" />
                Your browser does not support this video.
              </video>
              <div><h2 className="text-2xl font-semibold text-charcoal">{serviceVideo.title}</h2><p className="mt-3 text-sm leading-7 text-steel">{serviceVideo.description}</p><p className="mt-3 text-sm leading-7 text-steel">Illustrative visualisation, not a completed Emitronix project. {serviceVideo.caption}</p><div className="mt-4 space-y-3">{serviceVideo.highlights.map((item) => <article key={item.title}><h3 className="font-semibold text-charcoal">{item.title}</h3><p className="mt-1 text-sm leading-7 text-steel">{item.description}</p></article>)}</div></div>
            </div>
          </details>
        </section>
      ) : null}

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading eyebrow="Related resources" title="Continue planning your project" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resourceLinks.map((item) => <Link key={item.href} href={item.href} className="luxury-card rounded-lg p-5"><h3 className="flex items-center justify-between gap-3 text-lg font-semibold text-charcoal">{item.title}<ArrowRight className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" /></h3><p className="mt-2 text-sm leading-7 text-steel">{item.description}</p></Link>)}
          </div>
          {isWarehouseService ? (
            <details id="warehouse-authority-silo" className="mt-6 rounded-lg border border-brand/[0.15] bg-white p-5">
              <summary className="cursor-pointer font-semibold text-brand">Warehouse construction and authority planning library</summary>
              <ul className="mt-5 grid gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">{warehouseAuthorityPages.map((page) => <li key={page.href}><Link href={page.href} className="text-sm leading-6 text-brand underline underline-offset-4">{page.title}</Link></li>)}</ul>
            </details>
          ) : null}
        </div>
      </section>

      <div id="faq"><FAQSection accordion title={`${service.title} Dubai FAQ.`} description="Common questions from owners, consultants and commercial teams evaluating a premium construction partner in Dubai." faqs={expandedFaqs} schema /></div>

      <section className="section-pad soft-section">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <PremiumSectionHeading eyebrow="Project enquiry" title={`Request ${service.shortTitle.toLowerCase()} consultation.`} description="Share your project location, scope, drawings, authority status and preferred timeline so the next coordination action can be identified." />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="premium-button">Request a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/contact?intent=site-visit" className="premium-button-light">Request a Site Visit <CalendarCheck className="h-4 w-4" aria-hidden="true" /></Link>
              <a href={phoneHref} className="premium-button-light">Call Now <PhoneCall className="h-4 w-4" aria-hidden="true" /></a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">WhatsApp Us <MessageCircle className="h-4 w-4" aria-hidden="true" /></a>
            </div>
            <SectionPhotograph photo={sectionPhotographs[3]} className="mt-6" compact />
          </div>
          <ContactForm />
        </div>
      </section>

      <details className="container-pad py-6">
        <summary className="cursor-pointer text-sm font-semibold text-brand">Content ownership and review boundaries</summary>
        <ContentReviewRecord title={`${service.title} content record`} reviewScope="General editorial review of service scope, workflow, document requirements, claim boundaries and Dubai context. Project requirements must be confirmed against current drawings, contracts, authority requirements and appointed-professional responsibilities." />
      </details>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      {videoJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} /> : null}
    </InternalPageFrame>
  );
}
