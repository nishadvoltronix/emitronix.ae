#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : fallback;
const baselinePath = option("baseline", "reports/seo-2026-10-01/final.json");
const auditPath = option("audit", "reports/seo-2026-10-01/non-indexed-review/final.json");
const output = option("output", "reports/seo-2026-10-01/non-indexed-review/review.json");
const sourceRef = execFileSync("git", ["rev-parse", option("source-baseline-ref", "HEAD")], { encoding: "utf8" }).trim();
const allowMalformedMetadataRepairs = args.includes("--allow-malformed-metadata-repairs");
const root = process.cwd();
const require = createRequire(import.meta.url);
const ts = require("typescript");
const hash = (value) => createHash("sha256").update(value).digest("hex");

// Load repository-owned data in an isolated module cache. This is an audit-only
// transpilation; it changes neither the application nor the installed packages.
function loadData(ref) {
  const cache = new Map();
  function load(file) {
    const relative = file.replaceAll("\\", "/");
    if (!relative.startsWith("data/") || !relative.endsWith(".ts") || relative.includes("..")) throw new Error(`Unexpected data module: ${file}`);
    if (cache.has(relative)) return cache.get(relative).exports;
    const source = ref
      ? execFileSync("git", ["show", `${ref}:${relative}`], { encoding: "utf8", maxBuffer: 10_000_000 })
      : readFileSync(path.join(root, relative), "utf8");
    const module = { exports: {} };
    cache.set(relative, module);
    const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
    const localRequire = (name) => name.startsWith("@/data/") ? load(`${name.slice(2)}.ts`) : require(name);
    new Function("require", "module", "exports", result.outputText)(localRequire, module, module.exports);
    return module.exports;
  }
  return load("data/warehouseSeo.ts");
}

const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const before = loadData(sourceRef);
const current = loadData();
const currentByPath = new Map(audit.pages.map((page) => [page.path, page]));
const historical = baseline.pages.filter((page) => /^(Discovered|Crawled)\s*[-—–]\s*currently not indexed$/i.test(page.historicalGscReason));

function authoredRecords(data, enhanced) {
  const blog = data.warehouseBlogPosts.map((post) => ({
    path: `/blog/${post.slug}`, kind: "article", title: post.title,
    blocks: [...post.intro, ...post.sections.flatMap((section) => [...section.paragraphs, ...(section.bullets ?? [])]), ...post.faqs.map((faq) => faq.answer)],
    sectionIds: post.sections.map((section) => section.id),
    primaryIntent: post.sections.at(-2)?.title,
    links: post.internalLinks.map((link) => link.href),
    modifiedDate: post.modifiedDate,
  }));
  const enhancements = enhanced ? loadEnhancements() : {};
  const warehouse = data.warehouseAuthorityPages.map((page) => {
    const extra = enhancements[page.slug];
    return {
      path: page.href, kind: "resource", title: page.h1,
      blocks: [
        ...page.intro, ...page.summaryFacts, ...page.benefits, ...page.processSteps,
        ...page.requiredDocuments, ...page.qualityControls, ...page.authorityNotes,
        page.engineeringOpinion, page.failureMode, ...page.fieldChecks.map((item) => item.description),
        ...page.faqs.map((item) => item.answer),
        ...(extra ? [extra.purpose, ...extra.sections.flatMap((section) => section.paragraphs)] : []),
      ],
      sectionIds: extra?.sections.map((section) => section.title) ?? [],
      primaryIntent: extra?.purpose,
      links: [...page.related.map((link) => link.href), ...(extra?.contextualLinks.map((link) => link.href) ?? [])],
      modifiedDate: page.modifiedDate,
    };
  });
  return [...blog, ...warehouse];
}
function loadEnhancements() {
  const source = readFileSync("data/warehouseIndexingContent.ts", "utf8");
  const module = { exports: {} };
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  new Function("require", "module", "exports", result.outputText)(require, module, module.exports);
  return module.exports.warehouseIndexingContentBySlug;
}
const oldRecords = authoredRecords(before, false);
const newRecords = authoredRecords(current, true);

