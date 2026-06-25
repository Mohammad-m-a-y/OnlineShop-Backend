"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./ProfileInfo.module.css";

export default function ProfileInfo() {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.is_owner
    ? "مالک"
    : user.is_admin
    ? "مدیر"
    : "کاربر";

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.image_url ? (
            <img
              src={user.image_url}
              alt={user.full_name}
            />
          ) : (
            <span>
              {user.full_name?.charAt(0)}
            </span>
          )}
        </div>

        <div>
          <h2>{user.full_name}</h2>
          <p>@{user.username}</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.item}>
          <span>نام کامل</span>
          <strong>{user.full_name}</strong>
        </div>

        <div className={styles.item}>
          <span>نام کاربری</span>
          <strong>{user.username}</strong>
        </div>

        <div className={styles.item}>
          <span>ایمیل</span>
          <strong>
            {user.email || "ثبت نشده"}
          </strong>
        </div>

        <div className={styles.item}>
          <span>نقش</span>
          <strong>{role}</strong>
        </div>

        <div className={styles.item}>
          <span>وضعیت حساب</span>
          <strong>
            {user.is_active
              ? "فعال"
              : "غیرفعال"}
          </strong>
        </div>

        <div className={styles.item}>
          <span>تاریخ عضویت</span>
          <strong>
            {new Date(
              user.created_at
            ).toLocaleDateString("fa-IR")}
          </strong>
        </div>
      </div>
    </div>
  );
}