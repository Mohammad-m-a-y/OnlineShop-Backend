"use client";

import styles from "./UserTable.module.css";

import UserRow from "./UserRow";

export default function UserTable({

    users,

    loading,

    page,

    totalPages,

    onPageChange,

    onRefresh,

}) {

    if (loading) {

        return (

            <div className={styles.loading}>
                در حال دریافت کاربران...
            </div>

        );

    }

    return (

        <div className={styles.wrapper}>

            <div className={styles.header}>

                <h1>مدیریت کاربران</h1>

                <span>{users.length} کاربر</span>

            </div>

            <table className={styles.table}>

                <thead>

                    <tr>

                        <th>تصویر</th>

                        <th>نام</th>

                        <th>نام کاربری</th>

                        <th>ایمیل</th>

                        <th>نقش</th>

                        <th>وضعیت</th>

                        <th>عملیات</th>

                    </tr>

                </thead>

                <tbody>

                    {users.map(user => (

                        <UserRow
                            key={user.id}
                            user={user}
                            onRefresh={onRefresh}
                        />

                    ))}

                </tbody>

            </table>

            <div className={styles.pagination}>

                <button
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    قبلی
                </button>

                <span>

                    صفحه {page} از {totalPages}

                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    بعدی
                </button>

            </div>

        </div>

    );

}