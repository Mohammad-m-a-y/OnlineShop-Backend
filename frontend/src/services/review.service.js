import api from "@/lib/axios";




export async function createReview( data) {
  const response = await api.post(
    `/products/${data.productId}/reviews`,
    {
      rating: data.rating,
      title: data.title ?? null,
      comment: data.comment,
      parent_id: data.parent_id ?? null,
    }
  );

  return response.data;
}



export async function getProductReviews( data) {
  const response = await api.get(
    `/products/${data.productId}/reviews`,
    {
      params:{
        page:data.page ?? 1,
        page_size:data.page_size ?? 12,
        is_approved:data.is_approved ?? null,
      }
    }
  );

  return response.data;
}



export async function toggleReviewApproval(reviewId) {
  const response = await api.patch(`/reviews/approve/${reviewId}`);

  return response.data;
}

export async function updateReview(data) {
  const response = await api.patch(`/reviews/${data.review_id}`,
    {
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    }
  );

  return response.data;
}

export async function deleteReview(reviewId) {
  return await api.delete(`/reviews/${reviewId}`);
}