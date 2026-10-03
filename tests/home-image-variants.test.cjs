const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const sharp = require("sharp");
const ts = require("typescript");
const manifest = require("../data/homeImageVariants.json");
const root = path.resolve(__dirname, "..");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const publicPath = (src) => path.join(root, "public", src.replace(/^\//, ""));

async function slides() {
  const source = await fs.readFile(path.join(root, "data/homeHeroSlides.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return (await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)).homeHeroSlides;
}

test("every original slideshow photograph has current derivatives and focal position", async () => {
  const originals = await slides();
  assert.deepEqual(Object.keys(manifest), originals.map(({ src }) => src));
  for (const slide of originals) {
    const asset = manifest[slide.src];
    const bytes = await fs.readFile(publicPath(slide.src));
    assert.equal(asset.sourceHash, hash(bytes), `Regenerate derivatives of ${slide.src}`);
    assert.equal(asset.position, slide.position, `Regenerate focal crop of ${slide.src}`);
    const metadata = await sharp(bytes).metadata();
    assert.equal(asset.width, metadata.width);
    assert.equal(asset.height, metadata.height);
  }
});

test("generated assets exist, match their immutable hash and do not upscale originals", async () => {
  for (const asset of Object.values(manifest)) {
    assert.equal(asset.wide.at(-1).width, asset.width);
    for (const variant of [...asset.wide, asset.portrait]) {
      assert.ok(variant.width <= asset.width);
      for (const format of ["avif", "webp"]) {
        assert.match(variant[format], /^\/images\/home-optimized\/[a-z0-9-]+\.(avif|webp)$/);
        const bytes = await fs.readFile(publicPath(variant[format]));
        assert.ok(variant[format].endsWith(`-${hash(bytes).slice(0, 16)}.${format}`));
        const metadata = await sharp(bytes).metadata();
        assert.equal(metadata.width, variant.width);
        assert.equal(metadata.height, variant === asset.portrait ? asset.height : Math.round(asset.height * variant.width / asset.width));
      }
    }
  }
});

test("phone crop preserves the same object-fit cover composition", () => {
  for (const asset of Object.values(manifest)) {
    const focalPoint = Number.parseFloat(asset.position) / 100;
    assert.equal(asset.crop.top, 0);
    assert.equal(asset.crop.height, asset.height);
    assert.ok(asset.crop.left >= 0 && asset.crop.left + asset.crop.width <= asset.width);
    // Compare original-coordinate left edges across narrow hero aspect ratios.
    // The only permissible difference is integer rounding of the source crop.
    for (const aspect of [0.3, 0.45, 0.6, 0.75]) {
      const visibleWidth = asset.height * aspect;
      const originalLeft = (asset.width - visibleWidth) * focalPoint;
      const croppedLeft = asset.crop.left + (asset.crop.width - visibleWidth) * focalPoint;
      assert.ok(Math.abs(originalLeft - croppedLeft) <= 0.5);
    }
  }
});
