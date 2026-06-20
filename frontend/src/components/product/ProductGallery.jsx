"use client";

import { useState } from "react";
import styles from "./ProductGallery.module.css";

export default function ProductGallery({
  images = [],
  productName,
}) {
  const [selectedImage, setSelectedImage] = useState(images[0] ?? null);

  if (!images.length) {
    return (
      <div className={styles.empty}>
        تصویری وجود ندارد
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* تصویر اصلی */}
      <div className={styles.mainImageWrapper}>
        <img src={selectedImage.full_image_url} alt={selectedImage.alt_text ?? productName} className={styles.mainImage} />
      </div>

      {/* تصاویر کوچک */}
      <div className={styles.thumbnails}>
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            className={`${styles.thumbnailBtn}
            ${
              selectedImage.id === image.id
                ? styles.active
                : ""
            }`}
            onClick={() =>
              setSelectedImage(image)
            }
          >
            <img src={image.full_image_url} alt={selectedImage.alt_text ?? productName} className={styles.thumbnail}/>
          </button>
        ))}
      </div>
    </div>
  );
}