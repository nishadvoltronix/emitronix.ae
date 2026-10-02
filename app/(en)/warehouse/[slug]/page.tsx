import { InternalPageFrame } from "@/components/InternalPageFrame";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck, Warehouse } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerEngineSummary } from "@/components/AnswerEngineSummary";
import { ContentReviewRecord } from "@/components/ContentReviewRecord";
import { FAQSection, ProcessRail, TrustBar } from "@/components/ContentBlocks";
import { CTA } from "@/components/CTA";
import { PremiumSectionHeading } from "@/components/Premium";
import { SectionPhotograph } from "@/components/SectionPhotograph";
import { WarehouseGuideHero } from "@/components/WarehouseGuideHero";
import { getGeneratedImage } from "@/data/generatedImages";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { applySeoOverrides, createPageMetadata } from "@/data/seo";
import { absoluteUrl, site } from "@/data/site";
import { warehouseAuthorityPages, warehouseBlogPosts } from "@/data/warehouseSeo";
import { warehouseBlogIndexingContent } from "@/data/warehouseBlogIndexingContent";
import { getWarehouseIndexingContent } from "@/data/warehouseIndexingContent";

type WarehousePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return warehouseAuthorityPages.map((page) => ({ slug: page.slug }));
}

function getWarehousePage(slug: string) {
  return warehouseAuthorityPages.find((page) => page.slug === slug);
}

export async function generateMetadata({ params }: WarehousePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getWarehousePage(slug);
  if (!page) return {};

  const image = getGeneratedImage(page.imageKey);
  const metadata = createPageMetadata({
    title: page.seoTitle,
    description: page.metaDescription,
    path: page.href,
    arabicPath: null,
    keywords: [
      page.keyword,
      "Warehouse Construction Dubai",
      "Warehouse Contractor Dubai",
      "Construction Company Dubai",
      "Civil Contractor Dubai",
      "Industrial Contractor Dubai",
      "Authority Approvals Dubai",
    ],
    image: image.og?.src ?? image.desktop.src,
    imageAlt: image.alt,
  });

  return applySeoOverrides(metadata, page.href);
}

