import Link from "next/link";
import styles from "./CategoryShowcase.module.css";

// آیکون پیش‌فرض برای دسته‌بندی‌هایی که تصویر ندارند
function CategoryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-3H5a2 2 0 0 0-2 3z"/>
    </svg>
  );
}

export default function CategoryShowcase({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>دسته‌بندی‌ها</h2>
        <Link href="/products" className={styles.viewAll}>
          مشاهده همه
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" transform="rotate(180 12 12)"/>
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category_ids=${category.id}`}
            className={styles.card}
          >
            <div className={styles.imageWrap}>
              {category.image_url ? (
                <img src={category.full_image_url} alt={category.name} className={styles.image} />
              ) : (
                <div className={styles.placeholder}>
                  <CategoryIcon />
                </div>
              )}
            </div>
            <span className={styles.name}>{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}