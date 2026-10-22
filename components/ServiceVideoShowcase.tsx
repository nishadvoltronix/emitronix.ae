"use client";

import { useEffect, useRef } from "react";
import { Layers3, ShieldCheck, Wrench } from "lucide-react";
import type { ServiceVideoAsset } from "@/data/serviceVideos";
import { formatHeading } from "@/lib/headings";

type ServiceVideoShowcaseProps = {
  asset: ServiceVideoAsset;
};

const highlightIcons = [Layers3, Wrench, ShieldCheck] as const;

export function ServiceVideoShowcase({ asset }: ServiceVideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  return (
    <section
      id="warehouse-video"
      className="section-pad scroll-mt-28 overflow-hidden bg-white"
      aria-labelledby="warehouse-video-title"
    >
      <div className="container-pad grid gap-12 lg:grid-cols-[0.95fr_0.68fr] lg:items-center">
        <div>
          <p className="premium-kicker">{asset.eyebrow}</p>
          <h2
            id="warehouse-video-title"
            className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-charcoal sm:text-5xl"
          >
            {formatHeading(asset.title)}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-steel">
            {asset.description}
          </p>

          <div className="mt-8 grid gap-4">
            {asset.highlights.map((highlight, index) => {
              const Icon = highlightIcons[index] ?? Layers3;

              return (
                <article
                  key={highlight.title}
                  className="rounded-[1.5rem] border border-brand/[0.12] bg-brand-soft p-5"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-charcoal">
                        {formatHeading(highlight.title)}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-steel">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        </div>

        <figure className="mx-auto w-full max-w-[29rem]">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-brand/[0.16] bg-brand-dark p-2 shadow-panel">
            <video
              ref={videoRef}
              controls
              loop
              muted
              playsInline
              preload="metadata"
              poster={asset.posterSrc}
              width={asset.width}
              height={asset.height}
              className="aspect-[9/16] w-full rounded-[1.8rem] bg-brand-dark object-cover"
              aria-label={asset.ariaLabel}
              aria-describedby="warehouse-video-caption"
            >
              <source src={asset.webmSrc} type="video/webm" />
              <source src={asset.mp4Src} type="video/mp4" />
              Your browser does not support embedded video.
            </video>
          </div>
          <figcaption
            id="warehouse-video-caption"
            className="px-2 pt-4 text-sm leading-7 text-steel"
          >
            {asset.caption}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
