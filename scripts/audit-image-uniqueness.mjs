import { createHash } from "node:crypto";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import ts from "typescript";

// Audit content placements, not network requests. srcset candidates, picture
// sources, preloads and social metadata are not additional visual placements.
const root = process.cwd();
const args = process.argv.slice(2);
const option = (name, fallback) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1) ?? fallback;
const build = option("--build", ".next-navigation-final");
const label = option("--label", "baseline");
const output = path.resolve(root, option("--output", "reports/internal-polish-unique-images-2026-10-02"));
const baseUrl = option("--base-url", "");
const extraRoutes = option("--routes", "").split(",").filter(Boolean);
const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");
const slash = (value) => value.replaceAll("\\", "/");
const decode = (value = "") => value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity) => {
  const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
  if (named[entity]) return named[entity];
  return String.fromCodePoint(entity.startsWith("&#x") ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10));
});
const textOnly = (value) => decode(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

async function walk(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === "ENOENT") return []; throw error; }
  return (await Promise.all(entries.map(async (entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))).flat();
}

function normalizeSource(value) {
  if (!value || value.startsWith("data:")) return value;
  let source = decode(value);
  try {
    const url = new URL(source, "https://emitronix.ae");
    if (url.pathname === "/_next/image") return normalizeSource(url.searchParams.get("url"));
    if (url.hostname === "emitronix.ae" || url.hostname === "www.emitronix.ae") source = decodeURIComponent(url.pathname);
    else source = `${url.origin}${url.pathname}`;
  } catch { source = source.split("?")[0]; }
  return source;
}

