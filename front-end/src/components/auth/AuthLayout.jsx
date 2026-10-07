'use client';

import Link from 'next/link';
import { BookOpen, ArrowLeft, CheckCircle2, Star, Sparkles } from 'lucide-react';
import styles from './AuthLayout.module.css';

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}) {
  return (
    <div className={styles.pageWrapper}>
      {/* Background Decorative Blobs */}
      <div className={styles.blobPrimary}></div>
      <div className={styles.blobCyan}></div>

      <div className={styles.authContainer}>
        {/* Sidebar Info Panel */}
        <div className={styles.infoSide}>
          <div className={styles.infoContent}>
            <Link href="/" className={styles.brandLogo}>
              <div className={styles.logoIcon}>
                <BookOpen size={24} color="#FFFFFF" />
              </div>
              <span className={styles.brandName}>مَنصّتِي</span>
            </Link>

            <div className={styles.badge}>
              <Sparkles size={16} />
              <span>انضم لأكبر تجمع تعليمي عربي</span>
            </div>

            <h2 className={styles.sideTitle}>
              ابدأ رحلة تطوير مهاراتك التقنية مع خبرات عمليّة حقيقية
            </h2>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>+140 مسار ودورة تعليمية محدثة</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>تطبيق عملي وبناء مشاريع حقيقية</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={18} className={styles.checkIcon} />
                <span>شهادات إنجاز معتمدة تزيد فرص عملك</span>
              </div>
            </div>

            {/* Quote Box */}
            <div className={styles.quoteCard}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p className={styles.quoteText}>
                "المنصة غيّرت مساري المهني بالكامل في أقل من 6 أشهر وتمكنت من الالتحاق بوظيفتي كـ Full Stack Developer."
              </p>
              <div className={styles.quoteAuthor}>- عبدالله الشمري، مطور برمجيات</div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className={styles.formSide}>
          <div className={styles.topBar}>
            <Link href="/" className={styles.homeLink}>
              <ArrowLeft size={16} />
              <span>العودة للرئيسية</span>
            </Link>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>{title}</h1>
              {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
            </div>

            {children}

            <div className={styles.formFooter}>
              <span>{footerText}</span>{' '}
              <Link href={footerLinkHref} className={styles.footerLink}>
                {footerLinkText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
