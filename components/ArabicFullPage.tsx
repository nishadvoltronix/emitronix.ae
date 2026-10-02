import { InternalPageFrame } from "@/components/InternalPageFrame";
import { ReactNode } from "react";
import { approvalServices } from "@/data/approvals";
import { blogPosts } from "@/data/blog";
import type { ArabicPageData } from "@/data/arabic";
import { findInternalServiceImage } from "@/data/pagePhotography";
import { absoluteUrl, services, site } from "@/data/site";
import { toArabicPath } from "@/lib/i18n";

type ArabicFullPageProps = {
  page: ArabicPageData;
  children: ReactNode;
};

function breadcrumbItems(page: ArabicPageData) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: absoluteUrl("/ar"),
    },
  ];

  if (page.path !== "/") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: page.title,
      item: absoluteUrl(toArabicPath(page.path)),
    });
  }

  return items;
}

export function ArabicFullPage({ page, children }: ArabicFullPageProps) {
  const internalPhoto = page.path === "/" ? undefined : findInternalServiceImage(`/ar${page.path}`);
  const primaryImage = internalPhoto?.src ?? page.image;
  const arabicUrl = absoluteUrl(toArabicPath(page.path));
  const englishUrl = absoluteUrl(page.path);
  const blogPost = page.kind === "blog-post" ? blogPosts.find((post) => `/blog/${post.slug}` === page.path) : null;
  const service = page.kind === "service" ? services.find((item) => item.href === page.path) : null;
  const approval = page.kind === "approval" ? approvalServices.find((item) => item.href === page.path) : null;
  const serviceLike = service
    ? {
        name: page.title,
        description: page.description,
        serviceType: service.title,
        related: service.relatedHrefs,
      }
    : approval
      ? {
          name: page.title,
          description: page.description,
          serviceType: approval.menuLabel,
          related: approval.related.map((slug) => `/${slug}`),
        }
      : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${arabicUrl}#webpage`,
        url: arabicUrl,
        name: page.title,
        description: page.description,
        inLanguage: "ar-AE",
        isPartOf: {
          "@id": `${site.url}/#website`,
          name: site.name,
          url: site.url,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(primaryImage),
          caption: internalPhoto?.altAr ?? page.imageAlt,
          ...(internalPhoto ? { width: internalPhoto.width, height: internalPhoto.height } : {}),
        },
        translationOfWork: {
          "@type": "WebPage",
          url: englishUrl,
          inLanguage: "en-AE",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${arabicUrl}#breadcrumb`,
        itemListElement: breadcrumbItems(page),
      },
      ...(blogPost
        ? [
            {
              "@type": "BlogPosting",
              "@id": `${arabicUrl}#article`,
              headline: page.title,
              description: page.description,
              image: [absoluteUrl(page.image)],
              datePublished: blogPost.publishedDate,
              dateModified: blogPost.modifiedDate,
              author: {
                "@id": absoluteUrl("/#organization"),
              },
              publisher: {
                "@id": absoluteUrl("/#organization"),
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${arabicUrl}#webpage`,
              },
              articleSection: blogPost.category,
              keywords: blogPost.targetKeywords.join(", "),
              citation: blogPost.references?.map((reference) => reference.href),
              inLanguage: "ar-AE",
              translationOfWork: {
                "@type": "Article",
                url: englishUrl,
                inLanguage: "en-AE",
              },
            },
          ]
        : []),
      ...(serviceLike
        ? [
            {
              "@type": "Service",
              "@id": `${arabicUrl}#service`,
              name: serviceLike.name,
              description: serviceLike.description,
              url: arabicUrl,
              image: absoluteUrl(primaryImage),
              areaServed: site.serviceArea.map((name) => ({ "@type": "Place", name })),
              provider: {
                "@id": absoluteUrl("/#organization"),
                name: site.legalName,
                telephone: site.phoneE164,
                email: site.email,
                url: site.url,
              },
              mainEntityOfPage: arabicUrl,
              serviceType: serviceLike.serviceType,
              isRelatedTo: serviceLike.related.map((href) => ({
                "@type": "WebPage",
                url: absoluteUrl(toArabicPath(href)),
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      {page.path === "/" ? (
        <div lang="ar-AE" dir="rtl" className="arabic-page bg-white text-charcoal">
          {children}
        </div>
      ) : (
        <InternalPageFrame lang="ar-AE" dir="rtl" className="arabic-page bg-white text-charcoal">
          {children}
        </InternalPageFrame>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
