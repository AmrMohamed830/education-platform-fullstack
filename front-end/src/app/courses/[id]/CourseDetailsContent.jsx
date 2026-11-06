'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourse } from '@/services/course.service';
import { enrollInCourse, getMyEnrollments } from '@/services/enrollment.service';
import useAuthStore from '@/store/auth.store';
import Container from '@/components/common/Container';
import Button from '@/components/common/Button';
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
  FileText,
  AlertCircle,
  Loader2,
  Layers,
  Infinity as InfinityIcon,
  HelpCircle,
} from 'lucide-react';
import styles from './CourseDetails.module.css';

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

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [enrollError, setEnrollError] = useState('');

  // ── Fetch Course Data & Check Enrollment ─────────────────────────────
  const loadData = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError('');

      const res = await getCourse(courseId);
      const courseData = res.data.data.course;
      setCourse(courseData);

      // If user is logged in, check if already enrolled
      if (user && user.role === 'USER') {
        try {
          const myEnrollmentsRes = await getMyEnrollments();
          const enrollmentsList = myEnrollmentsRes.data?.data?.enrollments || [];
          const enrolled = enrollmentsList.some((e) => {
            const enrolledId = typeof e.course === 'object' ? e.course?._id : e.course;
            return enrolledId === courseId;
          });
          setIsEnrolled(enrolled);
        } catch {
          // Ignore error silently if enrollments check fails
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'تعذر تحميل بيانات الكورس.');
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      if (!ignore) {
        await loadData();
      }
    };

    init();

    return () => {
      ignore = true;
    };
  }, [loadData]);

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
      setIsEnrolling(true);
      setEnrollError('');
      setEnrollSuccess('');

      await enrollInCourse(courseId);

      setIsEnrolled(true);
      setEnrollSuccess('تم اشتراكك في الكورس بنجاح! 🎉 يمكنك الآن متابعة التعلم.');
    } catch (err) {
      setEnrollError(err?.response?.data?.message || 'حدث خطأ أثناء الاشتراك. يرجى المحاولة لاحقاً.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // ── Loading & Error States ──────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.stateContainer}>
        <Loader2 size={46} className={styles.spinner} />
        <h2 className={styles.stateTitle}>جارٍ تحميل تفاصيل الكورس...</h2>
        <p className={styles.stateText}>لحظات وسنكون جاهزين.</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.stateContainer}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '1rem' }} />
        <h2 className={styles.stateTitle}>الكورس غير موجود</h2>
        <p className={styles.stateText}>{error || 'لم نتمكن من العثور على الكورس المطلوب.'}</p>
        <Link href="/">
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

  // Syllabus Chapters
  const syllabus = [
    { title: 'الوحدة الأولى: البداية والتأسيس النظري والعملي', lessons: 4, duration: 'ساعة و 45 دقيقة' },
    { title: 'الوحدة الثانية: التطبيق العملي وبناء المفاهيم المتقدمة', lessons: 6, duration: 'ساعتان و 30 دقيقة' },
    { title: 'الوحدة الثالثة: بناء مشروع حقيقي واقعي من الصفر', lessons: 5, duration: '3 ساعات و 15 دقيقة' },
    { title: 'الوحدة الرابعة: الاختبار، التحسين، ونشر المشروع النهائي', lessons: 3, duration: 'ساعة و 15 دقيقة' },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* ── Top Hero Section ── */}
      <section className={styles.heroSection}>
        <Container>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="مسار التصفح">
            <Link href="/" className={styles.breadcrumbLink}>
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/#courses" className={styles.breadcrumbLink}>
              الكورسات
            </Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>{course.title}</span>
          </nav>

          <div className={styles.heroContent}>
            {/* Badges */}
            <div className={styles.badgeRow}>
              <span className={styles.categoryBadge}>
                <Layers size={14} />
                {course.category || 'مسار تعليمي'}
              </span>
              <span className={styles.statusBadge}>
                <Sparkles size={14} />
                متاح للتسجيل
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseSubtitle}>
              {course.description ||
                'دورة تدريبية متكاملة تأخذك خطوة بخطوة من البدايات وحتى الاحتراف مع التطبيق العملي.'}
            </p>

            {/* Meta Row */}
            <div className={styles.metaRow}>
              {/* Instructor */}
              <div className={styles.instructorMeta}>
                <div className={styles.instructorAvatar}>
                  {course.instructor?.charAt(0) || 'م'}
                </div>
                <span>المدرب: <strong>{course.instructor || 'خبير تقني'}</strong></span>
              </div>

              {/* Rating */}
              <div className={styles.ratingBadge}>
                <span>⭐ 4.9</span>
                <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>(+320 تقييم)</span>
              </div>

              {/* Language */}
              <div className={styles.metaItem}>
                <BookOpen size={16} />
                <span>اللغة: العربية</span>
              </div>

              {/* Certificate */}
              <div className={styles.metaItem}>
                <Award size={16} />
                <span>شهادة إتمام معتمدة</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Main Layout ── */}
      <Container>
        <div className={styles.mainLayout}>
          {/* Left / Main Content Column */}
          <div className={styles.contentCol}>
            {/* Section 1: What you will learn */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>
                <CheckCircle2 size={22} className={styles.sectionTitleIcon} />
                ماذا ستتعلم في هذا الكورس؟
              </h2>
              <div className={styles.objectivesGrid}>
                {defaultObjectives.map((obj, i) => (
                  <div key={i} className={styles.objectiveItem}>
                    <CheckCircle2 size={18} className={styles.checkIcon} />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Course Description */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>
                <FileText size={22} className={styles.sectionTitleIcon} />
                وصف الكورس
              </h2>
              <p className={styles.descriptionText}>
                {course.description}
                {'\n\n'}
                تم إعداد هذا المحتوى بعناية فائقة ليركز على التطبيق العملي المباشر بدلاً من الحفظ النظري. ستتعلم من خلال بناء مشاريع حقيقية تواجهك في سوق العمل، وتكتسب المعرفة العميقة التي تميزك عن المبتدئين. بنهاية الكورس ستكون قادراً على توظيف كل ما تعلمته في أعمالك الحقيقية.
              </p>
            </div>

            {/* Section 3: Course Curriculum */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>
                <PlayCircle size={22} className={styles.sectionTitleIcon} />
                منهج الدورة والدروس
              </h2>
              <div className={styles.curriculumList}>
                {syllabus.map((unit, index) => (
                  <div key={index} className={styles.curriculumItem}>
                    <div className={styles.curriculumHeader}>
                      <span className={styles.curriculumIndex}>{index + 1}</span>
                      <span className={styles.curriculumName}>{unit.title}</span>
                    </div>
                    <div className={styles.curriculumMeta}>
                      <span>{unit.lessons} دروس</span>
                      <span>•</span>
                      <span>{unit.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Prerequisites */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>
                <HelpCircle size={22} className={styles.sectionTitleIcon} />
                متطلبات الكورس
              </h2>
              <div className={styles.prerequisitesList}>
                <div className={styles.prerequisiteItem}>
                  <div className={styles.bulletDot} />
                  <span>جهاز كمبيوتر (Windows أو Mac أو Linux) واتصال بالإنترنت.</span>
                </div>
                <div className={styles.prerequisiteItem}>
                  <div className={styles.bulletDot} />
                  <span>الرغبة والشغف في التطبيق العملي وكتابة الأكواد بنفسك.</span>
                </div>
                <div className={styles.prerequisiteItem}>
                  <div className={styles.bulletDot} />
                  <span>لا تشترط أي خبرة مسبقة معقدة؛ نبدأ معك من المفاهيم الأساسية خطوة بخطوة.</span>
                </div>
              </div>
            </div>

            {/* Section 5: Instructor */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>
                <Users size={22} className={styles.sectionTitleIcon} />
                عن المدرب
              </h2>
              <div className={styles.instructorCard}>
                <div className={styles.instructorBigAvatar}>
                  {course.instructor?.charAt(0) || 'م'}
                </div>
                <div className={styles.instructorDetails}>
                  <h4>{course.instructor || 'المدرب التقني'}</h4>
                  <p>
                    خبير ومطور برمجيات بخبرة تزيد عن 8 سنوات في بناء وتطوير الأنظمة والتطبيقات الحديثة، شغوف بتبسيط المفاهيم البرمجية ومساعدة الطلاب على دخول سوق العمل التقني بنجاح.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right / Sticky Sidebar */}
          <aside className={styles.sidebarCol}>
            <div className={styles.stickyCard}>
              {/* Image Banner */}
              <div
                className={styles.sidebarImageBanner}
                style={
                  course.image
                    ? { backgroundImage: `url(${course.image})` }
                    : { background: GRADIENTS[0] }
                }
              >
                <div className={styles.playOverlay}>
                  <PlayCircle size={32} />
                </div>
              </div>

              <div className={styles.sidebarBody}>
                {/* Price Display */}
                <div className={styles.priceWrapper}>
                  {course.price === 0 ? (
                    <span className={styles.freeTag}>مجاناً</span>
                  ) : (
                    <>
                      <span className={styles.currentPrice}>{course.price} $</span>
                      <span className={styles.priceNote}>وصول شامل مدى الحياة</span>
                    </>
                  )}
                </div>

                {/* Alerts */}
                {enrollSuccess && (
                  <div className={styles.successMessage}>
                    <span>{enrollSuccess}</span>
                  </div>
                )}

                {enrollError && (
                  <div className={styles.errorMessage}>
                    <span>{enrollError}</span>
                  </div>
                )}

                {/* Enrollment Button Actions */}
                <div className={styles.actionBtnGroup}>
                  {isEnrolled ? (
                    <>
                      <div className={styles.enrolledAlert}>
                        <CheckCircle2 size={20} />
                        <span>أنت مسجل بالفعل في هذا الكورس</span>
                      </div>
                      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="lg" fullWidth icon={ArrowLeft}>
                          اذهب لمتابعة الكورس
                        </Button>
                      </Link>
                    </>
                  ) : !user ? (
                    <Link href="/login" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="lg" fullWidth icon={ArrowLeft}>
                        تسجيل الدخول للاشتراك
                      </Button>
                    </Link>
                  ) : user.role !== 'USER' ? (
                    <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="lg" fullWidth icon={ArrowLeft}>
                        لوحة تحكم المشرفين
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className={styles.enrollBtn}
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      icon={isEnrolling ? Loader2 : Sparkles}
                    >
                      {isEnrolling ? 'جاري الاشتراك...' : 'اشترك في الكورس الآن'}
                    </Button>
                  )}
                </div>

                {/* Benefits Checklist */}
                <div className={styles.benefitsList}>
                  <div className={styles.benefitItem}>
                    <InfinityIcon size={18} className={styles.benefitIcon} />
                    <span>وصول كامل ودائم لجميع محتويات الكورس</span>
                  </div>
                  <div className={styles.benefitItem}>
                    <Award size={18} className={styles.benefitIcon} />
                    <span>شهادة إتمام معتمدة لملفك الشخصي</span>
                  </div>
                  <div className={styles.benefitItem}>
                    <PlayCircle size={18} className={styles.benefitIcon} />
                    <span>تطبيقات ومشاريع عملية خطوة بخطوة</span>
                  </div>
                  <div className={styles.benefitItem}>
                    <ShieldCheck size={18} className={styles.benefitIcon} />
                    <span>تحديثات مستمرة لدروس الكورس مجاناً</span>
                  </div>
                </div>

                <p className={styles.guaranteeNote}>
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

