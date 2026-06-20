"use client";

import { useState, useRef } from "react";
import { createBrand } from "@/services/brand.service";
import styles from "./brandForms.module.css";


export default function BrandForm({ onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function handleNameChange(value) {
    setName(value);
    setSlug(value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
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
      const data = await createBrand({ name, slug, description, image: imageFile });
      onSuccess?.(data);
    } catch (err) {
      console.error(err);
      setError("خطا در ایجاد برند. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="brand-name">نام برند<span className={styles.required}>*</span></label>
          <input
            id="brand-name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="مثلاً: Apple"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="brand-slug">Slug<span className={styles.required}>*</span></label>
          <input
            id="brand-slug"
            type="text"
            className={`${styles.input} ${styles.ltr}`}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="apple"
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="brand-description">توضیحات</label>
        <textarea
          id="brand-description"
          className={`${styles.input} ${styles.textarea}`}
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیح کوتاهی درباره این برند"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>لوگوی برند</label>
        {!preview ? (
          <div className={styles.dropzone} onClick={() => fileRef.current?.click()}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span className={styles.dropzoneText}>برای انتخاب لوگو کلیک کنید</span>
            <input
              ref={fileRef}
              id="brand-image"
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
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
          {loading ? <><span className={styles.spinner} />در حال ثبت...</> : "ثبت برند"}
        </button>
      </div>
    </form>
  );
}