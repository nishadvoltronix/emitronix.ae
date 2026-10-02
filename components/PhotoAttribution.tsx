export type PhotoAttributionDetails = {
  credit: string;
  sourceUrl: string;
  licenseUrl: string;
  locale?: "en" | "ar";
};

/** Source links belong to the photograph, never to a claim about our projects. */
export function PhotoAttribution({ credit, sourceUrl, licenseUrl, locale = "en" }: PhotoAttributionDetails) {
  return (
    <span className="ms-2 inline-flex flex-wrap gap-x-2" data-photo-attribution>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 focus-ring">
        {credit}
      </a>
      <span aria-hidden="true">·</span>
      <a href={licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 focus-ring">
        {locale === "ar" ? "الترخيص" : "License"}
      </a>
    </span>
  );
}
