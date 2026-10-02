import type { Metadata } from "next";
import { getSeoOverride } from "@/lib/adminStore";
import { absoluteUrl, brandAssets, site } from "@/data/site";
import { getAssignedPageHero } from "@/data/pagePhotography";
import {
  buildCanonicalUrl,
  buildLanguageAlternates,
  getLanguageAlternates,
  getOpenGraphLocales,
} from "@/lib/seoRouting";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  /**
   * Existing Arabic routes are paired automatically. Set this to null only
   * for a genuine English-only or utility route.
   */
  arabicPath?: string | null;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
};

const defaultImage = brandAssets.socialCard;
const defaultImageAlt =
  "Commercial and warehouse construction in Dubai";
const MAX_TITLE_LENGTH = 70;
const MAX_META_KEYWORDS = 12;

export function resolveMetaTitle(title: string) {
  if (title.includes(site.name)) return title;

  const brandedTitle = `${title} | ${site.name}`;
  return brandedTitle.length <= MAX_TITLE_LENGTH ? brandedTitle : title;
}

function normalizeMetaKeywords(keywords: string[] | undefined) {
  if (!keywords) return undefined;

  const normalized = Array.from(
    new Set(
      keywords
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_META_KEYWORDS);

  return normalized.length > 0 ? normalized : undefined;
}

/** Keep social images aligned with an explicitly assigned, visible internal hero. */
function withAssignedHeroImage(metadata: Metadata, pagePath: string): Metadata {
  const photo = getAssignedPageHero(pagePath);
  if (!photo) return metadata;
  const imageUrl = absoluteUrl(photo.src);
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [{ url: imageUrl, width: photo.width, height: photo.height, alt: pagePath.startsWith("/ar/") ? photo.altAr : photo.alt }],
    },
    twitter: { ...metadata.twitter, images: [imageUrl] },
  };
}

export function createPageMetadata({
  title,
  description,
  path,
  arabicPath,
  keywords,
  image = defaultImage,
  imageAlt = defaultImageAlt,
}: PageMetadataInput): Metadata {
  const resolvedTitle = resolveMetaTitle(title);
  const url = buildCanonicalUrl(path);
  const languages =
    arabicPath === null
      ? undefined
      : arabicPath
        ? buildLanguageAlternates(path, arabicPath)
        : getLanguageAlternates(path);
  const openGraphLocales = getOpenGraphLocales(path);
  const socialImage =
    image.startsWith("/images/generated/") && image.endsWith("-desktop.webp")
      ? image.replace(/-desktop\.webp$/, "-og.webp")
      : image;
  const imageUrl = absoluteUrl(socialImage);
  const imageDimensions =
    socialImage === brandAssets.socialCard || /-og\.webp$/i.test(socialImage)
      ? { width: 1200, height: 630 }
      : { width: 1672, height: 941 };

  return withAssignedHeroImage({
    title: {
      absolute: resolvedTitle,
    },
    description,
    keywords: normalizeMetaKeywords(keywords),
    alternates: {
      canonical: url,
      ...(languages ? { languages } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      ...openGraphLocales,
      url,
      siteName: site.name,
      title: resolvedTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: imageDimensions.width,
          height: imageDimensions.height,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [imageUrl],
    },
  }, path);
}

/**
 * Merges administrator SEO overrides (managed in /admin/seo, stored in
 * storage/seo-overrides.json) into a page's base metadata.
 */
export async function applySeoOverrides(base: Metadata, pagePath: string): Promise<Metadata> {
  base = withAssignedHeroImage(base, pagePath);
  const override = await getSeoOverride(pagePath).catch(() => null);
  if (!override) return base;

  const merged: Metadata = { ...base };

  if (override.metaTitle) merged.title = { absolute: override.metaTitle };
  if (override.metaDescription) merged.description = override.metaDescription;
  if (override.keywords) merged.keywords = normalizeMetaKeywords(override.keywords.split(","));

  if (override.ogTitle || override.ogDescription || override.ogImage || override.metaTitle || override.metaDescription) {
    merged.openGraph = {
      ...merged.openGraph,
      title: override.ogTitle || override.metaTitle || undefined,
      description: override.ogDescription || override.metaDescription || undefined,
      ...(override.ogImage
        ? {
            images: [
              {
                url: override.ogImage.startsWith("http") ? override.ogImage : absoluteUrl(override.ogImage),
                ...(/(?:-og\.webp|emitronix-construction-dubai-og\.webp)$/i.test(override.ogImage)
                  ? { width: 1200, height: 630 }
                  : {}),
              },
            ],
          }
        : {}),
    };
    merged.twitter = {
      ...merged.twitter,
      title: override.ogTitle || override.metaTitle || undefined,
      description: override.ogDescription || override.metaDescription || undefined,
      ...(override.ogImage
        ? { images: [override.ogImage.startsWith("http") ? override.ogImage : absoluteUrl(override.ogImage)] }
        : {}),
    };
  }

  // Public canonical pages must remain self-canonical and indexable. Stored
  // canonical/noindex values are retained for backwards data compatibility but
  // are only allowed to affect genuine utility routes.
  if (override.noindex && ["/search", "/guest-post"].includes(pagePath)) {
    merged.robots = { index: false, follow: false };
  }

  return merged;
}

/**
 * Wraps createPageMetadata in a generateMetadata resolver so administrator
 * overrides are read at render time (and refreshed via ISR/revalidatePath)
 * instead of being frozen into the build.
 */
export function createMetadataResolver(input: PageMetadataInput) {
  return async function generateMetadata(): Promise<Metadata> {
    return applySeoOverrides(createPageMetadata(input), input.path);
  };
}
