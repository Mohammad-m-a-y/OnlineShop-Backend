"use client";

import { useState } from "react";
import { updateProductImageOrder } from "@/services/image.service";
import styles from "./images.module.css";

export default function ImageOrderForm({ productId, image, onSuccess }) {


  const [order, setOrder] = useState(image.display_order);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updatedImage = await updateProductImageOrder(productId, image.id, Number(order));
      onSuccess?.(updatedImage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setError("خطا در تغییر ترتیب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.orderForm}>
      <div className={styles.orderInputWrap}>
        <label className={styles.orderLabel}>ترتیب</label>
        <input
          className={styles.orderInput}
          type="number"
          min="0"
          value={order}
          onChange={(e) => { setOrder(e.target.value); setSaved(false); }}
        />
      </div>

      {error && <span className={styles.orderError}>{error}</span>}

      <button type="submit" className={`${styles.orderBtn} ${saved ? styles.savedBtn : ""}`} disabled={loading}>
        {loading ? (
          <span className={styles.spinner} />
        ) : saved ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
        )}
        {loading ? "ذخیره..." : saved ? "ذخیره شد" : "ذخیره"}
      </button>
    </form>
  );
}