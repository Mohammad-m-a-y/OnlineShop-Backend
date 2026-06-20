"use client";
import { useState, useRef } from "react";
import { createCategory } from "@/services/category.service";
import styles from "./categoryForms.module.css";



export default function CategoryForm({ onSuccess, categories, onCancel }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  function handleNameChange(value) {
    setName(value);
    setSlug(
      value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    );
  }

  function handleImageChange(file) {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await createCategory({
        name,
        slug,
        parent_id: parentId || null,
        description,
        image: imageFile,
      });
      onSuccess?.(data);
    } catch (err) {
      console.error(err);
      setError("خطا در افزودن دسته بندی لطفا دوباره تلاش کنید!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-name">نام دسته<span className={styles.required}>*</span></label>
          <input
            type="text"
            id="cf-name"
            className={styles.input}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="مثلاً: لوازم الکترونیکی"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-slug">Slug<span className={styles.required}>*</span></label>
          <input
            type="text"
            id="cf-slug"
            className={`${styles.input} ${styles.ltr}`}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="electronics"
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-description">توضیحات</label>
        <input
          type="text"
          id="cf-description"
          className={styles.input}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیح کوتاهی درباره این دسته‌بندی"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-parent">دسته والد</label>
        <select
          id="cf-parent"
          className={styles.select}
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">بدون والد</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
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
            <span className={styles.dropzoneText}>برای انتخاب تصویر کلیک کنید</span>
            <input
              ref={fileRef}
              id="cf-image"
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => handleImageChange(e.target.files[0])}
            />
          </div>
        ) : (
          <div className={styles.previewWrap}>
            <img src={preview} alt="پیش‌نمایش" className={styles.previewImg} />
            <span className={styles.fileName}>{imageFile?.name}</span>
            <button type="button" className={styles.removeImgBtn} onClick={handleRemoveImage} aria-label="حذف تصویر">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
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
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinner} />در حال ثبت...</> : "افزودن دسته‌بندی"}
        </button>
      </div>
    </form>
  );
}