function sourceIdentity(value = "") {
  const photo = value.match(/photo-\d+-[\da-f]+/i);
  if (photo) return `unsplash:${photo[0]}`;
  const pexels = value.match(/(?:Pexels|pexels-photo-|images\.pexels\.com\/photos\/)(\d+)/i) ?? value.match(/pexels\.com\/photo\/[^/]*-(\d+)\//i);
  return pexels ? `pexels:${pexels[1]}` : null;
}

const explicitIdentities = new Map();
const basenameIdentities = new Map();
const sourceEvidence = new Map();
const sourceProvenance = new Map();
function remember(src, identity, evidence, details) {
  if (!src || !identity) return;
  const normalized = normalizeSource(src);
  explicitIdentities.set(normalized, identity);
  basenameIdentities.set(path.basename(normalized).replace(/\.(?:webp|avif|jpe?g|png)$/i, ""), identity);
  sourceEvidence.set(normalized, evidence);
  if (details) sourceProvenance.set(normalized, details);
}

for (const file of (await walk(path.join(root, "data"))).filter((file) => /\.(?:ts|json)$/.test(file))) {
  const contents = await readFile(file, "utf8");
  if (file.endsWith(".json")) {
    function inspectRecord(record) {
      if (!record || typeof record !== "object") return;
      if (record.src && (record.sourceId || record.sourceUrl)) {
        remember(record.src, sourceIdentity(record.sourceId ?? record.sourceUrl), slash(path.relative(root, file)), {
          sourceId: record.sourceId, sourceUrl: record.sourceUrl, credit: record.credit,
          licenseUrl: record.licenseUrl, topic: record.topic,
        });
      }
      for (const value of Object.values(record)) inspectRecord(value);
    }
    inspectRecord(JSON.parse(contents));
    continue;
  }
  const tree = ts.createSourceFile(file, contents, ts.ScriptTarget.Latest, true);
  function literal(node) { return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null; }
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const props = Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map((prop) => [prop.name.getText(tree).replace(/^['"]|['"]$/g, ""), literal(prop.initializer)]));
      const id = sourceIdentity(props.sourceId ?? props.sourceUrl ?? "");
      if (id) remember(props.src ?? props.path ?? props.image, id, slash(path.relative(root, file)));
    }
    if (ts.isCallExpression(node) && node.expression.getText(tree) === "stock") {
      remember(literal(node.arguments[0]), sourceIdentity(literal(node.arguments[3]) ?? ""), slash(path.relative(root, file)));
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
}

for (const file of ["docs/image-sources.md", "reports/internal-pages-optimization-2026-10-02/image-download-provenance.json"]) {
  let contents;
  try { contents = await readFile(path.join(root, file), "utf8"); } catch { continue; }
  if (file.endsWith(".json")) {
    for (const item of JSON.parse(contents).assets ?? []) remember(item.src, sourceIdentity(item.sourceId ?? item.sourceUrl), file);
  } else {
    for (const line of contents.split(/\r?\n/)) {
      if (!line.startsWith("|")) continue;
      const id = sourceIdentity(line);
      if (!id) continue;
      for (const match of line.matchAll(/`([^`]+)`/g)) {
        if (/\.(?:webp|avif|jpe?g|png)$/.test(match[1])) remember(match[1].startsWith("/") ? match[1] : `/images/${match[1]}`, id, file);
        else if (!match[1].includes(" ")) basenameIdentities.set(match[1], id);
      }
    }
  }
}
// The social image is explicitly documented as a crop of the waterfront photo.
remember("/images/home-construction-og.webp", "unsplash:photo-1617018628636-6f3f5dcda7b1", "docs/image-sources.md");
const manuallyReviewedIdentityGroups = [{
  identity: "legacy-generated:emitronix-warehouse-team",
  paths: ["/images/home/emitronix-warehouse-team-generated.png", "/images/home/emitronix-warehouse-team-hero.webp"],
  evidence: "Both full images visually inspected during the 2026-10-02 audit: same warehouse scene and people; format/compression derivatives. Neither is rendered in the baseline.",
}];
for (const group of manuallyReviewedIdentityGroups) for (const src of group.paths) remember(src, group.identity, group.evidence);

function initialIdentity(src) {
  const normalized = normalizeSource(src);
  return explicitIdentities.get(normalized)
    ?? basenameIdentities.get(path.basename(normalized).replace(/\.(?:webp|avif|jpe?g|png)$/i, ""))
    ?? sourceIdentity(normalized)
    ?? normalized.replace(/-(?:desktop|mobile|og)(?=\.)/, "").replace(/\.(?:webp|avif|jpe?g|png)$/i, "");
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function srcsetPaths(value = "") { return [...new Set(value.split(/,\s*/).map((part) => normalizeSource(part.trim().split(/\s+/)[0])).filter(Boolean))]; }
const occurrences = [];
const technicalReferences = [];
const pages = [];
const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function inspectHtml(html, page, evidence) {
  const rawHtml = html;
  const canonical = decode(html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] ?? "");
  const title = textOnly(html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "");
  const local = [];
  const stack = [];
  let sectionNumber = 0;
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  const nearest = (tags) => [...stack].reverse().find((node) => tags.includes(node.tag));
  for (const token of html.matchAll(/<[^>]+>|[^<]+/g)) {
    const value = token[0];
    if (!value.startsWith("<")) {
      const heading = nearest(["h1", "h2", "h3", "h4"]);
      if (heading) heading.text += ` ${value}`;
      continue;
    }
    const name = value.match(/^<\/?\s*([\w-]+)/)?.[1]?.toLowerCase();
    if (!name) continue;
    if (value.startsWith("</")) {
      const index = stack.findLastIndex((node) => node.tag === name);
      if (index < 0) continue;
      const frame = stack[index];
      if (/^h[1-4]$/.test(name)) for (const ancestor of stack.slice(0, index)) ancestor.headings.push({ tag: name, text: textOnly(frame.text) });
      stack.splice(index);
      continue;
    }
    const attr = attributes(value);
    const node = { tag: name, attr, text: "", headings: [], sources: [], number: name === "section" ? ++sectionNumber : 0 };
    if (name === "source") {
      const picture = nearest(["picture"]);
      if (picture) picture.sources.push(...srcsetPaths(attr.srcset));
    }
    const sources = [];
    if (name === "img" && attr.src) sources.push({ src: normalizeSource(attr.src), type: "image", variants: [...new Set([...srcsetPaths(attr.srcset), ...(nearest(["picture"])?.sources ?? [])])] });
    if (name === "video" && attr.poster) sources.push({ src: normalizeSource(attr.poster), type: "video-poster", variants: [] });
    for (const match of (attr.style ?? "").matchAll(/(?:background(?:-image)?)\s*:[^;]*url\(['"]?([^'"\)]+)['"]?\)/g)) sources.push({ src: normalizeSource(match[1]), type: "background-image", variants: [] });
    for (const source of sources) {
      if (source.src?.startsWith("data:")) continue;
      local.push({
        page, pageTitle: title, imagePath: source.src, filename: path.basename(source.src), domIndex: local.length + 1,
        placementType: source.type, alt: attr.alt ?? attr["aria-label"] ?? "", declaredWidth: attr.width || null, declaredHeight: attr.height || null,
        loading: attr.loading ?? null, priority: attr.fetchpriority ?? null, variants: source.variants.filter((item) => item !== source.src),
        sectionRef: nearest(["section", "header", "footer", "main"]), articleRef: nearest(["article", "a"]),
        figureRef: nearest(["figure"]), ancestors: stack.map((item) => item.attr.class ?? "").join(" "), evidence,
      });
    }
    if (name === "meta" && /^(?:og:image|twitter:image)$/.test(attr.property ?? attr.name ?? "") && attr.content) technicalReferences.push({ page, kind: attr.property ?? attr.name, imagePath: normalizeSource(attr.content), countsAsVisualPlacement: false });
    if (name === "link" && /^(?:icon|apple-touch-icon|shortcut icon)$/.test(attr.rel ?? "") && attr.href) technicalReferences.push({ page, kind: attr.rel, imagePath: normalizeSource(attr.href), countsAsVisualPlacement: false });
    if (!voidTags.has(name) && !value.endsWith("/>")) stack.push(node);
  }
  for (const item of local) {
    const section = item.sectionRef;
    const mainHeading = section?.headings.find((heading) => /h[12]/.test(heading.tag));
    const cardHeading = item.articleRef?.headings.find((heading) => /h[234]/.test(heading.tag));
    const sectionName = mainHeading?.text || section?.attr["aria-label"] || section?.attr.id || section?.tag || "Page content";
    item.section = `${sectionName}${cardHeading ? ` / ${cardHeading.text}` : ""}`;
    item.sectionIndex = section?.number ?? 0;
    item.sectionId = section?.attr.id ?? null;
    item.role = item.placementType === "video-poster" ? "video poster" : /hero|intro|heroSlides/.test(item.ancestors) || mainHeading?.tag === "h1" ? "hero" : item.articleRef ? "card" : item.figureRef ? "section photograph" : "content image";
    item.classification = /(?:logo|wordmark|brand-mark)/i.test(item.imagePath) ? "Logo/brand asset" : /(?:favicon|\/icons?\/|apple-touch-icon)/i.test(item.imagePath) ? "Icon/system asset" : "Important content image";
    item.important = item.classification === "Important content image";
    item.homepageLocked = page === "/" || page === "/ar";
    delete item.sectionRef; delete item.articleRef; delete item.figureRef; delete item.ancestors;
  }
  occurrences.push(...local);
  pages.push({ page, title, canonical, htmlSha256: sha(rawHtml), evidence, contentPlacements: local.filter((item) => item.important).length, sharedPlacements: local.filter((item) => !item.important).length });
}

const htmlRoot = path.join(root, build, "server", "app");
for (const file of (await walk(htmlRoot)).filter((file) => file.endsWith(".html")).sort()) {
  const route = slash(path.relative(htmlRoot, file)).replace(/\.html$/, "");
  inspectHtml(await readFile(file, "utf8"), route === "index" ? "/" : `/${route}`, slash(path.relative(root, file)));
}
if (baseUrl) for (const page of extraRoutes) {
  const response = await fetch(new URL(page, baseUrl), { signal: AbortSignal.timeout(30000) });
  inspectHtml(await response.text(), page, `HTTP ${response.status} ${baseUrl}${page}`);
}

const referenced = new Set([...occurrences.flatMap((item) => [item.imagePath, ...item.variants]), ...technicalReferences.map((item) => item.imagePath)]);
const filePaths = (await walk(path.join(root, "public", "images"))).filter((file) => /\.(?:webp|avif|jpe?g|png|svg|gif)$/i.test(file));
const assets = [];
const cosine = Array.from({ length: 8 }, (_, u) => Array.from({ length: 32 }, (_, x) => Math.cos(((2 * x + 1) * u * Math.PI) / 64)));
async function fingerprint(file) {
  const buffer = await readFile(file);
  const meta = await sharp(buffer).metadata();
  const normalized = await sharp(buffer).rotate().removeAlpha().greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
  const coefficients = [];
  for (let u = 0; u < 8; u++) for (let v = 0; v < 8; v++) {
    let sum = 0;
    for (let x = 0; x < 32; x++) for (let y = 0; y < 32; y++) sum += normalized[y * 32 + x] * cosine[u][x] * cosine[v][y];
    coefficients.push(sum);
  }
  const median = [...coefficients.slice(1)].sort((a, b) => a - b)[31];
  let bits = 0n;
  for (const value of coefficients.slice(1)) bits = (bits << 1n) | BigInt(value > median);
  return { width: meta.width, height: meta.height, format: meta.format, bytes: buffer.length, sha256: sha(buffer), normalizedPixelSha256: sha(normalized), perceptualHash: bits.toString(16).padStart(16, "0") };
}
for (const file of filePaths.sort()) {
  const src = `/${slash(path.relative(path.join(root, "public"), file))}`;
  try { assets.push({ imagePath: src, filename: path.basename(file), ...await fingerprint(file), identity: initialIdentity(src), identityEvidence: sourceEvidence.get(src) ?? (src.includes("/generated/") ? "Asset family naming; generation provenance requires review" : "Source documentation or asset-family naming"), provenance: sourceProvenance.get(src) ?? null, used: referenced.has(src) }); }
  catch (error) { assets.push({ imagePath: src, filename: path.basename(file), identity: initialIdentity(src), error: error.message, used: referenced.has(src) }); }
}
const assetByPath = new Map(assets.map((asset) => [asset.imagePath, asset]));
let reviewedPhotoEvidence = null;
let independentVisualScreening = null;
try {
  const evidencePath = path.join(output, "reviewed-new-photo-provenance.json");
  const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
  const records = new Map((evidence.images ?? []).filter((item) => item.src && item.reviewStatus?.startsWith("approved")).map((item) => [item.src, item]));
  for (const asset of assets.filter((item) => item.imagePath.startsWith("/images/unique/"))) {
    const record = records.get(asset.imagePath);
    asset.visualReviewEvidence = record ? {
      report: slash(path.relative(root, evidencePath)),
      status: record.reviewStatus, sourceId: record.sourceId, licenseUrl: record.licenseUrl,
      reviewedFileSha256: record.sha256, currentFileMatchesReviewedBytes: record.sha256 === asset.sha256,
      companyOwnership: record.companyOwnership, locationClaim: record.locationClaim,
    } : null;
  }
  reviewedPhotoEvidence = { report: slash(path.relative(root, evidencePath)), approvedRecords: records.size };
} catch (error) { if (error.code !== "ENOENT") throw error; }
try {
  const screeningPath = path.join(output, "new-photo-perceptual-check.json");
  const screening = JSON.parse(await readFile(screeningPath, "utf8"));
  independentVisualScreening = { report: slash(path.relative(root, screeningPath)), method: screening.method, newImages: screening.newImages, comparedImages: screening.comparedImages, flaggedPairs: screening.flagged?.length ?? null };
} catch (error) { if (error.code !== "ENOENT") throw error; }

// Merge exact byte/pixel identities across names/formats. Conservative perceptual
// candidates remain separate until visually reviewed, avoiding false positives.
const parent = new Map();
function find(id) { if (!parent.has(id)) parent.set(id, id); const next = parent.get(id); if (next !== id) parent.set(id, find(next)); return parent.get(id); }
function union(a, b) { const aa = find(a), bb = find(b); if (aa !== bb) parent.set(bb, aa); }
for (const field of ["sha256", "normalizedPixelSha256"]) {
  const seen = new Map();
  for (const asset of assets) if (asset[field]) { if (seen.has(asset[field])) union(seen.get(asset[field]), asset.identity); else seen.set(asset[field], asset.identity); }
}
for (const item of occurrences) for (const variant of item.variants) union(initialIdentity(item.imagePath), initialIdentity(variant));
for (const asset of assets) asset.identity = find(asset.identity);
const hamming = (a, b) => { let x = BigInt(`0x${a}`) ^ BigInt(`0x${b}`), count = 0; while (x) { x &= x - 1n; count++; } return count; };
const visualCandidates = [];
for (let i = 0; i < assets.length; i++) for (let j = i + 1; j < assets.length; j++) {
  const a = assets[i], b = assets[j];
  if (!a.perceptualHash || !b.perceptualHash || a.identity === b.identity) continue;
  const distance = hamming(a.perceptualHash, b.perceptualHash);
  if (distance <= 6) visualCandidates.push({ first: a.imagePath, second: b.imagePath, distance, bothUsed: a.used && b.used, action: "Visual review needed; low pHash distance is evidence, not proof" });
}
for (const item of occurrences) {
  const asset = assetByPath.get(item.imagePath);
  item.identity = asset?.identity ?? find(initialIdentity(item.imagePath));
  for (const field of ["width", "height", "format", "sha256", "normalizedPixelSha256", "perceptualHash", "bytes"]) item[field] = asset?.[field] ?? null;
  item.assetExists = Boolean(asset) || /^https?:/.test(item.imagePath);
  item.provenance = asset?.provenance ?? null;
  item.visualReviewEvidence = asset?.visualReviewEvidence ?? null;
}
const grouped = new Map();
for (const item of occurrences) { if (!grouped.has(item.identity)) grouped.set(item.identity, []); grouped.get(item.identity).push(item); }
const groups = [...grouped].map(([identity, uses]) => {
  const important = uses.some((item) => item.important);
  const homeUses = uses.filter((item) => item.homepageLocked && item.important);
  return {
    identity, important, classification: important ? "Important content image" : uses[0].classification,
    actionClass: uses.length > 1 ? important ? "Must replace" : "Acceptable shared UI asset" : "Unique content image",
    occurrences: uses.length, pages: [...new Set(uses.map((item) => item.page))], imagePaths: [...new Set(uses.map((item) => item.imagePath))],
    duplicate: important && uses.length > 1, lockedHomepagePlacements: homeUses.length,
    replacementsRequiredOnEditablePages: important && uses.length > 1 ? uses.length - Math.max(1, homeUses.length) : 0,
    unresolvedLockedHomepageDuplicates: Math.max(0, homeUses.length - 1),
    reason: important ? uses.length > 1 ? "The same photograph occurs in multiple rendered placements; locales count as separate pages." : "One content placement in scanned pages." : "Repeated company identity in navigation/footer; brand assets are explicitly allowed to be shared.",
    uses: uses.map(({ page, section, imagePath, domIndex, homepageLocked, placementType }) => ({ page, section, imagePath, domIndex, homepageLocked, placementType })),
  };
}).sort((a, b) => b.occurrences - a.occurrences);
const missingReplacements = [];
const lockedConflicts = [];
for (const item of occurrences) {
  const group = groups.find((entry) => entry.identity === item.identity);
  const first = group.uses[0];
  const reservedFirstUse = group.lockedHomepagePlacements === 0 && first.page === item.page && first.domIndex === item.domIndex;
  item.placementId = `${item.page}#image-${item.domIndex}`;
  item.identityOccurrences = group.occurrences;
  item.duplicate = group.duplicate;
  item.needsReplacement = item.important && item.duplicate && !item.homepageLocked && !reservedFirstUse;
  item.action = !item.important ? "Retain permitted shared brand/UI asset"
    : !item.duplicate ? "Retain unique image"
    : item.homepageLocked ? "Locked homepage: preserve; inherited duplicate reported"
    : reservedFirstUse ? "Reserve this source here; replace its other duplicated placements"
    : "Missing distinct real replacement; inherited duplicate retained pending suitable photograph";
  if (item.needsReplacement) missingReplacements.push({ placementId: item.placementId, page: item.page, section: item.section, role: item.role, imagePath: item.imagePath, identity: item.identity, action: item.action, requiredSubject: item.alt, status: "Suitable distinct real photograph remains to be sourced and reviewed" });
  if (item.important && item.duplicate && item.homepageLocked) lockedConflicts.push({ placementId: item.placementId, page: item.page, section: item.section, imagePath: item.imagePath, identity: item.identity, action: item.action });
}

const content = occurrences.filter((item) => item.important);
const duplicates = groups.filter((group) => group.duplicate);
const summary = {
  scannedAt: new Date().toISOString(), build, label, renderedRoutes: pages.length, contentImagePlacements: content.length,
  uniqueContentImageIdentities: groups.filter((group) => group.important).length,
  duplicateContentIdentityGroups: duplicates.length,
  excessDuplicateContentPlacements: duplicates.reduce((sum, group) => sum + group.occurrences - 1, 0),
  editablePlacementsRequiringReplacement: duplicates.reduce((sum, group) => sum + group.replacementsRequiredOnEditablePages, 0),
  lockedHomepageExcessPlacements: duplicates.reduce((sum, group) => sum + group.unresolvedLockedHomepageDuplicates, 0),
  sharedAssetPlacements: occurrences.length - content.length, sharedAssetIdentities: groups.filter((group) => !group.important).length,
  physicalImageFilesScanned: assets.length, technicalReferences: technicalReferences.length,
  missingRenderedLocalAssets: content.filter((item) => !item.assetExists).length,
  missingDistinctReplacements: missingReplacements.length,
  renderedNewPhotoPlacements: content.filter((item) => item.imagePath.startsWith("/images/unique/")).length,
  uniqueNewPhotoIdentities: new Set(content.filter((item) => item.imagePath.startsWith("/images/unique/")).map((item) => item.identity)).size,
  reviewedNewFilesMatchingProvenance: assets.filter((item) => item.visualReviewEvidence?.currentFileMatchesReviewedBytes).length,
  newFilesMissingOrMismatchedReviewProof: assets.filter((item) => item.imagePath.startsWith("/images/unique/") && !item.visualReviewEvidence?.currentFileMatchesReviewedBytes).length,
  strictWebsiteUniquenessSatisfied: duplicates.length === 0,
  perceptualCandidatePairs: visualCandidates.length, usedPerceptualCandidatePairs: visualCandidates.filter((item) => item.bothUsed).length,
};

const baselinePath = path.join(output, "image-inventory-baseline.json");
let baseline;
const replacementActions = [];
if (label !== "baseline") try { baseline = JSON.parse(await readFile(baselinePath, "utf8")); } catch { /* optional comparison */ }
if (baseline) {
  const currentByPlacement = new Map(occurrences.map((item) => [`${item.page}:${item.domIndex}`, item]));
  const baselineByPlacement = new Map(baseline.occurrences.map((item) => [`${item.page}:${item.domIndex}`, item]));
  for (const before of baseline.occurrences.filter((item) => item.important)) {
    const after = currentByPlacement.get(`${before.page}:${before.domIndex}`);
    if (!after || before.identity === after.identity) continue;
    replacementActions.push({ placementId: after.placementId, page: after.page, section: after.section, beforeImage: before.imagePath, afterImage: after.imagePath, beforeIdentity: before.identity, afterIdentity: after.identity, wasDuplicate: before.duplicate, nowUnique: !after.duplicate, provenance: after.provenance });
  }
  summary.changedContentPlacements = replacementActions.length;
  summary.duplicatesReplacedWithUniqueImages = replacementActions.filter((item) => item.wasDuplicate && item.nowUnique).length;
  summary.removedOrUnscannedContentPlacements = baseline.occurrences.filter((item) => item.important && !currentByPlacement.has(`${item.page}:${item.domIndex}`)).length;
  summary.addedOrPreviouslyUnscannedContentPlacements = content.filter((item) => !baselineByPlacement.has(`${item.page}:${item.domIndex}`)).length;
  summary.duplicateExcessReduction = baseline.summary.excessDuplicateContentPlacements - summary.excessDuplicateContentPlacements;
}
const limitations = [
  "Rendered HTML covers all static public route files in the named build; use --base-url and --routes to add runtime-only routes.",
  "A srcset/picture responsive family is one content placement. Social metadata, favicons and preloads are technical references, not extra page sections.",
  "English and Arabic routes are separate pages under the user's strict rule. Homepage / and /ar are preserved and their inherited conflicts are reported.",
  "Byte and normalized-pixel hashes plus documented photographer IDs and known variant families detect duplicates. Perceptual candidates require visual review; arbitrary crops/filters cannot be proven unique automatically.",
  "Home slideshow serializes all slides in initial HTML; ProjectsPortfolio defaults to All and serializes all gallery cards. Blog filters can move the same asset into another list placement; inspect source/browser states as part of final validation.",
];
await mkdir(output, { recursive: true });
await writeFile(path.join(output, `image-inventory-${label}.json`), `${JSON.stringify({ summary, limitations, pages, occurrences, assets, technicalReferences, visualCandidates, manuallyReviewedIdentityGroups, reviewedPhotoEvidence, independentVisualScreening, replacementActions }, null, 2)}\n`);
await writeFile(path.join(output, `image-duplicates-${label}.json`), `${JSON.stringify({ summary, groups }, null, 2)}\n`);
await writeFile(path.join(output, `missing-image-replacements-${label}.json`), `${JSON.stringify({ summary, explanation: "All existing image placements are retained. Entries identify still-missing distinct real replacements, not broken image URLs. One original placement per repeated source is provisionally reserved, favoring locked homepages; this avoids demanding replacements for every copy. Homepage conflicts cannot be resolved without separate authorization to change the homepage.", missingReplacements, lockedConflicts }, null, 2)}\n`);
const csvColumns = ["imagePath", "page", "section", "role", "filename", "width", "height", "format", "sha256", "identity", "identityOccurrences", "duplicate", "classification", "action"];
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
await writeFile(path.join(output, `image-inventory-${label}.csv`), `${csvColumns.join(",")}\n${occurrences.map((item) => csvColumns.map((column) => cell(item[column])).join(",")).join("\n")}\n`);
const missingColumns = ["placementId", "imagePath", "page", "section", "role", "identity", "requiredSubject", "status", "action"];
await writeFile(path.join(output, `missing-image-replacements-${label}.csv`), `${missingColumns.join(",")}\n${missingReplacements.map((item) => missingColumns.map((column) => cell(item[column])).join(",")).join("\n")}\n`);
const md = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const report = [
  `# Website image uniqueness audit — ${label}`, "", `Build: \`${build}\`. Rendered routes: **${summary.renderedRoutes}**.`, "",
  `Content placements: **${summary.contentImagePlacements}**; unique content identities: **${summary.uniqueContentImageIdentities}**; duplicated identity groups: **${summary.duplicateContentIdentityGroups}**; excess repeated placements: **${summary.excessDuplicateContentPlacements}**.`, "",
  `Editable placements requiring replacement: **${summary.editablePlacementsRequiringReplacement}**. Inherited excess homepage placements: **${summary.lockedHomepageExcessPlacements}**. Permitted shared brand/UI placements: **${summary.sharedAssetPlacements}** across **${summary.sharedAssetIdentities}** identities.`, "",
  ...(baseline ? [`Replaced content placements: **${summary.changedContentPlacements}**. Previously duplicated placements now using unique images: **${summary.duplicatesReplacedWithUniqueImages}**. Removed/unscanned placements: **${summary.removedOrUnscannedContentPlacements}**. Added/previously unscanned placements: **${summary.addedOrPreviouslyUnscannedContentPlacements}**.`, ""] : []),
  `New real-photo placements: **${summary.renderedNewPhotoPlacements}**, with **${summary.uniqueNewPhotoIdentities}** source identities. Reviewed new files whose SHA-256 matches the provenance record: **${summary.reviewedNewFilesMatchingProvenance}**. Missing or mismatched new-file review proof: **${summary.newFilesMissingOrMismatchedReviewProof}**.`, "",
  "**Strict website-wide uniqueness remains incomplete while any inherited content duplicates remain.** The missing-image JSON/CSV lists every outstanding editable replacement with its exact page and section. Existing duplicates are disclosed as unresolved; they are not classified as permitted shared content.", "",
  "New real-photo provenance is in `data/uniquePhotoAssets.json` and `reviewed-new-photo-provenance.json`; `new-photo-perceptual-check.json` records the independently reviewed DCT screening. Every currently rendered new file is fingerprinted again by this audit.", "",
  ...limitations.map((item) => `- ${item}`), "", "## Duplicate classification", "", "| Identity | Occurrences | Classification | Action |", "| --- | ---: | --- | --- |",
  ...groups.filter((group) => group.occurrences > 1).map((group) => `| ${md(group.identity)} | ${group.occurrences} | ${group.classification} | ${group.actionClass}; ${md(group.reason)} |`),
  "", "## Every content placement", "", "| Image | Used on | Section | Duplicate? | Action |", "| --- | --- | --- | --- | --- |",
  ...content.map((item) => `| ${md(item.imagePath)} | ${md(item.page)} | ${md(item.section)} | ${item.duplicate ? "Yes" : "No"} | ${item.action} |`), "",
];
await writeFile(path.join(output, `image-audit-${label}.md`), report.join("\n"));
console.log(JSON.stringify(summary, null, 2));
if (args.includes("--strict") && summary.excessDuplicateContentPlacements > 0) process.exitCode = 1;
