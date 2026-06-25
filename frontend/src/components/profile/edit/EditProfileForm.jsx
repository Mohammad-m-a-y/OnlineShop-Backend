"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { updateCurrentUser } from "@/services/user.service";

import styles from "./EditProfileForm.module.css";

export default function EditProfileForm() {
  const router = useRouter();

  const { user, refreshUser,} = useAuth();

  const [username, setUsername] = useState( user?.username || "");
  const [fullName, setFullName] = useState( user?.full_name || "");
  const [email, setEmail] = useState( user?.email || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState( user?.full_image_url || null);
  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] =useState(false);

  const [error, setError] =useState("");

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setRemoveImage(false);

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
 }



  function handleRemoveImage() {
    setImage(null);
    setPreview(null);
    setRemoveImage(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await updateCurrentUser({
        username: username,
        full_name: fullName,
        email: email,
        image: image,
        remove_image: removeImage,
      });

      await refreshUser();

      router.push("/profile");
    } catch (err) {
      console.error(err);

      setError(
        "خطا در ذخیره اطلاعات"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} >

      <h1 className={styles.title}>
        ویرایش پروفایل
      </h1>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper}>
          {preview ? (
            <img
              src={preview}
              alt="profile"
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {username?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.avatarActions}>
          <label
            className={styles.uploadBtn}
          >
            انتخاب تصویر

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {(preview || user?.full_image_url) && (
            <button
              type="button"
              className={styles.removeBtn}
              onClick={ handleRemoveImage }
            >
              حذف تصویر
            </button>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label>
          نام کاربری
        </label>

        <input
          value={username}
          onChange={(e) =>setUsername( e.target.value )
          }
        />
      </div>

      <div className={styles.field}>
        <label>
          نام و نام خانوادگی
        </label>

        <input
          value={fullName}
          onChange={(e) => setFullName( e.target.value)
          }
        />
      </div>

      <div className={styles.field}>
        <label>
          ایمیل
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail( e.target.value)
          }
        />
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={loading}
          className={styles.saveBtn}
        >
          {loading
            ? "در حال ذخیره..."
            : "ذخیره تغییرات"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className={styles.cancelBtn}
        >
          انصراف
        </button>
      </div>
    </form>
  );
}