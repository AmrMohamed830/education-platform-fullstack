'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, CheckCircle2, Sparkles, X } from 'lucide-react';
import styles from './DashboardNavbar.module.css';

export default function DashboardNavbar({ onToggleSidebar, user }) {
  const router = useRouter();
  const isAdmin = ["ADMIN", "MANAGER"].includes(user?.role);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/courses`);
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
        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className={styles.notificationBtn}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="الإشعارات"
          >
            <Bell size={20} />
            <span className={styles.notifBadge}>2</span>
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                left: 0,
                width: '300px',
                backgroundColor: '#FFFFFF',
                borderRadius: '0.875rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '1rem',
                zIndex: 100,
                direction: 'rtl',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #F1F5F9',
                  paddingBottom: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                  الإشعارات والتنبيهات
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.825rem' }}>
                  <Sparkles size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#0F172A', display: 'block' }}>نظام الشهادات الرقمية</strong>
                    <span style={{ color: '#64748B' }}>أكمل مساراتك التدريبية بنسبة 100% واحصل على شهادة إلكترونية معتمدة!</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.825rem' }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#0F172A', display: 'block' }}>تقييمات المناهج</strong>
                    <span style={{ color: '#64748B' }}>يمكنك الآن تقييم الكورسات المشترك بها ومساعدة زملائك برأيك.</span>
                  </div>
                </div>
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
                {isAdmin ? "مشرف النظام" : "طالب مسجل"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
