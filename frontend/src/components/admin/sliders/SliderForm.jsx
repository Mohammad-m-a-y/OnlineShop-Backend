"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSlider, updateSlider } from "@/services/slider.service";
import styles from "./SliderForm.module.css";


// mode: "create" | "edit"
export default function SliderForm({ mode = "create", slider = null }) {
  const router = useRouter();

  const [title, setTitle] = useState(slider?.title ?? "");
  const [description, setDescription] = useState(slider?.description ?? "");
  const [linkUrl, setLinkUrl] = useState(slider?.link_url ?? "");
  const [buttonText, setButtonText] = useState(slider?.button_text ?? "");
  const [displayOrder, setDisplayOrder] = useState(slider?.display_order ?? 0);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(slider?.full_image_url ?? null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

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

    if (mode === "create" && !imageFile) {
      setError("تصویر اسلایدر الزامی است");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("display_order", Number(displayOrder));
      if (description) formData.append("description", description);
      if (linkUrl) formData.append("link_url", linkUrl);
      if (buttonText) formData.append("button_text", buttonText);
      if (imageFile) formData.append("image", imageFile);

      if (mode === "create") {
        await createSlider({ title, description, link_url: linkUrl, button_text: buttonText, display_order: Number(displayOrder), image: imageFile });
      } else {
        await updateSlider(slider.id, formData);
      }

      router.push("/admin/sliders");
    } catch (err) {
      console.error(err);
      setError(mode === "create" ? "خطا در ایجاد اسلایدر" : "خطا در بروزرسانی اسلایدر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>

      {/* تصویر */}
      <div className={styles.field}>
        <label className={styles.label}>
          تصویر اسلایدر
          {mode === "create" && <span className={styles.required}>*</span>}
        </label>

        {!preview ? (
          <div className={styles.dropzone} onClick={() => fileRef.current?.click()}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <p className={styles.dropzoneText}>تصویر را اینجا رها کنید یا کلیک کنید</p>
            <span className={styles.dropzoneHint}>توصیه: نسبت ۱۶:۶ — PNG یا JPG</span>
          </div>
        ) : (
          <div className={styles.previewWrap}>
            <img src={preview} alt="پیش‌نمایش" className={styles.previewImg} />
            <button type="button" className={styles.removeImgBtn} onClick={handleRemoveImage} aria-label="حذف تصویر">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
        />
      </div>

      {/* ردیف عنوان + ترتیب */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sl-title">
            عنوان<span className={styles.required}>*</span>
          </label>
          <input
            id="sl-title"
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: جشنواره تخفیف تابستانه"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sl-order">
            ترتیب نمایش<span className={styles.required}>*</span>
          </label>
          <input
            id="sl-order"
            className={`${styles.input} ${styles.ltr}`}
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            required
          />
        </div>
      </div>

      {/* توضیحات */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="sl-desc">توضیحات</label>
        <textarea
          id="sl-desc"
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="زیرعنوان اسلایدر..."
        />
      </div>

      {/* ردیف لینک + متن دکمه */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sl-link">لینک دکمه</label>
          <input
            id="sl-link"
            className={`${styles.input} ${styles.ltr}`}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/products"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sl-btn">متن دکمه</label>
          <input
            id="sl-btn"
            className={styles.input}
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="مشاهده محصولات"
          />
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className={styles.formFooter}>
        <button type="button" className={styles.cancelBtn} onClick={() => router.push("/admin/sliders")} disabled={loading}>
          انصراف
        </button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <><span className={styles.spinner} />{mode === "create" ? "در حال ایجاد..." : "در حال ذخیره..."}</>
          ) : (
            mode === "create" ? "ایجاد اسلایدر" : "ذخیره تغییرات"
          )}
        </button>
      </div>
    </form>
  );
}