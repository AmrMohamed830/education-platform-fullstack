'use client';

import { Search, Bell, Menu, RefreshCw, UserCheck } from 'lucide-react';
import styles from './DashboardNavbar.module.css';

export default function DashboardNavbar({ role, setRole, onToggleSidebar, user }) {
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
        {/* Role Switcher Demo Control */}
        <div className={styles.roleSwitcher}>
          <span className={styles.switcherLabel}>معاينة الواجهة:</span>
          <button
            className={`${styles.roleToggleBtn} ${role === 'student' ? styles.activeRole : ''}`}
            onClick={() => setRole('student')}
          >
            🎓 طالب
          </button>
          <button
            className={`${styles.roleToggleBtn} ${role === 'admin' ? styles.activeRoleAdmin : ''}`}
            onClick={() => setRole('admin')}
          >
            👑 مشرف
          </button>
        </div>

        {/* Notification Bell */}
        <button className={styles.notificationBtn} aria-label="الإشعارات">
          <Bell size={20} />
          <span className={styles.notifBadge}>3</span>
        </button>

        {/* User Profile Snippet */}
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{user?.avatar || '👤'}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'المستخدم'}</span>
            <span className={styles.userRole}>
              {role === 'admin' ? 'مشرف النظام' : 'طالب مسجل'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
