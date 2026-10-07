import { ArrowRight, MessageCircle, PhoneCall } from "lucide-react";
import Link from "next/link";
import { heroBadges, site, whatsappUrl } from "@/data/site";
import { HomeHeroSlideshow } from "./HomeHeroSlideshow";
import styles from "./Home.module.css";

export function HomeSignatureHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <HomeHeroSlideshow>
        <div className={`container-pad ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Emitronix Contracting LLC · Dubai, UAE</p>
            <h1 id="home-title" className={styles.heroTitle}>
              Construction Company <span>in Dubai</span>
            </h1>
            <p className={styles.heroText}>
              Emitronix Contracting LLC is a construction company in Dubai delivering
              residential, commercial, industrial, and civil construction solutions
              across the UAE. As a reliable building contractor in Dubai, we handle
              project planning, construction, coordination, and handover based on
              each client&apos;s requirements.
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
          <nav className={styles.heroServices} aria-label="Construction capabilities">
            {heroBadges.map(({ title, label, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <Icon aria-hidden="true" strokeWidth={1.5} />
                <span><strong>{title}</strong><span>{label}</span></span>
              </Link>
            ))}
          </nav>
        </div>
      </HomeHeroSlideshow>
    </section>
  );
}
