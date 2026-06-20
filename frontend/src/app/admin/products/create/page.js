import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import styles from "./create.module.css";



export default function CreateProductPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link href="/admin/products" className={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          بازگشت به محصولات
        </Link>
        <h1 className={styles.pageTitle}>ایجاد محصول جدید</h1>
        <p className={styles.pageSubtitle}>اطلاعات محصول را وارد کنید</p>
      </div>

      <ProductForm />
    </div>
  );
}