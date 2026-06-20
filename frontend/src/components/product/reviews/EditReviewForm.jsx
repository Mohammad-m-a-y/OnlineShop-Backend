"use client";

import { useState } from "react";
import { updateReview }
  from "@/services/review.service";

export default function EditReviewForm({ review, onSuccess, onCancel}) {

  const [title, setTitle] = useState(review.title || "");
  const [comment, setComment] = useState(review.comment);
  const [rating, setRating] = useState(review.rating);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const updated =
        await updateReview({
          review_id: review.id,
          title,
          comment,
          rating,
        });

      onSuccess(updated);

    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        placeholder="عنوان"
      />

      <textarea
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
      />

      {!review.parent_id && (
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) =>
            setRating(
              Number(e.target.value)
            )
          }
        />
      )}

      <button
        type="submit"
        disabled={loading}
      >
        ذخیره
      </button>

      <button
        type="button"
        onClick={onCancel}
      >
        انصراف
      </button>

    </form>
  );
}