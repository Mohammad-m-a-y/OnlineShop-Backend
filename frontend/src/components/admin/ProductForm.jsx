"use client";

import { useState, useEffect } from "react";
import { addProduct } from "@/services/product.service";
import { getBrands } from "@/services/brand.service";
import { getCategories } from "@/services/category.service";
import { useRouter } from "next/navigation";
import styles from "./ProductForm.module.css";

export default function ProductForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    base_price: "",
    slug: "",
    short_description: "",
    description: "",
  });
  const [brandId, setBrandId] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // تبدیل دسته‌های تو در تو (parent + children) به یک لیست مسطح برای نمایش
  function flattenCategories(items) {
    const result = [];
    for (const category of items) {
      result.push({ id: category.id, name: category.name, isChild: false });
      if (category.children?.length) {
        for (const child of category.children) {
          result.push({ id: child.id, name: child.name, isChild: true });
        }
      }
    }
    return result;
  }

  // بارگذاری برندها و دسته‌بندی‌ها برای select ها
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [brandsData, categoriesData] = await Promise.all([
          getBrands({ is_active: true }),
          getCategories({ is_active: true }),
        ]);
        setBrands(brandsData.items || []);
        setCategories(flattenCategories(categoriesData.items || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // تولید خودکار slug از نام
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }));
    }
  }

  function toggleCategory(categoryId) {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await addProduct({
        name: formData.name,
        slug: formData.slug,
        base_price: Number(formData.base_price),
        short_description: formData.short_description,
        description: formData.description,
        brand_id: brandId || null,
        category_ids: categoryIds,
      });
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      setError("خطا در ایجاد محصول، لطفاً دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* ردیف اول: نام + slug */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              نام محصول
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="name"
                className={styles.input}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثلاً: شارژر بی‌سیم Anker"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="slug">
              Slug
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="slug"
                className={`${styles.input} ${styles.ltr}`}
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="anker-wireless-charger"
                required
              />
            </div>
            <span className={styles.hint}>از نام محصول به‌صورت خودکار ساخته می‌شود</span>
          </div>
        </div>

        {/* قیمت */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="base_price">
            قیمت پایه (تومان)
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="base_price"
              className={`${styles.input} ${styles.ltr}`}
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              placeholder="2900000"
              min="0"
              required
            />
            <span className={styles.inputSuffix}>تومان</span>
          </div>
          {formData.base_price && (
            <span className={styles.hint}>
              {Number(formData.base_price).toLocaleString("fa-IR")} تومان
            </span>
          )}
        </div>

        {/* ── ردیف برند + دسته‌بندی ── */}
        <div className={styles.row}>

          {/* برند: انتخاب تکی */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="brand">برند</label>
            <select
              id="brand"
              className={styles.select}
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              disabled={loadingOptions}
            >
              <option value="">بدون برند</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            {loadingOptions && <span className={styles.hint}>در حال بارگذاری برندها...</span>}
          </div>

          {/* دسته‌بندی: انتخاب چندتایی به‌صورت چک‌باکس */}
          <div className={styles.field}>
            <label className={styles.label}>
              دسته‌بندی‌ها
              {categoryIds.length > 0 && (
                <span className={styles.countBadge}>{categoryIds.length}</span>
              )}
            </label>
            <div className={styles.categoryBox}>
              {loadingOptions ? (
                <span className={styles.hint}>در حال بارگذاری دسته‌بندی‌ها...</span>
              ) : categories.length === 0 ? (
                <span className={styles.hint}>هیچ دسته‌بندی‌ای ثبت نشده</span>
              ) : (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className={`${styles.checkRow} ${category.isChild ? styles.childRow : ""}`}
                  >
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={categoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                    />
                    <span className={`${styles.checkCustom} ${categoryIds.includes(category.id) ? styles.checked : ""}`}>
                      {categoryIds.includes(category.id) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </span>
                    {category.name}
                  </label>
                ))
              )}
            </div>
          </div>

        </div>

        {/* توضیح کوتاه */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="short_description">
            توضیح کوتاه
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="short_description"
              className={styles.input}
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="یک جمله کوتاه درباره محصول"
              maxLength={120}
              required
            />
          </div>
          <span className={styles.hint}>
            {formData.short_description.length} / ۱۲۰ کاراکتر
          </span>
        </div>

        {/* توضیحات کامل */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">توضیحات کامل</label>
          <textarea
            id="description"
            className={`${styles.input} ${styles.textarea}`}
            name="description"
            rows="6"
            value={formData.description}
            onChange={handleChange}
            placeholder="توضیحات کامل محصول، ویژگی‌ها، مشخصات فنی و..."
          />
        </div>

        {/* خطا */}
        {error && (
          <div className={styles.error} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* دکمه‌ها */}
        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push("/admin/products")}
            disabled={loading}
          >
            انصراف
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <><span className={styles.spinner} />در حال ثبت...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                ایجاد محصول
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}