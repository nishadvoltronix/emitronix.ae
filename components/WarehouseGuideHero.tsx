import { ArrowRight, Building2, ClipboardCheck, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import type { GeneratedImageAsset } from "@/data/generatedImages";
import type { WarehouseAuthorityPage } from "@/data/warehouseSeo";
import { whatsappUrl } from "@/data/site";
import styles from "./WarehouseGuideHero.module.css";

const metrics = [
  { value: "Dubai", label: "Primary warehouse market", icon: MapPin },
  { value: "DM / DCD / DEWA", label: "Authority visibility", icon: ShieldCheck },
  { value: "Civil + MEP", label: "Coordinated interfaces", icon: Building2 },
  { value: "Handover", label: "Completion-focused planning", icon: ClipboardCheck },
];

/** Editorial introduction for the warehouse guide routes only. */
export function WarehouseGuideHero({ page, image }: { page: WarehouseAuthorityPage; image: GeneratedImageAsset }) {
  return (
    <header className={styles.header}>
      <div className="container-pad">
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span aria-hidden="true">/</span><Link href="/warehouse-construction">Warehouse Construction</Link></li>
            <li><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></li>
          </ol>
        </nav>

        <div className={styles.introduction}>
          <div>
            <p className="premium-kicker">{page.category}</p>
            <h1 className={styles.title}>{page.h1}</h1>
            <p className={styles.description}>{page.excerpt}</p>
            <div className={styles.actions}>
              <Link href="/contact" className="premium-button">Request Warehouse Support <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href={whatsappUrl} className="premium-button-light">WhatsApp Team <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>

          <figure className={styles.figure}>
            <ResponsiveIllustrativeImage
              asset={image}
              quality={65}
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 320px, calc(100vw - 32px)"
              className={styles.image}
              imageStyle={{ height: "100%", objectFit: "cover" }}
              ariaDescribedBy="warehouse-guide-illustration-caption"
            />
            <figcaption id="warehouse-guide-illustration-caption" className={styles.caption}>
              Illustrative image for general context, not a project photograph or a technical drawing.
            </figcaption>
          </figure>
        </div>

        <dl className={styles.metrics}>
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label}>
                <dt><Icon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            );
          })}
        </dl>

        <aside className={styles.planning} aria-label="Project planning summary">
          <p><strong>Project planning summary</strong> Civil, MEP, approval and fit-out questions to align before site execution.</p>
          <ul>
            <li>Project-specific authority check</li>
            <li>Documented scope boundaries</li>
            <li>Handover planning</li>
          </ul>
        </aside>
      </div>
    </header>
  );
}
