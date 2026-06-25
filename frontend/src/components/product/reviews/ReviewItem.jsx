"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";
import { useAuth } from "@/context/AuthContext";
import EditReviewForm from "./EditReviewForm";
import { deleteReview, toggleReviewApproval } from "@/services/review.service";
import styles from "./ReviewItem.module.css";



export default function ReviewItem({ review, productId, onReviewCreated, onReviewUpdated, onReviewDeleted, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { user } = useAuth();

  const isOwner = user?.id === review.user_id;
  const canModerate = user?.is_admin || user?.is_owner;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteReview(review.id);
      onReviewDeleted?.(review.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleToggleApproval = async () => {
    try {
      setApproving(true);
      const updated = await toggleReviewApproval(review.id);
      onReviewUpdated?.(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  if (editing) {
    return (
      <EditReviewForm
        review={review}
        onCancel={() => setEditing(false)}
        onSuccess={(updated) => {
          onReviewUpdated?.(updated);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className={`${styles.card} ${!review.is_approved ? styles.pending : ""}`}>

      {/* دیالوگ تأیید حذف */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <p className={styles.dialogText}>آیا از حذف این نظر مطمئن هستید؟</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelDialogBtn} onClick={() => setConfirmDelete(false)}>انصراف</button>
              <button className={styles.confirmDialogBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? "..." : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* هدر */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {(review.user.full_name || review.user.username)?.charAt(0)}
          </div>
          <div>
            <div className={styles.userName}>{review.user.full_name || review.user.username}</div>
            <div className={styles.username}>@{review.user.username}</div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {!review.parent_id && <StarRating rating={review.rating} size={16} />}
          {!review.is_approved && (
            <span className={styles.pendingTag}>در انتظار تایید</span>
          )}
        </div>
      </div>

      {/* محتوا */}
      {review.title && <h4 className={styles.title}>{review.title}</h4>}
      <p className={styles.comment}>{review.comment}</p>
      <div className={styles.date}>
        {new Date(review.created_at).toLocaleDateString("fa-IR")}
      </div>

      {/* اکشن‌ها */}
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={() => setShowReplyForm((prev) => !prev)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
          </svg>
          پاسخ
        </button>

        {isOwner && (
          <>
            <button className={styles.actionBtn} onClick={() => setEditing(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              ویرایش
            </button>
            <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => setConfirmDelete(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
              حذف
            </button>
          </>
        )}

        {canModerate && (
          <button
            className={`${styles.actionBtn} ${review.is_approved ? styles.moderateOff : styles.moderateOn}`}
            onClick={handleToggleApproval}
            disabled={approving}
          >
            {approving ? "..." : review.is_approved ? "لغو تایید" : "تایید"}
          </button>
        )}
      </div>

      {/* فرم پاسخ */}
      {showReplyForm && (
        <div className={styles.replyFormWrap}>
          <ReviewForm
            productId={productId}
            parentId={review.id}
            onSuccess={(newReply) => {
              onReviewCreated?.(newReply);
              setShowReplyForm(false);
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* پاسخ‌ها */}
      {review.replies?.length > 0 && (
        <div className={styles.replies}>
          {review.replies.map((reply) => (
            <ReviewItem
              key={reply.id}
              review={reply}
              productId={productId}
              onReviewCreated={onReviewCreated}
              onReviewUpdated={onReviewUpdated}
              onReviewDeleted={onReviewDeleted}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}