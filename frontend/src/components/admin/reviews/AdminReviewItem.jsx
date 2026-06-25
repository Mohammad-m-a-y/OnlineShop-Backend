"use client";

import { useState } from "react";
import StarRating from "@/components/product/reviews/StarRating";
import styles from "./AdminReviewItem.module.css";

export default function AdminReviewItem({ review, onToggleApproval, depth = 0 }) {
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    try {
      setToggling(true);
      await onToggleApproval(review.id);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className={`${styles.card} ${review.is_approved ? styles.approved : styles.pending} ${depth > 0 ? styles.replyCard : ""}`}>

      {/* هدر */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {(review.user.full_name || review.user.username)?.charAt(0)}
          </div>
          <div>
            <div className={styles.user}>{review.user.full_name || review.user.username}</div>
            <div className={styles.username}>@{review.user.username}</div>
          </div>
        </div>

        <span className={`${styles.badge} ${review.is_approved ? styles.badgeApproved : styles.badgePending}`}>
          {review.is_approved ? "تایید شده" : "در انتظار تایید"}
        </span>
      </div>

      {/* امتیاز (فقط برای نظرات اصلی، نه پاسخ‌ها) */}
      {!review.parent_id && (
        <div className={styles.ratingRow}>
          <StarRating rating={review.rating} size={16} />
          <span className={styles.ratingNumber}>{review.rating}/۵</span>
        </div>
      )}

      {/* محتوا */}
      {review.title && <h3 className={styles.title}>{review.title}</h3>}
      <p className={styles.comment}>{review.comment}</p>

      <div className={styles.date}>
        {new Date(review.created_at).toLocaleDateString("fa-IR")}
      </div>

      {/* فوتر: اطلاعات محصول + دکمه تایید */}
      <div className={styles.footer}>
        {review.product && (
          <span className={styles.productTag}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            </svg>
            {review.product.name}
          </span>
        )}

        <button
          className={`${styles.toggleBtn} ${review.is_approved ? styles.toggleOff : styles.toggleOn}`}
          onClick={handleToggle}
          disabled={toggling}
        >
          {toggling ? (
            <span className={styles.spinner} />
          ) : review.is_approved ? (
            "لغو تایید"
          ) : (
            "تایید"
          )}
        </button>
      </div>

      {/* پاسخ‌ها */}
      {review.replies?.length > 0 && (
        <div className={styles.replies}>
          {review.replies.map((reply) => (
            <AdminReviewItem
              key={reply.id}
              review={reply}
              onToggleApproval={onToggleApproval}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}