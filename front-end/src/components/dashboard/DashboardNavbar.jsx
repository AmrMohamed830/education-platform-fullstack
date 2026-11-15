'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  X,
  GraduationCap,
  PlayCircle,
  HelpCircle,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/queries/useNotifications';
import styles from './DashboardNavbar.module.css';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-EG');
};

const getNotifIcon = (type) => {
  switch (type) {
    case 'NEW_ENROLLMENT':
      return (
        <div className={`${styles.notifIconBadge} ${styles.badgeEnrollment}`}>
          <GraduationCap size={18} />
        </div>
      );
    case 'NEW_LESSON':
      return (
        <div className={`${styles.notifIconBadge} ${styles.badgeLesson}`}>
          <PlayCircle size={18} />
        </div>
      );
    case 'NEW_QUIZ':
      return (
        <div className={`${styles.notifIconBadge} ${styles.badgeQuiz}`}>
          <HelpCircle size={18} />
        </div>
      );
    default:
      return (
        <div className={`${styles.notifIconBadge} ${styles.badgeGeneral}`}>
          <Sparkles size={18} />
        </div>
      );
  }
};

export default function DashboardNavbar({ onToggleSidebar, user }) {
  const router = useRouter();
  const isAdmin = ['ADMIN', 'MANAGER'].includes(user?.role);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic notifications via TanStack Query
  const { data: notifData, isLoading: loadingNotifs } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  // Close notifications on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNotifications]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push('/courses');
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsReadMutation.mutate(notif._id);
    }
    setShowNotifications(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.leftGroup}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => {
            setShowNotifications(false);
            onToggleSidebar();
          }}
          aria-label="القائمة الجانبية"
        >
          <Menu size={22} />
        </button>

        {/* Search Bar */}
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="ابحث عن الكورسات واضغط Enter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.rightGroup}>
        {/* Dynamic Notification Bell with Dropdown */}
        <div className={styles.bellWrapper}>
          <button
            type="button"
            className={`${styles.notificationBtn} ${
              showNotifications ? styles.notificationBtnActive : ''
            }`}
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="الإشعارات"
            aria-expanded={showNotifications}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>
                {unreadCount > 9 ? '+9' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay Backdrop to close when clicking outside */}
              <div
                className={styles.notifBackdrop}
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />

              <div
                className={styles.notifDropdown}
                role="dialog"
                aria-label="صندوق الإشعارات"
              >
                {/* Header */}
                <div className={styles.notifHeader}>
                  <div className={styles.notifTitleGroup}>
                    <span className={styles.notifTitle}>الإشعارات</span>
                    {unreadCount > 0 && (
                      <span className={styles.notifCountBadge}>
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>

                  <div className={styles.notifActions}>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllMutation.mutate()}
                        disabled={markAllMutation.isPending}
                        className={styles.markAllBtn}
                        title="تحديد الكل كمقروء"
                      >
                        <CheckCheck size={14} />
                        <span>قراءة الكل</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className={styles.closeNotifBtn}
                      aria-label="إغلاق الإشعارات"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Notification Items List */}
                <div className={styles.notifList}>
                  {loadingNotifs ? (
                    <div className={styles.notifLoading}>
                      <Loader2 size={24} className={styles.spinner} />
                      <span>جارٍ تحديث الإشعارات…</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>
                      <Bell size={32} className={styles.emptyBellIcon} />
                      <p>لا توجد إشعارات جديدة حالياً</p>
                      <span>
                        ستظهر التنبيهات هنا فور تسجيل طلاب جدد أو نشر دروس واختبارات.
                      </span>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`${styles.notifItem} ${
                          notif.isRead ? styles.readItem : styles.unreadItem
                        }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleNotificationClick(notif);
                          }
                        }}
                      >
                        {getNotifIcon(notif.type)}
                        <div className={styles.notifContent}>
                          <div className={styles.notifItemHeader}>
                            <strong className={styles.notifItemTitle}>
                              {notif.title}
                            </strong>
                            <span className={styles.notifItemTime}>
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className={styles.notifItemMsg}>
                            {notif.message}
                          </p>
                        </div>
                        {!notif.isRead && <span className={styles.unreadDot} />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Snippet (Clickable to profile) */}
        <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className={styles.userProfile}
            style={{ cursor: 'pointer' }}
            title="عرض الملف الشخصي والإعدادات"
          >
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
              <span className={styles.userName}>{user?.name || user?.email || "المستخدم"}</span>
              <span className={styles.userRole}>
                {isAdmin ? "مشرف النظام 👑" : "طالب مسجل 🎓"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
