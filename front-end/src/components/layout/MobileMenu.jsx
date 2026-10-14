'use client';

import Link from 'next/link';
import { X, ArrowLeft, BookOpen, LayoutDashboard, ShieldAlert, GraduationCap } from 'lucide-react';
import Button from '../common/Button';
import styles from './MobileMenu.module.css';
import useAuthStore from '../../store/auth.store';

export default function MobileMenu({ isOpen, onClose, navLinks }) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isOpen) return null;

  const isAdmin = ["ADMIN", "MANAGER"].includes(user?.role);
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "مستخدم")}&background=4F46E5&color=fff&bold=true`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div className={styles.brand}>
            <div className={styles.logoBadge}>
              <BookOpen size={20} color="#FFFFFF" />
            </div>
            <span className={styles.brandName}>مَنصّتِي</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق القائمة">
            <X size={24} />
          </button>
        </div>

        {/* User Card in Mobile Drawer if logged in */}
        {!isLoading && user && (
          <div className={styles.userCard}>
            <div className={styles.userAvatarWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={user.name || "المستخدم"}
                className={styles.userAvatarImg}
              />
              <span className={styles.onlineStatus}></span>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
              <div className={`${styles.roleBadge} ${isAdmin ? styles.adminBadge : styles.studentBadge}`}>
                {isAdmin ? <ShieldAlert size={12} /> : <GraduationCap size={12} />}
                <span>{isAdmin ? "مشرف المنصة" : "طالب مسجل"}</span>
              </div>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.navItem}
              onClick={onClose}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          {!isLoading && user ? (
            <Link href="/dashboard" style={{ textDecoration: 'none', width: '100%' }} onClick={onClose}>
              <Button variant="primary" icon={LayoutDashboard} fullWidth>
                لوحة التحكم
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ textDecoration: 'none', width: '100%' }} onClick={onClose}>
                <Button variant="outline" fullWidth>
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register" style={{ textDecoration: 'none', width: '100%' }} onClick={onClose}>
                <Button variant="primary" icon={ArrowLeft} fullWidth>
                  ابدأ التعلم الآن
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
