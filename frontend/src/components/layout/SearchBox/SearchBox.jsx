"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBox.module.css";
import Link from "next/link";
import { getProducts } from "@/services/product.service";
import { formatPrice } from "@/utils/formatPrice";



export default function SearchBox() {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();

    const wrapperRef = useRef();


    useEffect(() => {

        function handleClick(e) {

            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }

        }

        document.addEventListener("mousedown", handleClick);

        return () => document.removeEventListener("mousedown", handleClick);

    }, [])




    async function searchProducts() {
        try {
            setLoading(true);

            const currentQuery = query;

            const data = await getProducts({
                search: query,
                page: 1,
                page_size: 6,
            });


            if (currentQuery === query) {
                setResults(data.items);
                setShowDropdown(true);
            }

        } finally {
            setLoading(false);
        }
    }




    useEffect(() => {
        if (query.trim().length < 2) {
            setShowDropdown(false);
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            searchProducts();
        }, 400);

        return () => clearTimeout(timer);

    }, [query]);





    function handleSearch() {

        const value = query.trim();

        if (!value) return;
        setShowDropdown(false);

        router.push(`/products?search=${encodeURIComponent(value)}`);
    }



    return (
        <div ref={wrapperRef} className={styles.search} >

            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSearch();
                    }
                }}
                onFocus={() => {
                    if (results.length)
                        setShowDropdown(true)
                }}
                placeholder="جستجوی محصول، برند یا دسته‌بندی..."
            />

            <button onClick={handleSearch}>

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

            </button>

            {showDropdown && (

                <div className={styles.dropdown}>

                    {loading && (
                        <div className={styles.loading}>
                            در حال جستجو...
                        </div>
                    )}

                    {!loading &&
                        results.map(product => {

                            const image = product.images.find(i => i.is_primary) || product.images[0];

                            return (

                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className={styles.item}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        setQuery("");
                                    }}
                                >

                                    <img
                                        src={image?.full_image_url || "/placeholder-product.png"}
                                        alt={product.name}
                                    />

                                    <div className={styles.info}>

                                        <span className={styles.name}>
                                            {product.name}
                                        </span>

                                        {product.brand && (
                                            <span className={styles.brand}>
                                                {product.brand.name}
                                            </span>
                                        )}

                                        <span className={styles.price}>
                                            {formatPrice(product.base_price)}
                                            {" "}
                                            تومان
                                        </span>


                                    </div>

                                </Link>

                            );

                        })}

                    {!loading &&
                        results.length === 0 &&
                        query.trim().length >= 2 && (

                            <div className={styles.empty}>
                                محصولی پیدا نشد
                            </div>

                        )}

                    {!loading && results.length === 6 && (

                        <button
                            className={styles.more}
                            onClick={handleSearch}
                        >
                            مشاهده همه نتایج
                        </button>

                    )}

                </div>

            )}


        </div>


    );
}