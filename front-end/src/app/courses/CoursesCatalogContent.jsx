'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  User,
  Star,
  Clock,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import Container from '../../components/common/Container';
import { getAllCourses } from '../../services/course.service';
import styles from './CoursesCatalog.module.css';

export default function CoursesCatalogContent() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceType, setPriceType] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch courses with current filters
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: currentPage,
        limit: 9,
        search: debouncedSearch || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        priceType: priceType !== 'all' ? priceType : undefined,
        sort: sortOption,
      };

      const res = await getAllCourses(params);
      const data = res.data.data;
      setCourses(data.courses || []);
      setTotalCourses(data.totalCourses || 0);
      setTotalPages(data.totalPages || 1);

      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'تعذر تحميل الكورسات، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, priceType, sortOption]);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!ignore) {
        await fetchCourses();
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, [fetchCourses]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setPriceType('all');
    setSortOption('newest');
    setCurrentPage(1);
  };

  // Helper to calculate total lessons in a course
  const getCourseLessonCount = (course) => {
    if (!course.sections || !Array.isArray(course.sections)) return 0;
    return course.sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);
  };

  // Helper to calculate total duration in minutes
  const getCourseTotalMinutes = (course) => {
    if (!course.sections || !Array.isArray(course.sections)) return 0;
    return course.sections.reduce((acc, sec) => {
      const secMin = (sec.lessons || []).reduce((lAcc, les) => lAcc + (Number(les.duration) || 0), 0);
      return acc + secMin;
    }, 0);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) || selectedCategory !== 'all' || priceType !== 'all' || sortOption !== 'newest';

  return (
    <div className={styles.catalogSection} dir="rtl">
      <Container>
        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={16} />
            <span>مكتبة الكورسات والدورات</span>
          </div>
          <h1 className={styles.title}>استكشف مسارك التعليمي القادم</h1>
          <p className={styles.subtitle}>
            دورات تدريبية متخصصة في مجالات البرمجة، التصميم، وتطوير المهارات مع نخبة من أفضل المدربين.
          </p>
        </div>

        {/* Toolbar & Filters */}
        <div className={styles.toolbarCard}>
          <div className={styles.searchSortRow}>
            {/* Search Input */}
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="ابحث عن اسم الكورس أو الموضوع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Filter Controls (Price & Sort) */}
            <div className={styles.filterControls}>
              <div className={styles.selectGroup}>
                <select
                  value={priceType}
                  onChange={(e) => {
                    setPriceType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={styles.selectInput}
                >
                  <option value="all">كل الأسعار</option>
                  <option value="free">كورسات مجانية</option>
                  <option value="paid">كورسات مدفوعة</option>
                </select>
              </div>

              <div className={styles.selectGroup}>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={styles.selectInput}
                >
                  <option value="newest">الأحدث إضافة</option>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="price-low">السعر: من الأقل للأعلى</option>
                  <option value="price-high">السعر: من الأعلى للأقل</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className={styles.categoryChips}>
            <span className={styles.categoryLabel}>التصنيف:</span>
            <button
              type="button"
              className={`${styles.chip} ${selectedCategory === 'all' ? styles.chipActive : ''}`}
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chip} ${selectedCategory === cat ? styles.chipActive : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Bar */}
        <div className={styles.resultsBar}>
          <span>
            تم العثور على <strong>{totalCourses}</strong> كورس
          </span>
          {hasActiveFilters && (
            <button type="button" onClick={handleResetFilters} className={styles.resetBtn}>
              <RotateCcw size={14} />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              padding: '4rem 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <Loader2 size={38} style={{ animation: 'spin 1s linear infinite', color: '#4F46E5' }} />
            <p style={{ color: '#64748B', fontWeight: 600 }}>جارٍ البحث وتحديث النتائج...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>حدث خطأ</h3>
            <p className={styles.emptyText}>{error}</p>
            <button type="button" onClick={fetchCourses} className={styles.detailsBtn}>
              إعادة المحاولة
            </button>
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className={styles.emptyState}>
            <BookOpen size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>لم يتم العثور على أي كورسات</h3>
            <p className={styles.emptyText}>
              لا توجد كورسات مطابقة لشروط البحث والفلاتر الحالية. جرب تغيير كلمات البحث أو إعادة ضبط الفلاتر.
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={handleResetFilters} className={styles.detailsBtn}>
                عرض جميع الكورسات
              </button>
            )}
          </div>
        ) : (
          /* Courses Grid */
          <>
            <div className={styles.courseGrid}>
              {courses.map((course) => {
                const lessonCount = getCourseLessonCount(course);
                const totalMinutes = getCourseTotalMinutes(course);
                const durationText =
                  totalMinutes > 0
                    ? `${Math.floor(totalMinutes / 60)} س ${totalMinutes % 60} د`
                    : 'ذاتي التقدم';

                return (
                  <div key={course._id} className={styles.courseCard}>
                    {/* Course Image */}
                    <div className={styles.imageWrapper}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                        alt={course.title}
                        className={styles.courseImg}
                      />
                      <span className={styles.categoryTag}>{course.category || 'عام'}</span>
                    </div>

                    {/* Card Body */}
                    <div className={styles.cardBody}>
                      <h3 className={styles.courseTitle} title={course.title}>
                        {course.title}
                      </h3>
                      <p className={styles.courseDesc}>{course.description}</p>

                      {/* Meta information */}
                      <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                          <User size={14} />
                          <span>{course.instructor || 'مدرب معتمد'}</span>
                        </div>

                        {lessonCount > 0 && (
                          <div className={styles.metaItem}>
                            <BookOpen size={14} />
                            <span>{lessonCount} درس</span>
                          </div>
                        )}

                        {totalMinutes > 0 && (
                          <div className={styles.metaItem}>
                            <Clock size={14} />
                            <span>{durationText}</span>
                          </div>
                        )}

                        <div className={styles.ratingBadge}>
                          <Star size={14} fill="#F59E0B" color="#F59E0B" />
                          <span>{(course.averageRating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className={styles.cardFooter}>
                        <div className={styles.priceWrapper}>
                          <span className={styles.priceLabel}>الرسوم</span>
                          <span
                            className={`${styles.priceValue} ${
                              course.price === 0 ? styles.freePrice : ''
                            }`}
                          >
                            {course.price === 0 ? 'مجانًا' : `$${course.price}`}
                          </span>
                        </div>

                        <Link href={`/courses/${course._id}`} className={styles.detailsBtn}>
                          <span>تفاصيل الكورس</span>
                          <ArrowLeft size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  title="الصفحة السابقة"
                >
                  <ChevronRight size={18} />
                  <span>السابق</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageActive : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  title="الصفحة التالية"
                >
                  <span>التالي</span>
                  <ChevronLeft size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

