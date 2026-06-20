"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./HeroSlider.module.css";

// محتوای اسلایدها — فعلاً ثابت، بعداً می‌توان از یک API بنر جایگزین کرد
const slides = [
  {
    id: 1,
    title: "جشنواره تخفیف تابستانه",
    subtitle: "تا ۴۰٪ تخفیف روی منتخب محصولات الکترونیکی",
    ctaText: "مشاهده محصولات",
    ctaHref: "/products",
    gradient: "linear-gradient(135deg, #0f3460 0%, #1a5276 60%, #00b4d8 100%)",
  },
  {
    id: 2,
    title: "ارسال رایگان",
    subtitle: "برای خریدهای بالای ۵۰۰ هزار تومان، در سراسر کشور",
    ctaText: "شروع خرید",
    ctaHref: "/products",
    gradient: "linear-gradient(135deg, #00b4d8 0%, #0891b2 50%, #0f3460 100%)",
  },
  {
    id: 3,
    title: "محصولات جدید رسید",
    subtitle: "جدیدترین گجت‌ها و لوازم الکترونیکی روز دنیا",
    ctaText: "کشف کنید",
    ctaHref: "/products",
    gradient: "linear-gradient(135deg, #1a2e4a 0%, #0f3460 50%, #164e63 100%)",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  function goTo(index) {
    setCurrent((index + slides.length) % slides.length);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  }

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  function handleManualNav(index) {
    goTo(index);
    resetTimer();
  }

  return (
    <section className={styles.slider} aria-roledescription="carousel">
      <div className={styles.track}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === current ? styles.activeSlide : ""}`}
            style={{ background: slide.gradient }}
            aria-hidden={index !== current}
          >
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>{slide.title}</h2>
              <p className={styles.slideSubtitle}>{slide.subtitle}</p>
              <Link href={slide.ctaHref} className={styles.slideCta}>
                {slide.ctaText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" transform="rotate(180 12 12)"/>
                </svg>
              </Link>
            </div>
            <div className={styles.slidePattern} />
          </div>
        ))}
      </div>

      {/* دکمه‌های قبلی/بعدی */}
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

      {/* نشانگرهای نقطه‌ای */}
      <div className={styles.dots}>
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`${styles.dot} ${index === current ? styles.activeDot : ""}`}
            onClick={() => handleManualNav(index)}
            aria-label={`رفتن به اسلاید ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}