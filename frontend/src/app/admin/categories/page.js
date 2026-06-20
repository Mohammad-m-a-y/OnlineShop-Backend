"use client";

import { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "@/services/category.service";
import CategoryForm from "@/components/admin/categires/CategoryForm";
import CategoryEditForm from "@/components/admin/categires/CategoryEditForm";
import styles from "./CategoriesPage.module.css";
import { flattenCategories } from "@/utils/categoryTree";




export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);


  const allCategories = flattenCategories(categories);


  function updateCategoryInTree(categories, updatedCategory) {
    return categories.map((category) => {
      if (category.id === updatedCategory.id) {
        return updatedCategory;
      }

      return {
        ...category,
        children: category.children ? updateCategoryInTree(category.children, updatedCategory)
          : [],
      };
    });
  }



  function removeCategoryFromTree(categories, categoryId) {
    return categories.filter((category) =>
      category.id !== categoryId
    ).map((category) => ({
      ...category,
      children: category.children ? removeCategoryFromTree(category.children, categoryId)
        : [],
    }));
  }




  async function handleDeleteCategory(id) {
    try {
      setDeletingId(id);
      await deleteCategory(id);

      setCategories((prev) =>
        removeCategoryFromTree(prev, id)
      );

      if (editingCategory?.id === id) setEditingCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  // پیدا کردن نام دسته والد برای نمایش
  function getParentName(parentId) {
    if (!parentId) return null;

    return (
      allCategories.find(
        (c) => c.id === parentId
      )?.name ?? null
    );
  }

  return (
    <div className={styles.page}>

      {/* دیالوگ تأیید حذف */}
      {confirmId && (
        <div className={styles.overlay} onClick={() => setConfirmId(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </div>
            <h3 className={styles.dialogTitle}>حذف دسته‌بندی</h3>
            <p className={styles.dialogText}>آیا از حذف این دسته‌بندی مطمئن هستید؟ این عمل قابل بازگشت نیست.</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelDialogBtn} onClick={() => setConfirmId(null)}>انصراف</button>
              <button className={styles.confirmDialogBtn} disabled={!!deletingId} onClick={() => handleDeleteCategory(confirmId)}>
                {deletingId ? <><span className={styles.spinnerSm} />حذف...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>مدیریت دسته‌بندی‌ها</h1>
          <p className={styles.pageSubtitle}>{!loading && `${allCategories.length} دسته‌بندی`}</p>
        </div>
        {!showForm && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            افزودن دسته‌بندی
          </button>
        )}
      </div>

      {/* فرم افزودن */}
      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formCardTitle}>دسته‌بندی جدید</h2>
            <button className={styles.closeFormBtn} onClick={() => setShowForm(false)} aria-label="بستن">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <CategoryForm
            categories={categories}
            onCancel={() => setShowForm(false)}
            onSuccess={(data) => {
              setCategories((prev) => [...prev, data]);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* فرم ویرایش */}
      {editingCategory && (
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formCardTitle}>ویرایش دسته‌بندی</h2>
            <button className={styles.closeFormBtn} onClick={() => setEditingCategory(null)} aria-label="بستن">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <CategoryEditForm
            category={editingCategory}
            categories={categories}
            onCancel={() => setEditingCategory(null)}
            onSuccess={(updatedCategory) => {
              setCategories((prev) => updateCategoryInTree( prev,updatedCategory) );
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      {/* لیست دسته‌بندی‌ها */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.spinner} />
          در حال بارگذاری دسته‌بندی‌ها...
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.empty}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-3H5a2 2 0 0 0-2 3z" />
          </svg>
          <p>هنوز دسته‌بندی‌ای ثبت نشده</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {allCategories.map((category) => {
            const parentName = getParentName(category.parent_id);
            return (
              <div key={category.id} className={styles.card}>
                <div className={styles.cardTop}>
                  {category.image_url ? (
                    <img src={category.full_image_url} alt={category.name} className={styles.cardImage} />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-3H5a2 2 0 0 0-2 3z" />
                      </svg>
                    </div>
                  )}
                  <span className={`${styles.statusBadge} ${category.is_active ? styles.active : styles.inactive}`}>
                    {category.is_active ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{category.name}</h3>
                  <span className={styles.cardSlug}>{category.slug}</span>
                  {parentName && (
                    <span className={styles.parentTag}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" transform="rotate(180 12 12)" />
                      </svg>
                      زیرمجموعه {parentName}
                    </span>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => setEditingCategory(category)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    ویرایش
                  </button>
                  <button className={styles.deleteBtn} onClick={() => setConfirmId(category.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}