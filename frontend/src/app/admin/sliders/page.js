"use client";

import { getSliders, deleteSlider, toggleSliderStatus } from "@/services/slider.service";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./SlidersPage.module.css";

export default function SlidersPage() {

  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);


  useEffect(() => {
    async function loadSliders() {
      try {
        const data = await getSliders();
 
        const sorted = (data.items ?? []).sort((a, b) => a.display_order - b.display_order);
        setSliders(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSliders();
  }, []);

  async function handleDelete(id) {
    try {
      setDeletingId(id);
      await deleteSlider(id);
      setSliders((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  async function handleToggleStatus(id) {
    try {
      setTogglingId(id);
      const updated = await toggleSliderStatus(id);
      setSliders((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className={styles.page}>

      {/* دیالوگ تأیید حذف */}
      {confirmId && (
        <div className={styles.overlay} onClick={() => setConfirmId(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className={styles.dialogTitle}>حذف اسلایدر</h3>
            <p className={styles.dialogText}>آیا از حذف این اسلایدر مطمئن هستید؟</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelDialogBtn} onClick={() => setConfirmId(null)}>انصراف</button>
              <button className={styles.confirmDialogBtn} disabled={!!deletingId} onClick={() => handleDelete(confirmId)}>
                {deletingId ? <><span className={styles.spinnerSm} />حذف...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>مدیریت اسلایدرها</h1>
          <p className={styles.pageSubtitle}>{!loading && `${sliders.length} اسلایدر`}</p>
        </div>
        <Link href="/admin/sliders/create" className={styles.addBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          اسلایدر جدید
        </Link>
      </div>

      {/* لودینگ */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.spinner} />
          در حال بارگذاری...
        </div>
      ) : sliders.length === 0 ? (
        <div className={styles.empty}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8"/>
          </svg>
          <p>هنوز اسلایدری اضافه نشده</p>
          <Link href="/admin/sliders/create" className={styles.emptyBtn}>افزودن اولین اسلایدر</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {sliders.map((slider) => (
            <div key={slider.id} className={`${styles.card} ${!slider.is_active ? styles.inactiveCard : ""}`}>

              {/* تصویر */}
              <div className={styles.imageWrap}>
                <img src={slider.full_image_url} alt={slider.title} className={styles.image} />
                <span className={`${styles.orderBadge}`}>#{slider.display_order}</span>
                <span className={`${styles.statusBadge} ${slider.is_active ? styles.activeBadge : styles.inactiveBadge}`}>
                  {slider.is_active ? "فعال" : "غیرفعال"}
                </span>
              </div>

              {/* محتوا */}
              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{slider.title}</h3>
                {slider.description && (
                  <p className={styles.cardDesc}>{slider.description}</p>
                )}
                {slider.link_url && (
                  <span className={styles.linkTag}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    {slider.link_url}
                  </span>
                )}
              </div>

              {/* اکشن‌ها */}
              <div className={styles.cardActions}>
                {/* toggle فعال/غیرفعال */}
                <button
                  className={`${styles.toggleBtn} ${slider.is_active ? styles.toggleOff : styles.toggleOn}`}
                  onClick={() => handleToggleStatus(slider.id)}
                  disabled={togglingId === slider.id}
                >
                  {togglingId === slider.id ? (
                    <span className={styles.spinnerSm} />
                  ) : slider.is_active ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.36 6.64A9 9 0 1 1 5.64 5.64"/><line x1="12" y1="2" x2="12" y2="12"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.36 6.64A9 9 0 1 1 5.64 5.64"/><line x1="12" y1="2" x2="12" y2="12"/>
                    </svg>
                  )}
                  {slider.is_active ? "غیرفعال" : "فعال"}
                </button>

                <Link href={`/admin/sliders/${slider.id}/edit`} className={styles.editBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  ویرایش
                </Link>

                <button className={styles.deleteBtn} onClick={() => setConfirmId(slider.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                  حذف
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}