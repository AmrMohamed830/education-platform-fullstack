"use client";

import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Compass,
  Award,
  Users,
  FolderKanban,
  Settings,
  LogOut,
  X,
  ShieldAlert,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/auth.store";
import { logout as logoutUser } from "@/services/auth.service";

export default function Sidebar({
  role,
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.logout);
  const isLoggingOut = useAuthStore(
  (state) => state.isLoggingOut
);

const setIsLoggingOut = useAuthStore(
  (state) => state.setIsLoggingOut
);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutUser();
      clearUser();
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const studentNav = [
    { id: "overview", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "my-courses", label: "كورساتي", icon: GraduationCap },
    { id: "explore", label: "استكشاف الكورسات", icon: Compass },
    { id: "certificates", label: "الشهادات", icon: Award },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  const adminNav = [
    { id: "overview", label: "لوحة الإدارة", icon: LayoutDashboard },
    { id: "courses-manage", label: "إدارة الكورسات", icon: FolderKanban },
    { id: "students-manage", label: "إدارة الطلاب", icon: Users },
    { id: "settings", label: "إعدادات المنصة", icon: Settings },
  ];

  const navItems = role === "admin" ? adminNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={onClose}></div>}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Brand Header */}
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <BookOpen size={20} color="#FFFFFF" />
            </div>
            <span className={styles.brandTitle}>مَنصّتِي</span>
          </Link>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card in Sidebar */}
        <div className={styles.userProfileCard}>
          <div className={styles.userCardTop}>
            <div className={styles.userAvatarWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "مستخدم"
                  )}&background=4F46E5&color=fff&bold=true`
                }
                alt={user?.name || "المستخدم"}
                className={styles.userAvatarImg}
              />
              <span className={styles.onlineDot}></span>
            </div>
            <div className={styles.userCardInfo}>
              <span className={styles.userName}>{user?.name || "المستخدم"}</span>
              <span className={styles.userEmail}>{user?.email || ""}</span>
            </div>
          </div>
          <div
            className={`${styles.roleBadge} ${
              role === "admin" ? styles.adminBadge : styles.studentBadge
            }`}
          >
            {role === "admin" ? (
              <ShieldAlert size={14} />
            ) : (
              <GraduationCap size={14} />
            )}
            <span>
              {role === "admin" ? "مشرف المنصة (Admin)" : "حساب طالب (Student)"}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <Icon size={18} className={styles.navIcon} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={18} />
            <span>
              {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
