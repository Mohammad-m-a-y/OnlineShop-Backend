import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div>
      <h1>❌ پرداخت ناموفق بود</h1>

      <p>
        پرداخت شما انجام نشد یا توسط کاربر لغو شد.
      </p>

      <div>
        <Link href="/profile/orders">
          بازگشت به سفارش‌ها
        </Link>

        <Link href="/">
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );
}