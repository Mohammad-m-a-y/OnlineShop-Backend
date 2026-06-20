"use client";

import { useState, useRef } from "react";
import { updateCategory, toggleCategoryStatus } from "@/services/category.service";
import styles from "./categoryForms.module.css";

export default function CategoryEditForm({ category, categories, onSuccess, onCancel }) {
  const [name, setName] = useState(category.name || "");
  const [slug, setSlug] = useState(category.slug || "");
  const [description, setDescription] = useState(category.description || "");
  const [parentId, setParentId] = useState(category.parent_id || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(category.full_image_url || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function handleImageChange(file) {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setPreview(null);
    setRemoveImage(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await updateCategory({
        category_id: category.id,
        name,
        slug,
        parent_id: parentId || null,
        description,
        image: imageFile,
        remove_image: removeImage,
      });
      onSuccess?.(updatedCategory);
    } catch (err) {
      console.error(err);
      setError("خطا در بروزرسانی دسته بندی");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus() {
    try {
      setToggleLoading(true);
      await toggleCategoryStatus(category.id);
      onSuccess?.({ ...category, is_active: !category.is_active });
    } catch (err) {
      console.error(err);
      setError("خطا در تغییر وضعیت");
    } finally {
      setToggleLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cef-name">نام<span className={styles.required}>*</span></label>
          <input id="cef-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cef-slug">Slug<span className={styles.required}>*</span></label>
          <input id="cef-slug" className={`${styles.input} ${styles.ltr}`} value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cef-description">توضیحات</label>
        <textarea
          id="cef-description"
          className={`${styles.input} ${styles.textarea}`}
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cef-parent">دسته والد</label>
        <select id="cef-parent" className={styles.select} value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">بدون والد</option>
          {categories
            .filter((c) => c.id !== category.id)
            .map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>تصویر دسته‌بندی</label>
        {!preview ? (
          <div className={styles.dropzone} onClick={() => fileRef.current?.click()}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className={styles.dropzoneText}>برای انتخاب تصویر جدید کلیک کنید</span>
          </div>
        ) : (
          <div className={styles.previewWrap}>
            <img src={preview} alt="پیش‌نمایش" className={styles.previewImg} />
            <span className={styles.fileName}>{imageFile?.name ?? "تصویر فعلی"}</span>
            <button type="button" className={styles.removeImgBtn} onClick={handleRemoveImage} aria-label="حذف تصویر">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={(e) => handleImageChange(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className={styles.formFooter}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>لغو</button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${category.is_active ? styles.toggleDeactivate : styles.toggleActivate}`}
          onClick={handleToggleStatus}
          disabled={toggleLoading}
        >
          {toggleLoading ? <span className={styles.spinnerSm} /> : (category.is_active ? "غیرفعال کردن" : "فعال کردن")}
        </button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinner} />در حال ذخیره...</> : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}