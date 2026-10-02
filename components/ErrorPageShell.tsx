import { InternalPageFrame } from "@/components/InternalPageFrame";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";

type ErrorPageShellProps = {
  code: "404" | "500";
  eyebrow: string;
  title: string;
  description: string;
  actions: ReactNode;
  locale?: "en" | "ar";
};

export function ErrorPageShell({
  code,
  eyebrow,
  title,
  description,
  actions,
  locale = "en",
}: ErrorPageShellProps) {
  const photos = getSectionPhotographs("/404", 5);
  return (
    <InternalPageFrame>
      <section
      className="internal-page-intro relative isolate overflow-hidden bg-brand-dark text-white"
      data-error-page={code}
      aria-labelledby={`error-${code}-title`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(70,145,255,0.34),transparent_34%),linear-gradient(135deg,#0b1f3a_0%,#123a73_52%,#194991_100%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-32 h-px w-2/3 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute bottom-24 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-sky/25 to-transparent" />
      </div>

      <div className="container-pad relative z-10 grid min-h-[78vh] content-center gap-10 py-28 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div className="max-w-4xl">
          <BrandLogo
            variant="reversed"
            className="mb-10 block"
            imageClassName="h-12 w-auto object-contain sm:h-14"
            sizes="(min-width: 640px) 240px, 206px"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-sky">
            {code} · {eyebrow}
          </p>
          <h1
            id={`error-${code}-title`}
            className="internal-page-title mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-7xl"
          >
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/[0.84]">
            {description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        </div>
        <SectionPhotograph photo={photos[0]} locale={locale} compact />
      </div>
      </section>
      <div className="container-pad grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {photos.slice(1).map(photo => <SectionPhotograph key={photo.sourceId} photo={photo} locale={locale} compact />)}
      </div>
    </InternalPageFrame>
  );
}
