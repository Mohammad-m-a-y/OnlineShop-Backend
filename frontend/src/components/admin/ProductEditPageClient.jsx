"use client";
import { useEffect, useState } from "react";
import { getProductById } from "@/services/product.service";
import Image from "next/image";
import VariantForm from "@/components/admin/variants/VariantForm";
import VariantList from "@/components/admin/variants/VariantList";
import ImageUploadForm from "@/components/admin/images/ImageUploadForm";
import { deleteProductImage } from "@/services/image.service";
import ImageOrderForm from "./images/ImageOrderForm";
import styles from "./ProductEditPageClient.module.css";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/formatPrice";
import ProductForm from "./ProductForm";




export default function ProductEditPageClient({ productId }) {
  const [activeTab, setActiveTab] = useState("info");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [ isEditing , setIsEditing ] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  function handleUpdateVariantAttributes(variantId, newAttr) {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId
          ? { ...v, attributes: [...v.attributes, newAttr] }
          : v
      ),
    }));
  }

  function handleUpdateVariant(updatedVariant) {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === updatedVariant.id ? updatedVariant : v
      ),
    }));
  }

  async function handleDeleteImage(imgId) {
    try {
      setDeletingImageId(imgId);
      await deleteProductImage(product.id, imgId);
      setProduct((prev) => ({
        ...prev,
        images: prev.images.filter((image) => image.id !== imgId),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingImageId(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.spinner} />
        در حال بارگذاری محصول...
      </div>
    );
  }

  const tabs = [
    {
      key: "info",
      label: "اطلاعات پایه",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    {
      key: "variants",
      label: "وریانت‌ها",
      count: product?.variants?.length,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ),
    },
    {
      key: "images",
      label: "تصاویر",
      count: product?.images?.length,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.page}>

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            ویرایش محصول
            <span className={styles.productName}>{product?.name}</span>
          </h1>
          <div className={styles.metaRow}>
            <span className={`${styles.metaBadge} ${product?.is_active ? styles.badgeActive : styles.badgeInactive}`}>
              {product?.is_active ? "فعال" : "غیرفعال"}
            </span>
            <span className={styles.metaSlug}>{product?.slug}</span>
          </div>
        </div>
      </div>

      {/* تب‌ها */}
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* محتوای تب‌ها */}
      <div className={styles.tabContent}>

        {/* ── تب اطلاعات ── */}
        {(activeTab === "info" && !isEditing )&& (
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>

              <h2 className={styles.cardTitle}>اطلاعات پایه</h2>

              <dl className={styles.infoList}>
                <div className={styles.infoRow}>
                  <dt>نام محصول</dt>
                  <dd>{product.name}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>Slug</dt>
                  <dd className={styles.ltr}>{product.slug}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>قیمت پایه</dt>
                  <dd>{formatPrice(product.base_price)} تومان</dd>
                </div>
                {product.short_description && (
                  <div className={styles.infoRow}>
                    <dt>توضیح کوتاه</dt>
                    <dd>{product.short_description}</dd>
                  </div>
                )}
              </dl>

                 <button
                  className={styles.editInfoBtn}
                  onClick={()=> setIsEditing(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  ویرایش
                </button>

            </div>
            {product.description && (
              <div className={styles.infoCard}>
                <h2 className={styles.cardTitle}>توضیحات کامل</h2>
                <p className={styles.description}>{product.description}</p>
              </div>
            )}
          </div>

        )}

        {/* ویرایش اطلاعات محصول */}
        {(activeTab === "info" && isEditing) && (
          <ProductForm
            product={product}
            cacelEdit={()=> setIsEditing(false)} 
            onSuccess={setProduct}
          />

        )}




        {/* ── تب وریانت‌ها ── */}
        {activeTab === "variants" && (
          <div className={styles.sectionWrap}>
            <VariantList
              variants={product?.variants}
              onUpdateVariant={handleUpdateVariant}
              onDeleteVariant={(id) =>
                setProduct((prev) => ({
                  ...prev,
                  variants: prev.variants.filter((v) => v.id !== id),
                }))
              }
              onDeleteAttribute={(variantId, attributeId) =>
                setProduct((prev) => ({
                  ...prev,
                  variants: prev.variants.map((variant) =>
                    variant.id === variantId
                      ? {
                          ...variant,
                          attributes: variant.attributes.filter(
                            (attr) => attr.id !== attributeId
                          ),
                        }
                      : variant
                  ),
                }))
              }
              onUpdateVariantAttributes={handleUpdateVariantAttributes}
            />

            {!showVariantForm ? (
              <button className={styles.addBtn} onClick={() => setShowVariantForm(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                افزودن وریانت
              </button>
            ) : (
              <div className={styles.formBox}>
                <div className={styles.formBoxHeader}>
                  <h3 className={styles.formBoxTitle}>وریانت جدید</h3>
                  <button className={styles.closeFormBtn} onClick={() => setShowVariantForm(false)} aria-label="بستن">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <VariantForm
                  productId={product?.id}
                  onCancel={() => setShowVariantForm(false)}
                  onSuccess={(newVariant) => {
                    setProduct((prev) => ({
                      ...prev,
                      variants: [...prev.variants, newVariant],
                    }));
                    setShowVariantForm(false);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* ── تب تصاویر ── */}
        {activeTab === "images" && (
          <div className={styles.sectionWrap}>
            {product.images.length === 0 ? (
              <div className={styles.emptyImages}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>هنوز تصویری آپلود نشده</p>
              </div>
            ) : (
              <div className={styles.imagesGrid}>
                {product.images.map((img) => (
                  <div key={img?.id} className={`${styles.imageCard} ${img?.is_primary ? styles.primaryImage : ""}`}>
                    {img?.is_primary && (
                      <span className={styles.primaryBadge}>تصویر اصلی</span>
                    )}
                    <div className={styles.imageThumb}>
                      <Image
                        unoptimized
                        src={img.full_image_url}
                        width={160}
                        height={160}
                        alt={img.alt_text || product.name}
                        className={styles.image}
                      />
                    </div>
                    <div className={styles.imageInfo}>
                      <span className={styles.imageOrder}>ترتیب: {img?.display_order}</span>
                      <ImageOrderForm
                        productId={product.id}
                        image={img}
                        onSuccess={(updatedImage) =>
                          setProduct((prev) => ({
                            ...prev,
                            images: prev.images.map((image) =>
                              image.id === updatedImage.id ? updatedImage : image
                            ),
                          }))
                        }
                      />
                      <button
                        className={styles.deleteImageBtn}
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={deletingImageId === img.id}
                      >
                        {deletingImageId === img.id ? (
                          <span className={styles.spinnerSm} />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        )}
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.formBox}>
              <h3 className={styles.formBoxTitle}>آپلود تصویر جدید</h3>
              <ImageUploadForm
                productId={product.id}
                productName={product.name}
                onSuccess={(newImage) =>
                  setProduct((prev) => ({
                    ...prev,
                    images: [...prev.images, newImage],
                  }))
                }
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}