import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { heroBadges } from "@/data/site";
import { HomeHeroImage } from "./HomeHeroImage";
import styles from "./Home.module.css";

export function HomeSignatureHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroStage}>
        <HomeHeroImage />
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={`container-pad ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Emitronix Contracting LLC · Dubai, UAE</p>
            <h1 id="home-title" className={styles.heroTitle}>
              Construction Company<br /><span>in Dubai.</span>
            </h1>
            <p className={styles.heroText}>
              From villas and commercial buildings to warehouses and civil works,
              we bring your project from planning to handover. Share your drawings
              and requirements with our Dubai team.
            </p>
            <div className={styles.actions}>
              <Link href="/contact" className={styles.button}>
                Request a Quote <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link href="/services" className={styles.buttonSecondary}>
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.heroServiceBand}>
        <nav className={`container-pad ${styles.heroServices}`} aria-label="Construction capabilities">
            {heroBadges.map(({ title, label, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <Icon aria-hidden="true" strokeWidth={1.5} />
                <span><strong>{title}</strong><span>{label}</span></span>
              </Link>
            ))}
        </nav>
      </div>
    </section>
  );
}
