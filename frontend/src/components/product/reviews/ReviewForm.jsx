"use client"

import { createReview } from "@/services/review.service"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link";


export default function ReviewForm({ productId, parentId = null, onSuccess, onCancel }) {

    const [title, setTitle] = useState("")
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const { isAuthenticated } = useAuth()



    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)

        try {
            const data = await createReview({
                rating: rating,
                title: title,
                comment: comment,
                parent_id: parentId,
                productId: productId
            })

            setTitle("");
            setComment("");
            setRating(0);

            onSuccess?.(data);
        } catch (err) {
            console.error(err)
            setError('خطا در بارگزاری نظر')
        } finally {
            setLoading(false)
        }

    }






    return (

        <div>

            {!isAuthenticated && (
                <div>
                    <p>برای ارسال نظر باید به حساب کاربری خود وارد شوید</p>
                    <Link href="/login">ورود به حساب کاربری</Link>
                </div>
            )}
            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="rc-title">موضوع:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='اختیاری'
                    />
                </div>

                <div>
                    <label htmlFor="rc-comment">کامنت:</label>
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder='نظر خود را اینجا وارد کنید'
                    />
                </div>

                {!parentId && (
                    <div>

                        <label>
                            امتیاز شما
                        </label>

                        <div
                            style={{
                                display: "flex",
                                gap: "4px",
                                marginTop: "8px",
                            }}
                        >
                            {[1, 2, 3, 4, 5].map(
                                (star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                            setRating(star)
                                        }
                                        style={{
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            fontSize: "24px",
                                            color:
                                                star <= rating
                                                    ? "#f59e0b"
                                                    : "#d1d5db",
                                        }}
                                    >
                                        ★
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                )}

                <button type="submit">
                    {loading ? "درحال ارسال..." : " ثبت نظر"}
                </button>

                <button type="button" onClick={onCancel}>
                    لغو
                </button>


            </form>


        </div>

    )



}