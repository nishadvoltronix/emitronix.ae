"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Optional polish only: the server HTML and every reveal target stay visible. */
export function InternalPageInteractions() {
  const marker = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const scope = '[data-page-design="internal"]';
    const root = marker.current?.closest<HTMLElement>(scope);
    if (!root || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let targets: HTMLElement[] = [];
    let frame = 0;
    const seen = new WeakSet<HTMLElement>();

    const clear = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      targets.forEach((target) => target.removeAttribute("data-internal-reveal"));
    };

    const prepare = () => {
      clear();
      if (motion.matches) return;

      // Let native route/anchor scroll restoration finish before checking the fold.
      frame = requestAnimationFrame(() => {
        const photos = Array.from(root.querySelectorAll<HTMLElement>("figure[data-section-photograph]")).slice(0, 4);
        const steps = Array.from(root.querySelectorAll<HTMLElement>("section ol > li, section article.luxury-card"))
          .filter((element) => /^\d{2}$/.test(element.firstElementChild?.textContent?.trim() ?? ""))
          .slice(0, 4);

        // No article text, headings, hero content, forms or links wait for JavaScript.
        targets = [...photos, ...steps].filter((target) =>
          target.closest(scope) === root
          && !target.closest("details:not([open])")
          && !seen.has(target)
          && target.getBoundingClientRect().top > window.innerHeight + 16,
        );
        if (!targets.length) return;

        let remaining = targets.length;
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const target = entry.target as HTMLElement;
            observer?.unobserve(target);
            seen.add(target);
            remaining -= 1;
            // A keyboard focus or anchor jump takes priority over entrance motion.
            if (!motion.matches && entry.boundingClientRect.top >= 0 && !target.contains(document.activeElement)) {
              target.setAttribute("data-internal-reveal", "enter");
            }
          });
          if (remaining === 0) observer?.disconnect();
        }, { threshold: 0.12, rootMargin: "0px 0px -20px 0px" });
        targets.forEach((target) => observer?.observe(target));
      });
    };

    prepare();
    motion.addEventListener("change", prepare);
    return () => {
      clear();
      motion.removeEventListener("change", prepare);
    };
  }, [pathname]);

  return <span ref={marker} hidden aria-hidden="true" data-internal-interactions="" />;
}
