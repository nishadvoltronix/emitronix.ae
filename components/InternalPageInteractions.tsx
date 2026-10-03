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
    let sectionObserver: IntersectionObserver | undefined;
    let targets: HTMLElement[] = [];
    let sectionLinks: HTMLAnchorElement[] = [];
    let sectionNavCleanups: Array<() => void> = [];
    let frame = 0;
    const seen = new WeakSet<HTMLElement>();

    const clear = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      sectionObserver?.disconnect();
      sectionNavCleanups.forEach((cleanup) => cleanup());
      sectionNavCleanups = [];
      targets.forEach((target) => {
        target.removeAttribute("data-internal-reveal");
        target.style.removeProperty("--internal-reveal-delay");
      });
      sectionLinks.forEach((link) => link.removeAttribute("aria-current"));
    };

    const prepareSectionNavigation = () => {
      const navs = Array.from(root.querySelectorAll<HTMLElement>("[data-internal-section-nav]"));
      sectionLinks = navs.flatMap((nav) =>
        Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')),
      );
      const sections = Array.from(new Set(sectionLinks
        .map((link) => {
          const id = decodeURIComponent(link.hash.slice(1));
          return id ? document.getElementById(id) : null;
        })
        .filter((section): section is HTMLElement => Boolean(section) && root.contains(section))));

      if (!sectionLinks.length || !sections.length) return;

      const setActive = (id: string) => {
        sectionLinks.forEach((link) => {
          if (decodeURIComponent(link.hash.slice(1)) === id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      };
      const hashId = decodeURIComponent(window.location.hash.slice(1));
      setActive(sections.some((section) => section.id === hashId) ? hashId : sections[0].id);
      sectionLinks.forEach((link) => {
        const onClick = () => setActive(decodeURIComponent(link.hash.slice(1)));
        link.addEventListener("click", onClick);
        sectionNavCleanups.push(() => link.removeEventListener("click", onClick));
      });

      const visible = new Map<string, number>();
      sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target.id, Math.abs(entry.boundingClientRect.top));
          else visible.delete(entry.target.id);
        });
        const active = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
        if (active) setActive(active);
      }, { threshold: 0.01, rootMargin: "-22% 0px -68% 0px" });
      sections.forEach((section) => sectionObserver?.observe(section));
    };

    const prepare = () => {
      clear();
      prepareSectionNavigation();
      if (motion.matches) return;

      // Let native route/anchor scroll restoration finish before checking the fold.
      frame = requestAnimationFrame(() => {
        const photos = Array.from(root.querySelectorAll<HTMLElement>("figure[data-section-photograph]")).slice(0, 6);
        const steps = Array.from(root.querySelectorAll<HTMLElement>("section ol > li, section article.luxury-card"))
          .filter((element) => /^\d{2}$/.test(element.firstElementChild?.textContent?.trim() ?? ""))
          .slice(0, 6);
        const selectedCards = Array.from(root.querySelectorAll<HTMLElement>("[data-internal-reveal-item]"))
          .slice(0, 8);

        // No article text, headings, hero content, forms or links wait for JavaScript.
        targets = Array.from(new Set([...photos, ...steps, ...selectedCards])).filter((target) =>
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
              const group = target.closest<HTMLElement>("[data-internal-reveal-group]");
              const siblings = group
                ? Array.from(group.querySelectorAll<HTMLElement>("[data-internal-reveal-item]"))
                : [];
              const order = Math.max(0, siblings.indexOf(target));
              target.style.setProperty("--internal-reveal-delay", `${Math.min(order, 3) * 45}ms`);
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
