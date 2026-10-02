const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const transpiled = new Map();
const photo = (sourceId, extra = {}) => ({
  sourceId,
  src: `/images/unique/${sourceId}.webp`,
  width: 1600,
  height: 1067,
  alt: `Real photograph ${sourceId}`,
  altAr: `وصف الصورة ${sourceId}`,
  caption: "Representative licensed photograph, not an Emitronix project.",
  captionAr: "صورة مرخصة للتوضيح وليست من مشاريع إيمترونيكس.",
  credit: "Test photographer",
  sourceUrl: `https://photos.example/${sourceId}`,
  licenseUrl: "https://photos.example/license",
  ...extra,
});

// Exercise production resolution and validation with real legacy catalogues.
// Inject only the new JSON allocation and administrator override response;
// this never writes assets, site content, or administrator data.
function loadPhotography(assets = [], assignments = {}, override = null) {
  const modules = new Map();
  function load(relative) {
    if (modules.has(relative)) return modules.get(relative);
    if (!transpiled.has(relative)) {
      transpiled.set(relative, ts.transpileModule(fs.readFileSync(path.join(root, relative), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
      }).outputText);
    }
    const module = { exports: {} };
    modules.set(relative, module.exports);
    function requireModule(name) {
      if (name === "server-only") return {};
      if (name.endsWith("uniquePhotoAssets.json")) return assets;
      if (name.endsWith("pagePhotoAssignments.json")) return assignments;
      if (name === "@/lib/adminStore") return { getSeoOverride: async () => override };
      if (name.startsWith("@/") || name.startsWith(".")) {
        const target = name.startsWith("@/") ? name.slice(2) : path.join(path.dirname(relative), name);
        return load(target.replaceAll("\\", "/") + ".ts");
      }
      return require(name);
    }
    new Function("require", "module", "exports", transpiled.get(relative))(requireModule, module, module.exports);
    return module.exports;
  }
  return {
    api: load("data/pagePhotography.ts"),
    legacy: load("data/internalServiceImages.ts"),
    sections: load("data/sectionPhotography.ts"),
    seo: () => load("data/seo.ts"),
  };
}

test("unassigned routes preserve legacy heroes, photographs and counts", () => {
  const { api, legacy, sections } = loadPhotography();
  for (const route of ["/civil", "/ar/civil", "/warehouse-construction", "/dewa-approvals", "/about", "/search"]) {
    assert.deepEqual(api.findInternalServiceImage(route), legacy.findInternalServiceImage(route));
    assert.deepEqual(api.getSectionPhotographs(route, 4), sections.getSectionPhotographs(route, 4));
  }
  assert.equal(api.findInternalServiceImage("/"), undefined);
  assert.equal(api.findInternalServiceImage("/ar"), undefined);
  assert.deepEqual(api.getSectionPhotographs("/", 4), []);
  assert.deepEqual(api.getSectionPhotographs("/ar", 4), []);
});

test("English and Arabic receive independent explicit heroes", () => {
  const english = photo("english"), arabic = photo("arabic");
  const { api, legacy } = loadPhotography([english, arabic], {
    "/civil": { hero: "english" },
    "/ar/civil": { hero: "arabic" },
  });
  assert.equal(api.getInternalServiceImage("/civil"), english);
  assert.equal(api.getInternalServiceImage("/ar/civil"), arabic);
  assert.equal(api.getInternalServiceImage("/ar/civil/?campaign=one#scope"), arabic);
  assert.equal(api.getUniquePhotoAttribution(arabic, "ar").locale, "ar");
  assert.equal(api.getUniquePhotoAttribution(legacy.getInternalServiceImage("/civil")), undefined);
  const onlyEnglish = loadPhotography([english], { "/civil": { hero: "english" } });
  assert.equal(onlyEnglish.api.getInternalServiceImage("/ar/civil"), onlyEnglish.legacy.getInternalServiceImage("/ar/civil"));
});

test("partial section assignments preserve original positions and photograph count", () => {
  const replacement = photo("section-one"), third = photo("section-three");
  const { api, sections } = loadPhotography([replacement, third], {
    "/civil": { sections: ["section-one", null, "section-three"] },
  });
  const before = sections.getSectionPhotographs("/civil", 4);
  const after = api.getSectionPhotographs("/civil", 4);
  assert.equal(after.length, before.length);
  assert.equal(after[0], replacement);
  assert.equal(after[1], before[1]);
  assert.equal(after[2], third);
  assert.equal(after[3], before[3]);
  assert.deepEqual(api.getSectionPhotographs("/ar/civil", 4), before);
});

