"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { flattenCategories } from "@/utils/categoryTree";
import { useState } from "react";
import styles from "./ProductFilters.module.css";

export default function ProductFilters({ brands, categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flatCategories = flattenCategories(categories);

  const [selectedBrands, setSelectedBrands] = useState(searchParams.getAll("brand_ids"));
  const [selectedCategories, setSelectedCategories] = useState(searchParams.getAll("category_ids"));
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    minPrice ||
    maxPrice;


  const [isOpen, setIsOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);


  const selectedItems = [
    ...brands
      .filter((b) => selectedBrands.includes(String(b.id)))
      .map((b) => b.name),

    ...flatCategories
      .filter((c) => selectedCategories.includes(String(c.id)))
      .map((c) => c.name),
  ];

  const previewFilters =
    selectedItems.length > 4
      ? [...selectedItems.slice(0, 4), "..."]
      : selectedItems;





  function toggleBrand(id) {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleCategory(id) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function applyFilters() {
    const params = new URLSearchParams();
    selectedBrands.forEach((id) => params.append("brand_ids", id));
    selectedCategories.forEach((id) => params.append("category_ids", id));
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    setIsOpen(false)
    router.push(`/products?${params.toString()}`);
  }

  function clearFilters() {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  }

  return (
    <div className={styles.filters}>

      <div
        className={styles.filterBar}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.filterBarContent}>
          <span className={styles.filterBarTitle}>
            فیلترها
          </span>

          {previewFilters.length > 0 && (
            <span className={styles.filterPreview}>
              {previewFilters.join(" ، ")}
            </span>
          )}
        </div>

        {!isOpen ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>

        ) :
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>

        }

      </div>


      {isOpen && (

        <div className={styles.wrapper}>


          {/* هدر فیلترها */}
          <div className={styles.filtersHeader}>
            <span className={styles.filtersTitle}>فیلترها</span>
            {hasActiveFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                پاک کردن
              </button>
            )}

          </div>

          {/* ── برندها ── */}
          {brands?.length > 0 && (
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => setBrandsOpen(!brandsOpen)}
              >
                <div>
                  برندها
                  {selectedBrands.length > 0 && (
                    <span className={styles.countBadge}>
                      {selectedBrands.length}
                    </span>
                  )}
                </div>

                <span>
                  {brandsOpen ? "−" : "+"}
                </span>
              </div>

              {brandsOpen && (

                <div className={styles.checkList}>
                  {brands.map((brand) => (
                    <label key={brand.id} className={styles.checkRow}>
                      <input
                        type="checkbox"
                        className={styles.hiddenCheckbox}
                        checked={selectedBrands.includes(String(brand.id))}
                        onChange={() => toggleBrand(String(brand.id))}
                      />
                      <span className={`${styles.checkBox} ${selectedBrands.includes(String(brand.id)) ? styles.checked : ""}`}>
                        {selectedBrands.includes(String(brand.id)) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className={styles.checkLabel}>{brand.name}</span>
                    </label>
                  ))}
                </div>

              )}

            </div>
          )}

          <div className={styles.divider} />

          {/* ── دسته‌بندی‌ها ── */}
          {flatCategories?.length > 0 && (
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                <div>
                  دسته‌بندی‌ها
                  {selectedCategories.length > 0 && (
                    <span className={styles.countBadge}>
                      {selectedCategories.length}
                    </span>
                  )}
                </div>

                <span>
                  {categoriesOpen ? "−" : "+"}
                </span>
              </div>

              {categoriesOpen && (

                <div className={styles.checkList}>
                  {flatCategories.map((cat) => (
                    <label
                      key={cat.id}
                      className={styles.checkRow}
                      style={{ paddingRight: `${cat.level * 14}px` }}
                    >
                      <input
                        type="checkbox"
                        className={styles.hiddenCheckbox}
                        checked={selectedCategories.includes(String(cat.id))}
                        onChange={() => toggleCategory(String(cat.id))}
                      />
                      <span className={`${styles.checkBox} ${cat.level > 0 ? styles.checkBoxSm : ""} ${selectedCategories.includes(String(cat.id)) ? styles.checked : ""}`}>
                        {selectedCategories.includes(String(cat.id)) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className={`${styles.checkLabel} ${cat.level > 0 ? styles.childLabel : ""}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>

              )}

            </div>
          )}

          <div className={styles.divider} />

          {/* ── محدوده قیمت ── */}
          <div className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => setPriceOpen(!priceOpen)}
            >
              <div>محدوده قیمت</div>

              <span>
                {priceOpen ? "−" : "+"}
              </span>
            </div>


            {priceOpen && (

              <div className={styles.priceInputs}>
                <div className={styles.priceField}>
                  <label className={styles.priceLabel}>از</label>
                  <input
                    type="number"
                    className={styles.priceInput}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="۰"
                    min="0"
                  />
                </div>
                <div className={styles.priceSep}>—</div>
                <div className={styles.priceField}>
                  <label className={styles.priceLabel}>تا</label>
                  <input
                    type="number"
                    className={styles.priceInput}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="∞"
                    min="0"
                  />
                </div>
              </div>

            )}


          </div>

          {/* ── دکمه اعمال ── */}
          <button className={styles.applyBtn} onClick={applyFilters}>
            اعمال فیلترها
          </button>


        </div>


      )}



    </div>
  );
}