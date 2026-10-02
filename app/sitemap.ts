import type { MetadataRoute } from "next";
import { approvalServices } from "@/data/approvals";
import { blogPosts } from "@/data/blog";
import { services, site } from "@/data/site";
import { warehouseAuthorityPages } from "@/data/warehouseSeo";
import {
  faqContentLastReviewedIso,
  trustContentLastReviewedIso,
} from "@/data/trustCenter";
import { readSiteFiles } from "@/lib/adminStore";
import { hasArabicPage, toArabicPath, toEnglishPath } from "@/lib/i18n";
import {
  buildCanonicalUrl,
  getLanguageAlternates,
  normalizePath,
} from "@/lib/seoRouting";

export const dynamic = "force-dynamic";

type RouteRecord = {
  path: string;
  lastModified?: string;
  changeFrequency?: "weekly" | "monthly" | "yearly";
  priority?: number;
};

function hasSitemapArabicPage(path: string) {
  return hasArabicPage(toEnglishPath(path));
}
const coreRoutes: RouteRecord[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", priority: 0.8, lastModified: trustContentLastReviewedIso },
  { path: "/founder", priority: 0.8, lastModified: trustContentLastReviewedIso },
  { path: "/leadership", priority: 0.8, lastModified: trustContentLastReviewedIso },
  { path: "/company-information", priority: 0.8, lastModified: trustContentLastReviewedIso },
  { path: "/services", priority: 0.9, lastModified: trustContentLastReviewedIso },
  { path: "/approval", priority: 0.9, lastModified: trustContentLastReviewedIso },
  { path: "/projects", priority: 0.6, lastModified: trustContentLastReviewedIso },
  { path: "/industries", priority: 0.8 },
  { path: "/careers", priority: 0.5 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/resources", changeFrequency: "weekly", priority: 0.9 },
  {
    path: "/faqs",
    priority: 0.7,
    lastModified: faqContentLastReviewedIso,
  },
  { path: "/locations", priority: 0.7 },
  { path: "/locations/dubai", priority: 0.8 },
  { path: "/contact", priority: 0.8 },
  { path: "/html-sitemap", priority: 0.4 },
  { path: "/editorial-policy", priority: 0.5, lastModified: trustContentLastReviewedIso },
  { path: "/technical-review-policy", priority: 0.5, lastModified: trustContentLastReviewedIso },
  { path: "/corrections-policy", priority: 0.5, lastModified: trustContentLastReviewedIso },
  { path: "/disclaimer", priority: 0.5, lastModified: trustContentLastReviewedIso },
  { path: "/accessibility", priority: 0.5, lastModified: trustContentLastReviewedIso },
  { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.4 },
];

function sitemapEntry(record: RouteRecord): MetadataRoute.Sitemap[number] {
  const languages = getLanguageAlternates(record.path);
  return {
    url: buildCanonicalUrl(record.path),
    ...(record.lastModified ? { lastModified: record.lastModified } : {}),
    changeFrequency: record.changeFrequency ?? "monthly",
    priority: record.priority ?? 0.7,
    ...(languages ? { alternates: { languages } } : {}),
  };
}

function normalizeSameOriginExtra(value: string) {
  try {
    const url = new URL(value, site.url);
    if (url.origin !== new URL(site.url).origin) return null;
    if (url.search || url.hash) return null;
    return normalizePath(url.pathname);
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteFiles = await readSiteFiles().catch(() => ({}) as Awaited<ReturnType<typeof readSiteFiles>>);
  const excluded = new Set(
    (siteFiles.sitemapExcludedPaths || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => normalizeSameOriginExtra(line))
      .filter((path): path is string => Boolean(path)),
  );
  for (const path of [...excluded]) {
    const englishPath = toEnglishPath(path);
    excluded.add(englishPath);
    if (hasSitemapArabicPage(englishPath)) excluded.add(toArabicPath(englishPath));
  }

  const extras = (siteFiles.sitemapExtraUrls || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => normalizeSameOriginExtra(line))
    .filter((path): path is string => Boolean(path));

  const englishRecords: RouteRecord[] = [
    ...coreRoutes,
    ...services.map((service) => ({
      path: service.href,
      priority: 0.8,
      lastModified: trustContentLastReviewedIso,
    })),
    ...approvalServices.map((service) => ({
      path: service.href,
      priority: 0.8,
      lastModified: trustContentLastReviewedIso,
    })),
    ...warehouseAuthorityPages.map((page) => ({
      path: page.href,
      priority: 0.78,
      lastModified: page.modifiedDate ?? trustContentLastReviewedIso,
    })),
    ...blogPosts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: post.modifiedDate,
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.8 : 0.7,
    })),
  ];
  const knownCanonicalPaths = new Set(englishRecords.map((record) => record.path));
  const validExtras = extras
    .filter((path) => {
      const englishPath = toEnglishPath(path);
      if (!knownCanonicalPaths.has(englishPath)) return false;
      return path === englishPath || (hasSitemapArabicPage(englishPath) && path === toArabicPath(englishPath));
    })
    .map((path) => ({ path, priority: 0.5 }));
  const arabicRecords = englishRecords
    .filter((record) => hasSitemapArabicPage(record.path))
    .map((record) => ({
      ...record,
      path: toArabicPath(record.path),
      priority: Math.max(0.3, (record.priority ?? 0.7) - 0.1),
    }));
  const records: RouteRecord[] = [
    ...validExtras,
    ...englishRecords,
    ...arabicRecords,
  ];

  const unique = new Map<string, RouteRecord>();
  for (const record of records) {
    if (!excluded.has(record.path)) unique.set(record.path, record);
  }

  return Array.from(unique.values()).map(sitemapEntry);
}
