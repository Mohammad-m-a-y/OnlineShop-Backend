"use client";

import { useAuth } from "@/context/AuthContext";

import styles from "./ProfileHeader.module.css";

export default function ProfileHeader() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={styles.header}>
      {user.full_image_url && (
        <img src={user.full_image_url} alt={user.full_name} />
      )}

      {!user.full_image_url && (
        <div className={styles.avatar}>
          {user.full_name?.charAt(0)}
        </div>

      )

      }

      <div>
        <h1>{user.full_name}</h1>

        <p>@{user.username}</p>
      </div>
    </div>
  );
}