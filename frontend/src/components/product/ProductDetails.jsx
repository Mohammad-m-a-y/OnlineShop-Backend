"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/utils/formatPrice";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "./ProductGallery";
import styles from "./ProductCard.module.css"
import ReviewsList from "./reviews/ReviewsList";



export default function ProductDetails({ product }) {
    const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id ?? null);

    const selectedVariant = useMemo(() => {
        return (
            product.variants.find(
                (variant) => variant.id === selectedVariantId
            ) || null
        );
    }, [product.variants, selectedVariantId]);

    const originalPrice = selectedVariant?.price_modifier ?? product.base_price;

    const finalPrice = selectedVariant?.discounted_price ?? null



    return (
        <div>

            <div className={styles.productPage}>
                <div className={styles.gallerySection}>
                    <ProductGallery
                        images={product.images}
                        productName={product.name}
                    />
                </div>

                <div className={styles.infoSection}>


                    <h1>{product.name}</h1>

                    <p>{product.short_description}</p>

                    <p>{product.description}</p>

                    {/* قیمت */}
                    <div>
                        <h3>قیمت</h3>

                        {selectedVariant ? (
                            <>
                                {Number(finalPrice) < Number(originalPrice) && (
                                        <p
                                            style={{
                                                textDecoration: "line-through",
                                                color: "#888",
                                            }}
                                        >
                                            {formatPrice(originalPrice)} تومان
                                        </p>
                                    )}

                                <p
                                    style={{
                                        fontSize: "22px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {formatPrice(finalPrice)} تومان
                                </p>
                            </>
                        ) : (
                            <p>
                                {formatPrice(product.base_price)} تومان
                            </p>
                        )}
                    </div>

                    {/* موجودی */}
                    <div>
                        <strong>موجودی:</strong>{" "}
                        {selectedVariant
                            ? selectedVariant.stock_quantity
                            : "-"}
                    </div>

                    {/* SKU */}
                    {selectedVariant && (
                        <div>
                            <strong>SKU:</strong>{" "}
                            {selectedVariant.sku}
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
                    />

                </div>
            </div>


            <ReviewsList productId={product.id} />



        </div>
    );
}