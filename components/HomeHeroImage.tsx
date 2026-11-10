import { homeHeroSlides } from "@/data/homeHeroSlides";
import homeImageVariants from "@/data/homeImageVariants.json";
import styles from "./Home.module.css";

// A single, real photograph keeps the reference's composition steady and avoids
// downloading additional backgrounds. Derivatives are generated at build time.
export function HomeHeroImage() {
  const photograph = homeHeroSlides[0];
  const image = homeImageVariants[photograph.src];
  const sources = (format: "avif" | "webp") =>
    image.wide.map((variant) => `${variant[format]} ${variant.width}w`).join(", ");
  // Cover must account for height as well as width, including tall tablets.
  const sizes = `max(100vw, ${Math.ceil(92 * image.width / image.height)}svh)`;

  return (
    <>
      <link rel="preload" as="image" type="image/avif" media="(max-width: 479px)"
        href={image.portrait.avif} fetchPriority="high" />
      <link rel="preload" as="image" type="image/avif" media="(min-width: 480px)"
        imageSrcSet={sources("avif")} imageSizes={sizes} fetchPriority="high" />
      <picture className={styles.heroPhotograph}>
        <source media="(max-width: 479px)" type="image/avif" srcSet={image.portrait.avif} />
        <source media="(max-width: 479px)" type="image/webp" srcSet={image.portrait.webp} />
        <source type="image/avif" srcSet={sources("avif")} sizes={sizes} />
        {/* Already optimized, content-hashed AVIF/WebP assets need no runtime transform. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.wide.at(-1)!.webp} srcSet={sources("webp")} sizes={sizes}
          alt={photograph.alt} width={image.width} height={image.height}
          loading="eager" fetchPriority="high" decoding="async"
          style={{ objectPosition: photograph.position }} />
      </picture>
    </>
  );
}
