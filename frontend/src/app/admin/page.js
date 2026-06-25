"use client";

import styles from "./admin.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getOrders } from "@/services/order.service";
import { formatPrice } from "@/utils/formatPrice";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/utils/orderStatus";
import { getAdminDashboardStatus } from "@/services/admin.service";





export default function AdminDashboard() {

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const router = useRouter();
  const [dashboardStatus, setDashboardStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);




const stats = [
  {
    label: "کل محصولات",
    value: dashboardStatus?.products_total_count ?? "-",
    change: `${dashboardStatus?.products_month_count ?? 0} این ماه`,
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    color: "blue",
  },
  {
    label: "سفارشات امروز",
    value:  dashboardStatus?.today_orders ?? "-",
    change: "ثبت شده امروز",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 12h6m-6 4h4" />
      </svg>
    ),
    color: "teal",
  },
  {
    label: "درآمد این ماه",
    value: dashboardStatus ? `${formatPrice(dashboardStatus.month_income)} تومان` : "-",
    change: "درآمد ماه جاری",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: "purple",
  },
  {
    label: "کاربران فعال",
    value: dashboardStatus?.users_count ?? "-",
    change: "کل کاربران",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "orange",
  },
];




  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders({
          page: 1,
          page_size: 5,
        });

        setOrders(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    }


    async function loadDashboardStatus() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminDashboardStatus();

        setDashboardStatus(data);

      } catch (err) {
        console.error(err);
        setError("خطا در بارگذاری اطلاعات");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardStatus();
    loadOrders();
  }, []);




  function getOrderProductsText(order) {
    if (!order.items?.length) {
      return "-";
    }

    const firstProduct =
      order.items[0].product_name_snapshot;

    const count = order.items.length;

    return count > 1
      ? `${firstProduct} +${count - 1}`
      : firstProduct;
  }



  return (
    <div className={styles.page}>

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>داشبورد</h1>
          <p className={styles.pageSubtitle}>خوش آمدید! خلاصه‌ای از وضعیت فروشگاه را اینجا ببینید.</p>
        </div>

      </div>

      {/* کارت‌های آماری */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={`${styles.statCard} ${styles[stat.color]}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                {stat.positive ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                )}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* جدول آخرین سفارشات */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>آخرین سفارشات</h2>
          <Link href="/admin/orders" className={styles.viewAll}>مشاهده همه</Link>
        </div>

        <div className={styles.tableWrapper}>
          {loadingOrders ? (
            <p>در حال بارگذاری سفارشات...</p>
          ) : (<table className={styles.table}>
            <thead>
              <tr>
                <th>شناسه</th>
                <th>مشتری</th>
                <th>محصول</th>
                <th>مبلغ (تومان)</th>
                <th>وضعیت</th>
                <th>تاریخ ثبت</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = ORDER_STATUS_LABELS.find(
                  (item) => item.value === order.status
                );

                return (
                  <tr
                    key={order.id}
                    onClick={() =>
                      router.push(
                        `/admin/orders/${order.id}`
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td className={styles.orderId}>
                      #{order.id.slice(0, 8)}
                    </td>

                    <td>
                      {
                        order.shipping_address
                          ?.receiver_name
                      }
                    </td>

                    <td className={styles.product}>
                      {getOrderProductsText(order)}
                    </td>

                    <td className={styles.amount}>
                      {formatPrice(
                        order.final_amount
                      )}
                    </td>

                    <td>
                      <span
                        className={`${styles.badge} ${styles[status.className]
                          }`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        order.created_at
                      ).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}

        </div>
      </div>

    </div>
  );
}