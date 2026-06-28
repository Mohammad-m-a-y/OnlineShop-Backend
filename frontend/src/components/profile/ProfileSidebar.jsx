"use client";

import styles from "./ProfileSidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.full_name?.charAt(0) ?? "؟";


  async function handleLogout() {
    const confirm = window.confirm("آیا قصد خروج از حساب کاربری خود را دارید؟")

    if (!confirm){
      return;
    }

    await logout()
    
  }



const navItems = [
  
  {
    href: "/profile",
    label: "اطلاعات حساب",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  ...(user?.is_admin || user?.is_owner
    ? [
        {
          href: "/admin",
          label: "پنل مدیریت",
          icon: (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 13h8V3H3z" />
              <path d="M13 21h8v-8h-8z" />
              <path d="M13 3h8v4h-8z" />
              <path d="M3 21h8v-4H3z" />
            </svg>
          ),
        },
      ]
    : []),
  {
    href: "/profile/orders",
    label: "سفارشات من",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6m-6 4h4"/>
      </svg>
    ),
  },
  {
    href: "/profile/addresses",
    label: "آدرس‌های من",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    href: "/profile/edit",
    label: "ویرایش پروفایل",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
];


     

  return (
    <aside className={styles.sidebar}>

      {/* ناوبری */}
      <nav className={styles.nav}>

     

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* خروج */}
      {logout && (
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          خروج از حساب
        </button>
      )}

    </aside>
  );
}



