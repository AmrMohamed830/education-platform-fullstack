'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Printer,
  Share2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { getCourseCertificate } from '../../../../services/certificate.service';
import styles from './Certificate.module.css';

export default function CertificateView({ courseId }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresQuiz, setRequiresQuiz] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        setLoading(true);
        setError('');
        setRequiresQuiz(false);
        const res = await getCourseCertificate(courseId);
        setCertificate(res.data.data.certificate);
      } catch (err) {
        if (err?.response?.data?.requiresQuiz) {
          setRequiresQuiz(true);
        }
        setError(
          err?.response?.data?.message ||
            'لم يتم العثور على شهادة لهذا الكورس، يرجى التأكد من إكمال جميع الدروس أولاً.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCert();
    }
  }, [courseId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper} dir="rtl">
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <Loader2 size={44} style={{ animation: 'spin 1s linear infinite', color: '#4F46E5' }} />
          <p style={{ marginTop: '1rem', color: '#64748B', fontWeight: 600 }}>
            جارٍ تجهيز واستخراج شهادة إتمام الدورة...
          </p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className={styles.pageWrapper} dir="rtl">
        <div
          style={{
            maxWidth: '550px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '1rem',
            padding: '2.5rem',
            textAlign: 'center',
            marginTop: '3rem',
          }}
        >
          <Award size={48} color="#94A3B8" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
            الشهادة غير متاحة حالياً
          </h2>
          <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {requiresQuiz && (
              <Link
                href={`/courses/${courseId}/quiz`}
                className={`${styles.actionBtn} ${styles.primaryBtn}`}
                style={{ backgroundColor: '#D97706' }}
              >
                <HelpCircle size={18} />
                <span>خوض اختبار الكورس الآن 📝</span>
              </Link>
            )}
            <Link
              href={`/courses/${courseId}/learn`}
              className={`${styles.actionBtn} ${styles.primaryBtn}`}
            >
              <BookOpen size={18} />
              <span>الذهاب لمتابعة الدروس</span>
            </Link>
            <Link href={`/courses/${courseId}`} className={`${styles.actionBtn} ${styles.secondaryBtn}`}>
              تفاصيل الكورس
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper} dir="rtl">
      {/* Top Toolbar (Hidden on print) */}
      <div className={styles.actionToolbar}>
        <Link href={`/courses/${courseId}/learn`} className={styles.backLink}>
          <ArrowRight size={18} />
          <span>العودة إلى مشغل الدروس</span>
        </Link>

        <div className={styles.buttonsGroup}>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`${styles.actionBtn} ${styles.secondaryBtn}`}
          >
            <Share2 size={16} />
            <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
          >
            <Printer size={16} />
            <span>طباعة أو حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Certificate Document */}
      <div className={styles.certificateCanvas}>
        <div className={styles.outerBorder}>
          <div className={styles.innerBorder}>
            {/* Header */}
            <div className={styles.certHeader}>
              <div className={styles.logoBadge}>
                <Award size={28} />
              </div>
              <div className={styles.platformTitle}>مَنصّتِي التعليمية</div>
              <h1 className={styles.certMainTitle}>شهادة إتمام دورة تدريبية</h1>
              <div className={styles.certSubtitle}>Certificate of Course Completion</div>
            </div>

            {/* Body */}
            <div className={styles.certBody}>
              <div className={styles.certPresentText}>تشهد المنصة بأن الطالب / الطالبة:</div>
              <div className={styles.studentName}>{certificate.userName}</div>
              <p className={styles.certDescription}>
                قد أتم بنجاح وبكفاءة عالية جميع متطلبات ومحاور الدورة التدريبية المتخصصة:
                <strong className={styles.courseHighlight}>{certificate.courseTitle}</strong>
              </p>
            </div>

            {/* Footer */}
            <div className={styles.certFooter}>
              {/* Instructor signature */}
              <div className={styles.signatureBox}>
                <div className={styles.signatureLine} />
                <div className={styles.signerTitle}>{certificate.instructor}</div>
                <div className={styles.signerRole}>مدرب الدورة التدريبية</div>
              </div>

              {/* Official Seal */}
              <div className={styles.sealBadge}>
                <div className={styles.sealIcon}>
                  <ShieldCheck size={32} />
                </div>
                <span className={styles.sealText}>معتمد إلكترونياً</span>
                <span className={styles.certIdTag}>{certificate.certificateCode}</span>
              </div>

              {/* Platform signature & Date */}
              <div className={styles.signatureBox}>
                <div className={styles.signatureLine} />
                <div className={styles.signerTitle}>إدارة المنصة الأكاديمية</div>
                <div className={styles.signerRole}>
                  تاريخ الإصدار: {formatDate(certificate.issueDate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

