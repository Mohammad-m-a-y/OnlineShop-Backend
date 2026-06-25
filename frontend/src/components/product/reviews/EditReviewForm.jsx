"use client";

import { useState } from "react";
import { updateReview } from "@/services/review.service";
import StarRating from "./StarRating";
import styles from "./ReviewForm.module.css";



export default function EditReviewForm({ review, onSuccess, onCancel }) {
  const [title, setTitle] = useState(review.title || "");
  const [comment, setComment] = useState(review.comment);
  const [rating, setRating] = useState(review.rating);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updated = await updateReview({
        review_id: review.id,
        title,
        comment,
        rating,
      });
      onSuccess(updated);
    } catch (err) {
      console.error(err);
      setError("خطا در ویرایش نظر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>

      {!review.parent_id && (
        <div className={styles.field}>
          <label className={styles.label}>امتیاز</label>
          <StarRating rating={rating} size={26} interactive onChange={setRating} />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="erf-title">موضوع</label>
        <input
          id="erf-title"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان (اختیاری)"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="erf-comment">نظر</label>
        <textarea
          id="erf-comment"
          className={`${styles.input} ${styles.textarea}`}
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
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
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>انصراف</button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinner} />در حال ذخیره...</> : "ذخیره"}
        </button>
      </div>
    </form>
  );
}