import { ArrowRight, CheckCheck, Clock3, Factory, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HomeSignatureHero } from "@/components/HomeSignatureHero";
import styles from "@/components/Home.module.css";
import { blogPosts } from "@/data/blog";
import {
  homeIndustries,
  homeMetadata,
  homeProcess,
  homeReasons,
  homeServices,
  homepageFaqs,
  ownerDecisionBriefs,
} from "@/data/home";
import { createMetadataResolver } from "@/data/seo";
import { absoluteUrl, services, site } from "@/data/site";
import { trustContentLastReviewedIso, trustContentLastReviewedLabel } from "@/data/trustCenter";

export const generateMetadata = createMetadataResolver({
  ...homeMetadata,
  path: "/",
  keywords: [
    "Construction Company Dubai",
    "Building Construction Dubai",
    "Building Contractor Dubai",
    "Civil Contracting Company Dubai",
    "Warehouse Construction Dubai",
    "Turnkey Construction Dubai",
    "Villa Construction Dubai",
    "Commercial building contractor Dubai",
    "Fit-out and renovation contractor Dubai",
    "Interior Fit-Out Dubai",
    "Authority Approvals Dubai",
  ],
  image: "/images/home-construction-og.webp",
  imageAlt: "Tower cranes and high-rise construction along the Dubai waterfront",
});

const servicePhotos = [
  { src: "/images/civil-contractor-dubai-construction-site.webp", alt: "Construction workers beside a reinforced concrete building frame" },
  { src: "/images/warehouse-construction-dubai.webp", alt: "Cranes erecting steel portal frames for a warehouse building" },
  { src: "/images/mep-civil-contracting-dubai.webp", alt: "Construction workers on a scissor lift installing steel roof trusses" },
  { src: "/images/dubai-authority-approval-contractor.webp", alt: "A project team reviewing architectural plans and building drawings" },
  { src: "/images/commercial-fit-out-contractor-dubai.webp", alt: "Completed office interior with glass partitions and coordinated finishes" },
  { src: "/images/building-contractor-dubai-construction-site.webp", alt: "Two construction professionals in hard hats reviewing a clipboard on site" },
];
const mainContracting = services.find((service) => service.href === "/main-contracting")!;
const featuredServices = [...homeServices, mainContracting];
const otherServices = services.filter((service) => !featuredServices.some((featured) => featured.href === service.href));

const industryPhotos = [
  { src: "/images/project-warehouse-industrial-dubai.webp", alt: "Storage racks and circulation aisles inside a working warehouse" },
  { src: "/images/project-office-fit-out-dubai.webp", alt: "Glass-fronted office spaces with overhead building services" },
  { src: "/images/mep-civil-contracting-dubai.webp", alt: "Steel roof structure being installed for an industrial building" },
  { src: "/images/project-commercial-renovation-dubai.webp", alt: "Finished commercial corridor with exposed mechanical services" },
];
const reasonIcons = [Users, CheckCheck, Clock3, Factory];
// Use the site's sourced photographs for the homepage article previews.
const articlePhotos: Record<string, { src: string; alt: string }> = {
  "Civil Construction": {
    src: "/images/civil-contractor-dubai-construction-site.webp",
    alt: "Construction team overlooking foundation reinforcement at a building site",
  },
  "Dubai Authority Approvals": {
    src: "/images/dubai-authority-approval-contractor.webp",
    alt: "Architectural drawings reviewed with a ruler and calculator",
  },
  "Warehouse Construction": {
    src: "/images/warehouse-construction-dubai.webp",
    alt: "Steel warehouse frame under construction with cranes and site equipment",
  },
};
const latestArticles = blogPosts.slice(0, 3).map((post) => ({
  ...post,
  photo: articlePhotos[post.category] ?? servicePhotos[5],
}));
const authorityLinks = [
  { title: "Dubai Municipality", href: "/dubai-municipality-approval" },
  { title: "DDA", href: "/dda-approvals" },
  { title: "Trakhees", href: "/trakhees-approvals" },
  { title: "DEWA", href: "/dewa-approvals" },
  { title: "Dubai Civil Defence", href: "/dcd-approvals" },
  { title: "RTA", href: "/rta-approval" },
];

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={styles.textLink}>{children}<ArrowRight aria-hidden="true" /></Link>;
}

