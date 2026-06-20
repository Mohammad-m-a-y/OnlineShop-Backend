import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { getBrands } from "@/services/brand.service";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import BrandShowcase from "@/components/home/BrandShowcase";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import styles from "./HomePage.module.css";


export const metadata = {
  title: "فروشگاه آنلاین",
  description: "خرید آنلاین جدیدترین محصولات با بهترین قیمت",
};


export default async function HomePage() {
  // واکشی موازی هر سه منبع داده
  const [productsData, categoriesData, brandsData] = await Promise.all([
    getProducts({ page: 1, page_size: 8, is_active: true }),
    getCategories({ is_active: true }),
    getBrands({ is_active: true }),
  ]);

  const products = productsData.items ?? [];
  const categories = categoriesData.items ?? [];
  const brands = brandsData.items ?? [];

  return (
    <main className={styles.page}>

      {/* اسلایدر اصلی */}
      <HeroSlider />

      {/* دسته‌بندی‌ها */}
      <CategoryShowcase categories={categories} />

      {/* محصولات */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>محصولات</h2>
          <Link href="/products" className={styles.viewAll}>
            مشاهده همه
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" transform="rotate(180 12 12)"/>
            </svg>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p>هنوز محصولی ثبت نشده</p>
          </div>
        )}
      </section>

      {/* برندها */}
      <BrandShowcase brands={brands} />

    </main>
  );
}