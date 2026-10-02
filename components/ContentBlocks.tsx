import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PremiumSectionHeading } from "./Premium";

export type FaqItem = {
  question: string;
  answer: string;
};

export type InsightItem = {
  title: string;
  description: string;
  icon?: LucideIcon;
  href?: string;
  label?: string;
};

export function ProcessRail({
  eyebrow,
  title,
  description,
  steps,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  steps: string[];
}) {
  return (
    <section className="section-pad bg-white">
      <div className="container-pad">
        <PremiumSectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step} className="luxury-card rounded-[1.5rem] p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-sm font-black text-white shadow-blue">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-5 text-sm font-bold leading-7 text-charcoal">{step}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InsightGrid({
  eyebrow,
  title,
  description,
  items,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  items: InsightItem[];
  tone?: "light" | "soft";
}) {
  return (
    <section className={`section-pad ${tone === "soft" ? "soft-section" : "bg-white"}`}>
      <div className="container-pad">
        <PremiumSectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon ?? CheckCircle2;
            const content = (
              <>
                <Icon className="h-8 w-8 text-brand" />
                <h2 className="mt-5 text-2xl font-black tracking-tight text-charcoal">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-steel">{item.description}</p>
                {item.href ? (
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-brand">
                    {item.label ?? "Explore"} <ArrowRight className="h-4 w-4" />
                  </span>
                ) : null}
              </>
            );

            return item.href ? (
              <Link key={item.title} href={item.href} className="luxury-card rounded-[1.5rem] p-6">
                {content}
              </Link>
            ) : (
              <article key={item.title} className="luxury-card rounded-[1.5rem] p-6">
                {content}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TrustBar({
  eyebrow,
  title,
  points,
}: {
  eyebrow: string;
  title: string;
  points: Array<string | { label: string; href: string }>;
}) {
  return (
    <section className="bg-white py-10">
      <div className="container-pad">
        <div className="luxury-surface grid gap-6 rounded-[2rem] p-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:p-8">
          <div>
            <p className="premium-kicker">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-charcoal sm:text-4xl">{title}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {points.map((point) => {
              const label = typeof point === "string" ? point : point.label;
              const className = "flex items-center gap-3 rounded-2xl border border-brand/[0.12] bg-white p-4 shadow-sm";
              const content = (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
                  <span className="text-sm font-black text-charcoal">{label}</span>
                </>
              );

              return typeof point === "string" ? (
                <div key={label} className={className}>{content}</div>
              ) : (
                <a key={label} href={point.href} className={`${className} transition hover:border-brand/30 hover:bg-brand-soft focus-ring`}>
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQSection({
  eyebrow = "FAQ",
  title,
  description,
  faqs,
  schema = false,
  accordion = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  faqs: FaqItem[];
  schema?: boolean;
  accordion?: boolean;
}) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="section-pad soft-section">
      <div className="container-pad">
        <PremiumSectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
        <div className={accordion ? "mt-8 grid items-start gap-4 md:grid-cols-2" : "mt-12 grid gap-5 md:grid-cols-2"}>
          {faqs.map((faq) => (
            accordion ? <details key={faq.question} className="luxury-card rounded-lg p-5">
              <summary className="cursor-pointer text-brand">
                <h3 className="inline text-lg font-semibold leading-7 text-charcoal">{faq.question}</h3>
              </summary>
              <p className="mt-4 text-sm leading-7 text-steel">{faq.answer}</p>
            </details> : <article key={faq.question} className="luxury-card rounded-[1.5rem] p-6">
              <h3 className="text-xl font-black tracking-tight text-charcoal">{faq.question}</h3>
              <p className="mt-4 text-sm leading-7 text-steel">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}
    </section>
  );
}
