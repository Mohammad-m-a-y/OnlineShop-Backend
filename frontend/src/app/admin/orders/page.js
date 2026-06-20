"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrders } from "@/services/order.service";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./OrdersPage.module.css";

const STATUS_MAP = {
  pending:    { label: "در انتظار پرداخت", style: "pending"    },
  paid:       { label: "پرداخت شده",       style: "paid"       },
  processing: { label: "در حال پردازش",    style: "processing" },
  shipped:    { label: "ارسال شده",         style: "shipped"    },
  delivered:  { label: "تحویل داده شده",   style: "delivered"  },
  cancelled:  { label: "لغو شده",           style: "cancelled"  },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, style: "pending" };
  return <span className={`${styles.badge} ${styles[s.style]}`}>{s.label}</span>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1, total_count: 0 });

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrders({ page, page_size: 10 });
        setOrders(data.items || []);
        setPagination({ total_pages: data.total_pages, total_count: data.total_count });
      } catch (error) {
        console.error(error);
        setError("خطا در دریافت سفارشات، لطفاً صفحه را رفرش کنید");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [page]);

  function getProductsText(order) {
    if (!order.items?.length) return "-";
    const first = order.items[0].product_name_snapshot;
    const extra = order.items.length - 1;
    return extra > 0 ? `${first} و ${extra} محصول دیگر` : first;
  }

  return (
    <div className={styles.page}>

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>مدیریت سفارشات</h1>
          <p className={styles.pageSubtitle}>
            {!loading && `${pagination.total_count} سفارش ثبت شده`}
          </p>
        </div>
      </div>

      {/* خطا */}
      {error && (
        <div className={styles.errorBox} role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* جدول */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <span className={styles.spinner} />
            در حال بارگذاری سفارشات...
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>گیرنده</th>
                  <th>محصولات</th>
                  <th>مبلغ نهایی</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className={styles.emptyCell}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="2"/>
                        </svg>
                        <p>هیچ سفارشی یافت نشد</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
                      </td>
                      <td>{order.shipping_address?.receiver_name ?? "—"}</td>
                      <td className={styles.productCell}>{getProductsText(order)}</td>
                      <td className={styles.amount}>
                        {formatPrice(order.final_amount)}
                        <span className={styles.unit}> تومان</span>
                      </td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className={styles.date}>
                        {new Date(order.created_at).toLocaleDateString("fa-IR")}
                      </td>
                      <td>
                        <Link href={`/admin/orders/${order.id}`} className={styles.viewBtn}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          مشاهده
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* صفحه‌بندی */}
      {!loading && pagination.total_pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            قبلی
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className={styles.dots}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageNum} ${p === page ? styles.activePage : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            className={styles.pageBtn}
            disabled={page >= pagination.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      )}

    </div>
  );
}