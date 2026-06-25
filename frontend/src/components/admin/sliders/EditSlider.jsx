"use client";

import { useEffect, useState } from "react";
import { getSliders } from "@/services/slider.service";
import SliderForm from "@/components/admin/sliders/SliderForm";
import Link from "next/link";
import styles from "./EditSlider.module.css";




export default function EditSlider({sliderId}){

  const [slider, setSlider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSliders();
        const found = data.items?.find((s) => s.id === sliderId);
        if (!found) { setNotFound(true); return; }
        setSlider(found);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sliderId]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.spinner} />
        در حال بارگذاری...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <p>اسلایدر مورد نظر یافت نشد</p>
        <Link href="/admin/sliders" className={styles.backBtn}>بازگشت</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link href="/admin/sliders" className={styles.backBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          بازگشت به اسلایدرها
        </Link>
        <h1 className={styles.pageTitle}>ویرایش اسلایدر</h1>
        <p className={styles.pageSubtitle}>{slider.title}</p>
      </div>

      <div className={styles.formCard}>
        <SliderForm mode="edit" slider={slider} />
      </div>
    </div>
  );



}



