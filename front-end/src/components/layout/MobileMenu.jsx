'use client';

import Link from 'next/link';
import { X, ArrowLeft, BookOpen } from 'lucide-react';
import Button from '../common/Button';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ isOpen, onClose, navLinks }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div className={styles.brand}>
            <div className={styles.logoBadge}>
              <BookOpen size={20} color="#FFFFFF" />
            </div>
            <span className={styles.brandName}>منصة التعلم</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق القائمة">
            <X size={24} />
          </button>
        </div>

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
        </div>
      </div>
    </div>
  );
}
