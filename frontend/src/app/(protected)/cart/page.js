"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./cart.module.css";
import Link from "next/link";

export default function CartPage() {
  const { cart, loading, updateQuantity, deleteCart, deleteItem } = useCart();

  const totalPrice = cart?.items.reduce((sum, item) => {
    const finalPrice =
      Number(item.variant.discounted_price) || Number(item.product.base_price);
    return sum + finalPrice * item.quantity;
  }, 0);

  const totalCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.spinner} />
        در حال بارگذاری سبد خرید...
      </div>
    );
  }

  if (!cart || !cart.items?.length) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h2 className={styles.emptyTitle}>سبد خرید شما خالی است</h2>
        <p className={styles.emptyDesc}>برای شروع خرید به صفحه محصولات بروید</p>
        <Link href="/products" className={styles.emptyBtn}>مشاهده محصولات</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <h1 className={styles.pageTitle}>
        سبد خرید
        <span className={styles.countBadge}>{totalCount} کالا</span>
      </h1>

      <div className={styles.cartGrid}>

        {/* ── لیست آیتم‌ها ── */}
        <div className={styles.items}>
          {cart.items.map((item) => {
            const image =
              item.product.images?.find((img) => img.is_primary) ||
              item.product.images?.[0];

            const finalPrice =
              Number(item.variant.discounted_price) ||
              Number(item.product.base_price);

            const hasDiscount =
              item.variant.discounted_price &&
              Number(item.variant.discounted_price) < Number(item.variant.price_modifier);

            const atCapacity = item.quantity >= item.variant.stock_quantity;

            return (
              <div key={item.id} className={styles.cartItem}>

                {/* تصویر */}
                <Link href={`/products/${item.product.slug}`} className={styles.imageLink}>
                  {image ? (
                    <img
                      src={image.full_image_url}
                      alt={item.product.name}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </Link>

                {/* جزئیات */}
                <div className={styles.details}>
                  <Link href={`/products/${item.product.slug}`} className={styles.productName}>
                    {item.product.name}
                  </Link>

                  {/* ویژگی‌های وریانت */}
                  {item.variant.attributes?.length > 0 && (
                    <div className={styles.attributes}>
                      {item.variant.attributes.map((attr) => (
                        <span key={attr.id} className={styles.attrChip}>
                          {attr.name}: {attr.value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* قیمت */}
                  <div className={styles.priceRow}>
                    {hasDiscount && (
                      <span className={styles.oldPrice}>
                        {formatPrice(item.variant.price_modifier)} تومان
                      </span>
                    )}
                    <span className={styles.price}>
                      {formatPrice(finalPrice)} تومان
                    </span>
                  </div>
                </div>

                {/* کنترل تعداد + حذف */}
                <div className={styles.actions}>
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() =>
                        item.quantity === 1
                          ? deleteItem(item.id)
                          : updateQuantity(item.id, item.quantity - 1)
                      }
                      aria-label="کاهش تعداد"
                    >
                      {item.quantity === 1 ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      )}
                    </button>

                    <span className={styles.qtyValue}>{item.quantity}</span>

                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={atCapacity}
                      aria-label="افزایش تعداد"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>

                  {atCapacity && (
                    <span className={styles.stockWarning}>حداکثر موجودی</span>
                  )}

                  <button
                    className={styles.removeBtn}
                    onClick={() => deleteItem(item.id)}
                    aria-label="حذف از سبد"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                    حذف
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── خلاصه سفارش ── */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>خلاصه سفارش</h3>

          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>تعداد کالا</span>
              <span>{totalCount} عدد</span>
            </div>
            <div className={styles.summaryRow}>
              <span>مبلغ کل</span>
              <span className={styles.totalPrice}>{formatPrice(totalPrice)} تومان</span>
            </div>
          </div>

          <Link href='/cart/checkout' className={styles.checkoutBtn}>

            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
            </svg>
            ادامه فرایند خرید

          </Link>

          <button
            className={styles.clearCartBtn}
            onClick={() => deleteCart()}
          >
            پاک کردن سبد خرید
          </button>
        </div>

      </div>
    </div>
  );
}