"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { homeHeroSlides } from "@/data/homeHeroSlides";
import homeImageVariants from "@/data/homeImageVariants.json";
import styles from "./Home.module.css";

const SLIDE_DURATION = 5000;
const FADE_DURATION = 500;
const PORTRAIT_MEDIA = "(max-width: 479px)";
const WIDE_MEDIA = "(min-width: 480px)";

function imageSources(src: typeof homeHeroSlides[number]["src"], format: "avif" | "webp") {
  return homeImageVariants[src].wide.map((image) => `${image[format]} ${image.width}w`).join(", ");
}

function imageSizes(src: typeof homeHeroSlides[number]["src"]) {
  const { width, height } = homeImageVariants[src];
  // Cover images also need enough pixels for the hero's height, not just its
  // width. Desktop hero height is min(860px, 100svh); tablet is content-driven.
  const ratio = width / height;
  return `(max-width: 767px) 1200px, max(100vw, min(${Math.ceil(860 * ratio)}px, ${Math.ceil(100 * ratio)}svh))`;
}

export function HomeHeroSlideshow({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [slideState, setSlideState] = useState<{ active: number; previous: number | null }>({ active: 0, previous: null });
  const activeSlide = slideState.active;
  const [readySlides, setReadySlides] = useState<number[]>([]);
  const [requestedSlides, setRequestedSlides] = useState<number[]>([0]);
  const [failedSlides, setFailedSlides] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const isRotating = isPlaying && isDocumentVisible && isInView && readySlides.some((index) => index !== activeSlide);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    // Keep the visitor's play/pause preference while suspending background work
    // below the hero, including when browser history restores a scrolled page.
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      setReducedMotion(motion.matches);
      setIsPlaying(!motion.matches);
    };
    const onVisibilityChange = () => setIsDocumentVisible(!document.hidden);
    onMotionChange();
    onVisibilityChange();
    setHydrated(true);
    motion.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      motion.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // Opacity-hidden slides still count as in-viewport for native lazy loading.
    // Load only the next slide, after the current image, when rotation is wanted.
    // Keep the first image in server HTML, including for visitors without JS.
    if (!isPlaying || !isDocumentVisible || !isInView) return;
    if (!readySlides.includes(activeSlide) && !failedSlides.includes(activeSlide)) return;

    for (let offset = 1; offset < homeHeroSlides.length; offset += 1) {
      const next = (activeSlide + offset) % homeHeroSlides.length;
      if (failedSlides.includes(next)) continue;
      setRequestedSlides((requested) => requested.includes(next) ? requested : [...requested, next]);
      break;
    }
  }, [activeSlide, failedSlides, isDocumentVisible, isInView, isPlaying, readySlides]);

  useEffect(() => {
    if (!isRotating) return;

    const timer = window.setInterval(() => {
      setSlideState((current) => {
        for (let offset = 1; offset < homeHeroSlides.length; offset += 1) {
          const next = (current.active + offset) % homeHeroSlides.length;
          if (readySlides.includes(next)) return { active: next, previous: current.active };
        }
        return current;
      });
    }, SLIDE_DURATION + FADE_DURATION);
    return () => window.clearInterval(timer);
  }, [isRotating, readySlides]);

  useEffect(() => {
    if (slideState.previous === null) return;
    // Both visible photographs continue panning throughout the crossfade. Once
    // it ends, the hidden image no longer needs an active compositor animation.
    const timer = window.setTimeout(() => {
      setSlideState((current) => ({ ...current, previous: null }));
    }, FADE_DURATION);
    return () => window.clearTimeout(timer);
  }, [slideState.active, slideState.previous]);

  return (
    <div
      ref={stageRef}
      className={styles.heroStage}
      role="region"
      aria-roledescription="carousel"
      aria-label="Construction and architecture imagery"
      data-active-slide={activeSlide}
      data-playing={isPlaying}
      data-motion-playing={isRotating}
      data-reduced-motion={reducedMotion}
    >
      {/* Matching media/type preloads avoid an on-demand optimizer request and
          fetch only the displayed AVIF source. WebP remains the native fallback. */}
      <link rel="preload" as="image" type="image/avif" media={PORTRAIT_MEDIA}
        href={homeImageVariants[homeHeroSlides[0].src].portrait.avif} fetchPriority="high" />
      <link rel="preload" as="image" type="image/avif" media={WIDE_MEDIA}
        imageSrcSet={imageSources(homeHeroSlides[0].src, "avif")}
        imageSizes={imageSizes(homeHeroSlides[0].src)} fetchPriority="high" />
      <div className={styles.heroSlides}>
        {homeHeroSlides.map((slide, index) => (
          <div
            key={slide.src}
            className={`${styles.heroSlide} ${index === activeSlide ? styles.heroSlideActive : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${homeHeroSlides.length}: ${slide.label}`}
            aria-hidden={index !== activeSlide}
            data-motion-visible={index === activeSlide || index === slideState.previous}
          >
            {requestedSlides.includes(index) && <picture>
              <source media={PORTRAIT_MEDIA} type="image/avif" srcSet={homeImageVariants[slide.src].portrait.avif} />
              <source media={PORTRAIT_MEDIA} type="image/webp" srcSet={homeImageVariants[slide.src].portrait.webp} />
              <source type="image/avif" srcSet={imageSources(slide.src, "avif")} sizes={imageSizes(slide.src)} />
              {/* Pre-generated, content-hashed AVIF/WebP sources are already
                  optimized. next/image would add a redundant runtime transform. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={homeImageVariants[slide.src].wide.at(-1)!.webp}
                srcSet={imageSources(slide.src, "webp")}
                sizes={imageSizes(slide.src)}
                alt={slide.alt}
                width={homeImageVariants[slide.src].width}
                height={homeImageVariants[slide.src].height}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "low"}
                decoding="async"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectPosition: slide.position }}
                ref={(image) => {
                  // A cached native image can finish before React hydrates.
                  if (image?.complete) {
                    if (image.naturalWidth > 0) {
                      setReadySlides((ready) => ready.includes(index) ? ready : [...ready, index]);
                    } else {
                      setFailedSlides((failed) => failed.includes(index) ? failed : [...failed, index]);
                    }
                  }
                }}
                onLoad={() => setReadySlides((ready) => ready.includes(index) ? ready : [...ready, index])}
                onError={() => setFailedSlides((failed) => failed.includes(index) ? failed : [...failed, index])}
              />
            </picture>}
          </div>
        ))}
      </div>
      <div className={styles.heroBackdrop} aria-hidden="true" />
      <div className={styles.heroContent}>{children}</div>
      {hydrated && (
        <button
          type="button"
          className={styles.heroMotionControl}
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? "Pause background slideshow" : "Play background slideshow"}
        </button>
      )}
    </div>
  );
}
