"use client"

import { useState, useEffect } from "react"
import { getProductReviews } from "@/services/review.service"
import ReviewForm from "./ReviewForm"
import ReviewItem from "./ReviewItem";
import { insertReplyIntoTree } from "@/utils/reviewTree";



export default function ReviewsList({ productId }) {

    const [reviews, setReviews] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [openForm, setOpenForm] = useState(false)
    const [parentId, setParentId] = useState(null)



    useEffect(() => {

        const fetchReviews = async () => {
            setLoading(true)
            try {
                const data = await getProductReviews(
                    productId,
                    {
                        page: 1,
                        page_size: 10
                    }
                )

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
                return {
                    ...prev,
                    items: [
                        review,
                        ...prev.items,
                    ],
                };
            }

            return {
                ...prev,
                items:
                    insertReplyIntoTree(
                        prev.items,
                        review
                    ),
            };
        });

        setOpenForm(false);
        setParentId(null);
    };




    if (loading) {
        return (
            <div>درحال بارگزاری نظرات...</div>
        )
    }



    return (

        <div>
            {
                openForm && (
                    <ReviewForm
                        productId={productId}
                        parentId={parentId}
                        onSuccess={handleReviewCreated}
                        onCancel={() => {
                            setParentId(null)
                            setOpenForm(false)
                        }}
                    />
                )
            }



            <h1>تجربه خرید</h1>

            <button onClick={() => setOpenForm(true)}>ارسال نظر</button>

            {error && (
                <div>
                    {error}
                </div>
            )}

            {reviews?.items?.length ? (
                reviews.items.map((review) => (
                    <ReviewItem
                        key={review.id}
                        review={review}
                        productId={productId}
                        onReviewCreated={
                            handleReviewCreated
                        }
                    />
                ))
            ) : (
                <div>نظری ثبت نشده</div>
            )}


        </div>


    )







}