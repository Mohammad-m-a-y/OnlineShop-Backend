"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";
 
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = 3;  
 
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🛍️</span>
          <span className={styles.logoText}>فروشگاه آنلاین</span>
        </Link>
 
        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>خانه</Link>
          <Link href="/products" className={styles.navLink}>محصولات</Link>
          <Link href="/about" className={styles.navLink}>درباره ما</Link>
        </nav>
 
        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/cart" className={styles.cartBtn} aria-label="سبد خرید">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span className={styles.badge}>{cartCount}</span>
            )}
          </Link>
 
          <Link href="/login" className={styles.loginBtn}>ورود</Link>
 
          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="منو"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
 
      {/* Mobile Nav */}
      <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileOpen : ""}`}>
        <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>خانه</Link>
        <Link href="/products" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>محصولات</Link>
        <Link href="/about" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>درباره ما</Link>
        <Link href="/cart" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>سبد خرید</Link>
        <Link href="/login" className={`${styles.mobileLink} ${styles.mobileLinkAccent}`} onClick={() => setMenuOpen(false)}>ورود</Link>
      </div>
    </header>
  );
}
 
