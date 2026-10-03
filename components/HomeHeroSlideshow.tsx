"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { homeHeroSlides } from "@/data/homeHeroSlides";
import styles from "./Home.module.css";

const SLIDE_DURATION = 5000;
const FADE_DURATION = 500;

export function HomeHeroSlideshow({ children }: { children: ReactNode }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [readySlides, setReadySlides] = useState<number[]>([]);
  const [requestedSlides, setRequestedSlides] = useState<number[]>([0]);
  const [failedSlides, setFailedSlides] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const isRotating = isPlaying && isDocumentVisible && readySlides.some((index) => index !== activeSlide);

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
    if (!isPlaying || !isDocumentVisible) return;
    if (!readySlides.includes(activeSlide) && !failedSlides.includes(activeSlide)) return;

    for (let offset = 1; offset < homeHeroSlides.length; offset += 1) {
      const next = (activeSlide + offset) % homeHeroSlides.length;
      if (failedSlides.includes(next)) continue;
      setRequestedSlides((requested) => requested.includes(next) ? requested : [...requested, next]);
      break;
    }
  }, [activeSlide, failedSlides, isDocumentVisible, isPlaying, readySlides]);

  useEffect(() => {
    if (!isRotating) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => {
        for (let offset = 1; offset < homeHeroSlides.length; offset += 1) {
          const next = (current + offset) % homeHeroSlides.length;
          if (readySlides.includes(next)) return next;
        }
        return current;
      });
    }, SLIDE_DURATION + FADE_DURATION);
    return () => window.clearInterval(timer);
  }, [isRotating, readySlides]);

  return (
    <div
      className={styles.heroStage}
      role="region"
      aria-roledescription="carousel"
      aria-label="Construction and architecture imagery"
      data-active-slide={activeSlide}
      data-playing={isPlaying}
      data-motion-playing={isRotating}
      data-reduced-motion={reducedMotion}
    >
      <div className={styles.heroSlides}>
        {homeHeroSlides.map((slide, index) => (
          <div
            key={slide.src}
            className={`${styles.heroSlide} ${index === activeSlide ? styles.heroSlideActive : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${homeHeroSlides.length}: ${slide.label}`}
            aria-hidden={index !== activeSlide}
          >
            {requestedSlides.includes(index) && <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 1600px) 1600px, 100vw"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              quality={65}
              style={{ objectPosition: slide.position }}
              onLoad={() => setReadySlides((ready) => ready.includes(index) ? ready : [...ready, index])}
              onError={() => setFailedSlides((failed) => failed.includes(index) ? failed : [...failed, index])}
            />}
          </div>
        ))}
      </div>
      <div className={styles.heroBackdrop} aria-hidden="true" />
      <div className={styles.heroContent}>{children}</div>
      <p className={styles.heroImageNote}>Representative construction photography</p>
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
