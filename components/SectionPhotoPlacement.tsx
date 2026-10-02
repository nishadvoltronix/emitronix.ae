import { SectionPhotograph } from "@/components/SectionPhotograph";
import type { InternalServiceImage } from "@/data/internalServiceImages";

/** Distribute a curated set through existing server-rendered content sections. */
export function SectionPhotoPlacement({
  photos,
  index,
  sections,
  locale = "en",
}: {
  photos: readonly InternalServiceImage[];
  index: number;
  sections: number;
  locale?: "en" | "ar";
}) {
  if (sections < 1 || photos.length === 0) return null;
  const selected = photos.filter((_, photoIndex) => Math.floor(photoIndex * sections / photos.length) === index);
  if (!selected.length) return null;
  return (
    <div className={`mt-8 grid gap-6 ${selected.length > 1 ? "sm:grid-cols-2" : "max-w-3xl"}`} data-section-photo-placement>
      {selected.map(photo => <SectionPhotograph key={photo.sourceId} photo={photo} locale={locale} compact />)}
    </div>
  );
}