function quality(records) {
  const owners = new Map();
  const shingles = new Map();
  for (const record of records) {
    for (const block of new Set(record.blocks)) {
      const key = `${record.kind}:${block}`;
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key).add(record.path);
    }
    const words = record.blocks.join(" ").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
    shingles.set(record.path, new Set(words.slice(0, -4).map((_, index) => words.slice(index, index + 5).join(" "))));
  }
  return new Map(records.map((record) => {
    const own = shingles.get(record.path);
    const nearest = records.filter((peer) => peer.path !== record.path && peer.kind === record.kind).map((peer) => {
      const other = shingles.get(peer.path);
      let shared = 0;
      for (const value of own) if (other.has(value)) shared++;
      return { path: peer.path, jaccard: Number((shared / (own.size + other.size - shared || 1)).toFixed(4)) };
    }).sort((a, b) => b.jaccard - a.jaccard).slice(0, 3);
    return [record.path, {
      authoredWords: record.blocks.join(" ").split(/\s+/).length,
      blocks: record.blocks.length,
      uniqueBlocks: record.blocks.filter((block) => owners.get(`${record.kind}:${block}`).size === 1).length,
      sharedBlocks: record.blocks.filter((block) => owners.get(`${record.kind}:${block}`).size > 1).length,
      nearest,
    }];
  }));
}
const beforeQuality = quality(oldRecords), afterQuality = quality(newRecords);
const beforeSource = new Map(oldRecords.map((record) => [record.path, record]));
const afterSource = new Map(newRecords.map((record) => [record.path, record]));
const issues = [];
const checks = historical.map((baselinePage) => {
  const page = currentByPath.get(baselinePage.path);
  if (!page) { issues.push(`Missing audit URL: ${baselinePage.path}`); return { path: baselinePage.path, error: "Missing current audit" }; }
  const old = beforeSource.get(page.path), updated = afterSource.get(page.path);
  const html = baselinePage.expectedIndexable;
  const removedBlocks = old && updated ? old.blocks.filter((block) => !updated.blocks.includes(block)).map(hash) : [];
  const removedLinks = (baselinePage.internalLinks ?? []).filter((href) => !(page.internalLinks ?? []).includes(href));
  const oldH1 = baselinePage.headings?.filter((heading) => heading.level === 1) ?? [];
  const newH1 = page.headings?.filter((heading) => heading.level === 1) ?? [];
  const h1Preserved = JSON.stringify(oldH1) === JSON.stringify(newH1);
  let headingCursor = 0;
  const originalHeadingsPreserved = (baselinePage.headings ?? []).every((heading) => {
    const index = (page.headings ?? []).findIndex((candidate, candidateIndex) => candidateIndex >= headingCursor && candidate.level === heading.level && candidate.text === heading.text);
    if (index < 0) return false;
    headingCursor = index + 1;
    return true;
  });
  const preserved = ["status", "canonical", "sitemapIncluded", "robotsAllowed", "robotsDirectives"].every((key) => page[key] === baselinePage[key]);
  if (html && (!old || !updated || removedBlocks.length || removedLinks.length || !h1Preserved || !originalHeadingsPreserved || !preserved || page.technicalIssues.length || page.structuredDataErrors.length)) issues.push(`Affected page failed preservation/technical check: ${page.path}`);
  const addedSourcePages = (page.internalSourcePages ?? []).filter((source) => !baselinePage.internalSourcePages.includes(source));
  return {
    path: page.path,
    classification: html ? ["A", "D"] : ["B"],
    historicalGscReason: baselinePage.historicalGscReason,
    currentGoogleIndexingStatus: "UNVERIFIED — historical audit data is not current Google URL Inspection evidence",
    intendedSearchLandingPage: html,
    sourceRoute: html ? page.path.startsWith("/blog/") ? "app/(en)/blog/[slug]/page.tsx" : "app/(en)/warehouse/[slug]/page.tsx" : "Next.js static font or application web manifest",
    routeGenerated: html ? Boolean(updated) : null,
    status: page.status, sitemapIncluded: page.sitemapIncluded, robotsAllowed: page.robotsAllowed,
    robotsDirectives: page.robotsDirectives, canonical: page.canonical,
    meaningfulServerRenderedContent: html ? page.mainTextWords > 0 && newH1.length === 1 : null,
    h1Preserved, originalHeadingsPreserved, originalContentBlocksPreserved: html ? removedBlocks.length === 0 : null,
    removedOriginalBlocks: removedBlocks, removedExistingLinks: removedLinks,
    titleBefore: baselinePage.title, titleAfter: page.title,
    descriptionBefore: baselinePage.description, descriptionAfter: page.description,
    metadataRepair: baselinePage.title !== page.title || baselinePage.description !== page.description,
    structuredDataBlocks: page.jsonLdBlocks, structuredDataErrors: page.structuredDataErrors,
    mainTextWordsBefore: baselinePage.mainTextWords, mainTextWordsAfter: page.mainTextWords,
    authoredContentBefore: beforeQuality.get(page.path) ?? null,
    authoredContentAfter: afterQuality.get(page.path) ?? null,
    specificSectionsAdded: updated && old ? updated.sectionIds.filter((id) => !old.sectionIds.includes(id)) : [],
    addedContentBlocks: updated && old ? updated.blocks.filter((block) => !old.blocks.includes(block)) : [],
    primaryIntent: updated?.primaryIntent ?? "Application resource; not a canonical search result page",
    internalSourcePagesBefore: baselinePage.internalSourcePages,
    internalSourcePagesAfter: page.internalSourcePages,
    addedSourcePages, effectivelyOrphaned: html ? !page.internalSourcePages.length : false,
    technicalIssues: page.technicalIssues,
    remainingAction: html ? "Inspect the current URL and Google-selected canonical in GSC after an approved deployment. Review actual performance before any consolidation." : "Retain as a crawlable application resource; do not create a replacement page or add it to the landing-page sitemap.",
  };
});
const homepageChecks = ["/", "/ar"].map((route) => {
  const previous = baseline.pages.find((page) => page.path === route), currentPage = currentByPath.get(route);
  const fields = ["status", "canonical", "title", "description", "mainTextHash", "jsonLdHash", "robotsDirectives"];
  const changed = fields.filter((field) => previous[field] !== currentPage[field]);
  if (changed.length) issues.push(`Protected homepage changed: ${route}: ${changed.join(", ")}`);
  return { path: route, changedFields: changed };
});
const affectedPaths = new Set(checks.filter((check) => check.intendedSearchLandingPage).map((check) => check.path));
const articlePaths = new Set(checks.filter((check) => check.path.startsWith("/blog/")).map((check) => check.path));
const guideSourcePages = new Set(current.warehouseBlogPosts.filter((post) => articlePaths.has(`/blog/${post.slug}`)).map((post) => post.internalLinks[0].href));
const approvedContentPages = new Set([...affectedPaths, ...guideSourcePages, "/warehouse-construction"]);
const publicProtection = baseline.pages.filter((page) => page.expectedIndexable).map((previous) => {
  const page = currentByPath.get(previous.path);
  if (!page) { issues.push(`Removed important page: ${previous.path}`); return { path: previous.path, missing: true }; }
  const protectedFields = ["status", "canonical", "sitemapIncluded", "robotsAllowed", "robotsDirectives"];
  const unexpectedFields = protectedFields.filter((key) => page[key] !== previous[key]);
  const titleRepair = page.title !== previous.title && (affectedPaths.has(page.path) || allowMalformedMetadataRepairs) && /\|\.(?:$|\s*\|)|Emitronix\.$/.test(previous.title);
  const descriptionRepair = page.description !== previous.description && (affectedPaths.has(page.path) || allowMalformedMetadataRepairs) && /(?:and|evidence in)\.$/.test(previous.description);
  if (page.title !== previous.title && !titleRepair) unexpectedFields.push("title");
  if (page.description !== previous.description && !descriptionRepair) unexpectedFields.push("description");
  if (page.mainTextHash !== previous.mainTextHash && !approvedContentPages.has(page.path)) unexpectedFields.push("mainTextHash");
  if (page.jsonLdHash !== previous.jsonLdHash && !affectedPaths.has(page.path) && !(allowMalformedMetadataRepairs && (titleRepair || descriptionRepair))) unexpectedFields.push("jsonLdHash");
  const removedLinks = previous.internalLinks.filter((href) => !page.internalLinks.includes(href));
  if (unexpectedFields.length || removedLinks.length) issues.push(`Unexpected public-page change: ${page.path}: ${unexpectedFields.join(", ")}`);
  return { path: page.path, unexpectedFields, removedExistingLinks: removedLinks, contentChanged: page.mainTextHash !== previous.mainTextHash };
});
const report = {
  observedAt: new Date().toISOString(), baseline: baselinePath, currentAudit: auditPath, sourceBaselineRef: sourceRef,
  scope: "Every baseline URL historically reported as Discovered or Crawled - currently not indexed; includes non-HTML resources separately",
  methodology: "Source-authored paragraphs/bullets/FAQ answers, excluding shared page chrome and navigation; five-word-shingle Jaccard for peers within the same route family. Exact shared blocks counted across all 100 generated articles or 50 warehouse resources. Similarity has no Google pass/fail threshold and does not prove an exclusion cause.",
  summary: {
    historicalUrls: checks.length, intendedHtmlPages: checks.filter((check) => check.intendedSearchLandingPage).length,
    applicationResources: checks.filter((check) => !check.intendedSearchLandingPage).length,
    affectedBlogPages: checks.filter((check) => check.path.startsWith("/blog/")).length,
    affectedWarehousePages: checks.filter((check) => check.path.startsWith("/warehouse/")).length,
    pagesWithSpecificContentAdded: checks.filter((check) => check.specificSectionsAdded?.length).length,
    pagesWithMetadataRepairs: checks.filter((check) => check.metadataRepair).length,
    titleRepairs: checks.filter((check) => check.titleBefore !== check.titleAfter).length,
    descriptionRepairs: checks.filter((check) => check.descriptionBefore !== check.descriptionAfter).length,
    originalContentBlocksRemoved: checks.reduce((sum, check) => sum + (check.removedOriginalBlocks?.length ?? 0), 0),
    issues,
  },
  homepageChecks,
  publicPageProtection: {
    pagesChecked: publicProtection.length,
    allowMalformedMetadataRepairs,
    unexpectedChanges: publicProtection.filter((page) => page.missing || page.unexpectedFields?.length || page.removedExistingLinks?.length),
    additionalGuideSourcePages: [...guideSourcePages].filter((route) => !affectedPaths.has(route)),
    dependentCardTextUpdate: { path: "/warehouse-construction", reason: "Existing resource cards render the repaired meta descriptions; the service page's own metadata, H1, links and JSON-LD remain unchanged." },
  },
  checks,
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
const columns = ["path", "classification", "historicalGscReason", "status", "sitemapIncluded", "robotsAllowed", "canonical", "metadataRepair", "originalContentBlocksPreserved", "effectivelyOrphaned", "currentGoogleIndexingStatus"];
const cell = (value) => `"${String(Array.isArray(value) ? value.join("; ") : value ?? "").replaceAll('"', '""')}"`;
await writeFile(output.replace(/\.json$/, ".csv"), [columns.map(cell).join(","), ...checks.map((check) => columns.map((column) => cell(check[column])).join(","))].join("\n") + "\n");
if (!args.includes("--json-only")) {
  await writeFile(output.replace(/\.json$/, ".html"), await renderHtmlReport(report));
}
console.log(JSON.stringify(report.summary, null, 2));
if (issues.length) process.exitCode = 1;

async function renderHtmlReport(result) {
  const escape = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const link = (href, label) => `<a href="${escape(href)}">${escape(label)}</a>`;
  const sourceLink = (route) => link(`https://emitronix.ae${route}`, route);
  const yes = (value) => value ? "Yes" : "No";
  const folder = path.dirname(output);
  const validation = JSON.parse(await readFile(path.join(folder, "validation-summary.json"), "utf8"));
  const browser = JSON.parse(await readFile(path.join(folder, "browser.json"), "utf8"));
  const htmlPages = result.checks.filter((page) => page.intendedSearchLandingPage);
  const metadataRows = htmlPages.filter((page) => page.metadataRepair).map((page) => `<tr><th scope="row"><code>${escape(page.path)}</code></th><td>${page.titleBefore !== page.titleAfter ? `<p><b>Title before:</b> ${escape(page.titleBefore)}</p><p><b>Title after:</b> ${escape(page.titleAfter)}</p>` : "Title unchanged"}</td><td>${page.descriptionBefore !== page.descriptionAfter ? `<p><b>Description before:</b> ${escape(page.descriptionBefore)}</p><p><b>Description after:</b> ${escape(page.descriptionAfter)}</p>` : "Description unchanged"}</td></tr>`).join("\n");
  const summaryRows = result.checks.map((page, index) => `<tr data-kind="${page.intendedSearchLandingPage ? "html" : "asset"}" data-reason="${page.historicalGscReason.startsWith("Discovered") ? "discovered" : "crawled"}" data-search="${escape(`${page.path} ${page.titleAfter}`.toLowerCase())}"><th scope="row">${link(`#url-${index}`, page.path)}</th><td>${escape(page.classification.join(" + "))}</td><td>${escape(page.historicalGscReason)}</td><td>${page.status}</td><td>${yes(page.sitemapIncluded)}</td><td>${page.intendedSearchLandingPage ? `${page.internalSourcePagesBefore.length} → ${page.internalSourcePagesAfter.length}` : "Application asset"}</td><td>${page.intendedSearchLandingPage ? "Eligible; GSC unverified" : "Not a search landing page"}</td></tr>`).join("\n");
  const nearest = (metrics) => metrics.nearest.map((peer) => `<li>${sourceLink(peer.path)}: ${peer.jaccard.toFixed(4)}</li>`).join("");
  const details = result.checks.map((page, index) => {
    if (!page.intendedSearchLandingPage) return `<article id="url-${index}" class="url"><h3><code>${escape(page.path)}</code></h3><p><b>Category B — application resource.</b> Historical reason: ${escape(page.historicalGscReason)}. Live and local GET return HTTP ${page.status}; robots permit crawling. The live font has a valid WOFF2 header and the manifest parses as JSON.</p><p>Neither is intended as a separate HTML search result. No sitemap inclusion, canonical page, editorial copy or noindex change is appropriate. Both remain available to render the website.</p><p class="note">${escape(page.remainingAction)} Current Google status remains unverified.</p></article>`;
    const old = page.authoredContentBefore, updated = page.authoredContentAfter;
    const sectionNames = page.path.startsWith("/blog/")
      ? current.warehouseBlogPosts.find((post) => `/blog/${post.slug}` === page.path).sections.filter((section) => page.specificSectionsAdded.includes(section.id)).map((section) => section.title)
      : page.specificSectionsAdded;
    return `<article id="url-${index}" class="url"><h3>${sourceLink(page.path)}</h3><p><b>Category A + D.</b> ${escape(page.historicalGscReason)} is historical baseline data, not a current Google finding.</p><dl><dt>Route</dt><dd><code>${escape(page.sourceRoute)}</code>; generateStaticParams includes this existing slug.</dd><dt>Observed technical state</dt><dd>HTTP ${page.status}; robots allowed; ${escape(page.robotsDirectives)}; sitemap included; one preserved H1; crawlable server-rendered main content; ${page.structuredDataBlocks} JSON-LD blocks with no validation errors.</dd><dt>Self-canonical</dt><dd><code>${escape(page.canonical)}</code></dd><dt>Search intent</dt><dd>${escape(page.primaryIntent)}</dd></dl><p><b>Source finding:</b> ${page.path.startsWith("/blog/") ? "The eight original generated sections use substantial verbatim material shared across the 100-article family." : "The 50-resource family shares benefits, document and quality arrays and draws on only 11 technical briefs; the generic planning brief is shared by 19 resources."} This supports adding specific guidance, but does not establish why Google excluded this URL.</p><p><b>Change:</b> Added ${sectionNames.length} topic-specific sections: ${escape(sectionNames.join("; "))}. Original body blocks, heading sequence, H1, URL, canonical, robots directives, sitemap membership and existing links are retained. ${page.metadataRepair ? "Only the malformed metadata listed below was repaired." : "Title and description are unchanged."}</p><div class="metrics"><p><b>Authored words:</b> ${old.authoredWords} → ${updated.authoredWords}</p><p><b>Blocks unique within this family:</b> ${old.uniqueBlocks} → ${updated.uniqueBlocks}</p><p><b>Shared blocks retained:</b> ${old.sharedBlocks} → ${updated.sharedBlocks}</p><p><b>Inbound source pages:</b> ${page.internalSourcePagesBefore.length} → ${page.internalSourcePagesAfter.length}; no orphan.</p></div><details><summary>Before/after nearest content peers</summary><div class="columns"><div><h4>Before</h4><ul>${nearest(old)}</ul></div><div><h4>After</h4><ul>${nearest(updated)}</ul></div></div><p class="muted">Five-word-shingle Jaccard, excluding shared navigation and page chrome. There is no Google threshold; overlap and possible intent competition require further performance review.</p></details><details><summary>Added guidance and preservation evidence</summary>${page.addedContentBlocks.map((block) => `<p>${escape(block)}</p>`).join("")}<p>Original content blocks removed: ${page.removedOriginalBlocks.length}. Existing internal links removed: ${page.removedExistingLinks.length}. Original headings preserved: ${yes(page.originalHeadingsPreserved)}.</p></details><details><summary>Verified incoming links (${page.internalSourcePagesAfter.length})</summary><ul>${page.internalSourcePagesAfter.map((route) => `<li>${sourceLink(route)}${page.addedSourcePages.includes(route) ? " — new contextual source" : " — retained source"}</li>`).join("")}</ul></details><p class="note">${escape(page.remainingAction)} No current GSC access or indexing confirmation was obtained.</p></article>`;
  }).join("\n");
  const tests = validation.checks.map((check) => `<tr><th scope="row">${escape(check.name)}</th><td>${escape(check.result)}</td><td>${check.evidence ? link(check.evidence, "Evidence") : escape(check.note ?? "")}</td></tr>`).join("");
  const gallery = browser.screenshots.map((shot) => `<figure><a href="${escape(shot.file)}"><img src="${escape(shot.file)}" alt="${escape(shot.path)} at ${shot.width}px" loading="lazy"></a><figcaption><code>${escape(shot.path)}</code> · ${shot.width}px</figcaption></figure>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Emitronix — focused review of historical non-indexed URLs</title><style>
:root{font:16px/1.65 Arial,sans-serif;color:#1e293b;background:#f4f7fb}*{box-sizing:border-box}body{margin:0}main{max-width:1240px;margin:auto;padding:32px 24px 70px}header{background:#0b213c;color:white;padding:36px;border-radius:10px}header p{max-width:880px;color:#d9e8f8}h1{font-size:clamp(28px,4vw,44px);line-height:1.15;letter-spacing:-.03em}h2{font-size:25px;line-height:1.3}h3{font-size:19px;line-height:1.5}h4{margin:12px 0}a{color:#194d96;text-underline-offset:3px;overflow-wrap:anywhere}header a{color:#6de0ff}section,.url{background:white;border:1px solid #d9e4ef;border-radius:8px;padding:26px;margin-top:24px}.url{scroll-margin-top:16px}.actions{display:flex;gap:16px;flex-wrap:wrap}.cards,.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.cards{margin-top:24px}.card{background:white;border:1px solid #d9e4ef;border-radius:8px;padding:22px}.card strong{display:block;font-size:36px;color:#194d96}.card span{font-size:13px}code{font-size:13px;overflow-wrap:anywhere}.note{background:#eef7ff;border-inline-start:4px solid #248ed8;padding:12px 16px}.warning{background:#fff9ed;border-color:#a86e18}.muted,figcaption{color:#52637a;font-size:13px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:24px}.metrics{font-size:13px;background:#f7faff;padding:10px 16px;margin:16px 0}.metrics p{margin:4px 0}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #d9e4ef;padding:12px}thead{background:#edf5ff}.scroll{overflow:auto}.scroll table{min-width:850px}td p{margin:6px 0}tbody th{font-weight:normal}label{font-weight:bold;font-size:13px;display:grid;gap:6px}input,select{font:inherit;min-height:44px;border:1px solid #b6c8dd;border-radius:5px;padding:8px;max-width:100%}.filters{display:flex;gap:16px;flex-wrap:wrap}.filters input{min-width:240px}details{border-top:1px solid #d9e4ef;padding-top:12px;margin-top:12px}summary{cursor:pointer;font-weight:bold;padding:6px 0}dl{display:grid;grid-template-columns:155px 1fr;gap:8px 16px;font-size:14px}dt{font-weight:bold}dd{margin:0;overflow-wrap:anywhere}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.gallery img{max-width:100%;height:240px;object-fit:cover;object-position:top;border:1px solid #d9e4ef}figure{margin:0}li{margin:5px 0}[hidden]{display:none!important}:focus-visible{outline:3px solid #138cc5;outline-offset:3px}@media(max-width:700px){main{padding:16px 12px 40px}header,section,.url{padding:20px}.cards,.metrics,.gallery{grid-template-columns:1fr 1fr}.columns{grid-template-columns:1fr}dl{grid-template-columns:1fr;gap:4px}dd{margin-bottom:10px}.filters label{width:100%}.filters input{min-width:0;width:100%}.gallery img{height:180px}}
</style></head><body><main><header><p>Emitronix · 1 October 2026 · Local review</p><h1>All historical non-indexed URLs reviewed.</h1><p>31 baseline URLs: 29 existing content pages and two application resources. Targeted guidance, contextual links and justified metadata repairs improve the content pages while preserving their URLs and indexability signals. No confirmed technical crawl barrier was found. Google indexing remains unverified.</p><p>No commit, GitHub push or deployment was performed.</p><nav class="actions" aria-label="Evidence"><a href="review.csv">Focused CSV</a><a href="review.json">Detailed evidence</a><a href="final.csv">Full current URL audit</a><a href="live-baseline.json">Live baseline</a><a href="../implementation-report.html">Earlier design report</a></nav></header>
<div class="cards"><div class="card"><strong>29</strong><span>Content pages improved</span></div><div class="card"><strong>7 / 8</strong><span>Title / description repairs</span></div><div class="card"><strong>0</strong><span>Original body blocks removed</span></div><div class="card"><strong>237</strong><span>Public pages checked for protection</span></div></div>
<section><h2>What the evidence supports</h2><p>The ${link("../final.json", "supplied full audit")} is preserved as baseline data. A read-only live crawl on 1 October matched its relevant HTML, metadata and structured data before editing. Both the live baseline and final isolated production build returned HTTP 200 for all 31 target URLs. All 29 HTML pages already had correct self-canonicals, sitemap entries, index/follow directives, robots access, meaningful server-rendered HTML, incoming links and valid applicable JSON-LD.</p><p>The full list includes <code>/warehouse/distribution-centre-construction</code> and <code>/warehouse/factory-construction</code>, which were absent from the example list. The font and manifest are application assets, not missing editorial pages. No route-generation, redirect, accidental noindex, orphan or canonical defect was found on the target pages.</p><p class="note warning">Historical labels do not prove Google's current status or why a URL was excluded. Category C remains empty for confirmed technical indexability barriers. The 29 HTML pages remain A + D; the two assets remain B. Across the full 306-URL audit, A = 237, B = 69, C = 0 and D = 237.</p><p>The substantive issue was template overlap: 40–41 of each target article's 43 original authored blocks also appeared elsewhere in the 100-article family. Warehouse resources shared large arrays and technical brief buckets. Seven titles and eight descriptions also had visibly truncated endings. These are supported quality findings; their role in Google's selection remains unknown.</p></section>
<section><h2>Changes and ranking protection</h2><p>Added 22 article sections and 54 warehouse-resource sections: practical operating briefs, decision registers, coordination examples and readiness checks tailored to each page's subject. Added 54 relevant resource links and direct guide links from nine matching warehouse resources to the 11 articles. Existing links remain intact. No business credentials, fixed authority requirements, construction thresholds, cost promises or guaranteed timelines were invented.</p><p>The approved internal-page design from the earlier task remains in use: scoped server-rendered framing, image heroes, clear content groups and responsive layouts. Both homepages retain their source design, content and metadata. No package, client component or tracking dependency was added; shared first-load JavaScript remains 103 kB in the build output.</p><p>All 237 public pages passed comparison for protected HTTP status, canonical, robots directives, sitemap membership and existing internal links. Original target copy, heading order, H1s and primary topic wording remain. Only seven malformed titles and eight incomplete descriptions change. Updated dates describe the actual 29-page editorial change on 1 October; existing authority source-check dates were not advanced without a fresh formal review.</p><p>Seven other warehouse resources receive relevant guide links. The existing <code>/warehouse-construction</code> cards display the four repaired resource descriptions, so that dependent card text also changes; its own title, description, H1, links and JSON-LD are preserved. No other public-page semantic change was detected.</p><p>Significant shared template text remains. Peer comparisons below use source-authored content, excluding chrome and navigation; a block counted as unique means absent verbatim from this local family, not proven unique on the web. Lower similarity is a diagnostic observation, not a Google pass criterion. No URL was merged, deleted, redirected or given noindex.</p><p>${link("blog-quality-before.json", "Article findings before changes")} · ${link("warehouse-quality-before.json", "Resource findings before changes")} · ${link("../../../data/warehouseBlogIndexingContent.ts", "Added article source")} · ${link("../../../data/warehouseIndexingContent.ts", "Added resource source")}</p></section>
<section><h2>Justified metadata repairs</h2><p>Only broken endings evidenced in the baseline were repaired. Five titles ended in <code>|.</code>, two ended in <code>Emitronix.</code>; four descriptions ended in <code>and.</code>, four in <code>evidence in.</code>. Full rendered values below include the existing site title resolver. ${result.summary.pagesWithMetadataRepairs} pages have at least one repair.</p><div class="scroll"><table><thead><tr><th scope="col">Page</th><th scope="col">Title</th><th scope="col">Description</th></tr></thead><tbody>${metadataRows}</tbody></table></div></section>
<section><h2>Validation and remaining findings</h2><div class="scroll"><table><thead><tr><th scope="col">Check</th><th scope="col">Result</th><th scope="col">Evidence</th></tr></thead><tbody>${tests}</tbody></table></div><p>Normal Chrome checked all 29 pages at 768px, with six further 375px/1440px visual checks. No overflow, broken content fragment or JavaScript error was observed in those navigations; all 130 tested internal destinations returned below HTTP 400. New content's ARIA references resolve. Forms were not submitted and writes were blocked.</p><p class="note warning">Existing findings remain: the homepage's long title/description warnings; the shared closed mobile-menu button references an unmounted <code>mobile-navigation-menu</code>; and the earlier intermittent React #418 hydration error, reproduced on both original and refreshed builds and traced to the vendored React cursor bug. The latest 35 navigations did not show #418, which does not establish resolution. ${link("browser.json", "Current browser evidence")} · ${link("../page-browser-checks.json", "Earlier hydration diagnosis")}</p></section>
<section><h2>All 31 historical URLs</h2><div class="filters"><label>Search URL or title<input id="search" type="search" placeholder="Filter URLs"></label><label>URL type<select id="kind"><option value="all">All URLs</option><option value="html">Content pages</option><option value="asset">Application assets</option></select></label><label>Historical reason<select id="reason"><option value="all">All reasons</option><option value="discovered">Discovered</option><option value="crawled">Crawled</option></select></label></div><p id="count" role="status" aria-live="polite">31 of 31 URLs shown</p><div class="scroll"><table id="inventory"><thead><tr><th scope="col">URL / full findings</th><th scope="col">Category</th><th scope="col">Historical reason</th><th scope="col">HTTP</th><th scope="col">Sitemap</th><th scope="col">Incoming pages</th><th scope="col">Current assessment</th></tr></thead><tbody>${summaryRows}</tbody></table></div><p>A: intended indexable page. B: intentional non-landing-page URL/resource. C: confirmed technical issue requiring correction. D: current Google Search Console verification required. A and D overlap.</p></section>
${details}
<section><h2>Responsive visual evidence</h2><div class="gallery">${gallery}</div></section>
<section><h2>After an approved deployment</h2><ol><li>Fetch the affected production URLs, robots.txt and sitemap and compare them with this final local audit.</li><li>Inspect all 29 content URLs in Google Search Console. Record the current indexing reason, last crawl, rendered page, user-declared canonical and Google-selected canonical.</li><li>Use the live test where appropriate; request indexing for eligible changed pages and monitor subsequent results.</li><li>Compare query intent and performance for the nearest overlapping peers before considering further rewrites or consolidation. Keep URLs and ranking signals protected unless current evidence supports a change.</li></ol><p>Google can still choose not to index an eligible page. These code changes cannot verify or guarantee indexing. No Search Console action was performed in this task.</p><p>Google guidance supports useful page-specific information, crawlable contextual links and accurate sitemap modification dates: ${link("https://developers.google.com/search/docs/fundamentals/creating-helpful-content", "Helpful content")} · ${link("https://developers.google.com/search/docs/crawling-indexing/links-crawlable", "Crawlable links")} · ${link("https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap", "Sitemap dates")} · ${link("https://support.google.com/webmasters/answer/12482179?hl=en", "URL Inspection")}. These principles guide the changes; they do not identify the cause for any particular exclusion.</p><p class="muted">Source baseline: ${escape(result.sourceBaselineRef)}. Focused audit generated ${escape(result.observedAt)}. ${link("validation-summary.json", "Validation summary")} · ${link("final.json", "Full final audit")}. Reproduce with <code>npm run review:nonindexed</code> after refreshing the isolated production audit and browser evidence.</p></section>
</main><script>
const rows=Array.from(document.querySelectorAll('#inventory tbody tr'));const search=document.getElementById('search'),kind=document.getElementById('kind'),reason=document.getElementById('reason');function filter(){let count=0;for(const row of rows){row.hidden=!(row.dataset.search.includes(search.value.toLowerCase())&&(kind.value==='all'||row.dataset.kind===kind.value)&&(reason.value==='all'||row.dataset.reason===reason.value));if(!row.hidden)count++;}document.getElementById('count').textContent=count+' of '+rows.length+' URLs shown';}search.addEventListener('input',filter);kind.addEventListener('change',filter);reason.addEventListener('change',filter);
</script></body></html>\n`;
}
