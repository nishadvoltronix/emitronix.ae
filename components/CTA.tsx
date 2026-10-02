import { ArrowRight, BadgeCheck, CalendarCheck, Clock, MessageCircle, PhoneCall, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { site, trustPillars, whatsappUrl } from "@/data/site";

const icons = [Users, Clock, ShieldCheck, BadgeCheck];

export function CTA() {
  const phoneHref = site.phoneHref;

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div className="container-pad">
        <div className="relative overflow-hidden rounded-lg border border-brand/[0.15] bg-brand-pale px-6 py-12 text-charcoal shadow-none sm:px-10 lg:px-14 lg:py-16">
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">Start a project</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
                Get a quote, request a site visit or speak to Emitronix today.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-steel">
                Share the project location, scope, drawings and authority status. These facts allow the first review to identify the next civil, fit-out, renovation, warehouse, villa or approval action.
              </p>
            </div>
            <div>
              <div className="grid gap-3 sm:grid-cols-2">
                {trustPillars.map((item, index) => {
                  const Icon = icons[index];
                  return (
                    <div key={item} className="rounded-lg border border-brand/[0.12] bg-white/[0.82] p-4 shadow-sm backdrop-blur-xl">
                      <Icon className="h-6 w-6 text-brand" />
                      <span className="mt-3 block text-sm font-semibold uppercase tracking-wide text-charcoal">{item}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Link href="/contact" className="premium-button">
                  Request a Quote <ArrowRight size={18} />
                </Link>
                <Link href="/contact?intent=site-visit" className="premium-button-light">
                  Request a Site Visit <CalendarCheck size={18} />
                </Link>
                <a href={phoneHref} className="premium-button-light">
                  Call Now <PhoneCall size={18} />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">
                  WhatsApp Us <MessageCircle size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
