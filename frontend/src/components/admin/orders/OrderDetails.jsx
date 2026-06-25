import { formatPrice } from "@/utils/formatPrice";
import styles from "./orders.module.css";

const STATUS_MAP = {
  pending: { label: "در انتظار پرداخت", style: "pending" },
  paid: { label: "پرداخت شده", style: "paid" },
  processing: { label: "در حال پردازش", style: "processing" },
  shipped: { label: "ارسال شده", style: "shipped" },
  delivered: { label: "تحویل داده شده", style: "delivered" },
  cancelled: { label: "لغو شده", style: "cancelled" },
};

const PAYMENT_STATUS_MAP = {
  success: { label: "موفق", style: "paySuccess" },
  pending: { label: "در انتظار", style: "payPending" },
  failed: { label: "ناموفق", style: "payFailed" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, style: "pending" };
  return <span className={`${styles.badge} ${styles[s.style]}`}>{s.label}</span>;
}

function PaymentBadge({ status }) {
  const s = PAYMENT_STATUS_MAP[status] ?? { label: status, style: "payPending" };
  return <span className={`${styles.badge} ${styles[s.style]}`}>{s.label}</span>;
}

 
export default function OrderDetails({ order }) {
  if (!order) return null;

  return (
    <div className={styles.detailsWrap}>

      {/* اطلاعات سفارش */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>اطلاعات سفارش</h2>
        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt>شناسه سفارش</dt>
            <dd className={styles.mono}>{order.id}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>وضعیت</dt>
            <dd><StatusBadge status={order.status} /></dd>
          </div>
          <div className={styles.infoRow}>
            <dt>روش ارسال</dt>
            <dd>{order.shipping_method || "—"}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>کد رهگیری</dt>
            <dd className={styles.mono}>{order.tracking_code || "—"}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>مبلغ نهایی</dt>
            <dd className={styles.finalAmount}>{formatPrice(order.final_amount)} تومان</dd>
          </div>
        </dl>
      </section>

      {/* آدرس ارسال */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>آدرس ارسال</h2>
        <div className={styles.addressCard}>
          <div className={styles.addressTop}>
            <span className={styles.receiverName}>{order.shipping_address.receiver_name}</span>
            <span className={styles.receiverMobile}>{order.shipping_address.receiver_mobile}</span>
          </div>
          <p className={styles.addressLine}>
            {order.shipping_address.province} - {order.shipping_address.city}
          </p>
          <p className={styles.addressLine}>{order.shipping_address.full_address}</p>
          <p className={styles.postalCode}>کد پستی: {order.shipping_address.postal_code}</p>
        </div>
      </section>

      {/* محصولات سفارش */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>محصولات سفارش</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>محصول</th>
                <th>تعداد</th>
                <th>قیمت</th>
                <th>قیمت تخفیف‌دار</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.productName}>{item.product_name_snapshot}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price_at_purchase)}</td>
                  <td className={item.discounted_price_at_purchase ? styles.discountedCell : ""}>
                    {item.discounted_price_at_purchase ? formatPrice(item.discounted_price_at_purchase) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* پرداخت‌ها */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>پرداخت‌ها</h2>
        {order.payments?.length === 0 ? (
          <p className={styles.emptyText}>پرداختی ثبت نشده</p>
        ) : (
          <div className={styles.paymentsList}>
            {order.payments.map((payment) => (
              <div key={payment.id} className={styles.paymentCard}>
                <div className={styles.paymentRow}>
                  <span className={styles.paymentLabel}>مبلغ</span>
                  <span className={styles.paymentValue}>{formatPrice(payment.amount)} تومان</span>
                </div>
                <div className={styles.paymentRow}>
                  <span className={styles.paymentLabel}>وضعیت</span>
                  <PaymentBadge status={payment.status} />
                </div>
                <div className={styles.paymentRow}>
                  <span className={styles.paymentLabel}>مرجع</span>
                  <span className={`${styles.paymentValue} ${styles.mono}`}>{payment.transaction_id || "—"}</span>
                </div>
                <div className={styles.paymentRow}>
                  <span className={styles.paymentLabel}>تاریخ</span>
                  <span className={`${styles.paymentValue} ${styles.mono}`}>
                    { new Date(payment.created_at).toLocaleDateString("fa-IR") || "—" }
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}