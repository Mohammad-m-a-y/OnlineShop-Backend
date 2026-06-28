"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/utils/formatPrice";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "./ProductGallery";
import ReviewsList from "./reviews/ReviewsList";
import styles from "./ProductDetails.module.css";
import RelatedProducts from "./related/RelatedProducts";


export default function ProductDetails({ product }) {

  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id ?? null);

  const selectedVariant = useMemo(() => {
    return product.variants.find((variant) => variant.id === selectedVariantId) || null;
  }, [product.variants, selectedVariantId]);

  const originalPrice = selectedVariant?.price_modifier ?? product.base_price;
  const finalPrice = selectedVariant?.discounted_price ?? null;
  const hasDiscount = finalPrice && Number(finalPrice) < Number(originalPrice);
  const isOutOfStock = selectedVariant && selectedVariant.stock_quantity === 0;

  return (
    <div className={styles.page}>

      <div className={styles.productPage}>

        {/* گالری تصاویر */}
        <div className={styles.gallerySection}>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* اطلاعات محصول */}
        <div className={styles.infoSection}>

          {product.brand && (
            <span className={styles.brandTag}>{product.brand.name}</span>
          )}

          <h1 className={styles.title}>{product.name}</h1>

          {product.short_description && (
            <p className={styles.shortDesc}>{product.short_description}</p>
          )}

          {/* قیمت */}
          <div className={styles.priceBox}>
            {selectedVariant ? (
              hasDiscount ? (
                <>
                  <span className={styles.oldPrice}>{formatPrice(originalPrice)} تومان</span>
                  <span className={styles.finalPrice}>{formatPrice(finalPrice)} تومان</span>
                  <span className={styles.discountBadge}>
                    {Math.round((1 - finalPrice / originalPrice) * 100)}٪ تخفیف
                  </span>
                </>
              ) : (
                <span className={styles.finalPrice}>{formatPrice(originalPrice)} تومان</span>
              )
            ) : (
              <span className={styles.finalPrice}>{formatPrice(product.base_price)} تومان</span>
            )}
          </div>

          {/* موجودی + SKU */}
          {selectedVariant && (
            <div className={styles.metaRow}>
              <span className={`${styles.stockTag} ${isOutOfStock ? styles.outOfStock : styles.inStock}`}>
                {isOutOfStock ? "ناموجود" : `${selectedVariant.stock_quantity} عدد در انبار`}
              </span>
              <span className={styles.skuTag}>SKU: {selectedVariant.sku}</span>
            </div>
          )}

          {/* انتخاب وریانت */}
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onChange={setSelectedVariantId}
          />

          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant?.id}
            disabled={isOutOfStock}
          />

          {product.description && (
            <div className={styles.descriptionBox}>
              <h2 className={styles.descTitle}>توضیحات محصول</h2>
              <p className={styles.descText}>{product.description}</p>
            </div>
          )}

        </div>
      </div>

      <RelatedProducts
        productId={product.id}
      />

      {/* نظرات */}
      <div className={styles.reviewsSection}>
        <ReviewsList productId={product.id} />
      </div>

    </div>
  );
}