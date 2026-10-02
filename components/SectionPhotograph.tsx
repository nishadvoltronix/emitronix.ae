import Image from "next/image";
import type { InternalServiceImage } from "@/data/internalServiceImages";
import styles from "./SectionPhotograph.module.css";
import { PhotoAttribution } from "@/components/PhotoAttribution";

/** A static, progressively loaded photograph beside existing internal-page content. */
export function SectionPhotograph({
  photo,
  locale = "en",
  className = "",
  compact = false,
}: {
  photo: InternalServiceImage;
  locale?: "en" | "ar";
  className?: string;
  compact?: boolean;
}) {
  return (
    <figure
      className={`${styles.figure}${compact ? ` ${styles.compact}` : ""} ${className}`}
      data-section-photograph={photo.sourceId}
    >
      <div className={styles.media}>
        <Image
          src={photo.src}
          alt={locale === "ar" ? photo.altAr : photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          quality={65}
          sizes={compact
            ? "(min-width: 1024px) 560px, (min-width: 768px) 66vw, 100vw"
            : "(min-width: 1280px) 960px, (min-width: 768px) 80vw, 100vw"}
          className={styles.image}
          style={{ objectPosition: photo.objectPosition ?? "center" }}
        />
      </div>
      <figcaption className={styles.caption}>
        {locale === "ar" ? photo.captionAr : photo.caption}
        {photo.src.startsWith("/images/unique/") ? <PhotoAttribution credit={photo.credit} sourceUrl={photo.sourceUrl} licenseUrl={photo.licenseUrl} locale={locale} /> : null}
      </figcaption>
    </figure>
  );
}
