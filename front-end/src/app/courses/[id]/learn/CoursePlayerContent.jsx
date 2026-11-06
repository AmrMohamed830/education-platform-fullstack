'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCourse } from '@/hooks/queries/useCourses';
import { useCurriculum } from '@/hooks/queries/useCurriculum';
import { useCourseProgress } from '@/hooks/queries/useEnrollments';
import { useToggleLesson, useEnrollCourse } from '@/hooks/mutations/useEnrollmentMutations';
import useAuthStore from '@/store/auth.store';
import Button from '@/components/common/Button';
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  FileText,
  Clock,
  Menu,
  X,
  Award,
  HelpCircle,
  ChevronLeft,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const getVideoEmbed = (url) => {
  if (!url) return null;
  const trimmed = url.trim();

  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/
  );
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
    };
  }

  return {
    type: 'direct',
    src: trimmed,
  };
};

export default function CoursePlayerContent({ courseId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryLessonId = searchParams?.get('lesson');

  const { user } = useAuthStore();

  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: curriculumData, isLoading: currLoading, error: currError } = useCurriculum(courseId);
  const { data: progressData } = useCourseProgress(courseId, Boolean(user && user.role === 'USER'));

  const toggleLessonMutation = useToggleLesson(courseId);
  const enrollMutation = useEnrollCourse();

  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const sections = useMemo(() => curriculumData?.sections || [], [curriculumData?.sections]);
  const hasFullAccess = Boolean(curriculumData?.hasFullAccess);
  const progressPercentage = progressData?.progressPercentage || 0;
  const completedLessonIds = useMemo(
    () => new Set((progressData?.completedLessons || []).map(String)),
    [progressData?.completedLessons]
  );

  const allLessons = useMemo(() => {
    const list = [];
    sections.forEach((sec) => {
      (sec.lessons || []).forEach((les) => {
        list.push({
          ...les,
          sectionId: sec._id,
          sectionTitle: sec.title,
        });
      });
    });
    return list;
  }, [sections]);

  const activeLessonId = selectedLessonId || queryLessonId || (allLessons[0]?._id ?? null);

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return allLessons[0] || null;
    return allLessons.find((l) => l._id === activeLessonId) || allLessons[0] || null;
  }, [allLessons, activeLessonId]);

  const currentIndex = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleSelectLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
    setIsSidebarOpenMobile(false);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === false ? true : false,
    }));
  };

  const isTogglingComplete = toggleLessonMutation.isPending;
  const handleToggleComplete = async () => {
    if (!activeLesson || isTogglingComplete) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'USER') {
      return;
    }

    try {
      await toggleLessonMutation.mutateAsync(activeLesson._id);
    } catch (err) {
      alert(err?.response?.data?.message || 'تعذر تحديث إكمال الدرس.');
    }
  };

  const isEnrolling = enrollMutation.isPending;
  const handleQuickEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await enrollMutation.mutateAsync(courseId);
    } catch (err) {
      alert(err?.response?.data?.message || 'تعذر الاشتراك.');
    }
  };

  const loading = courseLoading || currLoading;
  const error = (courseError || currError)
    ? (courseError?.response?.data?.message || currError?.response?.data?.message || 'تعذر تحميل بيانات الدورة التعليمية.')
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <Loader2 size={46} className="animate-spin text-indigo-500 mb-4" />
        <h2 className="text-xl font-bold">جارٍ تجهيز مساحة التعلم...</h2>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <AlertCircle size={52} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
        <p className="text-sm text-slate-400 mb-6">{error || 'لم نتمكن من فتح الكورس.'}</p>
        <Link href={`/courses/${courseId}`} className="no-underline">
          <Button variant="primary" icon={ArrowRight}>
            العودة لصفحة الكورس
          </Button>
        </Link>
      </div>
    );
  }

  const isCurrentCompleted = activeLesson ? completedLessonIds.has(activeLesson._id) : false;
  const isCurrentLocked = activeLesson ? activeLesson.isLocked : false;
  const videoData = activeLesson?.videoUrl ? getVideoEmbed(activeLesson.videoUrl) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col" dir="rtl">
      {/* ── Top Bar ── */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 py-1.5 px-3 rounded-xl text-xs font-bold no-underline transition-colors"
          >
            <ArrowRight size={16} />
            <span>تفاصيل الكورس</span>
          </Link>
          <span className="text-sm sm:text-base font-extrabold text-white max-w-[200px] sm:max-w-md truncate">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === 'USER' && (
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400">{progressPercentage}% مكتمل</span>
            </div>
          )}

          {progressPercentage === 100 && (
            <Link href={`/courses/${courseId}/certificate`} className="no-underline">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-md border-none cursor-pointer transition-colors"
              >
                <Award size={16} />
                <span>شهادتك 🎓</span>
              </button>
            </Link>
          )}

          <button
            type="button"
            className="lg:hidden bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white py-1.5 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          >
            {isSidebarOpenMobile ? <X size={18} /> : <Menu size={18} />}
            <span>المنهج</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] flex-1 min-h-[calc(100vh-64px)] relative">
        {/* ── Left Content Area: Video Player + Details ── */}
        <main className="flex flex-col bg-slate-950 overflow-y-auto">
          {/* Video Section */}
          <div className="w-full bg-black relative aspect-video max-h-[70vh] flex items-center justify-center">
            {isCurrentLocked ? (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">هذا الدرس خاص بالطلاب المشتركين</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  اشترك الآن في كورس &quot;{course.title}&quot; لتتمكن من الوصول لكافة الفيديوهات، المشاريع، وملفات الدورة والشهادة المعتمدة.
                </p>
                {!user ? (
                  <Link href="/login" className="no-underline">
                    <Button variant="primary" size="lg" icon={ArrowLeft}>
                      تسجيل الدخول للاشتراك
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleQuickEnroll}
                    disabled={isEnrolling}
                    icon={isEnrolling ? Loader2 : Sparkles}
                  >
                    {isEnrolling ? 'جاري الاشتراك...' : 'اشترك في الكورس الآن'}
                  </Button>
                )}
              </div>
            ) : !videoData ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <PlayCircle size={48} className="text-indigo-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">لا يوجد فيديو متاح لهذا الدرس حالياً</h3>
                <p className="text-xs text-slate-400">يمكنك مراجعة وصف الدرس والمصادر المرفقة أدناه.</p>
              </div>
            ) : videoData.type === 'youtube' || videoData.type === 'vimeo' ? (
              <iframe
                src={videoData.src}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={activeLesson?.title || 'Video Player'}
              />
            ) : (
              <video
                src={videoData.src}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Lesson Details & Action Controls */}
          {activeLesson && (
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              {/* Navigation & Completion Bar */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-700 cursor-pointer"
                    onClick={() => previousLesson && handleSelectLesson(previousLesson._id)}
                    disabled={!previousLesson}
                  >
                    <ArrowRight size={16} />
                    <span>الدرس السابق</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-700 cursor-pointer"
                    onClick={() => nextLesson && handleSelectLesson(nextLesson._id)}
                    disabled={!nextLesson}
                  >
                    <span>الدرس التالي</span>
                    <ArrowLeft size={16} />
                  </button>
                </div>

                {user?.role === 'USER' && hasFullAccess && (
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrentCompleted
                        ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                    }`}
                    onClick={handleToggleComplete}
                    disabled={isTogglingComplete}
                  >
                    {isTogglingComplete ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isCurrentCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Circle size={18} />
                    )}
                    <span>{isCurrentCompleted ? 'تم إكمال الدرس ✓' : 'تحديد الدرس كمكتمل'}</span>
                  </button>
                )}
              </div>

              {/* Lesson Metadata Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <span className="text-xs font-bold text-indigo-400 mb-2 block">
                  {activeLesson.sectionTitle || 'الوحدة الحالية'}
                </span>

                <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
                  {activeLesson.title}
                </h1>

                <div className="flex items-center gap-3 text-xs mb-4">
                  {activeLesson.duration > 0 && (
                    <div className="inline-flex items-center gap-1 text-slate-400 font-medium">
                      <Clock size={15} />
                      <span>{activeLesson.duration} دقيقة</span>
                    </div>
                  )}

                  {activeLesson.isPreview && (
                    <span className="py-0.5 px-2 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                      معاينة مجانية
                    </span>
                  )}
                </div>

                {activeLesson.description && (
                  <p className="text-sm text-slate-300 leading-relaxed">{activeLesson.description}</p>
                )}
              </div>

              {/* Downloadable / External Resources */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-400" />
                    <span>مصادر وملفات الدرس ({activeLesson.resources.length})</span>
                  </h3>

                  <div className="flex flex-col gap-2">
                    {activeLesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 no-underline transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <LinkIcon size={16} className="text-indigo-400" />
                          <span>{res.title}</span>
                        </div>
                        <span className="text-xs text-slate-400">تحميل / فتح ↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Right Column: Curriculum Accordion Sidebar ── */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto ${
            isSidebarOpenMobile
              ? 'fixed inset-y-16 right-0 w-80 z-30 shadow-2xl flex'
              : 'hidden lg:flex'
          }`}
        >
          <div className="p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <h2 className="text-base font-extrabold text-white">منهج الدورة</h2>
            <p className="text-xs text-slate-400">
              {sections.length} وحدات • {allLessons.length} درس
            </p>
          </div>

          <div className="flex flex-col">
            {sections.map((section, sIndex) => {
              const isExpanded = expandedSections[section._id] !== false;
              const sectionLessons = section.lessons || [];

              return (
                <div key={section._id} className="border-b border-slate-800/80">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800/60 text-right cursor-pointer border-none font-inherit transition-colors"
                    onClick={() => toggleSection(section._id)}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-200 leading-snug">
                        {sIndex + 1}. {section.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{sectionLessons.length} دروس</div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-slate-800/40 bg-slate-950/60">
                      {sectionLessons.map((lesson) => {
                        const isActive = lesson._id === activeLesson?._id;
                        const isDone = completedLessonIds.has(lesson._id);
                        const isLock = lesson.isLocked;

                        return (
                          <div
                            key={lesson._id}
                            className={`flex items-center gap-3 p-3.5 px-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${
                              isActive ? 'bg-indigo-950/70 border-r-4 border-indigo-500' : ''
                            }`}
                            onClick={() => handleSelectLesson(lesson._id)}
                          >
                            <div className="shrink-0">
                              {isDone ? (
                                <CheckCircle2 size={18} className="text-emerald-400" />
                              ) : isLock ? (
                                <Lock size={16} className="text-slate-500" />
                              ) : (
                                <PlayCircle size={17} className="text-slate-400" />
                              )}
                            </div>

                            <div className="flex-1">
                              <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                                {lesson.title}
                              </span>
                              <div className="flex items-center gap-2 text-[0.7rem] text-slate-400 mt-0.5">
                                {lesson.duration > 0 && <span>{lesson.duration} د</span>}
                                {lesson.isPreview && (
                                  <span className="text-emerald-400 font-bold">معاينة</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Quiz Item in Sidebar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 sticky bottom-0 z-10">
            <Link
              href={`/courses/${courseId}/quiz`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-700/60 hover:border-indigo-500 transition-all text-white no-underline group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-bold block text-indigo-300">التقييم والشهادة</span>
                  <span className="text-xs font-extrabold text-white">الاختبار النهائي للدورة</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-indigo-400 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
