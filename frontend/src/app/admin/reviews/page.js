"use client";

import { useEffect, useState } from "react";
import { getReviews, toggleReviewApproval } from "@/services/review.service";
import AdminReviewItem from "@/components/admin/reviews/AdminReviewItem";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import styles from "./ReviewsPage.module.css";



export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvedFilter, setApprovedFilter] = useState("");

  // مقادیر تاریخ به‌صورت آبجکت DateObject (شمسی) برای نمایش در DatePicker
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);

        const params = { page:page, page_size:12 };
        if (approvedFilter !== "") params.is_approved = approvedFilter;

        // تبدیل تاریخ شمسی انتخاب‌شده به فرمت میلادی YYYY-MM-DD برای ارسال به API
        if (startDate) params.start_date = startDate.toDate().toISOString().slice(0, 10);
        if (endDate) params.end_date = endDate.toDate().toISOString().slice(0, 10);

        const data = await getReviews(params);

        setReviews(data.items ?? []);
        setTotalPages(data.total_pages ?? 1);
        setTotalCount(data.total_count ?? 0);
      } catch (err) {
        console.error(err);
        setError("خطا در بارگذاری نظرات");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [approvedFilter, startDate, endDate, page]);

  async function handleToggle(reviewId) {
    try {
      const updated = await toggleReviewApproval(reviewId);
      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? updated : review))
      );
    } catch (err) {
      console.error(err);
    }
  }

  function handleFilterChange(setter, value) {
    setter(value);
    setPage(1);
  }

  const hasActiveFilters = approvedFilter || startDate || endDate;

  function clearFilters() {
    setApprovedFilter("");
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  }

  return (
    <div className={styles.page}>

      {/* سرصفحه */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>مدیریت نظرات</h1>
          <p className={styles.pageSubtitle}>{!loading && `${totalCount} نظر`}</p>
        </div>
      </div>

      {/* فیلترها */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>وضعیت</label>
          <select
            className={styles.select}
            value={approvedFilter}
            onChange={(e) => handleFilterChange(setApprovedFilter, e.target.value)}
          >
            <option value="">همه</option>
            <option value="true">تایید شده</option>
            <option value="false">تایید نشده</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>از تاریخ</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={startDate}
            onChange={(date) => handleFilterChange(setStartDate, date)}
            inputClass={styles.dateInput}
            calendarPosition="bottom-right"
            placeholder="انتخاب تاریخ"
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>تا تاریخ</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={endDate}
            onChange={(date) => handleFilterChange(setEndDate, date)}
            inputClass={styles.dateInput}
            calendarPosition="bottom-right"
            placeholder="انتخاب تاریخ"
          />
        </div>

        {hasActiveFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            حذف فیلترها
          </button>
        )}
      </div>

      {/* خطا */}
      {error && (
        <div className={styles.errorBox} role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* لیست نظرات */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.spinner} />
          در حال بارگذاری نظرات...
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.empty}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <p>نظری با این فیلترها یافت نشد</p>
        </div>
      ) : (
        <div className={styles.list}>
          {reviews.map((review) => (
            <AdminReviewItem
              key={review.id}
              review={review}
              onToggleApproval={handleToggle}
            />
          ))}
        </div>
      )}

      {/* صفحه‌بندی */}
      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            قبلی
          </button>

          <span className={styles.pageInfo}>صفحه {page} از {totalPages}</span>

          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      )}

    </div>
  );
}