"use client"

import { useState, useEffect } from "react"
import { getProductReviews } from "@/services/review.service"
import ReviewForm from "./ReviewForm"
import ReviewItem from "./ReviewItem";
import { insertReplyIntoTree, updateReviewInTree, removeReviewFromTree } from "@/utils/reviewTree";
import styles from "./ReviewsList.module.css";

export default function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openForm, setOpenForm] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const data = await getProductReviews({productId:productId, page: 1, page_size: 10 })
        setReviews(data)
        
      } catch (err) {
        console.error(err)
        setError("خطا در بارگزاری نظرات")
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [productId])

  const handleReviewCreated = (review) => {
    setReviews((prev) => {
      if (!review.parent_id) {
        return { ...prev, items: [review, ...prev.items] };
      }
      return { ...prev, items: insertReplyIntoTree(prev.items, review) };
    });
    setOpenForm(false);
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews((prev) => ({
      ...prev,
      items: updateReviewInTree(prev.items, updatedReview),
    }));
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => ({
      ...prev,
      items: removeReviewFromTree(prev.items, reviewId),
    }));
  };


  // میانگین امتیاز برای نمایش خلاصه
  const averageRating = reviews?.items?.length
    ? (
        reviews.items.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.items.length
      ).toFixed(1)
    : null;

  return (
    <div className={styles.wrapper}>

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>تجربه خرید</h2>
          {averageRating && (
            <div className={styles.summary}>
              <span className={styles.averageScore}>{averageRating}</span>
              <span className={styles.summaryText}>از ۵ — بر اساس {reviews.items.length} نظر</span>
            </div>
          )}
        </div>

        {!openForm && (
          <button className={styles.addReviewBtn} onClick={() => setOpenForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            ارسال نظر
          </button>
        )}
      </div>

      {openForm && (
        <div className={styles.formWrap}>
          <ReviewForm
            productId={productId}
            parentId={null}
            onSuccess={handleReviewCreated}
            onCancel={() => setOpenForm(false)}
          />
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.spinner} />
          در حال بارگذاری نظرات...
        </div>
      ) : reviews?.items?.length ? (
        <div className={styles.list}>
          {reviews.items.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              productId={productId}
              onReviewCreated={handleReviewCreated}
              onReviewUpdated={handleReviewUpdated}
              onReviewDeleted={handleReviewDeleted}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <p>هنوز نظری برای این محصول ثبت نشده</p>
        </div>
      )}

    </div>
  );
}