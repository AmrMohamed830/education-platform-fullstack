'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourse } from '@/hooks/queries/useCourses';
import { useCurriculum } from '@/hooks/queries/useCurriculum';
import { useMyEnrollments } from '@/hooks/queries/useEnrollments';
import { useEnrollCourse } from '@/hooks/mutations/useEnrollmentMutations';
import useAuthStore from '@/store/auth.store';
import Container from '@/components/common/Container';
import Button from '@/components/common/Button';
import CourseReviews from '@/components/course/CourseReviews';
import {
  BookOpen,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  PlayCircle,
  Play,
  FileText,
  AlertCircle,
  Loader2,
  Layers,
  Infinity as InfinityIcon,
  HelpCircle,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const GRADIENTS = [
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
];

export default function CourseDetailsContent({ courseId }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: currData, isLoading: currLoading } = useCurriculum(courseId);
  const { data: enrollments } = useMyEnrollments(Boolean(user && user.role === 'USER'));
  const enrollMutation = useEnrollCourse();
  const isEnrolling = enrollMutation.isPending;

  const [expandedSections, setExpandedSections] = useState({});
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [enrollError, setEnrollError] = useState('');

  const curriculumSections = currData?.sections || [];
  const totalLessons = currData?.totalLessons || 0;
  const totalDuration = currData?.totalDuration || 0;

  const isEnrolled = Boolean(
    user &&
      user.role === 'USER' &&
      enrollments?.some((e) => {
        const enrolledId = typeof e.course === 'object' ? e.course?._id : e.course;
        return enrolledId === courseId;
      })
  );

  // Toggle Section Collapse
  const toggleSection = (sectionId, defaultExpanded = true) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] !== undefined ? !prev[sectionId] : !defaultExpanded,
    }));
  };

  // ── Handle Enrollment ────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'USER') {
      router.push('/dashboard');
      return;
    }

    if (isEnrolling || isEnrolled) return;

    try {
      setEnrollError('');
      setEnrollSuccess('');

      await enrollMutation.mutateAsync(courseId);
      setEnrollSuccess('تم اشتراكك في الكورس بنجاح! 🎉 يمكنك الآن البدء في مشاهدة الدروس.');
    } catch (err) {
      setEnrollError(err?.response?.data?.message || 'حدث خطأ أثناء الاشتراك. يرجى المحاولة لاحقاً.');
    }
  };

  // Helper: Format Duration
  const formatDurationText = (minutes) => {
    if (!minutes || minutes === 0) return 'محتوى تدريبي مرن';
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    if (hours > 0 && remMins > 0) {
      return `${hours} ساعة و ${remMins} دقيقة`;
    }
    if (hours > 0) {
      return `${hours} ساعات تدريبية`;
    }
    return `${minutes} دقيقة`;
  };

  // ── Loading & Error States ──────────────────────────────────────────
  const loading = courseLoading || currLoading;
  const error = courseError ? (courseError?.response?.data?.message || 'تعذر تحميل بيانات الكورس.') : '';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <Loader2 size={46} className="animate-spin text-[var(--primary)] mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-1">جارٍ تحميل تفاصيل الكورس...</h2>
        <p className="text-sm text-slate-500">لحظات وسنكون جاهزين.</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-1">الكورس غير موجود</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'لم نتمكن من العثور على الكورس المطلوب.'}</p>
        <Link href="/" className="no-underline">
          <Button variant="primary" icon={ArrowRight}>
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    );
  }

  // Dynamic Objectives based on category
  const defaultObjectives = [
    `فهم وبناء المشاريع العملية المتطورة في مجال ${course.category || 'البرمجة'}.`,
    'تطبيق أفضل الممارسات البرمجية وأساليب كتابة الكود النظيف والمنظم.',
    'بناء مشاريع تطبيقية واقعية متكاملة لضمها إلى معرض أعمالك (Portfolio).',
    'التعامل مع المشاكل الشائعة وكيفية تصحيح الأخطاء بكفاءة عالية.',
    'اكتساب المهارات المطلوبة في سوق العمل الحر والشركات التقنية.',
    'الحصول على شهادة إتمام تثبت إتقانك لكافة مخرجات ومحاور الكورس.',
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
      {/* ── Top Hero Section ── */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white py-12 md:py-16 relative overflow-hidden">
        <Container>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6" aria-label="مسار التصفح">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors no-underline">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/courses" className="text-slate-300 hover:text-white transition-colors no-underline">
              الكورسات
            </Link>
            <span>/</span>
            <span className="text-indigo-400 font-semibold truncate max-w-xs">{course.title}</span>
          </nav>

          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <span className="inline-flex items-center gap-1.5 bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 py-1 px-3.5 rounded-full text-xs font-bold">
                <Layers size={14} />
                {course.category || 'مسار تعليمي'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 py-1 px-3.5 rounded-full text-xs font-semibold">
                <Sparkles size={14} />
                متاح للتسجيل
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">{course.title}</h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
              {course.description ||
                'دورة تدريبية متكاملة تأخذك خطوة بخطوة من البدايات وحتى الاحتراف مع التطبيق العملي.'}
            </p>

            {/* Quick Button in Hero if enrolled */}
            {isEnrolled && (
              <div className="mb-6">
                <Link href={`/courses/${courseId}/learn`} className="no-underline">
                  <Button variant="primary" size="lg" icon={PlayCircle}>
                    متابعة مشاهدة الدروس الآن 🎬
                  </Button>
                </Link>
              </div>
            )}

            {/* Meta Row */}
            <div className="flex items-center gap-6 flex-wrap pt-5 border-t border-white/10 text-sm">
              {/* Instructor */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-white/20">
                  {course.instructor?.charAt(0) || 'م'}
                </div>
                <span>المدرب: <strong>{course.instructor || 'خبير تقني'}</strong></span>
              </div>

              {/* Real Lessons Count */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <BookOpen size={16} />
                <span>{totalLessons} درس</span>
              </div>

              {/* Real Total Duration */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Layers size={16} />
                <span>{formatDurationText(totalDuration)}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-slate-200">
                <span>⭐ {(course.averageRating || 5.0).toFixed(1)}</span>
                <span className="text-slate-400 text-xs">({course.ratingsCount || 0} تقييم)</span>
              </div>

              {/* Certificate */}
              <div className="flex items-center gap-1.5 text-slate-200">
                <Award size={16} />
                <span>شهادة إتمام معتمدة</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Main Layout ── */}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mt-10">
          {/* Left / Main Content Column */}
          <div>
            {/* Section 1: What you will learn */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2.5">
                <CheckCircle2 size={22} className="text-[var(--primary)]" />
                <span>ماذا ستتعلم في هذا الكورس؟</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {defaultObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Real Course Curriculum (Syllabus) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2.5">
                <PlayCircle size={22} className="text-[var(--primary)]" />
                <span>منهج ومحاور الدورة ({curriculumSections.length} وحدات • {totalLessons} درس)</span>
              </h2>

              {curriculumSections.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  سيتم نشر وحدات ودروس هذا الكورس التدريبي قريباً.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {curriculumSections.map((sec, sIndex) => {
                    const isExpanded = expandedSections[sec._id] !== undefined ? expandedSections[sec._id] : sIndex < 2;
                    const secLessons = sec.lessons || [];

                    return (
                      <div key={sec._id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-right cursor-pointer border-none font-inherit"
                          onClick={() => toggleSection(sec._id, sIndex < 2)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0">
                              {sIndex + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{sec.title}</div>
                              {sec.description && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {sec.description}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                            <span>{secLessons.length} دروس</span>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </button>

                        {isExpanded && secLessons.length > 0 && (
                          <div className="divide-y divide-slate-100 bg-white">
                            {secLessons.map((les) => (
                              <div key={les._id} className="flex items-center justify-between p-3.5 px-4 text-xs sm:text-sm hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2.5">
                                  <PlayCircle size={16} className="text-[var(--primary)] shrink-0" />
                                  <span className="font-medium text-slate-800">{les.title}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {les.duration > 0 && (
                                    <span className="text-xs text-slate-500 font-medium">
                                      {les.duration} دقيقة
                                    </span>
                                  )}

                                  {les.isPreview ? (
                                    <Link
                                      href={`/courses/${courseId}/learn?lesson=${les._id}`}
                                      className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs no-underline hover:bg-emerald-100"
                                    >
                                      <Play size={11} />
                                      <span>معاينة مجانية</span>
                                    </Link>
                                  ) : isEnrolled ? (
                                    <Link
                                      href={`/courses/${courseId}/learn?lesson=${les._id}`}
                                      className="text-[var(--primary)] font-bold text-xs no-underline hover:underline"
                                    >
                                      مشاهدة ↗
                                    </Link>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                                      <Lock size={13} />
                                      <span>خاص بالمشتركين</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 3: Course Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2.5">
                <FileText size={22} className="text-[var(--primary)]" />
                <span>تفاصيل الكورس</span>
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {course.description}
                {'\n\n'}
                تم إعداد هذا المحتوى بعناية فائقة ليركز على التطبيق العملي المباشر بدلاً من الحفظ النظري. ستتعلم من خلال بناء مشاريع حقيقية تواجهك في سوق العمل، وتكتسب المعرفة العميقة التي تميزك عن المبتدئين. بنهاية الكورس ستكون قادراً على توظيف كل ما تعلمته في أعمالك الحقيقية.
              </p>
            </div>

            {/* Section 4: Prerequisites */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2.5">
                <HelpCircle size={22} className="text-[var(--primary)]" />
                <span>متطلبات الكورس</span>
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                  <span>جهاز كمبيوتر (Windows أو Mac أو Linux) واتصال بالإنترنت.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                  <span>الرغبة والشغف في التطبيق العملي وكتابة الأكواد بنفسك.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                  <span>لا تشترط أي خبرة مسبقة معقدة؛ نبدأ معك من المفاهيم الأساسية خطوة بخطوة.</span>
                </div>
              </div>
            </div>

            {/* Section 5: Instructor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2.5">
                <Users size={22} className="text-[var(--primary)]" />
                <span>عن المدرب</span>
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0">
                  {course.instructor?.charAt(0) || 'م'}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-1">
                    {course.instructor || 'المدرب التقني'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    خبير ومطور برمجيات بخبرة تزيد عن 8 سنوات في بناء وتطوير الأنظمة والتطبيقات الحديثة، شغوف بتبسيط المفاهيم البرمجية ومساعدة الطلاب على دخول سوق العمل التقني بنجاح.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6: Course Reviews */}
            <CourseReviews courseId={courseId} isEnrolled={isEnrolled} />
          </div>

          {/* Right / Sticky Sidebar */}
          <aside>
            <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
              {/* Image Banner */}
              <div
                className="relative h-52 bg-slate-800 bg-cover bg-center flex items-center justify-center"
                style={
                  course.image
                    ? { backgroundImage: `url(${course.image})` }
                    : { background: GRADIENTS[0] }
                }
              >
                <Link
                  href={
                    curriculumSections[0]?.lessons?.find((l) => l.isPreview)?._id
                      ? `/courses/${courseId}/learn?lesson=${curriculumSections[0]?.lessons?.find((l) => l.isPreview)?._id}`
                      : `/courses/${courseId}/learn`
                  }
                  className="w-14 h-14 rounded-full bg-white/95 text-[var(--primary)] flex items-center justify-center shadow-xl hover:scale-110 transition-transform no-underline"
                  title="معاينة الكورس"
                >
                  <PlayCircle size={32} />
                </Link>
              </div>

              <div className="p-6">
                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-6">
                  {course.price === 0 ? (
                    <span className="text-3xl font-black text-emerald-600">مجاناً</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-slate-900">{course.price} $</span>
                      <span className="text-xs text-slate-400 font-semibold">وصول شامل مدى الحياة</span>
                    </>
                  )}
                </div>

                {/* Alerts */}
                {enrollSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-4 leading-relaxed">
                    <span>{enrollSuccess}</span>
                  </div>
                )}

                {enrollError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4 leading-relaxed">
                    <span>{enrollError}</span>
                  </div>
                )}

                {/* Enrollment Button Actions */}
                <div className="flex flex-col gap-3">
                  {isEnrolled ? (
                    <>
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold justify-center">
                        <CheckCircle2 size={18} />
                        <span>أنت مسجل بالفعل في هذا الكورس</span>
                      </div>
                      <Link href={`/courses/${courseId}/learn`} className="no-underline">
                        <Button variant="primary" size="lg" fullWidth icon={PlayCircle}>
                          ابدأ التعلم ومتابعة الدروس 🎬
                        </Button>
                      </Link>
                      <Link href={`/courses/${courseId}/quiz`} className="no-underline">
                        <Button variant="outline" size="md" fullWidth icon={HelpCircle}>
                          الاختبار النهائي للدورة 📝
                        </Button>
                      </Link>
                    </>
                  ) : !user ? (
                    <Link href="/login" className="no-underline">
                      <Button variant="primary" size="lg" fullWidth icon={ArrowLeft}>
                        تسجيل الدخول للاشتراك
                      </Button>
                    </Link>
                  ) : user.role !== 'USER' ? (
                    <Link href="/dashboard" className="no-underline">
                      <Button variant="outline" size="lg" fullWidth icon={ArrowLeft}>
                        لوحة تحكم المشرفين
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      icon={isEnrolling ? Loader2 : Sparkles}
                    >
                      {isEnrolling ? 'جاري الاشتراك...' : 'اشترك في الكورس الآن'}
                    </Button>
                  )}
                </div>

                {/* Benefits Checklist */}
                <div className="flex flex-col gap-3 my-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <InfinityIcon size={18} className="text-[var(--primary)] shrink-0" />
                    <span>وصول كامل ودائم لجميع محتويات الكورس</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award size={18} className="text-[var(--primary)] shrink-0" />
                    <span>شهادة إتمام معتمدة لملفك الشخصي</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <HelpCircle size={18} className="text-[var(--primary)] shrink-0" />
                    <span>اختبار تقييمي شامل لقياس استيعابك للمهارات</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <PlayCircle size={18} className="text-[var(--primary)] shrink-0" />
                    <span>{totalLessons} دروس ومشاريع تطبيقية</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-[var(--primary)] shrink-0" />
                    <span>تحديثات مستمرة لدروس الكورس مجاناً</span>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400 font-medium pt-4 border-t border-slate-100">
                  🔒 ضمان تجربة تعليمية متميزة واحترافية 100%
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
