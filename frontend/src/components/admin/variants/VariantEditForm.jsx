"use client";

import { useState } from "react";
import { updateVariant } from "@/services/variant.service";
import styles from "./variants.module.css";

export default function VariantEditForm({ variant, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    sku: variant.sku,
    stock_quantity: variant.stock_quantity,
    price_modifier: variant.price_modifier,
    discounted_price: variant.discounted_price,
  });
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
      const updatedVariant = await updateVariant(variant.id, form);
      onSuccess?.(updatedVariant);
    } catch (err) {
      console.error(err);
      setError("خطا در ویرایش وریانت");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.variantForm} noValidate>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="ve-sku">SKU</label>
          <input id="ve-sku" className={`${styles.formInput} ${styles.ltr}`} name="sku" value={form.sku} onChange={handleChange} required />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="ve-stock">موجودی</label>
          <input id="ve-stock" className={styles.formInput} type="number" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} min="0" />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="ve-price">قیمت (تومان)</label>
          <input id="ve-price" className={`${styles.formInput} ${styles.ltr}`} type="number" name="price_modifier" value={form.price_modifier} onChange={handleChange} min="0" />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="ve-discount">قیمت با تخفیف (تومان)</label>
          <input id="ve-discount" className={`${styles.formInput} ${styles.ltr}`} type="number" name="discounted_price" value={form.discounted_price} onChange={handleChange} min="0" />
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
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>انصراف</button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinnerSm} />در حال ذخیره...</> : <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            ذخیره تغییرات
          </>}
        </button>
      </div>
    </form>
  );
}