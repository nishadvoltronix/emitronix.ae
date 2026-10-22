import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/data/site";
import { formatHeading } from "@/lib/headings";

type ProjectCardProps = {
  project: Project;
  compact?: boolean;
};

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white shadow-panel transition duration-500 hover:-translate-y-2 hover:border-brand/30 hover:shadow-luxe">
      <div className={compact ? "relative aspect-[16/10] overflow-hidden" : "relative aspect-[16/12] overflow-hidden"}>
        <Image
          src={project.image}
          alt={project.imageAlt}
          title={project.imageTitle}
          fill
          loading="lazy"
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/10 to-transparent" />
        <div className="absolute bottom-5 left-5 rounded-full border border-white/70 bg-white/[0.86] px-4 py-2 text-xs font-black uppercase tracking-wide text-brand shadow-sm backdrop-blur-xl">
          {project.location}
        </div>
      </div>
      <div className={compact ? "p-5 text-center" : "p-6"}>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">{project.category}</p>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-charcoal">{formatHeading(project.title)}</h3>
        {!compact ? (
          <>
            <p className="mt-3 text-sm leading-7 text-steel">{project.summary}</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-brand/[0.12] bg-brand-soft p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">Scope of work</p>
                <ul className="mt-3 grid gap-2 text-sm font-bold leading-6 text-charcoal">
                  {project.scopeOfWork.map((scope) => (
                    <li key={scope}>{scope}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-brand/[0.12] bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">Timeline</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-charcoal">{project.timeline}</p>
                </div>
                <div className="rounded-2xl border border-brand/[0.12] bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">Outcome</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-charcoal">{project.outcome}</p>
                </div>
              </div>
            </div>
            <Link href="/contact" className="premium-button-light mt-6 w-full">
              Discuss Similar Project <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : null}
      </div>
    </article>
  );
}
