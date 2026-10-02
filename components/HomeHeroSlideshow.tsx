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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const isRotating = isPlaying && isDocumentVisible && readySlides.length > 1;

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
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 1600px) 1600px, 100vw"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              quality={75}
              style={{ objectPosition: slide.position }}
              onLoad={() => setReadySlides((ready) => ready.includes(index) ? ready : [...ready, index])}
            />
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
