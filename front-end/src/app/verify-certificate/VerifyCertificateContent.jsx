'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVerifyCertificate } from '@/hooks/queries/useCertificates';
import Button from '@/components/common/Button';
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  BookOpen,
  ArrowRight,
  Share2,
  Loader2,
} from 'lucide-react';
import styles from './VerifyCertificate.module.css';

export default function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get('code') || '').toUpperCase().trim();

  const [inputCode, setInputCode] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [hasSearched, setHasSearched] = useState(Boolean(initialCode));

  const { data: certResponse, isLoading, error } = useVerifyCertificate(activeCode);

  const certData = certResponse?.certificate || certResponse;

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) return;
    setActiveCode(clean);
    setHasSearched(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconBox}>
            <ShieldCheck size={36} color="#FFFFFF" />
          </div>
          <h1 className={styles.title}>التحقق من صحة الشهادات</h1>
          <p className={styles.subtitle}>
            أدخل الرقم التسلسلي الفريد للشهادة الصادرة من منصّتي للتحقق من مصداقيتها وصحة بيانات الطالب وتاريخ الإكمال.
          </p>
        </div>

        {/* Search Card */}
        <div className={styles.searchCard}>
          <form className={styles.form} onSubmit={handleSearch}>
            <div className={styles.inputWrapper}>
              <Search size={20} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="أدخل كود الشهادة (مثال: MC-ABCDE12345)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className={styles.input}
                required
              />
            </div>
            <Button variant="primary" size="lg" icon={Search} type="submit" disabled={isLoading}>
              {isLoading ? 'جارٍ التحقق…' : 'تحقق الآن'}
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>جارٍ فحص سجلات المنصة المشفرة والتحقق من الكود...</p>
          </div>
        )}

        {/* Result: Found Certificate */}
        {!isLoading && hasSearched && certData && (
          <div className={styles.certCard}>
            <div className={styles.certBadgeTop}>
              <CheckCircle2 size={18} />
              <span>شهادة رسمية موثقة ومعتمدة 100%</span>
            </div>

            <div className={styles.certHeader}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>اسم الكورس المعتمد</span>
                <h2 className={styles.certTitle}>{certData.courseTitle}</h2>
              </div>
              <div className={styles.certCode}>{certData.certificateCode}</div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>اسم الطالب الحاصل على الشهادة</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="var(--primary)" />
                  <span className={styles.detailValue}>{certData.studentName}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>تاريخ إصدار الشهادة</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <span className={styles.detailValue}>{formatDate(certData.issueDate)}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>المدرب والمشرف الأكاديمي</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} color="var(--primary)" />
                  <span className={styles.detailValue}>{certData.instructor || 'مَنصّتِي التعليمية'}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>حالة الاعتماد</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--accent)" />
                  <span className={styles.detailValue} style={{ color: 'var(--accent)' }}>سارية ومصدّقة</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                صادرة عن مَنصّتِي التعليمية الرسمية تحت رقم القيد المرجعي أعلاه.
              </span>

              {certData.courseId && (
                <Link href={`/courses/${certData.courseId}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm" icon={ArrowRight}>
                    استعراض منهج هذا الكورس
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Result: Not Found */}
        {!isLoading && hasSearched && !certData && error && (
          <div className={styles.notFoundCard}>
            <div className={styles.notFoundIcon}>
              <XCircle size={36} />
            </div>
            <h3 className={styles.notFoundTitle}>لم يتم العثور على شهادة بهذا الكود</h3>
            <p className={styles.notFoundDesc}>
              الكود ({activeCode}) غير مسجل في قاعدة بيانات الشهادات المعتمدة لدينا. يرجى التأكد من كتابة الكود بشكل صحيح بدون مسافات إضافية.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
