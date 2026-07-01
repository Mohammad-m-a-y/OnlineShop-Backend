"use client";



import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getSliders } from "@/services/slider.service";
import styles from "./HeroSlider.module.css";



export default function HeroSlider() {

  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);


 
  useEffect(() => {
    
    async function loadSlides() {
      try {
        const data = await getSliders();
        const active = (data.items ?? []).filter((s) => s.is_active).sort((a, b) => a.display_order - b.display_order);  

        setSlides(active);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSlides();
  }, []);

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  }

  useEffect(() => {
    if (slides.length < 2) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [slides]);

  function handleManualNav(index) {
    setCurrent((index + slides.length) % slides.length);
    resetTimer();
  }

 
  if (loading) {
    return <div className={styles.skeleton} />;
  }


  if (slides.length === 0) {
    return null;
  }

  return (
    <section className={styles.slider} aria-roledescription="carousel">
      <div className={styles.track}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === current ? styles.activeSlide : ""}`}
            aria-hidden={index !== current}
          >
            {/* تصویر بک‌گراند */}
            <img
              src={slide.full_image_url}
              alt={slide.title}
              className={styles.slideImage}
            />
            <div className={styles.slideOverlay} />

            {/* محتوا */}
            <div className={styles.slideContent}>
              {slide.title && <h2 className={styles.slideTitle}>{slide.title}</h2>}
              {slide.description && <p className={styles.slideSubtitle}>{slide.description}</p>}
              {slide.link_url && (
                <Link href={slide.link_url} className={styles.slideCta}>
                  {slide.button_text || "مشاهده بیشتر"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" transform="rotate(180 12 12)"/>
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* دکمه‌های ناوبری — فقط اگه بیش از یه اسلاید داریم */}
      {slides.length > 1 && (
        <>
          <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={() => handleManualNav(current - 1)} aria-label="اسلاید قبلی">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button className={`${styles.navBtn} ${styles.navNext}`} onClick={() => handleManualNav(current + 1)} aria-label="اسلاید بعدی">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className={styles.dots}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === current ? styles.activeDot : ""}`}
                onClick={() => handleManualNav(index)}
                aria-label={`رفتن به اسلاید ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}