import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame, InternalPageHero as PageHero } from "@/components/InternalPageFrame";
import Link from "next/link";
import { CTA } from "@/components/CTA";
import { PremiumSectionHeading } from "@/components/Premium";
import { approvalServices } from "@/data/approvals";
import { blogPosts } from "@/data/blog";
import { getGeneratedImage } from "@/data/generatedImages";
import { createMetadataResolver } from "@/data/seo";
import { absoluteUrl, navItems, services, stats } from "@/data/site";
import { warehouseAuthorityPages } from "@/data/warehouseSeo";

export const generateMetadata = createMetadataResolver({
  title: "HTML Sitemap",
  description:
    "Browse Emitronix Contracting LLC pages, Dubai construction services, authority approval resources and construction blog articles.",
  path: "/html-sitemap",
  keywords: ["Emitronix sitemap", "Dubai construction services sitemap", "construction company Dubai pages"],
});

const sitemapImage = getGeneratedImage("company.construction-technical-resources-dubai-hero");

const pageGroups = [
  {
    title: "Main pages",
    links: [
      ...navItems,
      { label: "Founder", href: "/founder" },
      { label: "Leadership", href: "/leadership" },
      { label: "Company Information", href: "/company-information" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Frequently Asked Questions", href: "/faqs" },
      { label: "Locations", href: "/locations" },
      { label: "Dubai Service Area", href: "/locations/dubai" },
      { label: "HTML Sitemap", href: "/html-sitemap" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Editorial Policy", href: "/editorial-policy" },
      { label: "Technical Review Policy", href: "/technical-review-policy" },
      { label: "Corrections Policy", href: "/corrections-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "سياسة ملفات الارتباط", href: "/ar/cookie-policy" },
      { label: "سياسة الخصوصية", href: "/ar/privacy-policy" },
      { label: "الشروط والأحكام", href: "/ar/terms-and-conditions" },
    ],
  },
  {
    title: "Construction services",
    links: services.map((service) => ({ label: service.title, href: service.href })),
  },
  {
    title: "Dubai authority approvals",
    links: [
      { label: "Authority Approvals Hub", href: "/approval" },
      ...approvalServices.map((service) => ({ label: service.menuLabel, href: service.href })),
    ],
  },
  {
    title: "Warehouse construction authority silo",
    links: warehouseAuthorityPages.map((page) => ({ label: page.title, href: page.href })),
  },
  {
    title: "Construction knowledge center",
    links: [
      { label: "Blog", href: "/blog" },
      ...blogPosts.map((post) => ({ label: post.title, href: `/blog/${post.slug}` })),
    ],
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "HTML Sitemap", item: absoluteUrl("/html-sitemap") },
  ],
};

export default function HtmlSitemapPage() {
  const sectionPhotographs = getSectionPhotographs("/html-sitemap", 5);
  return (
    <InternalPageFrame>
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "HTML Sitemap" }]}
        eyebrow="Sitemap"
        title="Browse Emitronix construction resources."
        description="A clean index of Emitronix Contracting LLC pages for Dubai construction services, authority approvals, project resources and civil construction articles."
        imageAsset={sitemapImage}
        primaryCta={{ label: "View Services", href: "/services" }}
        secondaryCta={{ label: "Contact Emitronix", href: "/contact" }}
        metrics={stats}
      />

      <section className="section-pad soft-section">
        <div className="container-pad">
          <PremiumSectionHeading
            eyebrow="Site index"
            title="Find the right page by topic."
            description="Use this page to move quickly between civil contracting, main contracting, warehouse construction, approvals, resources and blog articles."
            align="center"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {pageGroups.map((group, index) => (
              <article key={group.title} className="luxury-card rounded-lg p-6 lg:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-charcoal">{group.title}</h2>
                <div className="mt-6"><SectionPhotograph photo={sectionPhotographs[index]} compact /></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {group.links.map((link) => (
                    <Link key={`${group.title}-${link.href}`} href={link.href} className="rounded-lg border border-brand/[0.12] bg-white px-4 py-3 text-sm font-semibold text-charcoal transition hover:border-brand/30 hover:bg-brand-soft hover:text-brand">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </InternalPageFrame>
  );
}
