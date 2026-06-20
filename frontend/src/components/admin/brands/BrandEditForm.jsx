"use client";

import { useState, useRef } from "react";
import { updateBrand, toggleBrandStatus } from "@/services/brand.service";
import styles from "./brandForms.module.css";

export default function BrandEditForm({ brand, onSuccess, onCancel }) {
  const [name, setName] = useState(brand.name);
  const [slug, setSlug] = useState(brand.slug);
  const [description, setDescription] = useState(brand.description || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(brand.full_image_url || null);
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
      const updatedBrand = await updateBrand({
        brand_id: brand.id,
        name:name,
        slug:slug,
        description:description,
        image: imageFile,
        remove_image: removeImage,
      });
      onSuccess?.(updatedBrand);
    } catch (err) {
      console.error(err);
      setError("خطا در بروزرسانی برند");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus() {
    try {
      setToggleLoading(true);
      const updatedBrand = await toggleBrandStatus(brand.id);
      onSuccess?.(updatedBrand);
    } catch (err) {
      console.error(err);
      setError("خطا در تغییر وضعیت برند");
    } finally {
      setToggleLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="bef-name">نام برند<span className={styles.required}>*</span></label>
          <input id="bef-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="bef-slug">Slug<span className={styles.required}>*</span></label>
          <input id="bef-slug" className={`${styles.input} ${styles.ltr}`} value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="bef-description">توضیحات</label>
        <textarea
          id="bef-description"
          className={`${styles.input} ${styles.textarea}`}
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>لوگوی برند</label>
        {!preview ? (
          <div className={styles.dropzone} onClick={() => fileRef.current?.click()}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span className={styles.dropzoneText}>برای انتخاب لوگوی جدید کلیک کنید</span>
          </div>
        ) : (
          <div className={styles.previewWrap}>
            <img src={preview} alt={brand.name} className={styles.previewImg} />
            <span className={styles.fileName}>{imageFile?.name ?? "لوگوی فعلی"}</span>
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
          onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
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
          className={`${styles.toggleBtn} ${brand.is_active ? styles.toggleDeactivate : styles.toggleActivate}`}
          onClick={handleToggleStatus}
          disabled={toggleLoading}
        >
          {toggleLoading ? <span className={styles.spinnerSm} /> : (brand.is_active ? "غیرفعال کردن" : "فعال کردن")}
        </button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinner} />در حال ذخیره...</> : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}