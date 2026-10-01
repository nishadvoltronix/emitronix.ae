import { ArrowRight, Building2, FileCheck2, Layers3, MessageCircle, PhoneCall, Warehouse } from "lucide-react";
import Link from "next/link";
import { site, whatsappUrl } from "@/data/site";
import { HomeHeroSlideshow } from "./HomeHeroSlideshow";
import styles from "./Home.module.css";

const capabilities = [
  { label: "Civil & building construction", href: "/civil", icon: Building2 },
  { label: "Warehouses & industrial", href: "/warehouse-construction", icon: Warehouse },
  { label: "Interiors & renovation", href: "/interior", icon: Layers3 },
  { label: "Dubai authority support", href: "/approval", icon: FileCheck2 },
];

export function HomeSignatureHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <HomeHeroSlideshow>
        <div className="container-pad">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Emitronix Contracting LLC · Dubai, UAE</p>
            <h1 id="home-title" className={styles.heroTitle}>
              Construction Company <span>in Dubai</span>
            </h1>
            <p className={styles.heroText}>
              From the first drawing to the final handover. Civil construction,
              building contracting, warehouse and villa construction, commercial
              fit-out and Dubai authority approval support — coordinated around your project.
            </p>
            <div className={styles.actions}>
              <Link href="/contact" className={styles.button}>
                Get a Free Consultation <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/contact" className={styles.buttonSecondary}>
                Request a Quote <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.heroContact}>
              <a href={site.phoneHref}><PhoneCall aria-hidden="true" /> {site.phone}</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" /> WhatsApp our team
              </a>
            </div>
          </div>
        </div>
      </HomeHeroSlideshow>
      <div className="container-pad">
        <nav className={styles.scopeStrip} aria-label="Construction capabilities">
          {capabilities.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}><Icon aria-hidden="true" />{label}</Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
