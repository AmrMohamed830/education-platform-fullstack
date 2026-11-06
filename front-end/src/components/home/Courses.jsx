'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import StarRating from '../common/StarRating';
import { getAllCourses } from '@/services/course.service';
import { BookOpen, Users, Clock, ArrowLeft, Bookmark, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import styles from './Courses.module.css';

// Gradient palette cycled for cards that have no image
const GRADIENTS = [
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllCourses();
        setCourses(response.data.data.courses);
      } catch (err) {
        setError(err?.response?.data?.message || 'حدث خطأ أثناء تحميل الكورسات.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section id="courses" className={styles.section}>
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
          <div className={styles.stateWrapper}>
            <Loader2 size={40} className={styles.spinner} />
            <p className={styles.stateText}>جارٍ تحميل الكورسات…</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className={styles.stateWrapper}>
            <AlertCircle size={40} className={styles.errorIcon} />
            <p className={styles.stateText}>{error}</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && courses.length === 0 && (
          <div className={styles.stateWrapper}>
            <BookOpen size={40} className={styles.emptyIcon} />
            <p className={styles.stateText}>لا توجد كورسات متاحة حالياً.</p>
          </div>
        )}

        {/* ── Course Cards ── */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className={styles.grid}>
              {courses.map((course, index) => {
                const gradient = GRADIENTS[index % GRADIENTS.length];

                return (
                  <div key={course._id} className={styles.courseCard}>
                    {/* Card Banner */}
                    <Link
                      href={`/courses/${course._id}`}
                      className={styles.imageBanner}
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
                      <div className={styles.badgeRow}>
                        <span className={styles.courseBadge}>
                          {course.category || 'كورس'}
                        </span>
                        <button
                          type="button"
                          className={styles.bookmarkBtn}
                          aria-label="حفظ الكورس"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Bookmark size={16} />
                        </button>
                      </div>
                    </Link>

                    {/* Card Content */}
                    <div className={styles.cardContent}>
                      <Link href={`/courses/${course._id}`} className={styles.titleLink}>
                        <h3 className={styles.courseTitle}>{course.title}</h3>
                      </Link>

                      {course.instructor && (
                        <div className={styles.instructorRow}>
                          <Users size={14} />
                          <span>المدرب: {course.instructor}</span>
                        </div>
                      )}

                      {course.description && (
                        <p className={styles.courseDescription}>{course.description}</p>
                      )}

                      {/* Card Footer with Price and Action Button */}
                      <div className={styles.cardFooter}>
                        <div className={styles.priceGroup}>
                          <span className={styles.price}>
                            {course.price === 0 ? 'مجاناً' : `${course.price} $`}
                          </span>
                        </div>

                        <Link href={`/courses/${course._id}`} style={{ textDecoration: 'none' }}>
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

            <div className={styles.viewMoreRow}>
              <Button variant="outline" size="lg" icon={ArrowLeft}>
                عرض كافة الكورسات والمسارات ({courses.length}+)
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
