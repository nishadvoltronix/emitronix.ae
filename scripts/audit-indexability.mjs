#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
}
const baseUrl = new URL(option("base-url", "http://127.0.0.1:3000"));
const distDir = option("dist-dir", ".next");
const output = option("output", "reports/seo-2026-10-01/indexability-audit.json");
const comparePath = option("compare", "");
const expectInternalDesign = args.includes("--expect-internal-design");
const publicOrigin = "https://emitronix.ae";
const concurrency = 4;
const utilityPaths = new Set(["/search", "/guest-post", "/ar/guest-post", "/admin/cookie-consent", "/ar/emitronix-route-not-found"]);

function decode(value) {
  return value.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|quot|apos|lt|gt|nbsp);/g, (_, name) => ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " })[name]);
}
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, key, double, single]) => [key.toLowerCase(), decode(double ?? single)]));
}
function text(html) {
  return decode(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}
const hash = (value) => createHash("sha256").update(value).digest("hex");
const publicUrl = (value) => new URL(value, publicOrigin).href;
function localPath(value) {
  const url = new URL(value, publicOrigin);
  return `${url.pathname}${url.search}`;
}
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(full) : [full]));
  }
  return files;
}
async function mapLimit(items, task) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index]);
    }
  }));
  return results;
}
async function request(requestPath) {
  const response = await fetch(new URL(requestPath, baseUrl), {
    redirect: "manual", signal: AbortSignal.timeout(25000),
    headers: { "User-Agent": "Emitronix-Technical-Audit/1.0", Accept: "text/html,application/xml,text/plain" },
  });
  return { response, body: await response.text() };
}

