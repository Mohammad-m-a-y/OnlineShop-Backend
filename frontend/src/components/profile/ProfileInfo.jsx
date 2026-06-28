"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./ProfileInfo.module.css";

export default function ProfileInfo() {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.is_owner ? "مالک" : user.is_admin ? "مدیر" : "کاربر";

  const initials = user.full_name?.charAt(0) ?? "؟";

  return (
    <div className={styles.wrapper}>

      {/* هدر: آواتار + نام + نقش */}
      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          {user.full_image_url ? (
            <img src={user.full_image_url} alt={user.full_name} className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarInitial}>{initials}</span>
          )}
        </div>

        <div className={styles.headerInfo}>
          <h2 className={styles.fullName}>{user.full_name}</h2>
          <span className={styles.username}>@{user.username}</span>
          <span className={`${styles.roleBadge} ${user.is_owner ? styles.roleOwner : user.is_admin ? styles.roleAdmin : styles.roleUser}`}>
            {role}
          </span>
        </div>
      </div>

      {/* گرید اطلاعات */}
      <div className={styles.infoGrid}>

        <div className={styles.item}>
          <span className={styles.itemLabel}>نام کامل</span>
          <strong className={styles.itemValue}>{user.full_name || "—"}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.itemLabel}>نام کاربری</span>
          <strong className={`${styles.itemValue} ${styles.ltr}`}>@{user.username}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.itemLabel}>ایمیل</span>
          <strong className={`${styles.itemValue} ${styles.ltr}`}>{user.email || "ثبت نشده"}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.itemLabel}>شماره موبایل</span>
          <strong className={`${styles.itemValue} ${styles.ltr}`}>{user.mobile || "ثبت نشده"}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.itemLabel}>وضعیت حساب</span>
          <span className={`${styles.statusBadge} ${user.is_active ? styles.active : styles.inactive}`}>
            {user.is_active ? "فعال" : "غیرفعال"}
          </span>
        </div>

        <div className={styles.item}>
          <span className={styles.itemLabel}>تاریخ عضویت</span>
          <strong className={styles.itemValue}>
            {new Date(user.created_at).toLocaleDateString("fa-IR")}
          </strong>
        </div>

      </div>
    </div>
  );
}