import styles from "./BrandShowcase.module.css";

function BrandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

export default function BrandShowcase({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>برندهای ما</h2>
      </div>

      <div className={styles.strip}>
        {brands.map((brand) => (
          <div key={brand.id} className={styles.brandCard}>
            {brand.image_url ? (
              <img src={brand.full_image_url} alt={brand.name} className={styles.logo} />
            ) : (
              <div className={styles.placeholder}>
                <BrandIcon />
              </div>
            )}
            <span className={styles.name}>{brand.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}