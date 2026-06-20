import styles from "./ProductCard.module.css";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";



export default function ProductCard({ product }) {


  const image = product.images?.[0]?.full_image_url ?? null;
  const isAvailable = product.is_available;

  return (
    <Link href={`/products/${product.slug}`} className={styles.link}>
      <div className={`${styles.card} ${!isAvailable ? styles.unavailable : ""}`}>

        {/* تصویر */}
        <div className={styles.imageWrap}>
          {image ? (
            <img src={image} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          {/* بج موجودی */}
          {!isAvailable && (
            <span className={styles.badge}>ناموجود</span>
          )}
        </div>

        {/* محتوا */}
        <div className={styles.body}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.description}>{product.short_description}</p>

          <div className={styles.footer}>
            <div className={styles.priceWrap}>
              <span className={styles.price}>{formatPrice(product.base_price)}</span>
              <span className={styles.unit}>تومان</span>
            </div>

            <span className={styles.cartIcon} aria-label="مشاهده محصول">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}