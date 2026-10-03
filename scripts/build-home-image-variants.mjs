import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import ts from "typescript";

// Deterministic, build-time derivatives of the existing photographs. Originals
// remain unchanged. Content hashes allow long-lived caching without stale images.
const root = process.cwd();
const output = path.join(root, "public/images/home-optimized");
const source = await readFile(path.join(root, "data/homeHeroSlides.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { homeHeroSlides } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const manifest = {};
await mkdir(output, { recursive: true });

async function encode(input, name, width, crop) {
  const result = { width };
  for (const format of ["avif", "webp"]) {
    let pipeline = sharp(input).rotate();
    if (crop) pipeline = pipeline.extract(crop);
    pipeline = pipeline.resize({ width, withoutEnlargement: true });
    // Match Next's existing quality=65 (AVIF scales that to 41). More encoder
    // effort costs build time, never time on a visitor's first request.
    pipeline = format === "avif"
      ? pipeline.avif({ quality: 41, effort: 6 })
      : pipeline.webp({ quality: 65, effort: 5 });
    const bytes = await pipeline.toBuffer();
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    const filename = `${name}-${width}-${hash}.${format}`;
    await writeFile(path.join(output, filename), bytes);
    result[format] = `/images/home-optimized/${filename}`;
  }
  return result;
}

for (const slide of homeHeroSlides) {
  const input = path.join(root, "public", slide.src.replace(/^\//, ""));
  const original = await readFile(input);
  const { width, height } = await sharp(original).metadata();
  if (!width || !height) throw new Error(`Missing dimensions: ${slide.src}`);
  const position = Number.parseFloat(slide.position) / 100;
  if (!Number.isFinite(position) || position < 0 || position > 1) {
    throw new Error(`Expected percentage focal position: ${slide.position}`);
  }
  const name = path.basename(slide.src, path.extname(slide.src));
  // On narrow phones the hero is taller than 5:4. Remove only the sides that
  // object-fit:cover already hides. Applying the SAME object-position to this
  // crop preserves the original focal point (including its animation).
  const cropWidth = Math.min(width, Math.round(height * 0.8));
  const crop = { left: Math.round((width - cropWidth) * position), top: 0, width: cropWidth, height };
  const widths = [...new Set([768, 1280, 1600, 1920, width].filter((value) => value <= width))];
  const wide = [];
  for (const variantWidth of widths) wide.push(await encode(original, name, variantWidth));
  manifest[slide.src] = {
    sourceHash: createHash("sha256").update(original).digest("hex"),
    width,
    height,
    position: slide.position,
    crop,
    portrait: await encode(original, `${name}-portrait`, cropWidth, crop),
    wide,
  };
  console.log(`Prepared responsive images: ${name}`);
}

await writeFile(path.join(root, "data/homeImageVariants.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Original photographs preserved; homeImageVariants.json updated.");
