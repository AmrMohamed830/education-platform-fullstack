'use client';

import { Search, Bell, Menu } from 'lucide-react';
import styles from './DashboardNavbar.module.css';

export default function DashboardNavbar({ onToggleSidebar, user }) {

  const isAdmin = ["ADMIN", "MANAGER"].includes(user?.role);


  return (
    <header className={styles.navbar}>
      <div className={styles.leftGroup}>
        <button className={styles.mobileMenuBtn} onClick={onToggleSidebar} aria-label="القائمة">
          <Menu size={22} />
        </button>

        {/* Search Bar */}
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="ابحث عن كورسات، دروس، أو طلاب..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.rightGroup}>

        {/* Notification Bell */}
        <button className={styles.notificationBtn} aria-label="الإشعارات">
          <Bell size={20} />
          <span className={styles.notifBadge}>3</span>
        </button>

        {/* User Profile Snippet */}
        <div className={styles.userProfile}>
          <div className={styles.avatarWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "مستخدم"
                )}&background=4F46E5&color=fff&bold=true`
              }
              alt={user?.name || "المستخدم"}
              className={styles.avatarImg}
            />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}> {user?.name || user?.email || "المستخدم"}</span>
            <span className={styles.userRole}>
             {isAdmin ? "مشرف النظام" : "طالب مسجل"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
