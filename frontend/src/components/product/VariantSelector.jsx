"use client";

import styles from "./VariantSelector.module.css";

export default function VariantSelector({ variants, selectedVariantId, onChange }) {
  if (!variants?.length) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>انتخاب مدل</h3>

      <div className={styles.options}>
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.stock_quantity === 0;
          const label = variant.attributes
            .map((attribute) => `${attribute.name}: ${attribute.value}`)
            .join(" | ");

          return (
            <button
              key={variant.id}
              type="button"
              className={`${styles.option} ${isSelected ? styles.selected : ""} ${isOutOfStock ? styles.outOfStock : ""}`}
              onClick={() => !isOutOfStock && onChange(variant.id)}
              disabled={isOutOfStock}
            >
              {label || variant.sku}
              {isOutOfStock && <span className={styles.outOfStockTag}>ناموجود</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}