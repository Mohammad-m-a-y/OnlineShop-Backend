import Link from "next/link";
import ProductList from "@/components/admin/ProductList";
import styles from "./products.module.css";

export default function ProductsPage() {


  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>مدیریت محصولات</h1>
          <p className={styles.pageSubtitle}>مشاهده، ویرایش و حذف محصولات فروشگاه</p>
        </div>
        <Link href="/admin/products/create" className={styles.addBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          افزودن محصول
        </Link>
      </div>

      <ProductList />
    </div>
  );
}