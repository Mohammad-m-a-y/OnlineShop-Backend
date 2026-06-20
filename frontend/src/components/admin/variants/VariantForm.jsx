"use client";

import { useState } from "react";
import { createVariant } from "@/services/variant.service";
import styles from "./variants.module.css";

export default function VariantForm({ productId, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    sku: "",
    price_modifier: 0,
    discounted_price: 0,
    stock_quantity: 0,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await createVariant({
        product_id: productId,
        sku: form.sku,
        price_modifier: Number(form.price_modifier),
        discounted_price: Number(form.discounted_price),
        stock_quantity: Number(form.stock_quantity),
      });
      onSuccess?.(data);
      setForm({ sku: "", price_modifier: 0, discounted_price: 0, stock_quantity: 0 });
    } catch (err) {
      console.error(err);
      setError("خطا در ایجاد وریانت، لطفاً دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.variantForm} noValidate>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="vf-sku">SKU</label>
          <input id="vf-sku" className={`${styles.formInput} ${styles.ltr}`} name="sku" placeholder="PROD-001-RED" value={form.sku} onChange={handleChange} required />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="vf-stock">موجودی</label>
          <input id="vf-stock" className={styles.formInput} type="number" name="stock_quantity" placeholder="۰" value={form.stock_quantity} onChange={handleChange} min="0" />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="vf-price">قیمت (تومان)</label>
          <input id="vf-price" className={`${styles.formInput} ${styles.ltr}`} type="number" name="price_modifier" placeholder="0" value={form.price_modifier} onChange={handleChange} min="0" />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="vf-discount">قیمت با تخفیف (تومان)</label>
          <input id="vf-discount" className={`${styles.formInput} ${styles.ltr}`} type="number" name="discounted_price" placeholder="0" value={form.discounted_price} onChange={handleChange} min="0" />
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
          {loading ? <><span className={styles.spinnerSm} />در حال ثبت...</> : <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            ثبت وریانت
          </>}
        </button>
      </div>
    </form>
  );
}