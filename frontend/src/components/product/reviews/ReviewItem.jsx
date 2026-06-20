"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";
import { useAuth } from "@/context/AuthContext";



export default function ReviewItem({ review, productId, onReviewCreated }) {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const [editing, setEditing] = useState(false);

    const { user } = useAuth();

    const isOwner = user?.id === review.user_id;

    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px",
            }}
        >
            {/* Header */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                }}
            >
                <div>
                    <strong>
                        {review.user.full_name ||
                            review.user.username}
                    </strong>

                    <div
                        style={{
                            fontSize: "14px",
                            color: "#666",
                        }}
                    >
                        @{review.user.username}
                    </div>
                </div>

                <StarRating
                    rating={review.rating}
                />
            </div>

            {/* Title */}

            {review.title && (
                <h4
                    style={{
                        marginBottom: "8px",
                    }}
                >
                    {review.title}
                </h4>
            )}

            {/* Comment */}

            <p
                style={{
                    marginBottom: "12px",
                    lineHeight: "1.8",
                }}
            >
                {review.comment}
            </p>

            {/* Date */}

            <div
                style={{
                    fontSize: "13px",
                    color: "#777",
                    marginBottom: "12px",
                }}
            >
                {new Date(
                    review.created_at
                ).toLocaleDateString("fa-IR")}
            </div>

            {/* Actions */}

            <button
                onClick={() =>
                    setShowReplyForm((prev) => !prev)
                }
            >
                پاسخ
            </button>

            {/* Reply Form */}

            {showReplyForm && (
                <div
                    style={{
                        marginTop: "12px",
                    }}
                >
                    <ReviewForm
                        productId={productId}
                        parentId={review.id}
                        onSuccess={(newReply) => {
                            onReviewCreated?.(newReply);

                            setShowReplyForm(false);
                        }}
                        onCancel={() =>
                            setShowReplyForm(false)
                        }
                    />
                </div>
            )}

            {/* Replies */}

            {review.replies?.length > 0 && (
                <div
                    style={{
                        marginTop: "16px",
                        marginRight: "32px",
                        borderRight:
                            "2px solid #eee",
                        paddingRight: "16px",
                    }}
                >
                    {review.replies.map((reply) => (
                        <ReviewItem
                            key={reply.id}
                            review={reply}
                            productId={productId}
                            onReviewCreated={
                                onReviewCreated
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}