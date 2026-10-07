'use client';

import Link from 'next/link';
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
  ShieldAlert
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ role, activeTab, setActiveTab, isOpen, onClose }) {
  const studentNav = [
    { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'my-courses', label: 'كورساتي', icon: GraduationCap },
    { id: 'explore', label: 'استكشاف الكورسات', icon: Compass },
    { id: 'certificates', label: 'الشهادات', icon: Award },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const adminNav = [
    { id: 'overview', label: 'لوحة الإدارة', icon: LayoutDashboard },
    { id: 'courses-manage', label: 'إدارة الكورسات', icon: FolderKanban },
    { id: 'students-manage', label: 'إدارة الطلاب', icon: Users },
    { id: 'settings', label: 'إعدادات المنصة', icon: Settings },
  ];

  const navItems = role === 'admin' ? adminNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={onClose}></div>}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Brand Header */}
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <BookOpen size={20} color="#FFFFFF" />
            </div>
            <span className={styles.brandTitle}>مَنصّتِي</span>
          </Link>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        {/* Role Badge */}
        <div className={styles.roleBadgeContainer}>
          <div className={`${styles.roleBadge} ${role === 'admin' ? styles.adminBadge : styles.studentBadge}`}>
            {role === 'admin' ? <ShieldAlert size={14} /> : <GraduationCap size={14} />}
            <span>{role === 'admin' ? 'مشرف المنصة (Admin)' : 'حساب طالب (Student)'}</span>
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
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
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
          <Link href="/" className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