function parseRobots(source) {
  const groups = [];
  let group;
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === "user-agent") {
      if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group); }
      group.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && group && value) {
      group.rules.push({ allow: key === "allow", pattern: value });
    }
  }
  const specific = groups.filter((item) => item.agents.includes("googlebot"));
  return (specific.length ? specific : groups.filter((item) => item.agents.includes("*"))).flatMap((item) => item.rules);
}
function allowedByRobots(requestPath, rules) {
  const matches = rules.filter(({ pattern }) => {
    const expression = pattern.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${expression}`).test(requestPath);
  }).sort((a, b) => b.pattern.replace(/[*$]/g, "").length - a.pattern.replace(/[*$]/g, "").length || Number(b.allow) - Number(a.allow));
  return matches[0]?.allow ?? true;
}

const appFiles = await walk("app");
const sourceFiles = appFiles.filter((file) => /[\\/]page\.tsx$/.test(file));
const endpointDefinitions = await Promise.all(appFiles.filter((file) => /[\\/]route\.ts$/.test(file)).map(async (file) => ({
  file: file.replaceAll("\\", "/"),
  route: "/" + file.replaceAll("\\", "/").replace(/^app\//, "").replace(/\/route\.ts$/, ""),
  methods: [...(await readFile(file, "utf8")).matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)].map(([, method]) => method),
  classification: "B — non-HTML application or machine-readable endpoint; not a canonical website page",
  scopeNote: "No write methods invoked. Metadata routes robots/sitemap are checked separately; public machine-readable resources can remain crawlable.",
})));
const routeDefinitions = sourceFiles.map((file) => ({
  file: file.replaceAll("\\", "/"),
  route: "/" + file.replaceAll("\\", "/").replace(/^app\//, "").replace(/\/page\.tsx$/, "")
    .split("/").filter((part) => !part.startsWith("(")).join("/"),
}));
const prerender = JSON.parse(await readFile(path.join(distDir, "prerender-manifest.json"), "utf8"));
const routesManifest = JSON.parse(await readFile(path.join(distDir, "routes-manifest.json"), "utf8"));
const evidence = JSON.parse(await readFile("reports/gsc-2026-09-07/indexing-evidence.json", "utf8"));
const historicalEvidence = new Map(evidence.groups.flatMap((group) => group.entries.map((entry) => [
  typeof entry === "string" ? entry : entry.path, { reason: group.reason, ...group.defaults, ...(typeof entry === "object" ? entry : {}) },
])));
const sitemap = await request("/sitemap.xml");
if (sitemap.response.status !== 200) throw new Error(`Sitemap returned ${sitemap.response.status}`);
const sitemapUrls = [...sitemap.body.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(([, url]) => decode(url.trim()));
const sitemapPaths = new Set(sitemapUrls.map(localPath));
const robots = await request("/robots.txt");
if (robots.response.status !== 200) throw new Error(`robots.txt returned ${robots.response.status}`);
const rules = parseRobots(robots.body);
const staticPaths = routeDefinitions.filter(({ route }) => !route.includes("[")).map(({ route }) => route);
const generatedPaths = Object.keys(prerender.routes).filter((route) => !route.startsWith("/_") && !/\.(txt|xml|webmanifest)$/.test(route));
const redirects = routesManifest.redirects.filter((entry) => !entry.source.includes(":") && !entry.source.includes("(") && !entry.has?.length);
const redirectPaths = new Set(redirects.map(({ source }) => source));
const variationPaths = ["/about/", "/ar/about/", "/about?utm_source=audit", "/contact?intent=site-visit", "/warehouse/not-found", "/blog/not-found", "/services/not-found", "/ar/unknown"];
const inventoryPaths = [...new Set([...sitemapPaths, ...staticPaths, ...generatedPaths, ...redirectPaths, ...historicalEvidence.keys(), ...variationPaths])].sort();

async function auditPage(requestPath) {
  const url = publicUrl(requestPath);
  const expectedIndexable = !utilityPaths.has(requestPath) && !redirectPaths.has(requestPath) && !requestPath.includes("?") && !requestPath.endsWith("/not-found") && requestPath !== "/ar/unknown" && (sitemapPaths.has(requestPath) || staticPaths.includes(requestPath) || generatedPaths.includes(requestPath));
  const base = { path: requestPath, url, expectedIndexable, sitemapIncluded: sitemapPaths.has(requestPath), robotsAllowed: allowedByRobots(requestPath, rules), historicalGscReason: historicalEvidence.get(requestPath)?.reason || "", googleIndexingStatus: "UNVERIFIED — current Google Search Console URL Inspection required" };
  try {
    const { response, body } = await request(requestPath);
    const metas = [...body.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attrs(tag));
    const linkTags = [...body.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attrs(tag));
    const canonicals = linkTags.filter((tag) => tag.rel === "canonical").map((tag) => tag.href);
    const robotsDirectives = [...metas.filter((tag) => ["robots", "googlebot"].includes(tag.name)).map((tag) => tag.content), response.headers.get("x-robots-tag")].filter(Boolean).join(" | ");
    const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
    const mainText = text(main);
    const headings = [...main.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(([, level, html]) => ({ level: Number(level), text: text(html) }));
    const anchorTags = [...body.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => attrs(tag));
    function extractLinks(anchors) { return [...new Set(anchors.map((tag) => tag.href).filter(Boolean).flatMap((href) => {
      try { const target = new URL(href, url); return target.origin === publicOrigin && !/\.(?:webp|png|jpe?g|svg|pdf|mp4|webm|ico)$/i.test(target.pathname) ? [localPath(target.href)] : []; } catch { return []; }
    }))].sort(); }
    const links = extractLinks(anchorTags);
    const crawlableLinks = extractLinks(anchorTags.filter((tag) => !/\bnofollow\b/i.test(tag.rel || "")));
    const title = text(body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const descriptions = metas.filter((tag) => tag.name === "description").map((tag) => tag.content);
    const jsonLd = [...body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(([, attributes]) => attrs(attributes).type === "application/ld+json");
    const structuredDataErrors = jsonLd.flatMap(([, , json], index) => { try { JSON.parse(json); return []; } catch { return [`JSON-LD block ${index + 1} is invalid JSON`]; } });
    const issues = [];
    const warnings = [];
    if (expectedIndexable) {
      if (response.status !== 200) issues.push(`Important page returns HTTP ${response.status}`);
      if (!base.sitemapIncluded) issues.push("Important page omitted from sitemap");
      if (!base.robotsAllowed) issues.push("Googlebot blocked by robots.txt");
      if (/\b(noindex|none)\b/i.test(robotsDirectives)) issues.push("Important page has noindex");
      if (/\b(nofollow|none)\b/i.test(robotsDirectives)) issues.push("Important page has nofollow");
      let selfCanonical = false;
      try { selfCanonical = canonicals.length === 1 && new URL(canonicals[0]).href === url; } catch { /* Invalid/missing canonical is reported below. */ }
      if (!selfCanonical) issues.push(`Expected one self canonical; found ${canonicals.join(", ") || "none"}`);
      if (!title || descriptions.length !== 1) issues.push("Missing title or missing/multiple meta description");
      if (!mainText || !headings.some(({ level }) => level === 1)) issues.push("Missing meaningful server-rendered main content or H1");
      if (headings.filter(({ level }) => level === 1).length !== 1) warnings.push("Review H1 count");
      if (mainText.split(/\s+/).length < 100) warnings.push("Short main content: review usefulness for this page's purpose; no automatic noindex");
      warnings.push(...structuredDataErrors);
    } else {
      const configuredRedirect = redirects.find((entry) => entry.source === requestPath);
      if (configuredRedirect) {
        if (![301, 308].includes(response.status) || !response.headers.get("location") || publicUrl(response.headers.get("location")) !== publicUrl(configuredRedirect.destination)) issues.push("Configured canonical redirect has incorrect status or destination");
      } else if (requestPath.endsWith("/") && requestPath !== "/" && sitemapPaths.has(requestPath.replace(/\/+$/, ""))) {
        if (![301, 308].includes(response.status) || publicUrl(response.headers.get("location") || "") !== publicUrl(requestPath.replace(/\/+$/, ""))) issues.push("Trailing-slash variation does not permanently redirect to canonical");
      } else if (["/warehouse/not-found", "/blog/not-found", "/services/not-found", "/ar/unknown", "/ar/emitronix-route-not-found"].includes(requestPath)) {
        if (response.status !== 404 || !/\bnoindex\b/i.test(robotsDirectives)) issues.push("Invalid route must return genuine 404 with noindex");
      } else if (utilityPaths.has(requestPath)) {
        if (response.status !== 200 || !/\bnoindex\b/i.test(robotsDirectives)) issues.push("Intentional utility page should return 200 with noindex");
      } else if (requestPath.includes("?") && sitemapPaths.has(requestPath.split("?")[0])) {
        if (response.status !== 200 || canonicals.length !== 1 || publicUrl(canonicals[0]) !== publicUrl(requestPath.split("?")[0])) issues.push("Query variation should preserve page behavior with a clean canonical");
      }
    }
    return { ...base, status: response.status, redirect: response.headers.get("location"), canonical: canonicals[0] || "", canonicalCount: canonicals.length, robotsDirectives, title, description: descriptions[0] || "", headings, mainTextWords: mainText ? mainText.split(/\s+/).length : 0, mainTextHash: hash(mainText), mainText, internalDesignApplied: /data-page-design="internal"/.test(main), internalLinks: links, crawlableLinks, jsonLdBlocks: jsonLd.length, jsonLdHash: hash(jsonLd.map(([, , json]) => json).join("\n")), structuredDataErrors, technicalIssues: issues, warnings };
  } catch (error) {
    return { ...base, status: 0, technicalIssues: [`Request failed: ${error.message}`], warnings: [], internalLinks: [] };
  }
}

const records = await mapLimit(inventoryPaths, auditPage);
const discoveredTargets = [...new Set(records.flatMap((record) => record.internalLinks))].filter((target) => !inventoryPaths.includes(target));
records.push(...await mapLimit(discoveredTargets, auditPage));
const canonicalRecords = records.filter((record) => record.expectedIndexable);
const inbound = new Map();
for (const record of canonicalRecords) for (const target of record.crawlableLinks || []) {
  const normalized = target.split("?")[0];
  if (normalized === record.path) continue;
  if (!inbound.has(normalized)) inbound.set(normalized, new Set());
  inbound.get(normalized).add(record.path);
}
const duplicateGroups = new Map();
for (const record of canonicalRecords.filter((record) => record.mainTextHash)) {
  const group = duplicateGroups.get(record.mainTextHash) || [];
  group.push(record.path); duplicateGroups.set(record.mainTextHash, group);
}
// Similar wording is a review signal, not proof of Google's duplicate selection.
const topicalRecords = canonicalRecords.filter((record) => /^\/(blog|warehouse)\//.test(record.path) && record.mainText);
const shingles = new Map(topicalRecords.map((record) => {
  const words = record.mainText.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  return [record.path, new Set(words.slice(0, -4).map((_, index) => words.slice(index, index + 5).join(" ")))];
}));
const similarPairs = [];
for (let index = 0; index < topicalRecords.length; index++) {
  for (let other = index + 1; other < topicalRecords.length; other++) {
    const left = topicalRecords[index], right = topicalRecords[other];
    const a = shingles.get(left.path), b = shingles.get(right.path);
    let shared = 0;
    for (const shingle of a) if (b.has(shingle)) shared++;
    const similarity = 2 * shared / (a.size + b.size || 1);
    if (similarity >= 0.65) similarPairs.push({ pages: [left.path, right.path], similarity: Number(similarity.toFixed(3)) });
  }
}
similarPairs.sort((a, b) => b.similarity - a.similarity);
for (const record of records) {
  record.internalSourcePages = [...(inbound.get(record.path) || [])];
  if (record.expectedIndexable && !record.internalSourcePages.length) record.technicalIssues.push("Orphan: no inbound links from any canonical page in the route inventory");
  record.classification = record.expectedIndexable ? [record.technicalIssues.length ? "C" : "A", "D"] : [record.technicalIssues.length ? "C" : "B"];
  record.classificationReason = record.expectedIndexable
    ? record.technicalIssues.length ? "Important page with observed technical issue; current Google status also requires verification" : "Important canonical page passes observed technical checks; current Google status requires verification"
    : record.technicalIssues.length ? "Unexpected behavior on an intentionally excluded URL; correction required" : "Not intended as a separate canonical HTML page: utility, redirect, URL variation, non-HTML resource, or invalid route; public resources can remain crawlable";
  if (record.mainTextHash && duplicateGroups.get(record.mainTextHash)?.length > 1) record.warnings.push(`Exact duplicate main text: ${duplicateGroups.get(record.mainTextHash).join(", ")}`);
}
const byPath = new Map(records.map((record) => [record.path, record]));
const brokenLinks = [...new Set(canonicalRecords.flatMap((record) => record.internalLinks))].filter((target) => byPath.has(target) && byPath.get(target).status >= 400);
const previous = comparePath ? JSON.parse(await readFile(comparePath, "utf8")) : null;
const robotSignals = (value) => [...new Set((value || "").toLowerCase().split(/[|,]/).map((item) => item.trim()).filter(Boolean))].sort().join(", ");
const missingInternalDesign = expectInternalDesign ? canonicalRecords.filter((record) => !["/", "/ar"].includes(record.path) && !record.internalDesignApplied).map((record) => record.path) : [];
const comparisons = previous ? records.flatMap((record) => {
  const before = previous.pages.find((item) => item.path === record.path);
  if (!before) return [{ path: record.path, change: "New inventory entry" }];
  const changes = ["status", "canonical", "robotsDirectives", "title", "description", "mainTextHash", "jsonLdHash", "sitemapIncluded"]
    .filter((key) => key === "robotsDirectives" ? robotSignals(before[key]) !== robotSignals(record[key]) : before[key] !== record[key]);
  const removedLinks = (before.internalLinks || []).filter((link) => !record.internalLinks.includes(link));
  const headingChanges = JSON.stringify(before.headings) !== JSON.stringify(record.headings);
  return changes.length || removedLinks.length || headingChanges ? [{ path: record.path, changedFields: changes, removedLinks, headingChanges }] : [];
}) : [];
if (previous) for (const before of previous.pages) {
  if (!byPath.has(before.path)) comparisons.push({ path: before.path, change: "Removed inventory entry", previouslyIndexable: before.expectedIndexable });
}
const report = {
  observedAt: new Date().toISOString(), baseUrl: baseUrl.origin, distDir, publicOrigin,
  scope: "Source page routes + all build-generated routes + sitemap + configured redirects + historical GSC examples + representative URL variations. HTTP GET without executing JavaScript.",
  classificationKey: { A: "IMPORTANT PAGE — SHOULD BE INDEXABLE", B: "INTENTIONALLY NON-INDEXABLE (includes canonicalized URL variants and redirects)", C: "INDEXING ISSUE FOUND — FIX REQUIRED", D: "NEEDS GOOGLE SEARCH CONSOLE VERIFICATION" },
  googleStatus: "No current GSC access/URL Inspection result was used. Technical eligibility is not proof of Google indexing.",
  historicalEvidence: { file: "reports/gsc-2026-09-07/indexing-evidence.json", capturedAt: evidence.capturedAt },
  routeDefinitions, dynamicRouteFamilies: routeDefinitions.filter(({ route }) => route.includes("[")), endpointDefinitions,
  robots: { status: robots.response.status, body: robots.body },
  sitemap: { status: sitemap.response.status, count: sitemapUrls.length, duplicateUrls: sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index) },
  summary: { inventoryUrls: records.length, intendedIndexable: canonicalRecords.length, categories: Object.fromEntries(["A", "B", "C", "D"].map((category) => [category, records.filter((record) => record.classification.includes(category)).length])), exactDuplicateMainTextGroups: [...duplicateGroups.values()].filter((group) => group.length > 1), brokenInternalLinks: brokenLinks },
  preservationComparison: { baseline: comparePath || null, changes: comparisons, robotsComparison: "Effective directive sets; repeated identical directives are deduplicated for comparison", rawRobotsDifferences: previous ? records.flatMap((record) => { const before = previous.pages.find((item) => item.path === record.path); return before && before.robotsDirectives !== record.robotsDirectives ? [{ path: record.path, before: before.robotsDirectives, after: record.robotsDirectives, effectiveSignalsChanged: robotSignals(before.robotsDirectives) !== robotSignals(record.robotsDirectives) }] : []; }) : [] },
  designCoverage: { expectedInternalPages: canonicalRecords.filter((record) => !["/", "/ar"].includes(record.path)).length, redesignedIndexablePages: canonicalRecords.filter((record) => record.internalDesignApplied).length, missingInternalDesign, homepageReceivedInternalDesign: canonicalRecords.filter((record) => ["/", "/ar"].includes(record.path) && record.internalDesignApplied).map((record) => record.path) },
  contentReview: { method: "Five-word shingle Dice similarity of server-rendered main text, including shared CTA and related-content sections. Counts refer to page PAIRS, not page counts. Same topic/templates can legitimately share wording. A score is not a Google indexing diagnosis. Preserve current URLs and indexability pending editorial review and GSC evidence.", reviewThreshold: 0.65, nearDuplicatePairs: similarPairs },
  pages: records.map(({ mainText, ...record }) => record),
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const columns = ["path", "classification", "expectedIndexable", "status", "sitemapIncluded", "robotsAllowed", "robotsDirectives", "canonical", "mainTextWords", "internalSourcePages", "technicalIssues", "warnings", "historicalGscReason", "googleIndexingStatus"];
await writeFile(output.replace(/\.json$/, ".csv"), [columns.map(csvCell).join(","), ...report.pages.map((record) => columns.map((key) => csvCell(Array.isArray(record[key]) ? key === "internalSourcePages" ? record[key].length : record[key].join("; ") : record[key])).join(","))].join("\n") + "\n");
console.log(JSON.stringify({ output, ...report.summary, preservationChanges: comparisons.length }, null, 2));
if (report.summary.categories.C || brokenLinks.length || report.sitemap.duplicateUrls.length || missingInternalDesign.length || report.designCoverage.homepageReceivedInternalDesign.length || comparisons.some((item) => item.change === "Removed inventory entry" && item.previouslyIndexable)) process.exitCode = 1;
