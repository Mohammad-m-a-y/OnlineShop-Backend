"use client";

import { useEffect, useState } from "react";
import { getOrderById } from "@/services/order.service";
import OrderUpdateForm from "@/components/admin/orders/OrderUpdateForm";
import OrderDetails from "./OrderDetails";
import Link from "next/link";
import styles from "./orders.module.css";

export default function OrderDetailsPageClient({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.spinner} />
        در حال بارگذاری سفارش...
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className={styles.notFound}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>سفارش مورد نظر یافت نشد</p>
        <Link href="/admin/orders" className={styles.backLink}>بازگشت به سفارشات</Link>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <Link href="/admin/orders" className={styles.backBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            بازگشت به سفارشات
          </Link>
          <h1 className={styles.pageTitle}>
            جزئیات سفارش
            <span className={styles.orderIdBadge}>#{order.id.slice(0, 8)}</span>
          </h1>
        </div>
      </div>

      {/* محتوا: دو ستون */}
      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <OrderDetails order={order} />
        </div>
        <div className={styles.detailSide}>
          <OrderUpdateForm
            order={order}
            onSuccess={(updatedOrder) => setOrder(updatedOrder)}
          />
        </div>
      </div>

    </div>
  );
}