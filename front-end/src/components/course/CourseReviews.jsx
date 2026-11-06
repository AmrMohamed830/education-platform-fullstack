'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Trash2, Send, Loader2 } from 'lucide-react';
import { getCourseReviews, submitReview, deleteReview } from '../../services/review.service';
import useAuthStore from '../../store/auth.store';
import styles from './CourseReviews.module.css';

export default function CourseReviews({ courseId, isEnrolled }) {
  const user = useAuthStore((state) => state.user);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ text: '', type: 'success' });

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Load reviews
  const loadReviews = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await getCourseReviews(courseId);
      const data = res.data.data;
      setReviews(data.reviews || []);
      setSummary({
        totalReviews: data.totalReviews || 0,
        averageRating: data.averageRating || 5.0,
        breakdown: data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });

      // Check if user already reviewed
      if (user) {
        const myReview = (data.reviews || []).find(
          (r) => r.user?._id === user._id || r.user === user._id || r.user?.id === user.id
        );
        if (myReview) {
          setUserHasReviewed(true);
          setRating(myReview.rating);
          setComment(myReview.comment);
        }
      }
    } catch {
      // Ignore or log error
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!ignore) {
        await loadReviews();
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setAlert({ text: 'يرجى كتابة نص المراجعة أو التعليق', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      setAlert({ text: '', type: 'success' });
      await submitReview(courseId, { rating, comment });
      setAlert({ text: 'تم نشر تقييمك بنجاح! شكراً لمشاركتك رأيك.', type: 'success' });
      setUserHasReviewed(true);
      await loadReviews();
    } catch (err) {
      setAlert({ text: err?.response?.data?.message || 'تعذر نشر التقييم.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم؟')) return;
    try {
      await deleteReview(reviewId);
      setAlert({ text: 'تم حذف التقييم بنجاح.', type: 'success' });
      setUserHasReviewed(false);
      setComment('');
      setRating(5);
      await loadReviews();
    } catch (err) {
      setAlert({ text: err?.response?.data?.message || 'تعذر حذف التقييم.', type: 'error' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className={styles.reviewsSection} dir="rtl">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <MessageSquare size={22} color="#4F46E5" />
          <span>آراء وتقييمات الطلاب</span>
        </h2>
        <span className={styles.totalReviewsCount}>
          ({summary.totalReviews} مراجعة)
        </span>
      </div>

      {/* Ratings Summary Card */}
      <div className={styles.summaryCard}>
        <div className={styles.overallScoreBox}>
          <span className={styles.bigScore}>{summary.averageRating.toFixed(1)}</span>
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                fill={star <= Math.round(summary.averageRating) ? '#F59E0B' : 'transparent'}
                color={star <= Math.round(summary.averageRating) ? '#F59E0B' : '#CBD5E1'}
              />
            ))}
          </div>
          <span className={styles.totalReviewsCount}>
            بناءً على {summary.totalReviews} تقييم
          </span>
        </div>

        {/* Breakdown bars */}
        <div className={styles.breakdownList}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.breakdown[stars] || 0;
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            return (
              <div key={stars} className={styles.breakdownRow}>
                <div className={styles.starLabel}>
                  <span>{stars}</span>
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                </div>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${percentage}%` }} />
                </div>
                <span className={styles.starCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Review Form for Enrolled Students */}
      {isEnrolled && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>
            {userHasReviewed ? 'تعديل تقييمك للكورس' : 'شاركنا رأيك وتقييمك في هذا الكورس'}
          </h3>

          {alert.text && (
            <div
              className={`${styles.alertBox} ${
                alert.type === 'error' ? styles.alertError : styles.alertSuccess
              }`}
            >
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.ratingSelectRow}>
              <span className={styles.ratingSelectLabel}>درجة التقييم:</span>
              <div className={styles.interactiveStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.starBtn} ${
                      s <= (hoverRating || rating) ? styles.starFilled : ''
                    }`}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    title={`${s} نجوم`}
                  >
                    <Star
                      size={24}
                      fill={s <= (hoverRating || rating) ? '#F59E0B' : 'transparent'}
                      color={s <= (hoverRating || rating) ? '#F59E0B' : '#CBD5E1'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="اكتب ملاحظاتك وتجربتك مع محتوى الدورة والشرح لمساعدة زملائك الطلاب..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.textarea}
              required
            />

            <div className={styles.formActions}>
              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{userHasReviewed ? 'تحديث التقييم' : 'إرسال التقييم'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#4F46E5' }} />
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.noReviews}>
          لا توجد مراجعات مسجلة حتى الآن لهذا الكورس. كن أول من يشارك تجربته بعد الاشتراك!
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((rev) => {
            const isOwner =
              user && (rev.user?._id === user._id || rev.user === user._id || rev.user?.id === user.id);
            const isAdmin = user && ['ADMIN', 'MANAGER'].includes(user.role);

            return (
              <div key={rev._id} className={styles.reviewItem}>
                <div className={styles.reviewItemHeader}>
                  <div className={styles.userInfo}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        rev.userAvatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          rev.userName || 'طالب'
                        )}&background=4F46E5&color=fff&bold=true`
                      }
                      alt={rev.userName}
                      className={styles.avatar}
                    />
                    <div>
                      <div className={styles.userName}>{rev.userName}</div>
                      <div className={styles.reviewDate}>{formatDate(rev.createdAt)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={15}
                          fill={s <= rev.rating ? '#F59E0B' : 'transparent'}
                          color={s <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                    </div>

                    {(isOwner || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rev._id)}
                        className={styles.deleteBtn}
                        title="حذف التقييم"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <p className={styles.reviewText}>{rev.comment}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

