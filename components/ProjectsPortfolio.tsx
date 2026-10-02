"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  Factory,
  FileCheck2,
  Filter,
  Gauge,
  Hammer,
  HardHat,
  Home,
  Landmark,
  MapPin,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Warehouse,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import { getGeneratedImage } from "@/data/generatedImages";
import {
  portfolioProjects,
  projectFilters,
  testimonialThemes,
  type ProjectCategory,
  type ProjectFilter,
} from "@/data/projects";

const filterIcons: Record<ProjectFilter, LucideIcon> = {
  All: Filter,
  "Civil Works": Hammer,
  "MEP Works": Zap,
  "Interior Fit-Out": Landmark,
  "Commercial Renovation": Sparkles,
  Maintenance: Wrench,
  "Authority Approvals": BadgeCheck,
};

const projectIcons: Record<ProjectCategory, LucideIcon> = {
  "Civil Works": Factory,
  "MEP Works": Gauge,
  "Interior Fit-Out": Landmark,
  "Commercial Renovation": Sparkles,
  Maintenance: Wrench,
  "Authority Approvals": ShieldCheck,
};

const projectSpecificIcons: Record<string, LucideIcon> = {
  "Villa Renovation Works - Dubai": Home,
  "Warehouse Civil & MEP Upgrade - Dubai": Warehouse,
  "Office Fit-Out Works - Business Bay": Landmark,
  "Building Maintenance Works - Al Quoz": Wrench,
  "DEWA Approval Support Works - Dubai": FileCheck2,
  "Commercial Shop Renovation - Jumeirah": Sparkles,
  "Industrial Facility Modification - JAFZA": Factory,
  "MEP Coordination Works - Dubai South": Gauge,
  "Authority Approval & NOC Support - Dubai": ShieldCheck,
  "Civil Repair & Maintenance Works - Dubai": HardHat,
};

export function ProjectsPortfolio() {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("All");

  const visibleProjects = useMemo(
    () => portfolioProjects.filter((project) => activeFilter === "All" || project.category === activeFilter),
    [activeFilter],
  );

  return (
    <section className="section-pad bg-white">
      <div className="container-pad">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="premium-kicker">Scope planning library</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-charcoal sm:text-5xl">
              Illustrative Dubai project-planning scenarios.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-steel">
              Explore common civil, MEP, fit-out, renovation, maintenance and approval-coordination situations. These cards are educational examples, not completed-project claims, client work or case studies.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end" role="group" aria-label="Filter planning scenarios by category">
            {projectFilters.map((filter) => {
              const Icon = filterIcons[filter];
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-wide transition duration-500 focus-ring sm:px-5 ${
                    isActive
                      ? "scale-[1.02] border-brand bg-brand text-white shadow-blue"
                      : "border-brand/20 bg-white/80 text-brand shadow-sm backdrop-blur-xl hover:translate-y-0 hover:border-brand/40 hover:bg-brand-soft"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-y border-brand/10 py-4">
          <p className="text-sm font-bold text-steel">
            Showing <span className="text-brand">{visibleProjects.length}</span> illustrative scenarios
          </p>
          <Link href="/contact" className="hidden items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand transition hover:text-brand-deep sm:inline-flex">
            Start a similar project <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project, index) => {
            const Icon = projectSpecificIcons[project.title] ?? projectIcons[project.category];
            const image = getGeneratedImage(project.generatedImage);

            return (
              <article
                key={`${activeFilter}-${project.title}`}
                className="group premium-reveal relative flex min-h-[610px] flex-col overflow-hidden rounded-lg border border-brand/10 bg-white/85 shadow-none backdrop-blur-xl transition duration-500 hover:translate-y-0 hover:border-brand/30 hover:bg-white hover:shadow-none"
                style={{ animationDelay: `${Math.min(index, 5) * 55}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <ResponsiveIllustrativeImage
                    asset={image}
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                    className="absolute inset-0 block h-full w-full"
                    imageClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    imageStyle={{ height: "100%", objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/78 via-brand-dark/18 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/30 bg-white/85 text-brand shadow-sm backdrop-blur-xl transition duration-500 group-hover:bg-brand group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand shadow-sm backdrop-blur-xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">{project.category}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-charcoal">{project.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-steel">{project.description}</p>

                  <div className="mt-6 grid gap-3">
                    <div className="flex gap-3 rounded-lg border border-brand/[0.12] bg-brand-soft/90 p-4">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">Planning context</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-charcoal">{project.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white/80 p-4 backdrop-blur-xl">
                      <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">Scope of work</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-charcoal">{project.scope}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg border border-brand/[0.12] bg-white/80 p-4 backdrop-blur-xl">
                      <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">Status</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-charcoal">
                          {project.title} <span aria-hidden="true">—</span> {project.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href="/contact" className="premium-button-light mt-auto w-full">
                    Discuss Similar Scope <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ProjectTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTheme = testimonialThemes[activeIndex];

  const goToPrevious = () => setActiveIndex((current) => (current === 0 ? testimonialThemes.length - 1 : current - 1));
  const goToNext = () => setActiveIndex((current) => (current + 1) % testimonialThemes.length);

  return (
    <section className="blue-grid section-pad text-charcoal">
      <div className="container-pad">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="premium-kicker">Client testimonial slider</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-charcoal sm:text-5xl">
              Publication-safe client priorities.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-steel">
              Public reviews and client quotes require approval before publishing. This slider shows representative client priorities that shape construction, renovation, approval and maintenance conversations in Dubai.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-brand/[0.15] bg-white/[0.82] p-6 shadow-none backdrop-blur-2xl sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-bright to-brand-sky" />
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-brand text-white shadow-blue">
                <MessageSquareQuote className="h-7 w-7" />
              </span>
              <div key={activeTheme.title} className="premium-reveal">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">{activeTheme.role}</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">{activeTheme.title}</h3>
                <p className="mt-5 text-lg font-medium leading-9 text-steel">{activeTheme.text}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2" aria-label="Choose testimonial theme">
                {testimonialThemes.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    aria-label={`Show ${item.title}`}
                    aria-current={activeIndex === index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 focus-ring ${
                      activeIndex === index ? "w-10 bg-brand" : "w-2.5 bg-brand/25 hover:bg-brand/50"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="grid h-12 w-12 place-items-center rounded-full border border-brand/20 bg-white text-brand shadow-sm transition hover:translate-y-0 hover:bg-brand hover:text-white focus-ring"
                  aria-label="Previous testimonial theme"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="grid h-12 w-12 place-items-center rounded-full border border-brand/20 bg-white text-brand shadow-sm transition hover:translate-y-0 hover:bg-brand hover:text-white focus-ring"
                  aria-label="Next testimonial theme"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
