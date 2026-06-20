"use client";

import { useState } from "react";
import { createAttribute } from "@/services/attribute.service";
import styles from "./variants.module.css";

export default function AttributeForm({ variantId, onSuccess, onCacel }) {
  const [form, setForm] = useState({ name: "", value: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await createAttribute({ variantId, name: form.name, value: form.value });
      onSuccess?.(data);
      setForm({ name: "", value: "" });
    } catch (err) {
      console.error(err);
      setError("خطا در افزودن ویژگی");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.variantForm} noValidate>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="af-name">نام ویژگی</label>
          <input id="af-name" className={`${styles.formInput} ${styles.ltr}`} name="name" placeholder="color" value={form.name} onChange={handleChange} required />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="af-value">مقدار</label>
          <input id="af-value" className={`${styles.formInput} ${styles.ltr}`} name="value" placeholder="red" value={form.value} onChange={handleChange} required />
        </div>
      </div>

      {error && (
        <div className={styles.formError}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className={styles.formFooter}>
        <button type="button" className={styles.cancelBtn} onClick={onCacel} disabled={loading}>انصراف</button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinnerSm} />در حال ثبت...</> : <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            افزودن ویژگی
          </>}
        </button>
      </div>
    </form>
  );
}