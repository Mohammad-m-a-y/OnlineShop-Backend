"use client";

import { useState } from "react";
import styles from "./UserTable.module.css";
import { toggleAdminRole, toggleUserStatus } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";



export default function UserRow({ user, onRefresh }) {

    const { user: currentUser } = useAuth();

    const [loading, setLoading] = useState(false);

    async function handleToggleStatus() {

        try {

            setLoading(true);

            await toggleUserStatus(user.id);

            onRefresh();

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    async function handleToggleAdmin() {

        try {

            setLoading(true);

            await toggleAdminRole(user.id);

            onRefresh();

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    const role = user.is_owner
        ? "مالک"
        : user.is_admin
            ? "ادمین"
            : "کاربر";

    return (

        <tr>

            <td>
                {user.full_image_url ? (
                    <img
                        className={styles.avatar}
                        src={user.full_image_url}
                        alt={user.full_name}
                    />
                ) : (
                    <div className={styles.avatarFallback}>
                        {(user.full_name || user.username)
                            ?.trim()
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                )}
            </td>

            <td>

                {user.full_name}

            </td>

            <td>

                {user.username}

            </td>

            <td>

                {user.email || "-"}

            </td>

            <td>

                <span
                    className={`${styles.badge}
                    ${user.is_owner
                            ? styles.ownerBadge
                            : user.is_admin
                                ? styles.adminBadge
                                : styles.userBadge
                        }`}
                >

                    {role}

                </span>

            </td>

            <td>

                <span
                    className={`${styles.badge}
                    ${user.is_active
                            ? styles.activeBadge
                            : styles.inactiveBadge
                        }`}
                >

                    {user.is_active
                        ? "فعال"
                        : "غیرفعال"}

                </span>

            </td>

            <td>

                <div className={styles.actions}>

                    {/* فعال / غیرفعال */}

                    {!user.is_owner && (

                        <button
                            disabled={loading}
                            className={styles.actionBtn}
                            onClick={handleToggleStatus}
                        >

                            {user.is_active
                                ? "غیرفعال"
                                : "فعال"}

                        </button>

                    )}

                    {/* فقط مالک */}

                    {currentUser?.is_owner &&
                        !user.is_owner && (

                            <button
                                disabled={loading}
                                className={styles.actionBtn}
                                onClick={handleToggleAdmin}
                            >

                                {user.is_admin
                                    ? "حذف ادمین"
                                    : "ادمین کن"}

                            </button>

                        )}

                </div>

            </td>

        </tr>

    );

}