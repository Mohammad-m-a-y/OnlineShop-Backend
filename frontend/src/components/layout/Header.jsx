"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import SearchBox from "./SearchBox/SearchBox";


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cartItemsCount } = useCart();
  const searchMobileRef = useRef();

  useEffect(()=>{
    function handleClick(e){
         if(searchMobileRef.current && !searchMobileRef.current.contains(e.target)){
          setMobileSearchOpen(false)
         }
    }

    document.addEventListener('mousedown',handleClick)
    return () => document.removeEventListener("mousedown", handleClick);

  },[]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* لوگو */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🛍️</span>
          <span className={styles.logoText}>فروشگاه آنلاین</span>
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>خانه</Link>
          <Link href="/products" className={styles.navLink}>محصولات</Link>
          <Link href="/about" className={styles.navLink}>درباره ما</Link>
        </nav>

        {/* سرچ باکس — فقط دسکتاپ */}
        <div className={styles.searchWrap}>
          <SearchBox />
        </div>

        {/* اکشن‌ها */}
        <div className={styles.actions}>

          {/* آیکون سرچ موبایل */}
          <button
            className={styles.mobileSearchBtn}
            onClick={() => { setMobileSearchOpen((v) => !v); setMenuOpen(false); }}
            aria-label="جستجو"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* سبد خرید */}
          <Link href="/cart" className={styles.cartBtn} aria-label="سبد خرید">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartItemsCount > 0 && (
              <span className={styles.badge}>{cartItemsCount}</span>
            )}
          </Link>

          {!isAuthenticated && <Link href="/login" className={styles.loginBtn}>ورود</Link>}
          {isAuthenticated && <Link href="/profile" className={styles.loginBtn}>پروفایل</Link>}

          {/* همبرگر */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
            onClick={() => { setMenuOpen((v) => !v); setMobileSearchOpen(false); }}
            aria-label="منو"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* سرچ موبایل — باز/بسته */}
      <div ref={searchMobileRef} className={`${styles.mobileSearch} ${mobileSearchOpen ? styles.mobileSearchOpen : ""}`}>
        <div className={styles.mobileSearchInner} style={{display :!mobileSearchOpen ? "none" : ''}}>
          <SearchBox />
        </div>
      </div>

      {/* منوی موبایل */}
      <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileOpen : ""}`}>
        <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>خانه</Link>
        <Link href="/products" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>محصولات</Link>
        <Link href="/about" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>درباره ما</Link>
        <Link href="/cart" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>سبد خرید</Link>
        {isAuthenticated && (
          <Link href="/profile" className={`${styles.mobileLink} ${styles.mobileLinkAccent}`} onClick={() => setMenuOpen(false)}>پروفایل</Link>
        )}
        {!isAuthenticated && (
          <Link href="/login" className={`${styles.mobileLink} ${styles.mobileLinkAccent}`} onClick={() => setMenuOpen(false)}>ورود</Link>
        )}
      </div>
    </header>
  );
}