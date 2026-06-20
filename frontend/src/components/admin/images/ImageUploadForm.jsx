"use client";

import { useState, useRef } from "react";
import { uploadProductImage } from "@/services/image.service";
import styles from "./images.module.css";



export default function ImageUploadForm({ productId, onSuccess, productName }) {


  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const inputRef = useRef(null);


  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped || !dropped.type.startsWith("image/")) return;
    setFile(dropped);
    setPreview(URL.createObjectURL(dropped));
    setError(null);
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError("لطفاً یک تصویر انتخاب کنید"); return; }
    try {
      setLoading(true);
      setError(null);
      const image = await uploadProductImage({
        product_id: productId,
        image: file,
        alt_text: productName,
        is_primary: isPrimary,
      });
      onSuccess?.(image);
      handleRemove();
      setIsPrimary(false);
    } catch (err) {
      console.error(err);
      setError("خطا در آپلود تصویر، لطفاً دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.uploadForm} noValidate>

      {/* ناحیه drag & drop */}
      {!preview ? (
        <div
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          <p className={styles.dropzoneText}>تصویر را اینجا رها کنید یا کلیک کنید</p>
          <span className={styles.dropzoneHint}>PNG، JPG، WEBP — حداکثر ۵ مگابایت</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className={styles.previewWrap}>
          <img src={preview} alt="پیش‌نمایش" className={styles.previewImg} />
          <div className={styles.previewInfo}>
            <span className={styles.fileName}>{file?.name}</span>
            <span className={styles.fileSize}>{file ? `${(file.size / 1024).toFixed(0)} KB` : ""}</span>
          </div>
          <button type="button" className={styles.removeBtn} onClick={handleRemove} aria-label="حذف تصویر">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* چک‌باکس تصویر اصلی */}
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          className={styles.hiddenCheckbox}
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
        />
        <span className={`${styles.checkCustom} ${isPrimary ? styles.checked : ""}`}>
          {isPrimary && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </span>
        تنظیم به عنوان تصویر اصلی محصول
      </label>

      {error && (
        <div className={styles.error} role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <button type="submit" className={styles.uploadBtn} disabled={loading || !file}>
        {loading ? (
          <><span className={styles.spinner} />در حال آپلود...</>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            آپلود تصویر
          </>
        )}
      </button>
    </form>
  );
}