export default async function WarehouseSiloPage({ params }: WarehousePageProps) {
  const { slug } = await params;
  const page = getWarehousePage(slug);
  if (!page) notFound();

  const image = getGeneratedImage(page.imageKey);
  const pageUrl = absoluteUrl(page.href);
  const [overviewPhoto, fieldPhoto, documentsPhoto, handoverPhoto] = getSectionPhotographs(page.href, 4, [image.desktop.src]);
  const phoneHref = `tel:${site.phone.replace(/\s/g, "")}`;
  const authorityList = page.authorityNotes.map((note) => note.split(" ")[0]).join(", ");
  const indexingContent = getWarehouseIndexingContent(slug);
  const topicGuides = warehouseBlogPosts.filter((post) =>
    Object.hasOwn(warehouseBlogIndexingContent, post.slug)
    && post.internalLinks.some((link) => link.href === page.href),
  );

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.seoTitle,
    description: page.metaDescription,
    ...(page.modifiedDate ? { dateModified: page.modifiedDate } : {}),
    inLanguage: "en-AE",
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: [
      { "@type": "Thing", name: page.keyword },
      { "@type": "Thing", name: page.category },
      { "@type": "Thing", name: "Warehouse Construction Dubai" },
      { "@type": "Thing", name: "Authority Approvals Dubai" },
    ],
    mainEntity: { "@id": `${pageUrl}#service` },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-answer-engine-summary]"],
    },
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: page.keyword,
    serviceType: page.category,
    description: page.metaDescription,
    url: pageUrl,
    provider: { "@id": absoluteUrl("/#organization") },
    areaServed: page.serviceAreas.map((name) => ({ "@type": "Place", name })),
    image: absoluteUrl(image.desktop.src),
    termsOfService: absoluteUrl("/terms-and-conditions"),
    isRelatedTo: page.related.map((item) => ({
      "@type": "WebPage",
      name: item.label,
      url: absoluteUrl(item.href),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Warehouse Construction", item: absoluteUrl("/warehouse-construction") },
      { "@type": "ListItem", position: 3, name: page.title, item: pageUrl },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#documents`,
    name: `${page.title} documents and quality controls`,
    itemListElement: [...page.requiredDocuments, ...page.qualityControls].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item,
    })),
  };

  return (
    <InternalPageFrame>
      <WarehouseGuideHero page={page} image={image} />

      <div data-answer-engine-summary>
        <AnswerEngineSummary
          eyebrow="Planning summary"
          question={`What is important for ${page.title.toLowerCase()}?`}
          answer={page.engineeringOpinion}
          facts={page.summaryFacts}
          cta={{ label: "Request Approval-Aware Support", href: "/contact" }}
        />
      </div>

      <section className="section-pad bg-white">
        <div className="container-pad grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-brand/[0.14] bg-brand-soft p-6 shadow-none">
              <p className="premium-kicker">Warehouse topic</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal">{page.keyword}</h2>
              <p className="mt-4 text-sm leading-7 text-steel">Review the scope, field checks and documents before discussing your project.</p>
              <div className="mt-6 grid gap-3">
                <a href={phoneHref} className="premium-button justify-center">Call Emitronix <ArrowRight className="h-4 w-4" /></a>
                <Link href="/contact" className="premium-button-light justify-center">Send Project Details <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </aside>
          <div>
            <PremiumSectionHeading
              eyebrow="Service overview"
              title={`${page.title}: engineering, approvals and delivery control.`}
            />
            <div className="mt-8 grid gap-5">
              {page.intro.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-9 text-steel">{paragraph}</p>
              ))}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {page.benefits.map((benefit) => (
                <div key={benefit} className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white p-5 shadow-sm">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand" />
                  <p className="text-sm font-bold leading-7 text-charcoal">{benefit}</p>
                </div>
              ))}
            </div>
            <SectionPhotograph photo={overviewPhoto} compact className="mt-8" />
          </div>
        </div>
      </section>

      {indexingContent ? (
        <section className="section-pad bg-white" aria-labelledby="scope-planning-heading" data-topic-specific-content>
          <div className="container-pad">
            <p className="premium-kicker">Scope planning</p>
            <h2 id="scope-planning-heading" className="mt-4 text-4xl font-semibold tracking-tight text-charcoal">Decisions specific to this scope.</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-steel">{indexingContent.purpose}</p>
            <p className="mt-5 text-sm text-steel">
              Content updated <time dateTime="2026-10-01">1 October 2026</time>.
            </p>
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {indexingContent.sections.map((section) => (
                <article key={section.title} className="rounded-lg border border-brand/[0.14] bg-brand-pale p-6">
                  <h3 className="text-2xl font-semibold tracking-tight text-charcoal">{section.title}</h3>
                  <div className="mt-5 grid gap-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-steel">{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {indexingContent.contextualLinks.map((link) => (
                <li key={link.href} className="rounded-lg border border-brand/[0.12] p-5">
                  <p className="text-sm leading-7 text-steel">{link.context}</p>
                  <Link href={link.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4">
                    {link.label}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {topicGuides.length ? (
        <section className="section-pad soft-section" aria-labelledby="topic-guides-heading">
          <div className="container-pad">
            <h2 id="topic-guides-heading" className="text-3xl font-semibold tracking-tight text-charcoal">Practical guides for this scope.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {topicGuides.map((post) => (
                <article key={post.slug} className="rounded-lg border border-brand/[0.14] bg-white p-6">
                  <h3 className="text-xl font-semibold leading-7 text-charcoal">
                    <Link href={`/blog/${post.slug}`} className="text-brand underline underline-offset-4">{post.title}</Link>
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-steel">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-pad soft-section" id="field-decision-brief">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="Engineer&apos;s decision brief"
            title={`What controls ${page.title.toLowerCase()} before work reaches site.`}
            description="The checks below translate the operating brief into field evidence that can be challenged before structure, services or authority-dependent work is released."
            align="center"
          />
          <div className="mx-auto mt-8 max-w-5xl rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-charcoal shadow-sm">
            <p className="premium-kicker">Failure mode to prevent</p>
            <p className="mt-3 text-base font-bold leading-8">{page.failureMode}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {page.fieldChecks.map((check, index) => (
              <article key={check.title} className="luxury-card rounded-lg p-6">
                <p className="premium-kicker">Field check {String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal">{check.title}</h2>
                <p className="mt-4 text-sm leading-7 text-steel">{check.description}</p>
              </article>
            ))}
          </div>
          <SectionPhotograph photo={fieldPhoto} compact className="mx-auto mt-8 max-w-4xl" />
        </div>
      </section>

      <ProcessRail
        eyebrow="Approval-aware process"
        title={`How Emitronix structures ${page.title.toLowerCase()}.`}
        description="The process is built around early information control, authority visibility, safe execution and completion-ready documentation."
        steps={page.processSteps}
      />

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="Documents"
            title="Documents and inputs that reduce delay."
            description="Share current coordinated records, identify missing information and assign an owner to each open decision."
          />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {page.requiredDocuments.map((document) => (
              <li key={document} className="flex items-start gap-3 rounded-lg border border-brand/[0.12] bg-white p-5">
                <FileCheck2 className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span className="text-base font-semibold leading-7 text-charcoal">{document}</span>
              </li>
            ))}
          </ul>
          <SectionPhotograph photo={documentsPhoto} compact className="mx-auto mt-8 max-w-4xl" />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-pad grid gap-8 lg:grid-cols-2">
          <article className="luxury-card rounded-lg p-7 lg:p-9">
            <p className="premium-kicker">Authority approvals expertise</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal">
              Authority pathways for Dubai warehouse projects.
            </h2>
            <p className="mt-5 text-base leading-8 text-steel">
              The likely touchpoints for this topic include {authorityList || "Dubai authorities"} depending on location, consultant scope, landlord rules and intended use.
            </p>
            <div className="mt-7 grid gap-4">
              {page.authorityNotes.map((note) => (
                <p key={note} className="rounded-lg border border-brand/[0.12] bg-brand-soft p-4 text-sm font-bold leading-7 text-charcoal">
                  {note}
                </p>
              ))}
            </div>
          </article>
          <article className="luxury-card rounded-lg p-7 lg:p-9">
            <p className="premium-kicker">Safety and quality</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal">
              Quality controls that protect handover.
            </h2>
            <div className="mt-7 grid gap-4">
              {page.qualityControls.map((item) => (
                <div key={item} className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white p-4 shadow-sm">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-brand" />
                  <p className="text-sm font-bold leading-7 text-charcoal">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
        <div className="container-pad mt-8">
          <SectionPhotograph photo={handoverPhoto} compact className="mx-auto max-w-4xl" />
        </div>
      </section>

      <TrustBar
        eyebrow="Service areas"
        title="Dubai-first warehouse contracting support across the UAE."
        points={page.serviceAreas.map((area) => `${area} warehouse and industrial project enquiries`)}
      />

      <section className="section-pad bg-white">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="Related resources"
            title="Related warehouse construction and approval guides."
            description="Explore the connected scopes relevant to your project."
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.related.map((item) => (
              <Link key={item.href} href={item.href} className="luxury-card flex items-center gap-4 rounded-lg p-5">
                <Warehouse className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
                <h2 className="text-lg font-semibold leading-7 text-charcoal">{item.label}</h2>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="References"
            title="Authority references to verify project requirements."
            description="Final project requirements must be confirmed with the appointed consultant and relevant approving authority for the exact location, scope and use."
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {page.references.map((reference) => (
              <a
                key={reference.href}
                href={reference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-brand/[0.12] bg-white p-5 text-sm font-semibold text-charcoal shadow-sm transition hover:border-brand/30 hover:text-brand"
              >
                {reference.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <FAQSection accordion
        title={`${page.title} FAQ.`}
        description="Short answers for owners and consultants preparing Dubai warehouse construction, industrial construction and authority approval enquiries."
        faqs={page.faqs}
        schema
      />

      <ContentReviewRecord
        title={`${page.title} content record`}
        reviewScope={`General editorial review of ${page.title.toLowerCase()}, including operational assumptions, engineering interfaces, authority boundaries, inspection planning and handover prompts. Project-specific design and formal approval remain with the appointed professionals and relevant authorities.`}
        showVerificationTodo={false}
      />

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
    </InternalPageFrame>
  );
}
