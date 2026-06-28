import Link from "next/link";
import styles from "./Pagination.module.css";

export default function Pagination({ currentPage, totalPages, searchParams, }) {
    if (totalPages <= 1) return null;

    const params = new URLSearchParams(searchParams);

    const createLink = (page) => {
        params.set("page", page);

        return `/products?${params.toString()}`;
    };

    const pages = [];

    const addPage = (page) => {
        pages.push(
            <Link
                key={page}
                href={createLink(page)}
                className={`${styles.pageBtn} ${page === currentPage ? styles.active : ""
                    }`}
            >
                {page}
            </Link>
        );
    };

    const addDots = (key) => (
        <span key={key} className={styles.dots}>
            ...
        </span>
    );

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            addPage(i);
        }
    } else {
        addPage(1);

        if (currentPage > 4) {
            pages.push(addDots("left"));
        }

        const start = Math.max(2, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);

        for (let i = start; i <= end; i++) {
            addPage(i);
        }

        if (currentPage < totalPages - 3) {
            pages.push(addDots("right"));
        }

        addPage(totalPages);
    }

    return (
        <div className={styles.pagination}>

            {(currentPage > 1) && (
                <Link
                    href={createLink(Math.max(1, currentPage - 1))}
                    className={`${styles.arrow} ${currentPage === 1 ? styles.disabled : ""
                        }`}
                >
                    قبلی
                </Link>
            )}


            {pages}

            {(currentPage < totalPages) && (
                <Link
                    href={createLink(Math.min(totalPages, currentPage + 1))}
                    className={`${styles.arrow} ${currentPage === totalPages ? styles.disabled : ""
                        }`}
                >
                    بعدی
                </Link>
            )}


        </div>
    );
}