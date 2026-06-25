"use client";

import { getOrderById, deleteOrder } from "@/services/order.service";
import { ORDER_STATUS_LABELS } from "@/utils/orderStatus";
import { useState, useEffect } from "react";
import { formatPrice } from "@/utils/formatPrice";
import { useRouter } from "next/navigation";
import { initiatePayment } from "@/services/payment.service";
import Link from "next/link";
import styles from "./OrderDetailesPage.module.css";

const STATUS_STYLE = {
  pending: "pending", paid: "paid", processing: "processing",
  shipped: "shipped", delivered: "delivered", cancelled: "cancelled",
};

function getStatusLabel(status) {
  return ORDER_STATUS_LABELS.find((item) => item.value === status)?.label || status;
}

export default function OrderDetailesPage({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  const canDeleteOrder = order && ["pending", "failed"].includes(order.status);
  const canPay = order && ["pending", "failed"].includes(order.status);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  async function handleDeleteOrder() {
    try {
      setDeleting(true);
      await deleteOrder(order.id);
      router.push("/profile/orders");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handlePayment() {
    try {
      setPaying(true);
      const data = await initiatePayment(order.id);
      window.location.href = data.redirect_url;
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.spinner} />
        در حال بارگذاری سفارش...
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <p>سفارش یافت نشد</p>
        <Link href="/profile/orders" className={styles.backLink}>بازگشت به سفارش‌ها</Link>
      </div>
    );
  }

  const statusKey = STATUS_STYLE[order.status] ?? "pending";

  return (
    <div className={styles.page}>

      {/* دیالوگ تأیید لغو */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className={styles.dialogTitle}>لغو سفارش</h3>
            <p className={styles.dialogText}>آیا از لغو این سفارش مطمئن هستید؟ این عمل قابل بازگشت نیست.</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelDialogBtn} onClick={() => setConfirmDelete(false)}>انصراف</button>
              <button className={styles.confirmDialogBtn} onClick={handleDeleteOrder} disabled={deleting}>
                {deleting ? <><span className={styles.spinnerSm} />در حال لغو...</> : "بله، لغو کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <Link href="/profile/orders" className={styles.backBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          بازگشت به سفارش‌ها
        </Link>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>سفارش #{order.id.slice(0, 8)}</h1>
          <span className={`${styles.statusBadge} ${styles[statusKey]}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className={styles.grid}>

        {/* ── ستون اصلی ── */}
        <div className={styles.main}>

          {/* محصولات سفارش */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>محصولات سفارش</h2>
            <div className={styles.items}>
              {order.items.map((item) => {
                const image = item.product.images?.[0]?.full_image_url;
                const attrs = Object.entries(item.variant_details_snapshot || {});

                return (
                  <div key={item.id} className={styles.item}>
                    <Link href={`/products/${item.product.slug}`} className={styles.itemImage}>
                      {image ? (
                        <img src={image} alt={item.product.name} className={styles.itemImg} />
                      ) : (
                        <div className={styles.itemImgPlaceholder}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </Link>

                    <div className={styles.itemDetails}>
                      <Link href={`/products/${item.product.slug}`} className={styles.itemName}>
                        {item.product.name}
                      </Link>

                      {attrs.length > 0 && (
                        <div className={styles.itemAttrs}>
                          {attrs.map(([key, value]) => (
                            <span key={key} className={styles.attrChip}>
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.itemMeta}>
                        <span className={styles.itemQty}>تعداد: {item.quantity}</span>
                        <span className={styles.itemPrice}>
                          {formatPrice(item.discounted_price_at_purchase)} تومان
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* آدرس ارسال */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>آدرس ارسال</h2>
            <div className={styles.addressCard}>
              <div className={styles.addressTop}>
                <span className={styles.receiverName}>{order.shipping_address.receiver_name}</span>
                <span className={styles.receiverPhone}>{order.shipping_address.receiver_mobile}</span>
              </div>
              <p className={styles.addressLine}>
                {order.shipping_address.province} — {order.shipping_address.city}
              </p>
              <p className={styles.addressLine}>{order.shipping_address.full_address}</p>
            </div>
          </div>

        </div>

        {/* ── ستون جانبی ── */}
        <div className={styles.side}>

          {/* خلاصه سفارش */}
          <div className={styles.summaryCard}>
            <h2 className={styles.sectionTitle}>خلاصه سفارش</h2>

            <dl className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <dt>مبلغ نهایی</dt>
                <dd className={styles.finalAmount}>{formatPrice(order.final_amount)} تومان</dd>
              </div>
              {order.shipping_method && (
                <div className={styles.summaryRow}>
                  <dt>روش ارسال</dt>
                  <dd>{order.shipping_method}</dd>
                </div>
              )}
              {order.tracking_code && (
                <div className={styles.summaryRow}>
                  <dt>کد رهگیری</dt>
                  <dd className={styles.trackingCode}>{order.tracking_code}</dd>
                </div>
              )}
            </dl>

            {/* دکمه پرداخت */}
            {canPay && (
              <button className={styles.payBtn} onClick={handlePayment} disabled={paying}>
                {paying ? (
                  <><span className={styles.spinnerSm} />در حال انتقال به درگاه...</>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    پرداخت سفارش
                  </>
                )}
              </button>
            )}

            {/* دکمه لغو */}
            {canDeleteOrder && (
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(true)} disabled={deleting}>
                لغو سفارش
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}