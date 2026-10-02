import "server-only";
import uniquePhotoAssets from "./uniquePhotoAssets.json";
import pagePhotoAssignments from "./pagePhotoAssignments.json";
import {
  findInternalServiceImage as findOriginalServiceImage,
  type InternalServiceImage,
} from "./internalServiceImages";
import {
  getSectionPhotographs as getOriginalSectionPhotographs,
  getSectionPhotographSourceId,
} from "./sectionPhotography";

type PagePhotoAssignment = {
  hero?: string;
  /** Positions correspond to the existing supporting-photo list; null retains a slot. */
  sections?: readonly (string | null)[];
};

const assignments = pagePhotoAssignments as Readonly<Record<string, PagePhotoAssignment>>;
const assets = uniquePhotoAssets as readonly InternalServiceImage[];
const assetsById = new Map<string, InternalServiceImage>();

function routePath(href: string): string {
  return href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}

function isHomepage(route: string): boolean {
  return route === "/" || route === "/ar";
}

function sourceIdentity(value: string): string {
  const photo = value.match(/photo-\d+-[\da-f]+/i)?.[0];
  if (photo) return photo;
  const pexels = (value.match(/(?:Pexels|pexels-photo-|images\.pexels\.com\/photos\/)(\d+)/i)
    ?? value.match(/pexels\.com\/photo\/(?:[^/?#]*-)?(\d+)(?:[/?#]|$)/i))?.[1];
  return pexels ? `pexels:${pexels}` : getSectionPhotographSourceId(value);
}

const physicalSources = new Map<string, string>();
for (const photo of assets) {
  const requiredText: (keyof InternalServiceImage)[] = ["sourceId", "src", "alt", "altAr", "caption", "captionAr", "sourceUrl", "licenseUrl", "credit"];
  if (requiredText.some((field) => typeof photo[field] !== "string" || !String(photo[field]).trim())
    || !Number.isFinite(photo.width) || photo.width <= 0 || !Number.isFinite(photo.height) || photo.height <= 0
    || !photo.src.startsWith("/images/")) {
    throw new Error(`Invalid unique photograph record: ${photo.sourceId || "missing sourceId"}.`);
  }
  if (assetsById.has(photo.sourceId)) throw new Error(`Duplicate unique photograph sourceId: ${photo.sourceId}.`);
  for (const key of [`src:${photo.src}`, `source:${sourceIdentity(photo.sourceUrl)}`]) {
    const existing = physicalSources.get(key);
    if (existing) throw new Error(`Photograph ${photo.sourceId} reuses the source of ${existing}.`);
    physicalSources.set(key, photo.sourceId);
  }
  assetsById.set(photo.sourceId, photo);
}

const owners = new Map<string, string>();
for (const [route, assignment] of Object.entries(assignments)) {
  if (!route.startsWith("/") || routePath(route) !== route || isHomepage(route)) {
    throw new Error(`Page photograph assignments cannot target ${route}; use a normalized internal-page route.`);
  }
  if (!assignment || typeof assignment !== "object" || (assignment.sections !== undefined && !Array.isArray(assignment.sections))) {
    throw new Error(`Invalid page photograph assignment for ${route}.`);
  }
  const slots = [
    ...(assignment.hero !== undefined ? [{ sourceId: assignment.hero, slot: "hero" }] : []),
    ...(assignment.sections ?? []).flatMap((sourceId, index) => sourceId === null ? [] : [{ sourceId, slot: `section ${index + 1}` }]),
  ];
  for (const { sourceId, slot } of slots) {
    const photo = assetsById.get(sourceId);
    if (!photo) throw new Error(`Missing unique photograph ${String(sourceId)} assigned to ${route} ${slot}.`);
    const owner = `${route} ${slot}`;
    const identity = sourceIdentity(photo.sourceUrl);
    const existing = owners.get(identity);
    if (existing) throw new Error(`Unique photograph ${sourceId} is assigned twice: ${existing} and ${owner}.`);
    owners.set(identity, owner);
  }
}

/** Explicit assignments never fall back across locales or onto either homepage. */
export function getAssignedPageHero(href: string): InternalServiceImage | undefined {
  const route = routePath(href);
  if (isHomepage(route)) return undefined;
  const sourceId = assignments[route]?.hero;
  return sourceId ? assetsById.get(sourceId) : undefined;
}

/** Keep the existing service-image API for untouched pages. */
export function findInternalServiceImage(href: string): InternalServiceImage | undefined {
  return getAssignedPageHero(href) ?? findOriginalServiceImage(href);
}

export function getInternalServiceImage(href: string): InternalServiceImage {
  const photo = findInternalServiceImage(href);
  if (!photo) throw new Error(`Internal service image is not configured for ${href}.`);
  return photo;
}

/** Replace only explicitly allocated slots; retain the prior count and all other slots. */
export function getSectionPhotographs(href: string, count = 4, excludeSources: string[] = []): InternalServiceImage[] {
  const original = getOriginalSectionPhotographs(href, count, excludeSources);
  const route = routePath(href);
  if (isHomepage(route) || !assignments[route]?.sections?.length) return original;
  const assignedHero = getAssignedPageHero(route);
  const excluded = new Set([...excludeSources, ...(assignedHero ? [assignedHero.sourceId, assignedHero.src, assignedHero.sourceUrl] : [])].map(sourceIdentity));
  const sectionIds = assignments[route].sections!;
  if (sectionIds.length > original.length && sectionIds.slice(original.length).some(Boolean)) {
    throw new Error(`Photograph assignments for ${route} exceed its ${original.length} supporting-photo slots.`);
  }
  const resolved = original.map((photo, index) => {
    const sourceId = sectionIds[index];
    return sourceId ? assetsById.get(sourceId)! : photo;
  });
  const seen = new Set(excluded);
  for (const photo of resolved) {
    const identity = sourceIdentity(photo.sourceUrl);
    if (seen.has(identity) || seen.has(sourceIdentity(photo.sourceId)) || seen.has(sourceIdentity(photo.src))) {
      throw new Error(`Photograph ${photo.sourceId} repeats an excluded or supporting image on ${route}.`);
    }
    seen.add(identity);
    seen.add(sourceIdentity(photo.sourceId));
    seen.add(sourceIdentity(photo.src));
  }
  return resolved;
}

/** Only newly curated assets require the new linked attribution treatment. */
export function getUniquePhotoAttribution(photo: InternalServiceImage | undefined, locale?: "en" | "ar"): (Pick<InternalServiceImage, "credit" | "sourceUrl" | "licenseUrl"> & { locale?: "en" | "ar" }) | undefined {
  if (!photo || assetsById.get(photo.sourceId)?.src !== photo.src) return undefined;
  return { credit: photo.credit, sourceUrl: photo.sourceUrl, licenseUrl: photo.licenseUrl, ...(locale ? { locale } : {}) };
}
