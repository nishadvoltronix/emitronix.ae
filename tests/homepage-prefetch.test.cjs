const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

function source(file) {
  return ts.createSourceFile(file, fs.readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function descendants(node, predicate) {
  const found = [];
  function visit(current) {
    if (predicate(current)) found.push(current);
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
}

function attribute(link, name) {
  return link.attributes.properties.find((item) => ts.isJsxAttribute(item) && item.name.getText() === name)?.initializer;
}

function links(file) {
  return descendants(source(file), (node) =>
    (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText() === "Link");
}

function expression(link, name) {
  const value = attribute(link, name);
  return value && ts.isJsxExpression(value) ? value.expression?.getText() : undefined;
}

function tsxFiles(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? tsxFiles(file) : file.endsWith(".tsx") ? [file] : [];
  });
}

// Model localization, including an untranslated Arabic destination falling back
// to /ar, to verify guards inspect the resolved URL rather than the source item.
function localizedPath(href, locale) {
  const english = href === "/ar" ? "/" : href.replace(/^\/ar\//, "/");
  if (locale === "en") return english;
  return english === "/" || english === "/untranslated" ? "/ar" : `/ar${english}`;
}

test("literal homepage links retain Next Link navigation without unused prefetch", () => {
  let count = 0;
  for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
    for (const link of links(file)) {
      const href = attribute(link, "href");
      if (!href || !ts.isStringLiteral(href) || !["/", "/ar"].includes(href.text)) continue;
      count++;
      assert.equal(expression(link, "prefetch"), "false", `${file}: ${href.text}`);
    }
  }
  assert.ok(count >= 10, "known home breadcrumbs must remain covered");
});

test("localized logo and policy breadcrumb do not prefetch the homepage", () => {
  for (const [file, href] of [
    ["components/HeaderClient.tsx", 'localizedPath("/", locale)'],
    ["components/PolicyContentPage.tsx", "homeHref"],
  ]) {
    const matches = links(file).filter((link) => expression(link, "href") === href);
    assert.equal(matches.length, 1, file);
    assert.equal(expression(matches[0], "prefetch"), "false", file);
  }
});

test("mapped navigation and breadcrumbs disable only homepage prefetch", () => {
  const sites = [
    ["components/HeaderClient.tsx", "localizedPath(item.href, locale)", 2],
    ["components/Footer.tsx", "localizedPath(item.href, locale)", 1],
    ["components/InternalPageFrame.tsx", "item.href", 1],
    ["components/Premium.tsx", "item.href", 1],
    ["components/TrustContentPage.tsx", "item.href", 1],
    ["components/ArabicSitePage.tsx", "link.href", 1],
    ["app/(en)/html-sitemap/page.tsx", "link.href", 1],
  ];
  for (const [file, hrefExpression, expectedCount] of sites) {
    const guarded = links(file).filter((link) => expression(link, "href") === hrefExpression && expression(link, "prefetch"));
    assert.equal(guarded.length, expectedCount, file);
    for (const link of guarded) {
      const evaluate = new Function("item", "link", "locale", "localizedPath", `return (${expression(link, "prefetch")});`);
      for (const locale of ["en", "ar"]) {
        for (const href of ["/", "/ar", "/services", "/ar/services", "/contact", "/untranslated"]) {
          const resolved = hrefExpression.startsWith("localizedPath") ? localizedPath(href, locale) : href;
          const expected = resolved === "/" || resolved === "/ar" ? false : undefined;
          assert.equal(evaluate({ href }, { href }, locale, localizedPath), expected, `${file}: ${locale} ${href}`);
        }
      }
    }
  }
});

test("mobile menu warming excludes home and current page but keeps other destinations", () => {
  const parsed = source("components/HeaderClient.tsx");
  const declarations = descendants(parsed, (node) => ts.isVariableDeclaration(node) && node.name.getText() === "prefetchNavigation");
  assert.equal(declarations.length, 1);
  const createNavigation = new Function("currentNavItems", "locale", "localizedPath", "window", "router", `return (${declarations[0].initializer.getText()});`);
  for (const locale of ["en", "ar"]) {
    const prefetched = [];
    const items = ["/", "/ar", "/services", "/contact"].map((href) => ({ href }));
    if (locale === "ar") items.push({ href: "/untranslated" });
    const prefetch = createNavigation(items, locale, localizedPath,
      { location: { pathname: localizedPath("/services", locale) } },
      { prefetch: (href) => prefetched.push(href) });
    prefetch();
    assert.deepEqual(prefetched, [localizedPath("/contact", locale)]);
  }
});
