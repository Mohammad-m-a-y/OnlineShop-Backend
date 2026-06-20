import { getProducts } from "@/services/product.service";
import ProductCard from "@/components/product/ProductCard";
import styles from "./ProductsPage.module.css";

export const metadata = {
  title: "محصولات | فروشگاه آنلاین",
  description: "مشاهده و خرید محصولات فروشگاه آنلاین",
};

export default async function ProductsPage() {
  const data = await getProducts();
  const products = data.items ?? [];

  return (
    <main className={styles.page}>

      {/* هدر صفحه */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>محصولات</h1>
        <span className={styles.count}>{products.length} محصول</span>
      </div>

      {/* گرید محصولات */}
      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>محصولی یافت نشد</p>
        </div>
      )}

    </main>
  );
}