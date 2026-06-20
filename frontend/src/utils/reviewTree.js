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