"use client";

import { useState } from "react";
import styles from "./ProductGallery.module.css";

export default function ProductGallery({ images = [], productName }) {
  const [selectedImage, setSelectedImage] = useState(images[0] ?? null);

  if (!images.length) {
    return (
      <div className={styles.empty}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
        <p>تصویری وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* تصویر اصلی */}
      <div className={styles.mainImageWrapper}>
        <img
          src={selectedImage.full_image_url}
          alt={selectedImage.alt_text ?? productName}
          className={styles.mainImage}
        />
      </div>

      {/* تصاویر کوچک */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              className={`${styles.thumbnailBtn} ${selectedImage.id === image.id ? styles.active : ""}`}
              onClick={() => setSelectedImage(image)}
              aria-label={image.alt_text ?? productName}
            >
              <img
                src={image.full_image_url}
                alt={image.alt_text ?? productName}
                className={styles.thumbnail}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}