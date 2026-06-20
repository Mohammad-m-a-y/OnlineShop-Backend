"use client";

import { useState } from "react";
import { updateOrder } from "@/services/order.service";
import { ORDER_STATUS_LABELS } from "@/utils/orderStatus";
import styles from "./orders.module.css";

export default function OrderUpdateForm({ order, onSuccess }) {
  const [status, setStatus] = useState(order.status);
  const [trackingCode, setTrackingCode] = useState(order.tracking_code || "");
  const [shippingMethod, setShippingMethod] = useState(order.shipping_method || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await updateOrder({
        order_id: order.id,
        status,
        tracking_code: trackingCode || null,
        shipping_method: shippingMethod || null,
      });
      onSuccess?.(updatedOrder);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError("خطا در بروزرسانی سفارش");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.updateForm} noValidate>
      <h3 className={styles.updateFormTitle}>مدیریت سفارش</h3>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="ouf-status">وضعیت سفارش</label>
        <select
          id="ouf-status"
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {ORDER_STATUS_LABELS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="ouf-tracking">کد رهگیری</label>
        <input
          id="ouf-tracking"
          className={`${styles.input} ${styles.ltrInput}`}
          type="text"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="کد رهگیری مرسوله"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="ouf-shipping">روش ارسال</label>
        <input
          id="ouf-shipping"
          className={styles.input}
          type="text"
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
          placeholder="مثلاً پست پیشتاز"
        />
      </div>

      {error && (
        <div className={styles.formError} role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <button type="submit" className={`${styles.saveBtn} ${saved ? styles.savedState : ""}`} disabled={loading}>
        {loading ? (
          <><span className={styles.spinner} />در حال ذخیره...</>
        ) : saved ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            ذخیره شد
          </>
        ) : (
          "ذخیره تغییرات"
        )}
      </button>
    </form>
  );
}