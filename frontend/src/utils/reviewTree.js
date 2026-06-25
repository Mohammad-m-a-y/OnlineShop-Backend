export function insertReplyIntoTree(reviews,newReply) {
  return reviews.map((review) => {

    if (review.id === newReply.parent_id) {
      return {
        ...review,
        replies: [
          ...(review.replies || []),
          newReply,
        ],
      };
    }

    if (review.replies?.length) {
      return {
        ...review,
        replies: insertReplyIntoTree(
          review.replies,
          newReply
        ),
      };
    }

    return review;
  });
}










export function updateReviewInTree(
  reviews,
  updatedReview
) {
  return reviews.map((review) => {

    if (
      review.id === updatedReview.id
    ) {
      return {
        ...review,
        ...updatedReview,
      };
    }

    if (
      review.replies?.length
    ) {
      return {
        ...review,
        replies:
          updateReviewInTree(
            review.replies,
            updatedReview
          ),
      };
    }

    return review;
  });
}



export function removeReviewFromTree(reviews, reviewId){
  return reviews.filter((review) =>
      review.id !== reviewId
    ).map((review) => ({
      ...review,
      replies:
        review.replies?.length
          ? removeReviewFromTree(
              review.replies,
              reviewId
            )
          : [],
    }));

}