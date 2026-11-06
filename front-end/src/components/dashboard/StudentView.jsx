"use client";

import { useState } from "react";
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
} from "lucide-react";

import Button from "../common/Button";
import useAuthStore from "@/store/auth.store";
import { useCourses } from "@/hooks/queries/useCourses";
import { useMyEnrollments } from "@/hooks/queries/useEnrollments";
import { useEnrollCourse } from "@/hooks/mutations/useEnrollmentMutations";

export default function StudentView({ activeTab = "overview" }) {
  const { user } = useAuthStore();

  const { data: enrollmentsData, isLoading: enrollmentsLoading, error: enrollmentsError } = useMyEnrollments();
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCourses();
  const enrollMutation = useEnrollCourse();

  const enrollments = enrollmentsData || [];
  const courses = coursesData?.courses || [];

  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isLoading = enrollmentsLoading || coursesLoading;

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

      await enrollMutation.mutateAsync(courseId);

      setSuccessMessage("تم الاشتراك في الكورس بنجاح");
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
      <div className="flex flex-col gap-8">
        <p className="text-slate-500 font-medium">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Welcome Banner */}
      {activeTab === "overview" && (
        <>
          <section className="bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-9 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl shadow-primary/20 relative overflow-hidden gap-6">
            <div className="max-w-[620px]">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 rounded-full text-xs font-bold mb-3">
                <Sparkles size={15} />
                لوحة الطالب
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                أهلاً بيك {user?.name || "طالبنا"} 👋
              </h1>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                استمر في رحلتك التعليمية واكتشف كورسات جديدة تطور بيها مهاراتك.
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-5 text-center w-full sm:w-auto">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 leading-none mb-1 font-['Alexandria',sans-serif]">
                {overallProgress}%
              </div>

              <div className="text-xs text-white/85 font-semibold">
                معدل إنجاز مساراتك
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                <BookOpen size={24} />
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {enrolledCourses.length}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  الكورسات المسجل فيها
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <GraduationCap size={24} />
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {availableCourses.length}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  كورسات متاحة
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {new Set(courses.map((course) => course.category)).size}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  تصنيفات الكورسات
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar size={24} />
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {formatDate(latestEnrollment?.enrolledAt)}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  آخر اشتراك
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div role="status" className="p-3.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Enrolled Courses */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-slate-900">
              <BookMarked
                size={21}
                className="text-primary"
              />
              كورساتي
            </h2>

            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {enrolledCourses.length} كورس
            </span>
          </div>

          <div className="flex flex-col gap-5">

            {enrolledCourses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center text-slate-500 text-sm">
                <p>لسه مش مشترك في أي كورس.</p>
                <p className="mt-1">اكتشف الكورسات المتاحة وابدأ رحلتك التعليمية!</p>
              </div>
            ) : (
              enrolledCourses.map((course) => (
                <article
                  key={course._id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />

                  <div className="p-5 sm:p-6">

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                          {course.title}
                        </h3>

                        <p className="text-xs text-slate-500">
                          {course.instructor}
                        </p>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md flex items-center gap-1 shrink-0">
                        <CheckCircle
                          size={14}
                          className="inline ml-1"
                        />
                        مسجل
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 mb-2 border border-slate-100">
                      <span className="font-bold text-slate-900 shrink-0">
                        التصنيف:
                      </span>

                      <span className="text-slate-600 truncate">
                        {course.category}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 mb-4 border border-slate-100">
                      <span className="font-bold text-slate-900 shrink-0">
                        تاريخ الاشتراك:
                      </span>

                      <span className="text-slate-600 truncate">
                        {formatDate(course.enrolledAt)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-4">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>نسبة الإنجاز</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-semibold">
                        {course.completedCount || 0} من {course.totalLessons || 0} درس مكتمل
                      </span>

                      <div className="flex gap-2 items-center">
                        {course.progress === 100 && (
                          <Link href={`/courses/${course._id}/certificate`}>
                            <Button variant="ghost" size="sm" icon={Award} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                              الشهادة
                            </Button>
                          </Link>
                        )}

                        <Link href={`/courses/${course._id}/learn`}>
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

        {/* Available Courses & Tips */}
        <aside className="lg:col-span-1 flex flex-col gap-6">

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <Sparkles
                size={19}
                className="text-primary"
              />

              <h3 className="text-base font-bold text-slate-900">
                اكتشف كورسات جديدة
              </h3>
            </div>

            {availableCourses.length === 0 ? (
              <p className="text-sm font-semibold text-slate-600 mb-3 leading-relaxed">
                مفيش كورسات جديدة متاحة حاليًا.
              </p>
            ) : (
              <div className="flex flex-col gap-4">

                {availableCourses.map((course) => (
                  <div
                    key={course._id}
                    className="flex flex-col gap-1 pb-3 border-b border-dashed border-slate-200 last:border-b-0 last:pb-0"
                  >
                    <h4 className="text-sm font-bold text-slate-900">
                      {course.title}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {course.instructor}
                    </p>

                    <p className="text-xs text-slate-500">
                      {course.category} • {formatPrice(course.price)}
                    </p>

                    <Button
                      size="sm"
                      className="self-start text-xs mt-1"
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

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <Award
                size={19}
                className="text-primary"
              />

              <h3 className="text-base font-bold text-slate-900">
                نصيحة تعليمية
              </h3>
            </div>

            <p className="text-sm font-semibold text-slate-600 mb-3 leading-relaxed">
              خصص وقتًا يوميًا للتعلم والتطبيق العملي.
              الاستمرارية أهم من عدد الساعات التي تذاكرها في يوم واحد.
            </p>
          </div>

        </aside>

      </section>
    </div>
  );
}
