import { CalendarClock, FileCheck2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { site } from "@/data/site";
import {
  managementVerificationNotice,
  trustContentLastReviewedIso,
  trustContentLastReviewedLabel,
} from "@/data/trustCenter";

type ContentReviewRecordProps = {
  title?: string;
  reviewScope?: string;
  showVerificationTodo?: boolean;
};

export function ContentReviewRecord({
  title = "Content ownership and review record",
  reviewScope = "General editorial review for scope clarity, factual boundaries and website consistency. This is not a project-specific design, authority approval or formal engineering review.",
  showVerificationTodo = true,
}: ContentReviewRecordProps) {
  return (
    <section className="bg-white py-10" aria-labelledby="content-review-record-heading">
      <div className="container-pad">
        <div className="rounded-[1.75rem] border border-brand/[0.14] bg-brand-soft p-6 shadow-panel lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="premium-kicker">Content record</p>
              <h2 id="content-review-record-heading" className="mt-3 text-3xl font-black tracking-tight text-charcoal">
                {title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-steel">
                Clear ownership and review boundaries help readers distinguish public company information from project-specific professional advice.
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand/[0.12] bg-white p-5">
                <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
                  <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                  Editorial owner
                </dt>
                <dd className="mt-3 text-sm font-bold leading-7 text-charcoal">{site.legalName}</dd>
              </div>
              <div className="rounded-2xl border border-brand/[0.12] bg-white p-5">
                <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  Last reviewed
                </dt>
                <dd className="mt-3 text-sm font-bold leading-7 text-charcoal">
                  <time dateTime={trustContentLastReviewedIso}>{trustContentLastReviewedLabel}</time>
                </dd>
              </div>
              <div className="rounded-2xl border border-brand/[0.12] bg-white p-5 sm:col-span-2">
                <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Review scope
                </dt>
                <dd className="mt-3 text-sm leading-7 text-charcoal">
                  {reviewScope}
                  {showVerificationTodo ? (
                    <p className="mt-3 text-sm font-bold leading-7 text-amber-800">
                      TODO — named technical reviewer, verified credentials and review scope: {managementVerificationNotice}
                    </p>
                  ) : null}
                </dd>
              </div>
            </dl>
          </div>

          <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-black" aria-label="Content governance policies">
            <Link href="/editorial-policy" className="text-brand underline underline-offset-4">
              Editorial policy
            </Link>
            <Link href="/technical-review-policy" className="text-brand underline underline-offset-4">
              Technical review policy
            </Link>
            <Link href="/corrections-policy" className="text-brand underline underline-offset-4">
              Corrections policy
            </Link>
            <Link href="/disclaimer" className="text-brand underline underline-offset-4">
              Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
