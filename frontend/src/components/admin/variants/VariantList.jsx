"use client";

import { deleteVariant } from "@/services/variant.service";
import AttributeForm from "./AttributeForm";
import { useState } from "react";
import { formatPrice } from "@/utils/formatPrice";
import VariantEditForm from "./VariantEditForm";
import { deleteAttribute } from "@/services/attribute.service";
import styles from "./variants.module.css";

export default function VariantList({
  variants,
  onDeleteVariant,
  onDeleteAttribute,
  onUpdateVariantAttributes,
  onUpdateVariant,
}) {
  const [openVariantId, setOpenVariantId] = useState(null);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [deletingVariantId, setDeletingVariantId] = useState(null);
  const [deletingAttrId, setDeletingAttrId] = useState(null);
  const [confirmVariantId, setConfirmVariantId] = useState(null);
  const [confirmAttr, setConfirmAttr] = useState(null); // { variantId, attributeId }

  async function handleDeleteVariant(variantId) {
    try {
      setDeletingVariantId(variantId);
      await deleteVariant(variantId);
      onDeleteVariant?.(variantId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingVariantId(null);
      setConfirmVariantId(null);
    }
  }

  async function handleDeleteAttribute(variantId, attributeId) {
    try {
      setDeletingAttrId(attributeId);
      await deleteAttribute(attributeId);
      onDeleteAttribute?.(variantId, attributeId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingAttrId(null);
      setConfirmAttr(null);
    }
  }

  if (!variants || variants.length === 0) {
    return (
      <div className={styles.emptyVariants}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <p>هیچ وریانتی ثبت نشده</p>
      </div>
    );
  }

  return (
    <>
      {/* دیالوگ تأیید حذف وریانت */}
      {confirmVariantId && (
        <div className={styles.overlay} onClick={() => setConfirmVariantId(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className={styles.dialogTitle}>حذف وریانت</h3>
            <p className={styles.dialogText}>این وریانت و تمام ویژگی‌های آن حذف خواهند شد.</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmVariantId(null)}>انصراف</button>
              <button className={styles.confirmBtn} disabled={!!deletingVariantId} onClick={() => handleDeleteVariant(confirmVariantId)}>
                {deletingVariantId ? <><span className={styles.spinnerSm} />حذف...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* دیالوگ تأیید حذف ویژگی */}
      {confirmAttr && (
        <div className={styles.overlay} onClick={() => setConfirmAttr(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className={styles.dialogTitle}>حذف ویژگی</h3>
            <p className={styles.dialogText}>آیا از حذف این ویژگی مطمئن هستید؟</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmAttr(null)}>انصراف</button>
              <button className={styles.confirmBtn} disabled={!!deletingAttrId} onClick={() => handleDeleteAttribute(confirmAttr.variantId, confirmAttr.attributeId)}>
                {deletingAttrId ? <><span className={styles.spinnerSm} />حذف...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.variantList}>
        {variants.map((variant) => (
          <div key={variant.id} className={styles.variantCard}>

            {/* هدر وریانت */}
            <div className={styles.variantHeader}>
              <div className={styles.variantMeta}>
                <span className={styles.skuBadge}>{variant.sku}</span>
                <span className={`${styles.stockBadge} ${variant.stock_quantity > 0 ? styles.inStock : styles.outStock}`}>
                  {variant.stock_quantity > 0 ? `${variant.stock_quantity} عدد` : "ناموجود"}
                </span>
              </div>
              <div className={styles.variantActions}>
                <button
                  className={styles.editVarBtn}
                  onClick={() => setEditingVariantId(editingVariantId === variant.id ? null : variant.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  ویرایش
                </button>
                <button
                  className={styles.deleteVarBtn}
                  onClick={() => setConfirmVariantId(variant.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                  حذف
                </button>
              </div>
            </div>

            {/* اطلاعات قیمت */}
            <div className={styles.priceRow}>
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>قیمت</span>
                <span className={styles.priceValue}>{formatPrice(variant.price_modifier)} تومان</span>
              </div>
              {variant.discounted_price > 0 && (
                <div className={styles.priceItem}>
                  <span className={styles.priceLabel}>قیمت با تخفیف</span>
                  <span className={`${styles.priceValue} ${styles.discounted}`}>{formatPrice(variant.discounted_price)} تومان</span>
                </div>
              )}
            </div>

            {/* ویژگی‌ها */}
            {variant.attributes?.length > 0 && (
              <div className={styles.attrList}>
                {variant.attributes.map((attr) => (
                  <div key={attr.id} className={styles.attrChip}>
                    <span className={styles.attrName}>{attr.name}</span>
                    <span className={styles.attrSep}>:</span>
                    <span className={styles.attrValue}>{attr.value}</span>
                    <button
                      className={styles.attrDeleteBtn}
                      onClick={() => setConfirmAttr({ variantId: variant.id, attributeId: attr.id })}
                      aria-label="حذف ویژگی"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* فرم ویرایش وریانت */}
            {editingVariantId === variant.id && (
              <div className={styles.inlineForm}>
                <div className={styles.inlineFormHeader}>
                  <span className={styles.inlineFormTitle}>ویرایش وریانت</span>
                  <button className={styles.closeInlineBtn} onClick={() => setEditingVariantId(null)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <VariantEditForm
                  variant={variant}
                  onCancel={() => setEditingVariantId(null)}
                  onSuccess={(updatedVariant) => {
                    onUpdateVariant(updatedVariant);
                    setEditingVariantId(null);
                  }}
                />
              </div>
            )}

            {/* فرم افزودن ویژگی */}
            <div className={styles.variantFooter}>
              <button
                className={styles.addAttrBtn}
                onClick={() => setOpenVariantId(openVariantId === variant.id ? null : variant.id)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                افزودن ویژگی
              </button>
            </div>

            {openVariantId === variant.id && (
              <div className={styles.inlineForm}>
                <AttributeForm
                  variantId={variant.id}
                  onSuccess={(newAttr) => {
                    onUpdateVariantAttributes(variant.id, newAttr);
                    setOpenVariantId(null);
                  }}
                  onCacel={() => setOpenVariantId(null)}
                />
              </div>
            )}

          </div>
        ))}
      </div>
    </>
  );
}