"use client";

import Link from "next/link";
import { ORDER_STATUS_LABELS } from "@/utils/orderStatus";
import { useState, useEffect } from "react";
import { getOrders } from "@/services/order.service";
import styles from "./OrdersList.module.css";
import { formatPrice } from "@/utils/formatPrice";


const STATUS_STYLE = {
  pending: "pending",
  paid: "paid",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

function getStatusLabel(status) {
  return ORDER_STATUS_LABELS.find((item) => item.value === status)?.label || status;
}

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders({ page: 1, page_size: 20 });
        setOrders(data.items ?? []);
      } catch (err) {
        console.error(err);
        setError("خطا در بارگذاری سفارش‌ها");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className={styles.grid}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className={styles.empty}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 12h6m-6 4h4" />
        </svg>
        <p>هنوز سفارشی ثبت نکرده‌اید</p>
        <Link href="/products" className={styles.emptyBtn}>شروع خرید</Link>
      </div>
    );
  }

  return (

    <>
    <h1 className={styles.title}>سفارش ها</h1>
    <div className={styles.grid}>

      {orders.map((order) => {
        const statusKey = STATUS_STYLE[order.status] ?? "pending";
        // حداکثر ۴ تصویر از محصولات سفارش
        const images = order.items
          ?.slice(0, 4)
          .map((item) => {
            const img =
              item.product?.images?.find((i) => i.is_primary) ||
              item.product?.images?.[0];
            return { id: item.id, url: img?.full_image_url, name: item.product?.name };
          }) ?? [];

        return (
          <Link key={order.id} href={`/profile/orders/${order.id}`} className={styles.card}>

            {/* گالری تصاویر محصولات */}
            <div className={`${styles.imagesGrid} ${styles[`count${images.length > 4 ? 4 : images.length}`]
              }`}>
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <div key={img.id} className={styles.imgCell}>
                    {img.url ? (
                      <img src={img.url} alt={img.name} className={styles.productImg} />
                    ) : (
                      <div className={styles.imgPlaceholder}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    {/* نمایش تعداد باقیمانده */}
                    {idx === 3 && order.items.length > 4 && (
                      <div className={styles.moreOverlay}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`${styles.imgCell} ${styles.imgPlaceholder}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* اطلاعات سفارش */}
            <div className={styles.info}>
              <div className={styles.infoTop}>
                <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
                <span className={`${styles.badge} ${styles[statusKey]}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className={styles.infoMeta}>
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  </svg>
                  {order.items?.length} کالا
                </span>
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {new Date(order.created_at).toLocaleDateString("fa-IR")}
                </span>
              </div>

              <div className={styles.infoFooter}>
                <span className={styles.amount}>
                  {formatPrice(order.final_amount)}
                  <span className={styles.unit}> تومان</span>
                </span>
                <span className={styles.viewBtn}>
                  جزئیات
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" transform="rotate(180 12 12)" />
                  </svg>
                </span>
              </div>
            </div>

          </Link>
        );
      })}
    </div>
    </>
  );
}