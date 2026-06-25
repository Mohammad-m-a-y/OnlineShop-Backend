import Link from "next/link";
import styles from "./Footer.module.css";





export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* ستون برند + توضیح کوتاه */}
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🛍️</span>
            <span className={styles.brandName}>فروشگاه آنلاین</span>
          </div>
          <p className={styles.brandDesc}>
            خرید آنلاین جدیدترین محصولات با بهترین قیمت و ارسال سریع به سراسر کشور.
          </p>

          {/* شبکه‌های اجتماعی */}
          <div className={styles.social}>
            <a href="#" className={styles.socialBtn} aria-label="اینستاگرام">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>
              </svg>
            </a>
            <a href="#" className={styles.socialBtn} aria-label="تلگرام">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </a>
            <a href="#" className={styles.socialBtn} aria-label="واتساپ">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ستون دسترسی سریع */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>دسترسی سریع</h3>
          <ul className={styles.linkList}>
            <li><Link href="/" className={styles.link}>خانه</Link></li>
            <li><Link href="/products" className={styles.link}>محصولات</Link></li>
            <li><Link href="/cart" className={styles.link}>سبد خرید</Link></li>
            <li><Link href="/about" className={styles.link}>درباره ما</Link></li>
          </ul>
        </div>

        {/* ستون خدمات مشتریان */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>خدمات مشتریان</h3>
          <ul className={styles.linkList}>
            <li><Link href="/faq" className={styles.link}>سوالات متداول</Link></li>
            <li><Link href="/shipping" className={styles.link}>راهنمای ارسال</Link></li>
            {/* <li><Link href="/returns" className={styles.link}>بازگشت کالا</Link></li>
            <li><Link href="/contact" className={styles.link}>تماس با ما</Link></li> */}
          </ul>
        </div>

        {/* ستون تماس */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>ارتباط با ما</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className={styles.ltr}>۰۲۱-۱۲۳۴۵۶۷۸</span>
            </li>
            <li className={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <span className={styles.ltr}>support@shop.ir</span>
            </li>
            <li className={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>تهران، خیابان آزادی</span>
            </li>
          </ul>
        </div>

      </div>

      {/* نوار پایینی: کپی‌رایت + روش‌های پرداخت */}
      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} فروشگاه آنلاین. تمامی حقوق محفوظ است.
        </p>
        <div className={styles.paymentBadges}>
          <span className={styles.paymentBadge}>زرین‌پال</span>
          <span className={styles.paymentBadge}>نماد اعتماد</span>
        </div>
      </div>
    </footer>
  );
}