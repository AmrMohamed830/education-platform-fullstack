'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
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
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
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
      return <GraduationCap size={18} color="#4F46E5" style={{ flexShrink: 0, marginTop: '2px' }} />;
    case 'NEW_LESSON':
      return <PlayCircle size={18} color="#06B6D4" style={{ flexShrink: 0, marginTop: '2px' }} />;
    case 'NEW_QUIZ':
      return <HelpCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />;
    default:
      return <Sparkles size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />;
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
        <button className={styles.mobileMenuBtn} onClick={onToggleSidebar} aria-label="القائمة">
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
        <div style={{ position: 'relative' }}>
          <button
            className={styles.notificationBtn}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="الإشعارات"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>
                {unreadCount > 9 ? '+9' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                left: 0,
                width: '340px',
                maxWidth: '90vw',
                backgroundColor: '#FFFFFF',
                borderRadius: '1rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.12)',
                padding: '1rem',
                zIndex: 1000,
                direction: 'rtl',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #F1F5F9',
                  paddingBottom: '0.65rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                    الإشعارات
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: '#EEF2FF',
                        color: '#4F46E5',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: '999px',
                      }}
                    >
                      {unreadCount} جديد
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllMutation.mutate()}
                      disabled={markAllMutation.isPending}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#4F46E5',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                      title="تحديد الكل كمقروء"
                    >
                      <CheckCheck size={14} />
                      <span>قراءة الكل</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '340px',
                  overflowY: 'auto',
                }}
              >
                {loadingNotifs ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94A3B8' }}>
                    <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
                    <span style={{ fontSize: '0.8rem' }}>جارٍ تحديث الإشعارات…</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                    <Bell size={28} style={{ color: '#CBD5E1', margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>لا توجد إشعارات جديدة حالياً</p>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      ستظهر التنبيهات هنا فور تسجيل طلاب جدد أو نشر دروس واختبارات.
                    </span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '0.65rem',
                        backgroundColor: notif.isRead ? '#FFFFFF' : '#F8FAFC',
                        border: `1px solid ${notif.isRead ? '#F1F5F9' : '#E0E7FF'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {getNotifIcon(notif.type)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                          <strong
                            style={{
                              color: notif.isRead ? '#334155' : '#0F172A',
                              fontSize: '0.825rem',
                              fontWeight: notif.isRead ? 600 : 800,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {notif.title}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8', flexShrink: 0 }}>
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p
                          style={{
                            color: '#64748B',
                            fontSize: '0.775rem',
                            marginTop: '0.2rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: '#4F46E5',
                            alignSelf: 'center',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Snippet (Clickable to profile) */}
        <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.userProfile} style={{ cursor: 'pointer' }} title="عرض الملف الشخصي والإعدادات">
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
