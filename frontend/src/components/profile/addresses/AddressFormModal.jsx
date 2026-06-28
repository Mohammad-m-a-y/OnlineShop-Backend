"use client";

import { useEffect, useState } from "react";
import { createAddress, updateAddress } from "@/services/address.service";
import styles from "./AddressFormModal.module.css";

export default function AddressFormModal({ address, onClose, onSuccess }) {
  const isEdit = !!address;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    province: "", city: "", full_address: "",
    postal_code: "", receiver_name: "", receiver_mobile: "",
  });

  useEffect(() => {
    if (!address) return;
    setFormData({
      province: address.province || "",
      city: address.city || "",
      full_address: address.full_address || "",
      postal_code: address.postal_code || "",
      receiver_name: address.receiver_name || "",
      receiver_mobile: address.receiver_mobile || "",
    });
  }, [address]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (isEdit) {
        await updateAddress(address.id, formData);
      } else {
        await createAddress(formData);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("خطا در ذخیره آدرس، لطفاً دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* هدر */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? "ویرایش آدرس" : "افزودن آدرس جدید"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="بستن">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* ردیف اول: نام + موبایل */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="af-name">
                نام گیرنده<span className={styles.required}>*</span>
              </label>
              <input
                id="af-name"
                className={styles.input}
                name="receiver_name"
                placeholder="نام و نام خانوادگی"
                value={formData.receiver_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="af-mobile">
                شماره موبایل<span className={styles.required}>*</span>
              </label>
              <input
                id="af-mobile"
                className={`${styles.input} ${styles.ltr}`}
                name="receiver_mobile"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={formData.receiver_mobile}
                onChange={handleChange}
                inputMode="tel"
                required
              />
            </div>
          </div>

          {/* ردیف دوم: استان + شهر + کدپستی */}
          <div className={styles.row3}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="af-province">
                استان<span className={styles.required}>*</span>
              </label>
              <input
                id="af-province"
                className={styles.input}
                name="province"
                placeholder="مثلاً: تهران"
                value={formData.province}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="af-city">
                شهر<span className={styles.required}>*</span>
              </label>
              <input
                id="af-city"
                className={styles.input}
                name="city"
                placeholder="مثلاً: تهران"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="af-postal">
                کد پستی<span className={styles.required}>*</span>
              </label>
              <input
                id="af-postal"
                className={`${styles.input} ${styles.ltr}`}
                name="postal_code"
                placeholder="۱۲۳۴۵۶۷۸۹۰"
                value={formData.postal_code}
                onChange={handleChange}
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {/* آدرس کامل */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="af-address">
              آدرس کامل<span className={styles.required}>*</span>
            </label>
            <textarea
              id="af-address"
              className={`${styles.input} ${styles.textarea}`}
              name="full_address"
              placeholder="خیابان، کوچه، پلاک، واحد..."
              value={formData.full_address}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>انصراف</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <><span className={styles.spinner} />در حال ذخیره...</> : "ذخیره آدرس"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}