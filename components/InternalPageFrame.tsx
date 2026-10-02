import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { GeneratedImageAsset } from "@/data/generatedImages";
import type { Metric } from "@/components/Premium";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import { InternalPageInteractions } from "@/components/InternalPageInteractions";
import styles from "./InternalPage.module.css";
import { PhotoAttribution, type PhotoAttributionDetails } from "@/components/PhotoAttribution";

// Next streams resolved route HTML outside its loading boundary. Without script
// replay that content would remain hidden. Only expose this internal-page segment.
const internalNoScriptStyles = `
body:has(> div[hidden][id^="S:"] > [data-page-design="internal"]) { display: flex; flex-direction: column; }
body:has(> div[hidden][id^="S:"] > [data-page-design="internal"]) > main#main-content { min-height: 0; order: 1; }
body:has(> div[hidden][id^="S:"] > [data-page-design="internal"]) > main#main-content > section[role="status"] { display: none; }
body > div[hidden][id^="S:"]:has(> [data-page-design="internal"]) { display: block !important; order: 2; }
body:has(> div[hidden][id^="S:"] > [data-page-design="internal"]) > footer { order: 3; }
body:has(> div[hidden][id^="S:"] > [data-page-design="internal"]) > aside { order: 4; }
`;

/** Opt-in presentation for internal routes; the approved home does not use it. */
export function InternalPageFrame({
  children,
  className = "",
  lang,
  dir,
}: {
  children: ReactNode;
  className?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <div className={`${styles.page} ${className}`} lang={lang} dir={dir} data-page-design="internal" role="region" aria-label={lang?.startsWith("ar") ? "محتوى الصفحة" : "Page content"}>
      <noscript dangerouslySetInnerHTML={{ __html: `<style>${internalNoScriptStyles}</style>` }} />
      {children}
      <InternalPageInteractions />
    </div>
  );
}

export function InternalPageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  imageAsset,
  imageCaption,
  imageAttribution,
  imagePosition,
  primaryCta,
  secondaryCta,
  breadcrumbs = [],
  metrics = [],
  children,
  showPlanningSummary = true,
  breadcrumbLabel = "Breadcrumb",
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  imageAsset?: GeneratedImageAsset;
  imageCaption?: string;
  imageAttribution?: PhotoAttributionDetails;
  imagePosition?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  breadcrumbs?: Array<{ label: string; href?: string }>;
  metrics?: Metric[];
  children?: ReactNode;
  showPlanningSummary?: boolean;
  breadcrumbLabel?: string;
}) {
  return (
    <header className={styles.hero}>
      <div className={`${styles.heroStage}${imageCaption ? ` ${styles.photographicStage}` : ""}`}>
        {imageAsset ? (
          <ResponsiveIllustrativeImage
            asset={imageAsset}
            alt={imageAlt ?? imageAsset.alt}
            priority
            sizes="100vw"
            className={styles.heroImage}
            imageStyle={{ height: "100%", objectFit: "cover" }}
          />
        ) : image ? (
          <Image src={image} alt={imageAlt ?? ""} fill priority quality={imageCaption ? 65 : undefined} sizes="100vw" className={styles.heroImage} style={imagePosition ? { objectPosition: imagePosition } : undefined} />
        ) : null}
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`container-pad ${styles.heroContent}`}>
          {breadcrumbs.length > 0 ? (
            <nav aria-label={breadcrumbLabel} className={styles.heroBreadcrumbs}>
              <ol>
                {breadcrumbs.map((item, index) => (
                  <li key={`${item.label}-${index}`}>
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className={showPlanningSummary ? styles.heroLayout : styles.heroSolo}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1 className={styles.heroTitle}>{title}</h1>
              <p className={styles.heroDescription}>{description}</p>
              {primaryCta || secondaryCta ? (
                <div className={styles.actions}>
                  {primaryCta ? <Link href={primaryCta.href} className={styles.button}>{primaryCta.label}<ArrowRight aria-hidden="true" /></Link> : null}
                  {secondaryCta ? <Link href={secondaryCta.href} className={styles.buttonSecondary}>{secondaryCta.label}<ArrowRight aria-hidden="true" /></Link> : null}
                </div>
              ) : null}
              {children}
            </div>
            {showPlanningSummary ? <aside className={styles.planningSummary}>
              <p className={styles.eyebrow}>Project planning summary</p>
              <p className={styles.planningIntro}>Civil, MEP, approval and fit-out questions to align before site execution.</p>
              <ul>
                {["Project-specific authority check", "Documented scope boundaries", "Handover planning"].map((item) => (
                  <li key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></li>
                ))}
              </ul>
            </aside> : null}
          </div>
        </div>
      </div>
      {imageCaption ? <p className={`container-pad ${styles.imageCaption}`}>{imageCaption}{imageAttribution ? <PhotoAttribution {...imageAttribution} /> : null}</p> : null}
      {metrics.length > 0 ? (
        <div className={styles.metrics}>
          <div className={`container-pad ${styles.metricGrid}`}>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className={styles.metric}>
                  {Icon ? <Icon aria-hidden="true" /> : null}
                  <div><strong>{metric.value}</strong><span>{metric.label}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
