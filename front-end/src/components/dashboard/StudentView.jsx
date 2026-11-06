"use client";

import { useCallback, useEffect, useState } from "react";

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

export default function StudentView() {
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
    }));

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
            {enrolledCourses.length}
          </div>

          <div className={styles.percentSub}>
            كورسات أنت مشترك فيها
          </div>
        </div>
      </section>

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

      {/* Main Content */}
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

                    <div className={styles.cardActions}>
                      <span className={styles.lessonsCount}>
                        {formatPrice(course.price)}
                      </span>
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
    </div>
  );
}