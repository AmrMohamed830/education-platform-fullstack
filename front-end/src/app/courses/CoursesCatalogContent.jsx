'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { useCourses } from '../../hooks/queries/useCourses';

export default function CoursesCatalogContent() {
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceType, setPriceType] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: 9,
      search: debouncedSearch || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      priceType: priceType !== 'all' ? priceType : undefined,
      sort: sortOption,
    }),
    [currentPage, debouncedSearch, selectedCategory, priceType, sortOption]
  );

  const { data, isLoading: loading, error: queryError, refetch } = useCourses(queryParams);
  const courses = data?.courses || [];
  const totalCourses = data?.totalCourses || 0;
  const totalPages = data?.totalPages || 1;
  const categories = data?.categories || [];
  const error = queryError?.response?.data?.message || (queryError ? 'تعذر تحميل الكورسات، يرجى المحاولة لاحقاً.' : '');

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
    <div className="py-12 pb-20 bg-slate-50 min-h-[85vh]" dir="rtl">
      <Container>
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-indigo-50 text-[var(--primary)] rounded-full text-sm font-bold mb-3.5">
            <Sparkles size={16} />
            <span>مكتبة الكورسات والدورات</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-main)] leading-tight mb-3">
            استكشف مسارك التعليمي القادم
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            دورات تدريبية متخصصة في مجالات البرمجة، التصميم، وتطوير المهارات مع نخبة من أفضل المدربين.
          </p>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white border border-[var(--border-light)] rounded-2xl p-5 shadow-sm mb-8 flex flex-col gap-5">
          <div className="flex gap-4 items-center flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن اسم الكورس أو الموضوع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pr-11 pl-4 border-[1.5px] border-[var(--border-light)] rounded-xl text-[0.95rem] text-[var(--text-main)] bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            {/* Filter Controls (Price & Sort) */}
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative min-w-[150px]">
                <select
                  value={priceType}
                  onChange={(e) => {
                    setPriceType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-3 px-4 border-[1.5px] border-[var(--border-light)] rounded-xl text-sm text-slate-700 bg-slate-50 focus:bg-white focus:border-[var(--primary)] outline-none cursor-pointer transition-all"
                >
                  <option value="all">كل الأسعار</option>
                  <option value="free">كورسات مجانية</option>
                  <option value="paid">كورسات مدفوعة</option>
                </select>
              </div>

              <div className="relative min-w-[150px]">
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-3 px-4 border-[1.5px] border-[var(--border-light)] rounded-xl text-sm text-slate-700 bg-slate-50 focus:bg-white focus:border-[var(--primary)] outline-none cursor-pointer transition-all"
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
          <div className="flex gap-2 items-center flex-wrap pt-3 border-t border-dashed border-slate-200">
            <span className="text-xs font-bold text-slate-500 ml-2">التصنيف:</span>
            <button
              type="button"
              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
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
                className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
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
        <div className="flex items-center justify-between mb-6 text-sm text-slate-500">
          <span>
            تم العثور على <strong className="text-slate-800">{totalCourses}</strong> كورس
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline bg-transparent border-none cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={38} className="animate-spin text-[var(--primary)]" />
            <p className="text-slate-500 font-semibold text-sm">جارٍ البحث وتحديث النتائج...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[var(--border-light)] max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-red-600 mb-2">حدث خطأ</h3>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="py-2 px-4 rounded-xl bg-indigo-50 text-[var(--primary)] font-bold text-xs"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[var(--border-light)] max-w-lg mx-auto">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">لم يتم العثور على أي كورسات</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              لا توجد كورسات مطابقة لشروط البحث والفلاتر الحالية. جرب تغيير كلمات البحث أو إعادة ضبط الفلاتر.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2.5 px-5 rounded-xl bg-[var(--primary)] text-white font-bold text-xs shadow-sm hover:opacity-95"
              >
                عرض جميع الكورسات
              </button>
            )}
          </div>
        ) : (
          /* Courses Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const lessonCount = getCourseLessonCount(course);
                const totalMinutes = getCourseTotalMinutes(course);
                const durationText =
                  totalMinutes > 0
                    ? `${Math.floor(totalMinutes / 60)} س ${totalMinutes % 60} د`
                    : 'ذاتي التقدم';

                return (
                  <div
                    key={course._id}
                    className="flex flex-col bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          course.image ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
                        }
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="absolute top-3 right-3 text-xs font-bold py-1 px-2.5 bg-white/95 backdrop-blur-md text-[var(--primary)] rounded-full shadow-sm">
                        {course.category || 'عام'}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-extrabold text-[var(--text-main)] mb-2 line-clamp-2 leading-snug" title={course.title}>
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2 flex-1">
                        {course.description}
                      </p>

                      {/* Meta information */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 py-3 border-t border-b border-slate-100 mb-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{course.instructor || 'مدرب معتمد'}</span>
                        </div>

                        {lessonCount > 0 && (
                          <div className="flex items-center gap-1">
                            <BookOpen size={14} />
                            <span>{lessonCount} درس</span>
                          </div>
                        )}

                        {totalMinutes > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{durationText}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 font-bold text-slate-700 mr-auto">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span>{(course.averageRating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[0.7rem] text-slate-400 font-semibold">الرسوم</span>
                          <span
                            className={`text-lg font-black ${
                              course.price === 0 ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {course.price === 0 ? 'مجانًا' : `$${course.price}`}
                          </span>
                        </div>

                        <Link
                          href={`/courses/${course._id}`}
                          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-50 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all text-xs font-bold no-underline"
                        >
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
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  type="button"
                  className="py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
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
                    className={`py-2 px-3.5 rounded-xl border text-sm font-semibold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
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
