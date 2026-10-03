import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { ArrowRight, CalendarCheck, MessageCircle, PhoneCall } from "lucide-react";
import Link from "next/link";
import { approvalServices, type ApprovalService } from "@/data/approvals";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { SectionPhotograph } from "@/components/SectionPhotograph";
import { buildApprovalExpandedFaqs, getApprovalDeepContent } from "@/data/serviceDeepContent";
import { getInternalServiceImage, getSectionPhotographs, getUniquePhotoAttribution } from "@/data/pagePhotography";
import { absoluteUrl, site, whatsappUrl } from "@/data/site";
import { trustContentLastReviewedIso, trustContentLastReviewedLabel } from "@/data/trustCenter";
import { ContactForm } from "./ContactForm";
import { FAQSection } from "./ContentBlocks";
import { PremiumSectionHeading } from "./Premium";

type ApprovalServicePageProps = {
  service: ApprovalService;
};

const authoritySources: Record<string, { label: string; href: string }> = {
  "dubai-municipality-approval": {
    label: "Dubai Municipality — Buildings Regulation and Permits Agency",
    href: "https://www.dm.gov.ae/municipality-business/buildings-regulation-permits-agency/",
  },
  "dda-approvals": {
    label: "Dubai Development Authority — Construction Permits and NOCs",
    href: "https://dda.gov.ae/en/planning-development/construction/permits-nocs",
  },
  "dcd-approvals": {
    label: "Dubai Civil Defence — Fire and Life Safety Code resources",
    href: "https://www.dcd.gov.ae/portal/en/preventive-safety/rules-regulations/faq-uae-fire-and-life-safety-code-of-practice",
  },
  "dewa-approvals": {
    label: "DEWA — Electricity connection requirements and steps",
    href: "https://www.dewa.gov.ae/en/builder/electricity-network-services/requirements-and-steps",
  },
  "trakhees-approvals": {
    label: "PCFC — Trakhees rules and regulations",
    href: "https://pcfc.ae/en/Pages/rules-regulations-trakhees.aspx",
  },
  "difc-approvals": {
    label: "DIFC — Official website",
    href: "https://www.difc.com/",
  },
  "concordia-dmcc-approvals": {
    label: "DMCC — Official website",
    href: "https://dmcc.ae/",
  },
  "rta-approval": {
    label: "RTA — Construction NOC for infrastructure work",
    href: "https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=315",
  },
};