function SectionHeading({ eyebrow, title, id, description }: {
  eyebrow: string;
  title: string;
  id: string;
  description?: string;
}) {
  return (
    <div>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.heading}>{title}</h2>
      {description && <p className={styles.intro}>{description}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={styles.home}>
      <HomeSignatureHero />

      <section className={styles.section} aria-labelledby="home-services">
        <div className="container-pad">
          <div className={styles.sectionHead}>
            <SectionHeading
              eyebrow="What we build"
              id="home-services"
              title="Our Construction Services"
              description="Civil contracting, building construction and fit-out, connected through clear planning, practical coordination and handover readiness."
            />
            <TextLink href="/services">Explore all services</TextLink>
          </div>
          <div className={styles.serviceGrid}>
            {featuredServices.map((service, index) => (
              <article key={service.href} className={styles.serviceCard}>
                <div className={styles.serviceImage}>
                  <Image src={servicePhotos[index].src} alt={servicePhotos[index].alt} fill sizes="(min-width: 1520px) 468px, (min-width: 768px) 33vw, (min-width: 480px) 50vw, 100vw" />
                </div>
                <div className={styles.serviceBody}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <Link href={service.href} className={styles.textLink} aria-label={`Learn more about ${service.title}`}>
                    Learn More <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.pale}`} aria-labelledby="home-solutions">
        <div className="container-pad">
          <div className={styles.solutionGrid}>
            <div className={styles.solutionPhoto}>
              <Image
                src="/images/project-civil-works-dubai.webp"
                alt="Construction workers preparing steel reinforcement at a building site"
                fill
                sizes="(min-width: 1101px) 1600px, 100vw"
              />
            </div>
            <div className={styles.solutionText}>
              <SectionHeading
                eyebrow="From scope to handover"
                id="home-solutions"
                title="Complete Construction & Contracting Solutions in Dubai"
              />
              <p>
                {site.legalName} brings civil and main contracting, warehouses, industrial
                and commercial buildings, villas, renovation and interior fit-out into a
                coordinated project approach. Based in {site.location}, our published
                service areas cover {site.serviceArea.join(", ")}.
              </p>
              <p>
                As a civil contracting company in Dubai, we start with the details that
                shape your build: location, intended use, drawings, site conditions,
                consultant responsibilities and authority requirements. Scope, assumptions
                and exclusions are clarified before pricing or mobilisation.
              </p>
              <p>
                Whether you need <Link href="/villa-construction">villa construction</Link>,{" "}
                <Link href="/building-renovation">building renovation</Link> or a{" "}
                <Link href="/turnkey-construction">turnkey construction</Link> solution,
                civil, structural, MEP and fit-out work must follow an agreed sequence.
                Inspection readiness, snag closure and completion records are part of that plan.
              </p>
              <p>
                Dubai Municipality approval, DDA approval and Trakhees approval support
                are coordinated around the property and proposed works. The exact
                authority, formal submitter and appointed consultant responsibilities
                are confirmed for each project.
              </p>
              <nav className={styles.authorityLinks} aria-label="Dubai authority approval guides">
                {authorityLinks.map((authority) => (
                  <Link key={authority.href} href={authority.href}>{authority.title}</Link>
                ))}
              </nav>
            </div>
          </div>
          <details className={styles.capabilities}>
            <summary>More construction & contracting capabilities <Plus aria-hidden="true" /></summary>
            <div className={styles.capabilityGrid}>
              {otherServices.map((service) => (
                <article key={service.href}>
                  <h3><TextLink href={service.href}>{service.title}</TextLink></h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="home-why">
        <div className="container-pad">
          <div className={styles.reasonsLayout}>
            <div>
              <SectionHeading
                eyebrow="The Emitronix approach"
                id="home-why"
                title="Why Choose Emitronix for Your Construction Project?"
                description="A well-planned build starts with clear responsibilities. We connect the drawings, the people and the decisions that move your project forward."
              />
              <div className={styles.actions}><TextLink href="/about">Get to know Emitronix</TextLink></div>
            </div>
            <div className={styles.reasonsGrid}>
              {homeReasons.map((reason, index) => {
                const Icon = reasonIcons[index];
                return (
                  <article key={reason.title} className={styles.reason}>
                    <Icon aria-hidden="true" />
                    <h3>{reason.title}</h3>
                    <p>{reason.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.pale}`} aria-labelledby="home-industries">
        <div className="container-pad">
          <div className={styles.sectionHead}>
            <SectionHeading
              eyebrow="Spaces that work"
              id="home-industries"
              title="Industries We Serve"
              description="Different buildings. Different demands. Construction planned around how each space will be used."
            />
            <TextLink href="/industries">Explore our sectors</TextLink>
          </div>
          <div className={styles.industryGrid}>
            {homeIndustries.map((industry, index) => (
              <article key={industry.title} className={styles.industry}>
                <div className={styles.industryImage}>
                  <Image src={industryPhotos[index].src} alt={industryPhotos[index].alt} fill sizes="(min-width: 1520px) 346px, (min-width: 1101px) 25vw, (min-width: 480px) 50vw, 100vw" />
                </div>
                <h3><Link href={industry.href}>{industry.title}</Link></h3>
                <p>{industry.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="home-process">
        <div className="container-pad">
          <SectionHeading
            eyebrow="A clear path forward"
            id="home-process"
            title="Our Construction Process"
            description="From your initial brief to project completion, every stage has a clear purpose."
          />
          <ol className={styles.timeline}>
            {homeProcess.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.pale}`} aria-labelledby="home-showcase">
        <div className="container-pad">
          <div className={styles.sectionHead}>
            <SectionHeading
              eyebrow="Construction in focus"
              id="home-showcase"
              title="The details behind a well-built space."
              description="Structural works, building services and considered finishes — each plays a part in the completed environment."
            />
            <TextLink href="/projects">Explore project scopes</TextLink>
          </div>
          <div className={styles.showcaseGrid}>
            <figure>
              <div className={styles.showcaseImage}>
                <Image
                  src="/images/warehouse-construction-dubai.webp"
                  alt="Steel columns and roof frames being erected across a warehouse construction site"
                  fill
                  sizes="(min-width: 1520px) 820px, (min-width: 768px) 58vw, 100vw"
                />
              </div>
              <figcaption>Structure & civil works <span>Industrial construction</span></figcaption>
            </figure>
            <figure>
              <div className={styles.showcaseImage}>
                <Image
                  src="/images/project-office-fit-out-dubai.webp"
                  alt="Completed commercial workspace with glass partitions and exposed ceiling services"
                  fill
                  sizes="(min-width: 1520px) 608px, (min-width: 768px) 42vw, 100vw"
                />
              </div>
              <figcaption>Interiors & building services <span>Commercial fit-out</span></figcaption>
            </figure>
          </div>
          <p className={styles.stockNote}>
            Representative construction photography. These images illustrate service environments and are not presented as completed Emitronix projects.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="home-planning">
        <div className="container-pad">
          <div className={styles.sectionHead}>
            <SectionHeading
              eyebrow="Before work begins"
              id="home-planning"
              title="Four decisions that help prevent construction rework."
              description="Practical briefing prompts for owners: operations, existing conditions, authority comments and inspection hold points belong in the first contractor conversation."
            />
          </div>
          <div className={styles.notesGrid}>
            {ownerDecisionBriefs.map((brief) => (
              <details key={brief.title} className={styles.accordion}>
                <summary><h3>{brief.title}</h3><Plus aria-hidden="true" /></summary>
                <div className={styles.faqAnswer}>
                  <p>{brief.observation}</p>
                  <p><strong>Next project action:</strong> {brief.action}</p>
                  <TextLink href={brief.href}>Review the related service</TextLink>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.pale}`} aria-labelledby="home-faq">
        <div className="container-pad">
          <div className={styles.faqLayout}>
            <div>
              <SectionHeading
                eyebrow="Your questions, answered"
                id="home-faq"
                title="Construction in Dubai. What you need to know."
                description="Helpful answers when choosing a building contractor, planning a warehouse or preparing for an approval."
              />
              <div className={styles.actions}><TextLink href="/faqs">Browse all construction FAQs</TextLink></div>
            </div>
            <div>
              {homepageFaqs.map((faq, index) => (
                <details key={faq.question} className={styles.accordion} open={index === 0}>
                  <summary><h3>{faq.question}</h3><Plus aria-hidden="true" /></summary>
                  <div className={styles.faqAnswer}><p>{faq.answer}</p></div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="home-cta">
        <div className="container-pad">
          <div className={styles.ctaPanel}>
            <div>
              <SectionHeading
                eyebrow="Let's build what's next"
                id="home-cta"
                title="Planning Your Next Construction Project in Dubai?"
                description="Tell us about your location, scope, drawings and target timeline. Our team will help identify the next steps for your construction, fit-out or approval enquiry."
              />
            </div>
            <div className={styles.ctaActions}>
              <div className={styles.actions}>
                <Link href="/contact" className={styles.button}>Request a Quote <ArrowRight aria-hidden="true" /></Link>
                <Link href="/contact" className={styles.buttonSecondary}>Contact Our Team <ArrowRight aria-hidden="true" /></Link>
              </div>
              <p>Need to discuss your site? <TextLink href="/contact?intent=site-visit">Request a site visit</TextLink></p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="home-guides">
        <div className="container-pad">
          <div className={styles.sectionHead}>
            <SectionHeading eyebrow="Knowledge & insight" id="home-guides" title="Construction Blog & Insights" />
            <TextLink href="/blog">View all articles</TextLink>
          </div>
          <div className={styles.articles}>
            {latestArticles.map((post) => (
              <article key={post.slug} className={styles.article}>
                <Link
                  href={`/blog/${post.slug}`}
                  className={styles.articleImage}
                  aria-label={`Read ${post.title}`}
                >
                  <Image
                    src={post.photo.src}
                    alt={post.photo.alt}
                    fill
                    sizes="(min-width: 1520px) 464px, (min-width: 1024px) calc((100vw - 128px) / 3), (min-width: 768px) calc((100vw - 112px) / 3), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                    quality={75}
                  />
                </Link>
                <p className={styles.eyebrow}>{post.category}</p>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.excerpt}</p>
                <TextLink href={`/blog/${post.slug}`}>Read guide</TextLink>
              </article>
            ))}
          </div>
          <details className={styles.review}>
            <summary>Homepage content ownership & review record <Plus aria-hidden="true" /></summary>
            <p>
              Editorial owner: {site.legalName}. Published company information last reviewed{" "}
              <time dateTime={trustContentLastReviewedIso}>{trustContentLastReviewedLabel}</time>.
            </p>
            <p>
              General editorial review of published company facts, service descriptions,
              construction-planning guidance, authority boundaries and enquiry pathways.
              Project-specific design, calculations, approvals and contractual advice
              remain the responsibility of the appointed professionals and relevant authorities.
            </p>
            <nav aria-label="Content governance policies">
              <Link href="/editorial-policy">Editorial policy</Link>
              <Link href="/technical-review-policy">Technical review policy</Link>
              <Link href="/corrections-policy">Corrections policy</Link>
              <Link href="/disclaimer">Disclaimer</Link>
            </nav>
          </details>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Construction Company Dubai | Emitronix Contracting LLC",
            url: absoluteUrl("/"),
            description: homeMetadata.description,
            primaryImageOfPage: absoluteUrl("/images/home-construction-og.webp"),
            provider: { "@id": absoluteUrl("/#organization"), name: site.legalName },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${absoluteUrl("/")}#faq`,
            mainEntity: homepageFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }],
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
