"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  CheckCircle,
  Sparkles,
  Calendar,
  Users,
  BookMarked,
  PlayCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

import Button from "../common/Button";

import useAuthStore from "@/store/auth.store";

import {
  getAllCourses,
} from "@/services/course.service";

import {
  enrollInCourse,
  getMyEnrollments,
} from "@/services/enrollment.service";

import styles from "./StudentView.module.css";

export default function StudentView({ activeTab = "overview" }) {
  const { user } = useAuthStore();

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // جلب بيانات الطالب والكورسات المتاحة
  const fetchDashboardData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      const [enrollmentsResponse, coursesResponse] = await Promise.all([
        getMyEnrollments(),
        getAllCourses(),
      ]);

      const enrolledData =
        enrollmentsResponse.data.data.enrollments || [];

      const coursesData =
        coursesResponse.data.data.courses || [];

      setEnrollments(enrolledData);
      setCourses(coursesData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "حدث خطأ أثناء تحميل بيانات لوحة التحكم"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      if (!ignore) {
        await fetchDashboardData();
      }
    };

    init();

    return () => {
      ignore = true;
    };
  }, [fetchDashboardData]);

  // استخراج الكورسات المسجل فيها الطالب
  const enrolledCourses = enrollments
    .filter((enrollment) => enrollment.course)
    .map((enrollment) => ({
      ...enrollment.course,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress || 0,
      totalLessons: enrollment.totalLessons || 0,
      completedCount: enrollment.completedCount || 0,
    }));

  const totalEnrolledLessons = enrolledCourses.reduce(
    (acc, c) => acc + (c.totalLessons || 0),
    0
  );
  const totalCompletedLessons = enrolledCourses.reduce(
    (acc, c) => acc + (c.completedCount || 0),
    0
  );
  const overallProgress =
    totalEnrolledLessons > 0
      ? Math.round((totalCompletedLessons / totalEnrolledLessons) * 100)
      : 0;
  const completedCoursesCount = enrolledCourses.filter(
    (c) => c.progress === 100
  ).length;

  // استخراج الكورسات المتاحة للاشتراك
  const enrolledCourseIds = new Set(
    enrolledCourses.map((course) => course._id)
  );

  const availableCourses = courses.filter(
    (course) =>
      course.status === "active" &&
      !enrolledCourseIds.has(course._id)
  );

  // الاشتراك في كورس
  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      setError("");
      setSuccessMessage("");

      await enrollInCourse(courseId);

      setSuccessMessage("تم الاشتراك في الكورس بنجاح");

      await fetchDashboardData(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "حدث خطأ أثناء الاشتراك في الكورس"
      );
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return "مجاني";

    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "غير متاح";

    return new Date(date).toLocaleDateString("ar-EG");
  };

  const latestEnrollment = [...enrollments].sort(
    (a, b) =>
      new Date(b.enrolledAt) - new Date(a.enrolledAt)
  )[0];

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* Welcome Banner */}
      {activeTab === "overview" && (
        <>
          <section className={styles.welcomeBanner}>
            <div className={styles.bannerContent}>
              <div className={styles.badge}>
                <Sparkles size={15} />
                لوحة الطالب
              </div>

              <h1 className={styles.bannerTitle}>
                أهلاً بيك {user?.name || "طالبنا"} 👋
              </h1>

              <p className={styles.bannerSub}>
                استمر في رحلتك التعليمية واكتشف كورسات جديدة تطور بيها مهاراتك.
              </p>
            </div>

            <div className={styles.progressRingCard}>
              <div className={styles.percentText}>
                {overallProgress}%
              </div>

              <div className={styles.percentSub}>
                معدل إنجاز مساراتك
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <BookOpen size={24} />
              </div>

              <div>
                <div className={styles.statVal}>
                  {enrolledCourses.length}
                </div>
                <div className={styles.statLab}>
                  الكورسات المسجل فيها
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <GraduationCap size={24} />
              </div>

              <div>
                <div className={styles.statVal}>
                  {availableCourses.length}
                </div>
                <div className={styles.statLab}>
                  كورسات متاحة
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <Users size={24} />
              </div>

              <div>
                <div className={styles.statVal}>
                  {new Set(courses.map((course) => course.category)).size}
                </div>
                <div className={styles.statLab}>
                  تصنيفات الكورسات
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <Calendar size={24} />
              </div>

              <div>
                <div className={styles.statVal}>
                  {formatDate(latestEnrollment?.enrolledAt)}
                </div>
                <div className={styles.statLab}>
                  آخر اشتراك
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div role="status">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === "certificates" && (
        <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={24} color="#D97706" />
                شهاداتي المعتمدة
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                الشهادات الرقمية الرسمية الصادرة باسمك لإتمام المسارات التعليمية بنجاح
              </p>
            </div>
            <Link href="/verify-certificate">
              <Button variant="outline" size="sm" icon={ShieldCheck}>
                التحقق من كود شهادة
              </Button>
            </Link>
          </div>

          {enrolledCourses.filter((c) => c.progress === 100).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#F8FAFC', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--border-light)' }}>
              <Award size={48} color="#CBD5E1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                لا توجد شهادات صادرة حتى الآن
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                للحصول على شهادة معتمدة، أكمل جميع دروس الكورس بنسبة 100% واجتز الاختبار النهائي بنجاح.
              </p>
              <Link href="/courses">
                <Button variant="primary" size="md">
                  استكشاف الكورسات ومتابعة التعلم
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {enrolledCourses
                .filter((c) => c.progress === 100)
                .map((course) => (
                  <div
                    key={course._id}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #FDE68A',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: '0 4px 15px rgba(217, 119, 6, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                        <Award size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706' }}>شهادة إتمام معتمدة</span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{course.title}</h4>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      المدرب: <strong>{course.instructor || 'مَنصّتِي'}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <Link href={`/courses/${course._id}/certificate`} style={{ flex: 1, textDecoration: 'none' }}>
                        <Button variant="primary" size="sm" fullWidth icon={Award}>
                          عرض وطباعة الشهادة 📜
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {activeTab !== "certificates" && (
      <section className={styles.mainGrid}>

        {/* Enrolled Courses */}
        <div className={styles.coursesCol}>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <BookMarked
                size={21}
                className={styles.sectionIcon}
              />
              كورساتي
            </h2>

            <span className={styles.countBadge}>
              {enrolledCourses.length} كورس
            </span>
          </div>

          <div className={styles.coursesList}>

            {enrolledCourses.length === 0 ? (
              <div className={styles.widgetCard}>
                <p>لسه مش مشترك في أي كورس.</p>
                <p>اكتشف الكورسات المتاحة وابدأ رحلتك التعليمية!</p>
              </div>
            ) : (
              enrolledCourses.map((course) => (
                <article
                  key={course._id}
                  className={styles.courseItemCard}
                >
                  <div className={styles.courseColorBar} />

                  <div className={styles.cardMain}>

                    <div className={styles.cardTop}>
                      <div>
                        <h3 className={styles.courseTitle}>
                          {course.title}
                        </h3>

                        <p className={styles.instructorName}>
                          {course.instructor}
                        </p>
                      </div>

                      <span className={styles.progressPill}>
                        <CheckCircle
                          size={14}
                          style={{ display: "inline", marginLeft: 4 }}
                        />
                        مسجل
                      </span>
                    </div>

                    <div className={styles.lastLessonBox}>
                      <span className={styles.lastLessonLabel}>
                        التصنيف:
                      </span>

                      <span className={styles.lastLessonTitle}>
                        {course.category}
                      </span>
                    </div>

                    <div className={styles.lastLessonBox}>
                      <span className={styles.lastLessonLabel}>
                        تاريخ الاشتراك:
                      </span>

                      <span className={styles.lastLessonTitle}>
                        {formatDate(course.enrolledAt)}
                      </span>
                    </div>

                    <div className={styles.progressWrapper}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#475569',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span>نسبة الإنجاز</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={styles.cardActions}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span className={styles.lessonsCount}>
                        {course.completedCount || 0} من {course.totalLessons || 0} درس مكتمل
                      </span>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link
                          href={`/courses/${course._id}/quiz`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Button variant="outline" size="sm" icon={HelpCircle}>
                            الاختبار
                          </Button>
                        </Link>

                        {course.progress === 100 && (
                          <Link
                            href={`/courses/${course._id}/certificate`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Button variant="ghost" size="sm" icon={Award} style={{ color: '#D97706', borderColor: '#FDE68A' }}>
                              الشهادة
                            </Button>
                          </Link>
                        )}

                        <Link
                          href={`/courses/${course._id}/learn`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Button variant="primary" size="sm" icon={PlayCircle}>
                            {course.progress === 100 ? 'مراجعة الدروس' : 'متابعة التعلم'}
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </article>
              ))
            )}

          </div>
        </div>

        {/* Available Courses */}
        <aside className={styles.widgetsCol}>

          <div className={styles.widgetCard}>

            <div className={styles.widgetHeader}>
              <Sparkles
                size={19}
                className={styles.widgetIcon}
              />

              <h3 className={styles.widgetTitle}>
                اكتشف كورسات جديدة
              </h3>
            </div>

            {availableCourses.length === 0 ? (
              <p className={styles.sessionTitle}>
                مفيش كورسات جديدة متاحة حاليًا.
              </p>
            ) : (
              <div className={styles.recList}>

                {availableCourses.map((course) => (
                  <div
                    key={course._id}
                    className={styles.recItem}
                  >
                    <h4 className={styles.recTitle}>
                      {course.title}
                    </h4>

                    <p className={styles.recMeta}>
                      {course.instructor}
                    </p>

                    <p className={styles.recMeta}>
                      {course.category} • {formatPrice(course.price)}
                    </p>

                    <Button
                      size="sm"
                      className={styles.recBtn}
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrollingCourseId === course._id}
                    >
                      {enrollingCourseId === course._id
                        ? "جاري الاشتراك..."
                        : "اشترك الآن"}
                    </Button>

                  </div>
                ))}

              </div>
            )}

          </div>

          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <Award
                size={19}
                className={styles.widgetIcon}
              />

              <h3 className={styles.widgetTitle}>
                نصيحة تعليمية
              </h3>
            </div>

            <p className={styles.sessionTitle}>
              خصص وقتًا يوميًا للتعلم والتطبيق العملي.
              الاستمرارية أهم من عدد الساعات التي تذاكرها في يوم واحد.
            </p>
          </div>

        </aside>

      </section>
      )}
    </div>
  );
}