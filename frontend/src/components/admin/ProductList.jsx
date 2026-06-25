"use client";
import { useEffect, useState } from "react";
import { getProducts, deleteProduct, toggleProductStatus } from "@/services/product.service";
import styles from "./ProductList.module.css";
import Link from "next/link";
import Image from "next/image";




export default function ProductList() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null); 

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  async function handleDelete(id) {
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  async function handleToggleStatus(id) {
    try {
      setTogglingId(id);
      await toggleProductStatus(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setTogglingId(null);
    }
  }



  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.spinner} />
        <span>در حال بارگذاری محصولات...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>هیچ محصولی یافت نشد</p>
        <Link href="/admin/products/create" className={styles.emptyBtn}>افزودن اولین محصول</Link>
      </div>
    );
  }

  return (
    <>
      {/* دیالوگ تأیید حذف */}
      {confirmId && (
        <div className={styles.overlay} onClick={() => setConfirmId(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 className={styles.dialogTitle}>حذف محصول</h3>
            <p className={styles.dialogText}>آیا از حذف این محصول مطمئن هستید؟ این عمل قابل بازگشت نیست.</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmId(null)}>انصراف</button>
              <button
                className={styles.confirmBtn}
                onClick={() => handleDelete(confirmId)}
                disabled={deletingId === confirmId}
              >
                {deletingId === confirmId ? <><span className={styles.spinnerSm} />در حال حذف...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>نام محصول</th>
                <th>قیمت (تومان)</th>
                <th>موجودی</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productName}>
                      <div className={styles.productThumb}>
                        {product.images?.[0]?.url ? (
                          <Image src={product.images[0].image_url} alt={product.images[0].alt_text ?? product.name} />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        )}
                      </div>
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className={styles.price}>
                    {Number(product.base_price).toLocaleString("fa-IR")}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${product.is_available ? styles.available : styles.unavailable}`}>
                      {product.is_available ? "موجود" : "ناموجود"}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${product.is_active ? styles.active : styles.inactive}`}>
                      {product.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/products/${product.id}/edit`} className={styles.editBtn}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        ویرایش
                      </Link>
                      <button
                        className={`${styles.toggleBtn} ${product.is_active ? styles.toggleOff : styles.toggleOn}`}
                        onClick={() => handleToggleStatus(product.id)}
                        disabled={togglingId === product.id}
                      >
                        {togglingId === product.id ? (
                          <span className={styles.spinnerSm} />
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18.36 6.64A9 9 0 1 1 5.64 5.64"/>
                            <line x1="12" y1="2" x2="12" y2="12"/>
                          </svg>
                        )}
                        {product.is_active ? "غیرفعال" : "فعال"}
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setConfirmId(product.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/>
                        </svg>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}