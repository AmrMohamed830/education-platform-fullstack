'use client';

import { useState } from 'react';
import { Star, MessageSquare, Trash2, Send, Loader2 } from 'lucide-react';
import { useCourseReviews } from '@/hooks/queries/useReviews';
import { useSubmitReview, useDeleteReview } from '@/hooks/mutations/useReviewMutations';
import useAuthStore from '../../store/auth.store';

export default function CourseReviews({ courseId, isEnrolled }) {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading: loading } = useCourseReviews(courseId);
  const submitMutation = useSubmitReview(courseId);
  const deleteMutation = useDeleteReview(courseId);

  const reviews = data?.reviews || [];
  const summary = {
    totalReviews: data?.totalReviews || 0,
    averageRating: data?.averageRating || 5.0,
    breakdown: data?.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  const [alert, setAlert] = useState({ text: '', type: 'success' });

  // Sync user's existing review
  const myReview =
    user && data?.reviews
      ? data.reviews.find(
          (r) => r.user?._id === user._id || r.user === user._id || r.user?.id === user.id
        ) || null
      : null;

  const userHasReviewed = Boolean(myReview);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [syncedReviewId, setSyncedReviewId] = useState(null);

  if (myReview && myReview._id !== syncedReviewId) {
    setSyncedReviewId(myReview._id);
    setRating(myReview.rating);
    setComment(myReview.comment || '');
  } else if (!myReview && syncedReviewId !== null) {
    setSyncedReviewId(null);
    setRating(5);
    setComment('');
  }

  const submitting = submitMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setAlert({ text: 'يرجى كتابة نص المراجعة أو التعليق', type: 'error' });
      return;
    }

    try {
      setAlert({ text: '', type: 'success' });
      await submitMutation.mutateAsync({ rating, comment });
      setAlert({ text: 'تم نشر تقييمك بنجاح! شكراً لمشاركتك رأيك.', type: 'success' });
    } catch (err) {
      setAlert({ text: err?.response?.data?.message || 'تعذر نشر التقييم.', type: 'error' });
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم؟')) return;
    try {
      await deleteMutation.mutateAsync(reviewId);
      setAlert({ text: 'تم حذف التقييم بنجاح.', type: 'success' });
      setComment('');
      setRating(5);
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
    <section className="mt-12 pt-10 border-t border-slate-200" dir="rtl">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <MessageSquare size={24} className="text-[var(--primary)]" />
          <span>تقييمات وآراء الطلاب ({summary.totalReviews})</span>
        </h2>
      </div>

      {/* Ratings Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-7 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-8 mb-10 shadow-sm text-center sm:text-right">
        <div className="flex flex-col items-center justify-center sm:border-l sm:border-slate-100 sm:pl-4 border-b sm:border-b-0 pb-5 sm:pb-0 border-slate-100">
          <span className="text-5xl font-black text-slate-900 leading-none mb-2">
            {summary.averageRating.toFixed(1)}
          </span>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                fill={star <= Math.round(summary.averageRating) ? '#F59E0B' : 'transparent'}
                color={star <= Math.round(summary.averageRating) ? '#F59E0B' : '#CBD5E1'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            بناءً على {summary.totalReviews} تقييم
          </span>
        </div>

        {/* Breakdown bars */}
        <div className="flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.breakdown[stars] || 0;
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs text-slate-600">
                <div className="w-12 flex items-center gap-1 font-bold">
                  <span>{stars}</span>
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-left font-semibold text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Review Form for Enrolled Students */}
      {isEnrolled && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4">
            {userHasReviewed ? 'تعديل تقييمك للكورس' : 'شاركنا رأيك وتقييمك في هذا الكورس'}
          </h3>

          {alert.text && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                alert.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              {alert.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <span className="text-sm font-bold text-slate-700">درجة التقييم:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="p-1 bg-transparent border-none cursor-pointer transition-transform hover:scale-110"
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
              className="w-full p-4 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 mb-4"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
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
        <div className="text-center py-8">
          <Loader2 size={28} className="animate-spin text-[var(--primary)] mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm">
          لا توجد مراجعات مسجلة حتى الآن لهذا الكورس. كن أول من يشارك تجربته بعد الاشتراك!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((rev) => {
            const isOwner =
              user && (rev.user?._id === user._id || rev.user === user._id || rev.user?.id === user.id);
            const isAdmin = user && ['ADMIN', 'MANAGER'].includes(user.role);

            return (
              <div key={rev._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        rev.userAvatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          rev.userName || 'طالب'
                        )}&background=4F46E5&color=fff&bold=true`
                      }
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{rev.userName}</div>
                      <div className="text-xs text-slate-400">{formatDate(rev.createdAt)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
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
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                        title="حذف التقييم"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{rev.comment}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
