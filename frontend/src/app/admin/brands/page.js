"use client";

import { useEffect, useState } from "react";
import { getBrands, deleteBrand } from "@/services/brand.service";
import BrandForm from "@/components/admin/brands/BrandForm";
import BrandEditForm from "@/components/admin/brands/BrandEditForm";
import styles from "./BrandsPage.module.css";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoading(true);
        const data = await getBrands();
        setBrands(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  async function handleDeleteBrand(id) {
    try {
      setDeletingId(id);
      await deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      if (editingBrand?.id === id) setEditingBrand(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
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
            <h3 className={styles.dialogTitle}>حذف برند</h3>
            <p className={styles.dialogText}>آیا از حذف این برند مطمئن هستید؟ این عمل قابل بازگشت نیست.</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelDialogBtn} onClick={() => setConfirmId(null)}>انصراف</button>
              <button className={styles.confirmDialogBtn} disabled={!!deletingId} onClick={() => handleDeleteBrand(confirmId)}>
                {deletingId ? <><span className={styles.spinnerSm} />حذف...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>مدیریت برندها</h1>
          <p className={styles.pageSubtitle}>{!loading && `${brands.length} برند`}</p>
        </div>
        {!showForm && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            افزودن برند
          </button>
        )}
      </div>

      {/* فرم افزودن */}
      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formCardTitle}>برند جدید</h2>
            <button className={styles.closeFormBtn} onClick={() => setShowForm(false)} aria-label="بستن">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <BrandForm
            onCancel={() => setShowForm(false)}
            onSuccess={(newBrand) => {
              setBrands((prev) => [...prev, newBrand]);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* فرم ویرایش */}
      {editingBrand && (
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formCardTitle}>ویرایش برند</h2>
            <button className={styles.closeFormBtn} onClick={() => setEditingBrand(null)} aria-label="بستن">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <BrandEditForm
            brand={editingBrand}
            onCancel={() => setEditingBrand(null)}
            onSuccess={(updatedBrand) => {
              setBrands((prev) => prev.map((b) => (b.id === updatedBrand.id ? updatedBrand : b)));
              setEditingBrand(null);
            }}
          />
        </div>
      )}

      {/* لیست برندها */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.spinner} />
          در حال بارگذاری برندها...
        </div>
      ) : brands.length === 0 ? (
        <div className={styles.empty}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          <p>هنوز برندی ثبت نشده</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {brands.map((brand) => (
            <div key={brand.id} className={styles.card}>
              <div className={styles.cardTop}>
                {brand.full_image_url ? (
                  <img src={brand.full_image_url} alt={brand.name} className={styles.cardImage} />
                ) : (
                  <div className={styles.cardImagePlaceholder}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </div>
                )}
                <span className={`${styles.statusBadge} ${brand.is_active ? styles.active : styles.inactive}`}>
                  {brand.is_active ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{brand.name}</h3>
                <span className={styles.cardSlug}>{brand.slug}</span>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => setEditingBrand(brand)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  ویرایش
                </button>
                <button className={styles.deleteBtn} onClick={() => setConfirmId(brand.id)}>
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