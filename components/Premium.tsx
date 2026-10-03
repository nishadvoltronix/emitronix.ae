import { ArrowRight, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import type { GeneratedImageAsset } from "@/data/generatedImages";

type Cta = {
  label: string;
  href: string;
};

export type Metric = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function PremiumLink({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light" | "primary";
}) {
  const className =
    variant === "light"
      ? "premium-button-light"
      : variant === "primary"
        ? "premium-button"
        : "premium-button-light";

  return (
    <Link href={href} className={className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function PremiumSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-5xl`}>
      <p className="premium-kicker">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-4xl font-black leading-[1.02] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 max-w-3xl text-base leading-8 text-steel sm:text-lg ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  imageAsset,
  primaryCta,
  secondaryCta,
  breadcrumbs = [],
  metrics = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  imageAsset?: GeneratedImageAsset;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  metrics?: Metric[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-dark text-white">
      {imageAsset ? (
        <ResponsiveIllustrativeImage
          asset={imageAsset}
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 block h-full w-full"
          imageClassName="h-full w-full object-cover"
          imageStyle={{ height: "100%", objectFit: "cover" }}
        />
      ) : image ? (
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover"
        />
      ) : null}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(11,31,58,0.94)_0%,rgba(18,58,115,0.78)_47%,rgba(25,73,145,0.34)_100%)]" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(11,31,58,0.16)_0%,rgba(11,31,58,0.70)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-20 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute left-0 top-32 h-px w-2/3 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute bottom-24 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-sky/25 to-transparent" />
        <div className="absolute right-[14%] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block" />
      </div>
      <div className="container-pad relative z-30 grid min-h-[720px] gap-10 pt-32 lg:grid-cols-[0.94fr_0.72fr] lg:items-end lg:pb-24 lg:pt-40">
        <div className="z-10 max-w-5xl pb-12 lg:pb-0">
          {breadcrumbs.length > 0 ? (
            <nav className="mb-8 text-sm font-bold text-white/[0.78]" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                {breadcrumbs.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {item.href ? (
                      <Link href={item.href} prefetch={item.href === "/" || item.href === "/ar" ? false : undefined} className="transition hover:text-brand-sky">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-white" aria-current="page">{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <p className="text-xs font-black uppercase tracking-[0.32em] text-brand-sky">{eyebrow}</p>
          <h1 className="mt-6 text-balance text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-7xl lg:text-8xl">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-white/[0.86] sm:text-xl sm:leading-9">
            {description}
          </p>
          {(primaryCta || secondaryCta) ? (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primaryCta ? <PremiumLink href={primaryCta.href} variant="primary">{primaryCta.label}</PremiumLink> : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-brand focus-ring"
                >
                  {secondaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative z-10 hidden pb-12 lg:block">
          <div className="rounded-[2rem] border border-white/25 bg-white/[0.12] p-5 shadow-luxe backdrop-blur-2xl">
            <div className="rounded-[1.5rem] border border-white/20 bg-white/[0.82] p-5 text-charcoal shadow-panel">
              <p className="premium-kicker">Project planning summary</p>
              <p className="mt-3 text-2xl font-black tracking-tight text-charcoal">
                Civil, MEP, approval and fit-out questions to align before site execution.
              </p>
              <div className="mt-5 grid gap-2">
                {["Project-specific authority check", "Documented scope boundaries", "Handover planning"].map((item) => (
                  <span key={item} className="rounded-2xl border border-brand/[0.12] bg-brand-soft px-4 py-3 text-sm font-black text-charcoal">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {metrics.length > 0 ? (
        <div className="container-pad relative z-30 -mt-16 pb-12">
          <MetricRibbon metrics={metrics} />
        </div>
      ) : null}
    </section>
  );
}

export function CommandCenter({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{ label: string; value: string; description: string }>;
}) {
  return (
    <section className="blue-grid section-pad overflow-hidden text-charcoal">
      <div className="container-pad grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div>
          <PremiumSectionHeading eyebrow={eyebrow} title={title} description={description} />
        </div>
        <div className="relative rounded-[2rem] border border-brand/[0.15] bg-white/[0.82] p-4 shadow-luxe backdrop-blur-2xl">
          <div className="absolute left-6 right-6 top-6 h-px bg-gradient-to-r from-brand/[0.45] via-brand-border to-transparent" />
          <div className="grid gap-3 pt-8">
            {items.map((item, index) => (
              <article key={item.label} className="grid gap-4 rounded-[1.4rem] border border-brand/10 bg-white/90 p-5 shadow-sm md:grid-cols-[auto_0.65fr_1fr] md:items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-black text-white shadow-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">{item.label}</p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-charcoal">{item.value}</h3>
                </div>
                <p className="text-sm font-medium leading-7 text-steel">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MetricRibbon({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="luxury-surface grid overflow-hidden rounded-[1.75rem] sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className={`flex min-h-32 items-center gap-4 p-6 ${index > 0 ? "border-t border-brand/10 sm:border-l sm:border-t-0" : ""}`}>
            {Icon ? (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand/[0.15] bg-brand-soft text-brand shadow-sm">
                <Icon className="h-6 w-6" />
              </span>
            ) : null}
            <span>
              <span className="block text-3xl font-black tracking-tight text-brand">{metric.value}</span>
              <span className="mt-1 block text-sm font-bold leading-5 text-charcoal">{metric.label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <article key={feature.title} className="luxury-card rounded-[1.5rem] p-6">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-black tracking-tight text-charcoal">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-steel">{feature.description}</p>
          </article>
        );
      })}
    </div>
  );
}

export function ImagePanel({
  src,
  alt,
  asset,
  label,
  title,
}: {
  src?: string;
  alt?: string;
  asset?: GeneratedImageAsset;
  label: string;
  title: string;
}) {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-brand/[0.15] bg-smoke shadow-luxe">
      {asset ? (
        <ResponsiveIllustrativeImage
          asset={asset}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="absolute inset-0 block h-full w-full"
          imageClassName="h-full w-full object-cover"
          imageStyle={{ height: "100%", objectFit: "cover" }}
        />
      ) : src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/70 bg-white/[0.82] p-5 text-charcoal shadow-panel backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-brand">{label}</p>
        <h3 className="mt-3 text-3xl font-black tracking-tight">{title}</h3>
      </div>
    </div>
  );
}
