"use client"

import Link from "next/link";



export default function PaymentSuccessPage() {


  return (
    <div>
      <h1>✅ پرداخت با موفقیت انجام شد</h1>

      <p>
        سفارش شما با موفقیت ثبت و پرداخت شد.
      </p>

      <div>
        <Link href="/profile/orders">
          مشاهده سفارش‌ها
        </Link>

        <Link href="/">
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );

}