test("homepage allocations, unknown IDs and reused assignments fail clearly", () => {
  const asset = photo("one");
  for (const route of ["/", "/ar", "/ar/", "/?query=x"]) {
    assert.throws(() => loadPhotography([asset], { [route]: { hero: "one" } }), /cannot target/);
  }
  assert.throws(() => loadPhotography([], { "/civil": { hero: "missing" } }), /Missing unique photograph missing/);
  assert.throws(() => loadPhotography([asset], { "/civil": { hero: "one", sections: ["one"] } }), /assigned twice/);
  assert.throws(() => loadPhotography([asset], { "/civil": { hero: "one" }, "/ar/civil": { hero: "one" } }), /assigned twice/);
});

test("renaming a source or format cannot bypass the new asset registry", () => {
  const first = photo("one");
  assert.throws(() => loadPhotography([first, photo("two", { sourceUrl: first.sourceUrl })]), /reuses the source/);
  assert.throws(() => loadPhotography([first, photo("two", { src: first.src })]), /reuses the source/);
  assert.throws(() => loadPhotography([
    photo("wide", { sourceUrl: "https://images.unsplash.com/photo-12345-abcdef?w=1600" }),
    photo("crop", { sourceUrl: "https://images.unsplash.com/photo-12345-abcdef?w=400&fit=crop" }),
  ]), /reuses the source/);
  assert.throws(() => loadPhotography([
    photo("pexels-wide", { sourceUrl: "https://www.pexels.com/photo/building-12345/" }),
    photo("pexels-crop", { sourceUrl: "https://www.pexels.com/photo/renamed-building-12345/" }),
  ]), /reuses the source/);
});

test("assigned supporting images cannot repeat an excluded rendered image or add slots", () => {
  const replacement = photo("replacement");
  const { api } = loadPhotography([replacement], { "/civil": { sections: ["replacement"] } });
  assert.throws(() => api.getSectionPhotographs("/civil", 4, [replacement.src]), /repeats an excluded/);
  assert.throws(() => api.getSectionPhotographs("/civil", 0), /exceed its 0/);
  const overflow = loadPhotography([replacement], { "/civil": { sections: [null, null, null, null, "replacement"] } });
  assert.throws(() => overflow.api.getSectionPhotographs("/civil", 4), /exceed its 4/);
});

test("hero metadata changes images only and preserves administrator override precedence", async () => {
  const hero = photo("arabic-hero");
  const base = {
    title: { absolute: "Existing title" },
    description: "Existing description",
    alternates: { canonical: "https://emitronix.ae/ar/civil" },
    robots: { index: true, follow: true },
    openGraph: { type: "website", title: "Existing OG title", images: [{ url: "/before.webp" }] },
    twitter: { card: "summary_large_image", title: "Existing Twitter title", images: ["/before.webp"] },
  };
  const { seo } = loadPhotography([hero], { "/ar/civil": { hero: hero.sourceId } });
  const result = await seo().applySeoOverrides(base, "/ar/civil");
  for (const key of ["title", "description", "alternates", "robots"]) assert.deepEqual(result[key], base[key]);
  assert.equal(result.openGraph.images[0].url, `https://emitronix.ae${hero.src}`);
  assert.equal(result.openGraph.images[0].alt, hero.altAr);
  assert.equal(result.openGraph.images[0].width, hero.width);
  assert.equal(result.openGraph.title, base.openGraph.title);
  assert.deepEqual(result.twitter.images, [`https://emitronix.ae${hero.src}`]);
  assert.equal(await seo().applySeoOverrides(base, "/"), base);
  const overridden = loadPhotography([hero], { "/ar/civil": { hero: hero.sourceId } }, { ogImage: "/approved-social.webp" });
  const final = await overridden.seo().applySeoOverrides(base, "/ar/civil");
  assert.equal(final.openGraph.images[0].url, "https://emitronix.ae/approved-social.webp");
  assert.deepEqual(final.twitter.images, ["https://emitronix.ae/approved-social.webp"]);
});
