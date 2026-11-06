'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCourse } from '@/services/course.service';
import { getCourseCurriculum } from '@/services/curriculum.service';
import { toggleLessonProgress, getCourseProgress, enrollInCourse } from '@/services/enrollment.service';
import useAuthStore from '@/store/auth.store';
import Button from '@/components/common/Button';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  PlayCircle,
  FileText,
  Clock,
  Menu,
  X,
  Award,
  HelpCircle,
  Layers,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import styles from './CoursePlayer.module.css';

// Helper: Convert video URL to embeddable format
const getVideoEmbed = (url) => {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
    };
  }

  // Direct MP4 / HTML5 video
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

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Progress state
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);

  // Full access flag (enrolled student or admin)
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Mobile drawer state
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Expanded sections tracking
  const [expandedSections, setExpandedSections] = useState({});

  // ── Flattened list of all lessons for navigation ───────────────────
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

  // Current active lesson object
  const activeLesson = useMemo(() => {
    if (!activeLessonId) return allLessons[0] || null;
    return allLessons.find((l) => l._id === activeLessonId) || allLessons[0] || null;
  }, [allLessons, activeLessonId]);

  // ── Fetch Initial Data ─────────────────────────────────────────────
  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError('');

      const [courseRes, curriculumRes] = await Promise.all([
        getCourse(courseId),
        getCourseCurriculum(courseId),
      ]);

      const courseData = courseRes.data.data.course;
      const curriculumData = curriculumRes.data.data;

      setCourse(courseData);
      const fetchedSections = curriculumData.sections || [];
      setSections(fetchedSections);
      setHasFullAccess(Boolean(curriculumData.hasFullAccess));

      // Expand all sections by default
      const initialExpanded = {};
      fetchedSections.forEach((s) => {
        initialExpanded[s._id] = true;
      });
      setExpandedSections(initialExpanded);

      // Select initial lesson
      if (queryLessonId) {
        setActiveLessonId(queryLessonId);
      } else if (fetchedSections.length > 0 && fetchedSections[0].lessons?.length > 0) {
        setActiveLessonId(fetchedSections[0].lessons[0]._id);
      }

      // Fetch progress if student
      if (user && user.role === 'USER') {
        try {
          const progRes = await getCourseProgress(courseId);
          const compIds = progRes.data.data.completedLessons || [];
          setCompletedLessonIds(new Set(compIds.map(String)));
          setProgressPercentage(progRes.data.data.progressPercentage || 0);
        } catch {
          // If not enrolled or error, ignore
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'تعذر تحميل بيانات الدورة التعليمية.');
    } finally {
      setLoading(false);
    }
  }, [courseId, queryLessonId, user]);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!ignore) {
        await loadCourseData();
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, [loadCourseData]);

  // ── Navigation (Previous / Next) ────────────────────────────────────
  const currentIndex = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleSelectLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    setIsSidebarOpenMobile(false);
  };

  // Toggle Section in Sidebar
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // ── Toggle Lesson Complete ──────────────────────────────────────────
  const handleToggleComplete = async () => {
    if (!activeLesson || isTogglingComplete) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'USER') {
      return;
    }

    setIsTogglingComplete(true);
    try {
      const res = await toggleLessonProgress(courseId, activeLesson._id);
      const { isCompleted, progressPercentage: newProg } = res.data.data;

      setCompletedLessonIds((prev) => {
        const nextSet = new Set(prev);
        if (isCompleted) {
          nextSet.add(activeLesson._id);
        } else {
          nextSet.delete(activeLesson._id);
        }
        return nextSet;
      });

      setProgressPercentage(newProg);
    } catch (err) {
      alert(err?.response?.data?.message || 'تعذر تحديث إكمال الدرس.');
    } finally {
      setIsTogglingComplete(false);
    }
  };

  // Quick enroll from player if un-enrolled
  const handleQuickEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      await enrollInCourse(courseId);
      await loadCourseData();
    } catch (err) {
      alert(err?.response?.data?.message || 'تعذر الاشتراك.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // ── Loading & Error States ──────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.stateCenter}>
        <Loader2 size={46} className={styles.spinner} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>جارٍ تجهيز مساحة التعلم...</h2>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.stateCenter}>
        <AlertCircle size={52} color="#EF4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>حدث خطأ</h2>
        <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>{error || 'لم نتمكن من فتح الكورس.'}</p>
        <Link href={`/courses/${courseId}`}>
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
    <div className={styles.playerWrapper}>
      {/* ── Top Bar ── */}
      <header className={styles.topNav}>
        <div className={styles.topNavRight}>
          <Link href={`/courses/${courseId}`} className={styles.backBtn}>
            <ArrowRight size={16} />
            <span>تفاصيل الكورس</span>
          </Link>
          <span className={styles.courseNavTitle}>{course.title}</span>
        </div>

        <div className={styles.topNavLeft}>
          {user?.role === 'USER' && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className={styles.progressText}>{progressPercentage}% مكتمل</span>
            </div>
          )}

          <Link href={`/courses/${courseId}/quiz`} style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
              }}
            >
              <HelpCircle size={16} />
              <span>اختبار الكورس 📝</span>
            </button>
          </Link>

          {progressPercentage === 100 && (
            <Link href={`/courses/${courseId}/certificate`} style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
                }}
              >
                <Award size={16} />
                <span>شهادتك 🎓</span>
              </button>
            </Link>
          )}

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          >
            {isSidebarOpenMobile ? <X size={18} /> : <Menu size={18} />}
            <span>المنهج</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className={styles.mainLayout}>
        {/* ── Left Content Area: Video Player + Details ── */}
        <main className={styles.contentArea}>
          {/* Video Section */}
          <div className={styles.videoSection}>
            {isCurrentLocked ? (
              <div className={styles.videoLockScreen}>
                <div className={styles.lockIconWrapper}>
                  <Lock size={32} />
                </div>
                <h3 className={styles.lockTitle}>هذا الدرس خاص بالطلاب المشتركين</h3>
                <p className={styles.lockSub}>
                  اشترك الآن في كورس &quot;{course.title}&quot; لتتمكن من الوصول لكافة الفيديوهات، المشاريع، وملفات الدورة والشهادة المعتمدة.
                </p>
                {!user ? (
                  <Link href="/login" style={{ textDecoration: 'none' }}>
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
              <div className={styles.videoLockScreen}>
                <PlayCircle size={48} color="#6366F1" />
                <h3 className={styles.lockTitle}>لا يوجد فيديو متاح لهذا الدرس حالياً</h3>
                <p className={styles.lockSub}>
                  يمكنك مراجعة وصف الدرس والمصادر المرفقة أدناه.
                </p>
              </div>
            ) : videoData.type === 'youtube' || videoData.type === 'vimeo' ? (
              <iframe
                src={videoData.src}
                className={styles.videoIframe}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={activeLesson?.title || 'Video Player'}
              />
            ) : (
              <video
                src={videoData.src}
                controls
                controlsList="nodownload"
                className={styles.videoNative}
              />
            )}
          </div>

          {/* Lesson Details & Action Controls */}
          {activeLesson && (
            <div className={styles.lessonDetailsArea}>
              {/* Navigation & Completion Bar */}
              <div className={styles.controlBar}>
                <div className={styles.navControls}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => previousLesson && handleSelectLesson(previousLesson._id)}
                    disabled={!previousLesson}
                  >
                    <ArrowRight size={16} />
                    <span>الدرس السابق</span>
                  </button>

                  <button
                    type="button"
                    className={styles.navBtn}
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
                    className={`${styles.completeBtn} ${
                      isCurrentCompleted
                        ? styles.completeBtnCompleted
                        : styles.completeBtnUncompleted
                    }`}
                    onClick={handleToggleComplete}
                    disabled={isTogglingComplete}
                  >
                    {isTogglingComplete ? (
                      <Loader2 size={18} className={styles.spinner} />
                    ) : isCurrentCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Circle size={18} />
                    )}
                    <span>
                      {isCurrentCompleted ? 'تم إكمال الدرس ✓' : 'تحديد الدرس كمكتمل'}
                    </span>
                  </button>
                )}
              </div>

              {/* Lesson Metadata Card */}
              <div className={styles.lessonMetaCard}>
                <span className={styles.sectionBreadcrumb}>
                  {activeLesson.sectionTitle || 'الوحدة الحالية'}
                </span>

                <h1 className={styles.currentLessonTitle}>{activeLesson.title}</h1>

                <div className={styles.lessonMetaPills}>
                  {activeLesson.duration > 0 && (
                    <div className={styles.pillItem}>
                      <Clock size={15} />
                      <span>{activeLesson.duration} دقيقة</span>
                    </div>
                  )}

                  {activeLesson.isPreview && (
                    <span className={styles.previewTag}>معاينة مجانية</span>
                  )}
                </div>

                {activeLesson.description && (
                  <p className={styles.lessonDesc}>{activeLesson.description}</p>
                )}
              </div>

              {/* Downloadable / External Resources */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className={styles.resourcesCard}>
                  <h3 className={styles.resourcesCardTitle}>
                    <FileText size={18} color="var(--primary)" />
                    <span>مصادر وملفات الدرس ({activeLesson.resources.length})</span>
                  </h3>

                  <div className={styles.resourcesList}>
                    {activeLesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.resourceLink}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <LinkIcon size={16} color="#818CF8" />
                          <span>{res.title}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>تحميل / فتح ↗</span>
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
          className={`${styles.curriculumSidebar} ${
            isSidebarOpenMobile ? styles.curriculumSidebarOpen : ''
          }`}
        >
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarHeaderTitle}>منهج الدورة</h2>
            <p className={styles.sidebarHeaderSub}>
              {sections.length} وحدات • {allLessons.length} درس
            </p>
          </div>

          <div className={styles.sidebarSectionList}>
            {sections.map((section, sIndex) => {
              const isExpanded = expandedSections[section._id] !== false;
              const sectionLessons = section.lessons || [];

              return (
                <div key={section._id} className={styles.sidebarSectionItem}>
                  {/* Section Title Header */}
                  <button
                    type="button"
                    className={styles.sidebarSectionHeader}
                    onClick={() => toggleSection(section._id)}
                  >
                    <div>
                      <div className={styles.sidebarSectionTitle}>
                        {sIndex + 1}. {section.title}
                      </div>
                      <div className={styles.sidebarSectionMeta}>
                        {sectionLessons.length} دروس
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
                  </button>

                  {/* Section Lessons */}
                  {isExpanded && (
                    <div className={styles.sidebarLessonsList}>
                      {sectionLessons.map((lesson) => {
                        const isActive = lesson._id === activeLesson?._id;
                        const isDone = completedLessonIds.has(lesson._id);
                        const isLock = lesson.isLocked;

                        return (
                          <div
                            key={lesson._id}
                            className={`${styles.sidebarLessonItem} ${
                              isActive ? styles.activeLessonItem : ''
                            }`}
                            onClick={() => handleSelectLesson(lesson._id)}
                          >
                            {/* Checkmark or Lock status */}
                            <div className={styles.statusCheckIcon}>
                              {isDone ? (
                                <CheckCircle2 size={18} className={styles.statusCheckCompleted} />
                              ) : isLock ? (
                                <Lock size={16} className={styles.statusLocked} />
                              ) : (
                                <PlayCircle size={17} className={styles.statusCheckIncomplete} />
                              )}
                            </div>

                            <div className={styles.sidebarLessonInfo}>
                              <span className={styles.sidebarLessonTitle}>{lesson.title}</span>
                              <div className={styles.sidebarLessonMeta}>
                                {lesson.duration > 0 && <span>{lesson.duration} د</span>}
                                {lesson.isPreview && (
                                  <span style={{ color: '#34D399', fontWeight: 700 }}>معاينة</span>
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
        </aside>
      </div>
    </div>
  );
}

