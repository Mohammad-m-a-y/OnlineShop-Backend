"use client";

import styles from "./ProfileSidebar.module.css";
import Link from "next/link";

export default function ProfileSidebar() {
  return (
    <aside className={styles.sidebar}>
      <button className={styles.active}>
        اطلاعات حساب
      </button>

      <Link href='/profile/orders'>سفارشات من</Link>

      <Link href='/profile/addresses' >
        آدرس‌ها
      </ Link>

      <Link href='/profile/edit'>
        تنظیمات
      </Link>
    </aside>
  );
}