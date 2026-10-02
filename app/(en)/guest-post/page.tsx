import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CTA } from "@/components/CTA";
import { PremiumSectionHeading } from "@/components/Premium";
import { getGeneratedImage } from "@/data/generatedImages";
import { absoluteUrl } from "@/data/site";
import { createMetadataResolver } from "@/data/seo";

const guestPostImage = getGeneratedImage("company.construction-technical-resources-dubai-hero");

const resolveGuestPostMetadata = createMetadataResolver({
  title: "Guest Post Guidelines",
  description:
    "Contact Emitronix for relevant construction, contracting, fit-out, warehouse, villa, project management or Dubai authority approval guest post enquiries.",
  path: "/guest-post",
  keywords: ["construction guest post Dubai", "contracting guest post UAE", "Dubai construction articles"],
  image: guestPostImage.og!.src,
  imageAlt: guestPostImage.alt,
});

export async function generateMetadata() {
  const metadata = await resolveGuestPostMetadata();
  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
    },
  };
}

const guidelines = [
  "Construction, contracting, fit-out, warehouse, villa, project management or Dubai authority approval topics.",
  "Practical guidance for owners, consultants, tenants or commercial teams preparing a Dubai project.",
  "No unverified claims, client names, project counts, certifications, guarantees or confidential customer information.",
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Guest Post Guidelines", item: absoluteUrl("/guest-post") },
  ],
};

export default function GuestPostPage() {
  const sectionPhotographs = getSectionPhotographs("/guest-post", 4);
  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guest Post Guidelines" }]}
        eyebrow="Guest posts"
        title="Guest post enquiries for construction and approval topics."
        description="Use this page for relevant construction, contracting, fit-out, warehouse, villa, project management or Dubai authority approval article enquiries. The contact team can review whether the topic is appropriate before anything is published."
        imageAsset={guestPostImage}
        primaryCta={{ label: "Contact Emitronix", href: "/contact" }}
        secondaryCta={{ label: "Read the blog", href: "/blog" }}
      />

      <section className="section-pad bg-white">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="Submission fit"
            title="Relevant topics must support practical construction decisions."
            description="Guest post enquiries are reviewed for relevance, accuracy and fit with Emitronix construction, fit-out and authority approval resources."
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {guidelines.map((item, index) => (
              <article key={item} className="luxury-card rounded-lg p-6">
                <div className="mb-5"><SectionPhotograph photo={sectionPhotographs[index]} compact /></div>
                <CheckCircle2 className="h-7 w-7 text-brand" />
                <p className="mt-5 text-sm font-bold leading-7 text-charcoal">{item}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/contact" className="premium-button">
              Send enquiry <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mx-auto mt-10 max-w-4xl rounded-lg border border-brand/[0.14] bg-brand-soft p-6 text-center">
            <div className="mb-6"><SectionPhotograph photo={sectionPhotographs[3]} compact /></div>
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Review and publication boundary</h2>
            <p className="mt-3 text-sm leading-7 text-steel">
              An enquiry, draft or topic suggestion does not guarantee acceptance or publication. Any accepted contribution must follow the website evidence, technical-review and correction standards.
            </p>
            <nav className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold" aria-label="Guest post review policies">
              <Link href="/editorial-policy" className="text-brand underline underline-offset-4">Editorial policy</Link>
              <Link href="/technical-review-policy" className="text-brand underline underline-offset-4">Technical review policy</Link>
              <Link href="/corrections-policy" className="text-brand underline underline-offset-4">Corrections policy</Link>
            </nav>
          </div>
        </div>
      </section>

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </InternalPageFrame>
  );
}
