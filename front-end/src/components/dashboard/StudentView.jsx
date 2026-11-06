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
  HelpCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

import Button from "../common/Button";
import useAuthStore from "@/store/auth.store";
import { useCourses } from "@/hooks/queries/useCourses";
import { useMyEnrollments } from "@/hooks/queries/useEnrollments";
import { useEnrollCourse } from "@/hooks/mutations/useEnrollmentMutations";
import { useMyCertificates } from "@/hooks/queries/useCertificates";
import { useMyQuizAttempts } from "@/hooks/queries/useQuizzes";

export default function StudentView({ activeTab = "overview" }) {
  const { user } = useAuthStore();

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useMyEnrollments();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: certificatesData, isLoading: certsLoading } = useMyCertificates();
  const { data: quizAttemptsData, isLoading: attemptsLoading } = useMyQuizAttempts();
  const enrollMutation = useEnrollCourse();

  const enrollments = enrollmentsData || [];
  const courses = coursesData?.courses || [];
  const certificates = certificatesData || [];
  const quizAttempts = quizAttemptsData || [];

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

    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <p className="text-slate-500 font-medium">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" dir="rtl">

      {/* ── Welcome Banner & Stats (Overview only) ── */}
      {activeTab === "overview" && (
        <>
          <section className="bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-9 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl shadow-primary/20 relative overflow-hidden gap-6">
            <div className="max-w-[620px]">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 rounded-full text-xs font-bold mb-3">
                <Sparkles size={15} />
                لوحة الطالب الأكاديمية
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                أهلاً بيك {user?.name || "طالبنا"} 👋
              </h1>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                استمر في رحلتك التعليمية، أتمم دروسك وخض الاختبارات للحصول على شهاداتك المعتمدة.
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

          {/* Statistics Grid */}
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
                <Award size={24} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {certificates.length}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  شهادات مكتسبة
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <HelpCircle size={24} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {quizAttempts.length}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  اختبارات تم خوضها
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {availableCourses.length}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  كورسات متاحة للتسجيل
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

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: CERTIFICATES TAB                                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "certificates" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Award size={22} className="text-amber-500" />
                <span>شهاداتي المعتمدة ({certificates.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                الشهادات الرسمية الصادرة باسمك بعد إكمال مساراتك واجتياز الاختبارات النهائية.
              </p>
            </div>

            <Link href="/verify-certificate">
              <Button variant="outline" size="sm" icon={ShieldCheck}>
                التحقق من أي شهادة
              </Button>
            </Link>
          </div>

          {certsLoading ? (
            <p className="text-slate-500 py-8 text-center font-bold">جارٍ تحميل شهاداتك...</p>
          ) : certificates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center gap-4">
              <Award size={48} className="text-slate-300" />
              <h3 className="text-lg font-extrabold text-slate-800">لم تحصل على أي شهادات بعد</h3>
              <p className="text-sm text-slate-500 max-w-md">
                أكمل 100% من دروس أي كورس ثم اجتز الاختبار النهائي بنجاح لإصدار شهادتك المعتمدة وتنزيلها بصيغة PDF.
              </p>
              <Link href="/courses">
                <Button variant="primary" icon={BookOpen}>
                  استكشف الكورسات المتاحة
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Award size={22} />
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {cert.certificateCode}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        المدرب: {cert.instructor}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400 font-medium">
                      تاريخ الإصدار: {formatDate(cert.issueDate)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                    <Link href={`/verify-certificate?code=${cert.certificateCode}`} target="_blank">
                      <span className="text-xs text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                        <ShieldCheck size={14} />
                        التحقق
                      </span>
                    </Link>

                    <Link href={`/courses/${cert.course}/certificate`}>
                      <Button variant="primary" size="sm" icon={Award}>
                        عرض وتحميل الشهادة
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: QUIZZES TAB (سجل الاختبارات والدرجات)              */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "quizzes" && (
        <div className="flex flex-col gap-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle size={22} className="text-primary" />
              <span>اختباراتي وسجل الدرجات والمحاولات ({quizAttempts.length})</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              متابعة جميع محاولاتك السابقة في الاختبارات النهائية ونتائجك الأكاديمية.
            </p>
          </div>

          {attemptsLoading ? (
            <p className="text-slate-500 py-8 text-center font-bold">جارٍ تحميل سجل محاولاتك...</p>
          ) : quizAttempts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center gap-4">
              <HelpCircle size={48} className="text-slate-300" />
              <h3 className="text-lg font-extrabold text-slate-800">لم تقدم أي اختبارات بعد</h3>
              <p className="text-sm text-slate-500 max-w-md">
                اختر أي كورس من كورساتك المسجلة، أتمم دروسه ثم خض الاختبار النهائي لإثبات مهاراتك.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-right text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                      <th className="p-3.5 px-4">الكورس</th>
                      <th className="p-3.5 px-4">المحاولة</th>
                      <th className="p-3.5 px-4">تاريخ التقديم</th>
                      <th className="p-3.5 px-4">النقاط</th>
                      <th className="p-3.5 px-4">النسبة</th>
                      <th className="p-3.5 px-4">الحالة</th>
                      <th className="p-3.5 px-4">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizAttempts.map((att) => (
                      <tr key={att._id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-900">
                          {att.course?.title || "كورس غير مسمى"}
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-600">
                          المحاولة #{att.attemptNumber || 1}
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          {formatDate(att.createdAt || att.completedAt)}
                        </td>
                        <td className="p-4 text-xs font-bold text-slate-700">
                          {att.earnedPoints} / {att.totalPoints}
                        </td>
                        <td className="p-4 font-extrabold text-primary font-mono">
                          {att.score}%
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              att.passed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {att.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            <span>{att.passed ? "ناجح" : "راسب"}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {att.passed ? (
                              <Link href={`/courses/${att.course?._id}/certificate`}>
                                <Button variant="ghost" size="sm" icon={Award} className="text-amber-600 hover:bg-amber-50">
                                  الشهادة
                                </Button>
                              </Link>
                            ) : null}

                            <Link href={`/courses/${att.course?._id}/quiz`}>
                              <Button variant="outline" size="sm" icon={RotateCcw}>
                                {att.passed ? "تحسين الدرجة" : "إعادة المحاولة"}
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: OVERVIEW & COURSES                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      {(activeTab === "overview" || activeTab === "my-courses" || activeTab === "explore") && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Enrolled Courses */}
          {activeTab !== "explore" && (
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-slate-900">
                  <BookMarked size={21} className="text-primary" />
                  كورساتي المسجلة
                </h2>

                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {enrolledCourses.length} كورس
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {enrolledCourses.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center text-slate-500 text-sm">
                    <p className="font-bold text-slate-700">لسه مش مشترك في أي كورس.</p>
                    <p className="mt-1">اكتشف الكورسات المتاحة وابدأ رحلتك التعليمية الآن!</p>
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
                            <CheckCircle size={14} className="inline ml-1" />
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
                            <span>نسبة إنجاز الدروس</span>
                            <span>{course.progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-500 font-semibold">
                            {course.completedCount || 0} من {course.totalLessons || 0} درس مكتمل
                          </span>

                          <div className="flex flex-wrap gap-2 items-center">
                            {/* Quiz Button */}
                            <Link href={`/courses/${course._id}/quiz`} className="no-underline">
                              <Button variant="outline" size="sm" icon={HelpCircle}>
                                الاختبار النهائي
                              </Button>
                            </Link>

                            {/* Certificate Button if 100% */}
                            {course.progress === 100 && (
                              <Link href={`/courses/${course._id}/certificate`} className="no-underline">
                                <Button variant="ghost" size="sm" icon={Award} className="text-amber-600 border border-amber-200 hover:bg-amber-50">
                                  الشهادة 🎓
                                </Button>
                              </Link>
                            )}

                            <Link href={`/courses/${course._id}/learn`} className="no-underline">
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
          )}

          {/* Available Courses & Educational Tips */}
          {activeTab !== "my-courses" && (
            <aside className={`${activeTab === "explore" ? "lg:col-span-3" : "lg:col-span-1"} flex flex-col gap-6`}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                  <Sparkles size={19} className="text-primary" />
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
                  <Award size={19} className="text-primary" />
                  <h3 className="text-base font-bold text-slate-900">
                    نصيحة تعليمية
                  </h3>
                </div>

                <p className="text-sm font-semibold text-slate-600 mb-3 leading-relaxed">
                  خصص وقتًا يوميًا للتعلم والتطبيق العملي.
                  الاستمرارية واجتياز الاختبارات هي طريقك لاكتساب المهارات والشهادات المعتمدة.
                </p>
              </div>
            </aside>
          )}

        </section>
      )}
    </div>
  );
}
