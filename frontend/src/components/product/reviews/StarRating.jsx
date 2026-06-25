import styles from "./StarRating.module.css";

export default function StarRating({ rating, size = 18, interactive = false, onChange }) {
  return (
    <div className={styles.row} style={{ gap: `${Math.max(2, size * 0.1)}px` }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${styles.star} ${star <= rating ? styles.filled : ""} ${interactive ? styles.interactive : ""}`}
          style={{ fontSize: size }}
          onClick={interactive ? () => onChange?.(star) : undefined}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `امتیاز ${star} از ۵` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}