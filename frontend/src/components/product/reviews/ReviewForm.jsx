"use client"

import { createReview } from "@/services/review.service"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link";
import StarRating from "./StarRating";
import styles from "./ReviewForm.module.css";

export default function ReviewForm({ productId, parentId = null, onSuccess, onCancel }) {
  const [title, setTitle] = useState("")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { isAuthenticated } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError("لطفاً متن نظر خود را وارد کنید");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await createReview({
        rating,
        title,
        comment,
        parent_id: parentId,
        productId,
      });

      setTitle("");
      setComment("");
      setRating(5);

      onSuccess?.(data);
    } catch (err) {
      console.error(err);
      setError("خطا در بارگزاری نظر");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.authNotice}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p>برای ارسال نظر باید به حساب کاربری خود وارد شوید</p>
        <Link href="/login" className={styles.authLink}>ورود به حساب کاربری</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>

      {!parentId && (
        <div className={styles.field}>
          <label className={styles.label}>امتیاز شما</label>
          <StarRating rating={rating} size={26} interactive onChange={setRating} />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="rc-title">موضوع</label>
        <input
          id="rc-title"
          className={styles.input}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="اختیاری"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="rc-comment">
          {parentId ? "پاسخ شما" : "نظر شما"}
        </label>
        <textarea
          id="rc-comment"
          className={`${styles.input} ${styles.textarea}`}
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نظر خود را اینجا وارد کنید"
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
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinner} />در حال ارسال...</> : "ثبت نظر"}
        </button>
      </div>
    </form>
  );
}