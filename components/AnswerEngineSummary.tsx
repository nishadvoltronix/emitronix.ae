import { formatHeading } from "@/lib/headings";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type AnswerEngineSummaryProps = {
  eyebrow?: string;
  question: string;
  answer: string;
  facts: string[];
  cta?: {
    label: string;
    href: string;
  };
};

export function AnswerEngineSummary({
  eyebrow = "Direct answer",
  question,
  answer,
  facts,
  cta,
}: AnswerEngineSummaryProps) {
  return (
    <section className="bg-white py-8">
      <div className="container-pad">
        <article className="luxury-surface rounded-[2rem] p-6 shadow-panel lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <p className="premium-kicker">{eyebrow}</p>
              <h2 className="mt-4 text-balance text-3xl font-black tracking-tight text-charcoal sm:text-4xl">
                {formatHeading(question)}
              </h2>
              <p className="mt-5 text-base font-bold leading-8 text-steel sm:text-lg">{answer}</p>
              {cta ? (
                <Link href={cta.href} className="premium-button mt-6">
                  {cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <div className="grid gap-3">
              {facts.map((fact) => (
                <div key={fact} className="flex gap-3 rounded-2xl border border-brand/[0.12] bg-white p-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand" />
                  <p className="text-sm font-bold leading-7 text-charcoal">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
