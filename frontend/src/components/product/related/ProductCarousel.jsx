"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ProductCard from "@/components/product/ProductCard";
import styles from "./ProductCarousel.module.css";

export default function ProductCarousel({ title, products }) {
  const sliderRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // در RTL مرورگرهای مختلف scrollLeft ممکنه منفی یا مثبت باشه
    const scrollLeft = Math.abs(slider.scrollLeft);
    const maxScroll = slider.scrollWidth - slider.clientWidth;

    setCanScrollPrev(scrollLeft > 5);
    setCanScrollNext(scrollLeft < maxScroll - 5);
  }, []);

  function scrollSlider(direction) {
    const slider = sliderRef.current;
    if (!slider) return;

    const amount = slider.clientWidth * 0.75;

    // در RTL: "قبلی" یعنی به راست، "بعدی" یعنی به چپ
    slider.scrollBy({
      left: direction === "prev" ? amount : -amount,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // دو بار بررسی: بلافاصله + بعد از رندر کامل
    updateArrows();
    const t = setTimeout(updateArrows, 100);

    slider.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows, { passive: true });

    return () => {
      clearTimeout(t);
      slider.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [products, updateArrows]);

  if (!products?.length) return null;

  return (
    <section className={styles.section}>

      {/* هدر */}
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {/* اسلایدر با دکمه‌های روی دو طرف */}
      <div className={styles.sliderWrap}>

        {/* دکمه قبلی — سمت راست */}
        <button
          className={`${styles.arrow} ${styles.prev} ${!canScrollPrev ? styles.hidden : ""}`}
          onClick={() => scrollSlider("prev")}
          disabled={!canScrollPrev}
          aria-label="قبلی"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* اسلایدر */}
        <div ref={sliderRef} className={styles.slider}>
          {products.map((product) => (
            <div key={product.id} className={styles.card}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* دکمه بعدی — سمت چپ */}
        <button
          className={`${styles.arrow} ${styles.next} ${!canScrollNext ? styles.hidden : ""}`}
          onClick={() => scrollSlider("next")}
          disabled={!canScrollNext}
          aria-label="بعدی"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

      </div>
    </section>
  );
}