export function ApprovalServicePage({ service }: ApprovalServicePageProps) {
  const phoneHref = site.phoneHref;
  const deepContent = getApprovalDeepContent(service);
  const approvalFaqs = buildApprovalExpandedFaqs(service);
  const authoritySource = authoritySources[service.slug] ?? {
    label: "UAE Government — Building safety guidance",
    href: "https://u.ae/en/information-and-services/justice-safety-and-the-law/building-safety",
  };
  const pageUrl = absoluteUrl(service.href);
  const approvalImage = getInternalServiceImage(service.href);
  const sectionPhotographs = getSectionPhotographs(service.href, 4, [approvalImage.src]);
  const imageUrl = absoluteUrl(approvalImage.src);
  const relatedPages = service.related
    .map((slug) => approvalServices.find((item) => item.slug === slug))
    .filter((item): item is ApprovalService => Boolean(item));
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: service.h1,
    alternateName: deepContent.primaryKeyword,
    serviceType: service.menuLabel,
    description: service.metaDescription,
    url: pageUrl,
    image: {
      "@id": `${pageUrl}#primaryimage`,
    },
    areaServed: {
      "@type": "City",
      name: "Dubai",
    },
    provider: {
      "@id": absoluteUrl("/#organization"),
      name: site.legalName,
      url: site.url,
      telephone: site.phoneE164,
      email: site.email,
    },
    mainEntityOfPage: {
      "@id": `${pageUrl}#webpage`,
    },
    isRelatedTo: relatedPages.map((item) => ({
      "@type": "WebPage",
      name: item.menuLabel,
      url: absoluteUrl(item.href),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Approval", item: absoluteUrl("/approval") },
      { "@type": "ListItem", position: 3, name: service.menuLabel, item: pageUrl },
    ],
  };
  const imageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${pageUrl}#primaryimage`,
    url: imageUrl,
    contentUrl: imageUrl,
    name: `${service.menuLabel} coordination image`,
    caption: approvalImage.alt,
    description: approvalImage.alt,
    width: approvalImage.width,
    height: approvalImage.height,
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: service.seoTitle,
    description: service.metaDescription,
    inLanguage: "en-AE",
    dateModified: trustContentLastReviewedIso,
    lastReviewed: trustContentLastReviewedIso,
    citation: authoritySource.href,
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
    primaryImageOfPage: {
      "@id": `${pageUrl}#primaryimage`,
    },
    breadcrumb: {
      "@id": `${pageUrl}#breadcrumb`,
    },
    about: [
      { "@type": "Thing", name: service.menuLabel },
      { "@type": "Thing", name: deepContent.primaryKeyword },
      ...deepContent.projectTypes.slice(0, 4).map((projectType) => ({ "@type": "Thing", name: projectType })),
    ],
    mainEntity: {
      "@id": `${pageUrl}#service`,
    },
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#approval-deliverables`,
    name: `${service.menuLabel} documents, risks and process steps`,
    itemListElement: [...service.documents, ...service.process, ...deepContent.authorityRisks.map((risk) => risk.title)].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item,
    })),
  };

  const documentChecklist = Array.from(new Set([...service.documents, ...deepContent.documents]));
  const resourceLinks = Array.from(new Map([
    ...deepContent.internalLinkBlocks,
    ...relatedPages.map((item) => ({ href: item.href, title: item.menuLabel, description: item.metaDescription })),
  ].map((item) => [item.href, item])).values());

  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Approval", href: "/approval" }, { label: service.menuLabel }]}
        eyebrow={service.eyebrow}
        title={service.h1}
        description={service.heroText}
        image={approvalImage.src}
        imageAlt={approvalImage.alt}
        imageCaption={approvalImage.caption}
        imageAttribution={getUniquePhotoAttribution(approvalImage)}
        imagePosition={approvalImage.objectPosition}
        primaryCta={{ label: "Request Approval Support", href: "/contact" }}
        secondaryCta={{ label: "All Approvals", href: "/approval" }}
        showPlanningSummary={false}
      />

      <section id="approval-answers" className="section-pad bg-white">
        <div className="container-pad grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <PremiumSectionHeading eyebrow="Service overview" title={service.overviewTitle} />
            <div className="mt-5 space-y-4 leading-7 text-steel">{service.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            <p className="mt-5 text-sm leading-7 text-steel">Project environments: {deepContent.projectTypes.join(", ")}. The correct route depends on the location, asset use, master developer, landlord and inspection stage.</p>
          </div>
          <div className="space-y-6">
            <SectionPhotograph photo={sectionPhotographs[0]} compact />
            <aside className="rounded-lg border border-amber-300 bg-amber-50 p-6" aria-labelledby="authority-boundary-heading">
              <h2 id="authority-boundary-heading" className="text-xl font-semibold text-charcoal">Coordination support is not authority approval</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal">Emitronix is not the approving authority and does not guarantee an approval, NOC, review period or inspection outcome. The relevant authority and appointed consultant determine formal requirements and technical submission responsibilities for each project.</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-charcoal">
                <li>Confirm the current authority route and project jurisdiction.</li>
                <li>Identify the properly appointed and eligible formal submitter.</li>
                <li>Define Emitronix&apos;s document, stakeholder and site-readiness tasks.</li>
                <li>Record exclusions, dependencies and authority-controlled outcomes.</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-pad soft-section">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
          <div className="space-y-6">
            <PremiumSectionHeading eyebrow="Document readiness" title="Prepare the submission records" description="Final requirements depend on project type, location, authority comments and consultant scope. Include the property or plot reference and records of any work already completed." />
            <SectionPhotograph photo={sectionPhotographs[1]} compact />
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {documentChecklist.map((document) => <li key={document} className="rounded-lg border border-brand/[0.15] bg-white p-4 text-sm leading-7 text-charcoal">{document}</li>)}
          </ul>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad">
          <PremiumSectionHeading eyebrow="Approval process" title="From scope review to authority response" />
          <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5" data-internal-reveal-group="approval-process">
            {service.process.map((step, index) => <li key={step} className="luxury-card rounded-lg p-5" data-internal-reveal-item><span className="text-xl font-semibold text-brand" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p className="mt-3 text-sm leading-7 text-charcoal">{step}</p></li>)}
          </ol>
          <details className="mt-6 rounded-lg border border-brand/[0.15] p-5">
            <summary className="cursor-pointer font-semibold text-brand">Document, comment and site coordination</summary>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {deepContent.processDetails.map((item) => <article key={item.title}><h3 className="font-semibold text-charcoal">{item.title}</h3><p className="mt-2 text-sm leading-7 text-steel">{item.description}</p></article>)}
            </div>
          </details>
        </div>
      </section>

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading eyebrow="Submission risks" title={`What can delay ${service.menuLabel}`} />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {deepContent.authorityRisks.map((item) => <article key={item.title} className="luxury-card rounded-lg p-6"><h3 className="text-xl font-semibold text-charcoal">{item.title}</h3><p className="mt-3 text-sm leading-7 text-steel">{item.description}</p></article>)}
          </div>
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <SectionPhotograph photo={sectionPhotographs[2]} />
            <div className="grid gap-5 md:grid-cols-2">
              {deepContent.technicalTopics.map((topic) => (
                <article key={topic.title} className="rounded-lg border border-brand/[0.15] bg-white p-6">
                  <h3 className="text-xl font-semibold text-charcoal">{topic.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-steel">{topic.summary}</p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-steel">{topic.points.map((point) => <li key={point}>{point}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad rounded-lg border border-brand/[0.15] bg-brand-soft p-6">
          <PremiumSectionHeading eyebrow="Official source" title="Confirm the current authority requirements" />
          <p className="mt-4 text-sm leading-7 text-steel">This general planning guide was reviewed on <time dateTime={trustContentLastReviewedIso}>{trustContentLastReviewedLabel}</time>. Authority portals, eligibility rules, documents, fees and service times can change. Check the official source and obtain project-specific confirmation from the relevant authority and properly appointed consultant or contractor before acting.</p>
          <a href={authoritySource.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-brand underline underline-offset-4">{authoritySource.label}</a>
        </div>
      </section>

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading eyebrow="Related resources" title="Connected authority and construction workflows" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resourceLinks.map((item) => <Link key={item.href} href={item.href} className="luxury-card rounded-lg p-5"><h3 className="flex items-center justify-between gap-3 text-lg font-semibold text-charcoal">{item.title}<ArrowRight className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" /></h3><p className="mt-2 text-sm leading-7 text-steel">{item.description}</p></Link>)}
          </div>
        </div>
      </section>

      <div id="faq"><FAQSection accordion title={`${service.menuLabel} FAQ.`} description="Useful answers for Dubai project teams preparing authority submissions, comments and inspections." faqs={approvalFaqs} schema /></div>

      <section className="section-pad soft-section">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <PremiumSectionHeading eyebrow="Project enquiry" title={`Request ${service.menuLabel} support.`} description="Share the project location, drawings, site photographs, existing approvals, NOC status, current authority comments, consultant details and required timeline so the next approval action can be identified." />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="premium-button">Request Support <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
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
        <ContentReviewRecord title={`${service.menuLabel} content record`} reviewScope={`General editorial review of the ${service.menuLabel} planning workflow, source boundary, document-readiness guidance and non-guarantee language. The relevant authority and appointed professionals remain responsible for current project requirements and formal decisions.`} />
      </details>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
    </InternalPageFrame>
  );
}
