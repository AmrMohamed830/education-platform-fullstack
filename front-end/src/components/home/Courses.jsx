'use client';

import Link from 'next/link';
import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import { useCourses } from '@/hooks/queries/useCourses';
import { BookOpen, Users, ArrowLeft, Bookmark, AlertCircle, Loader2 } from 'lucide-react';

const GRADIENTS = [
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
];

export default function Courses() {
  const { data, isLoading: loading, error: queryError } = useCourses();
  const courses = data?.courses || [];
  const error = queryError?.response?.data?.message || (queryError ? 'حدث خطأ أثناء تحميل الكورسات.' : null);

  return (
    <section id="courses" className="py-20 bg-white border-t border-[var(--border-light)]">
      <Container>
        <SectionHeader
          badgeText="الكورسات الأكثر طلباً"
          badgeIcon={BookOpen}
          title="استكشف أشهر الكورسات"
          highlightText="والمسارات التعليمية"
          subtitle="مناهج تفاعلية مُحدثة ومصممة لنقلك من الصفر إلى احتراف العمل في أفضل المشاريع."
        />

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Loader2 size={40} className="animate-spin text-[var(--primary)] mb-4" />
            <p className="text-base font-semibold text-[var(--text-muted)]">جارٍ تحميل الكورسات…</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <AlertCircle size={40} className="text-red-500 mb-4" />
            <p className="text-base font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <BookOpen size={40} className="text-slate-300 mb-4" />
            <p className="text-base font-semibold text-[var(--text-muted)]">لا توجد كورسات متاحة حالياً.</p>
          </div>
        )}

        {/* ── Course Cards ── */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {courses.map((course, index) => {
                const gradient = GRADIENTS[index % GRADIENTS.length];

                return (
                  <div
                    key={course._id}
                    className="flex flex-col bg-white border border-[var(--border-light)] rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-right"
                  >
                    {/* Card Banner */}
                    <Link
                      href={`/courses/${course._id}`}
                      className="h-48 relative p-4 flex flex-col justify-between no-underline"
                      style={
                        course.image
                          ? {
                              backgroundImage: `url(${course.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : { background: gradient }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold py-1 px-3 bg-white/90 backdrop-blur-md text-[var(--text-main)] rounded-full shadow-sm">
                          {course.category || 'كورس'}
                        </span>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[var(--text-main)] hover:text-[var(--primary)] transition-colors shadow-sm"
                          aria-label="حفظ الكورس"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Bookmark size={16} />
                        </button>
                      </div>
                    </Link>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <Link
                        href={`/courses/${course._id}`}
                        className="no-underline text-inherit hover:text-[var(--primary)] transition-colors"
                      >
                        <h3 className="text-lg font-extrabold text-[var(--text-main)] mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                      </Link>

                      {course.instructor && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-semibold mb-3">
                          <Users size={14} />
                          <span>المدرب: {course.instructor}</span>
                        </div>
                      )}

                      {course.description && (
                        <p className="text-xs text-[var(--text-body)] leading-relaxed mb-6 line-clamp-2 flex-1">
                          {course.description}
                        </p>
                      )}

                      {/* Card Footer with Price and Action Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] mt-auto">
                        <span className="text-lg font-black text-[var(--primary)]">
                          {course.price === 0 ? 'مجاناً' : `${course.price} $`}
                        </span>

                        <Link href={`/courses/${course._id}`} className="no-underline">
                          <Button variant="outline" size="sm" icon={ArrowLeft}>
                            تفاصيل واشتراك
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-12">
              <Link href="/courses" className="no-underline">
                <Button variant="outline" size="lg" icon={ArrowLeft}>
                  عرض كافة الكورسات والمسارات ({courses.length}+)
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
