import api from "../lib/axios";

// الاشتراك في كورس
export const enrollInCourse = (courseId) => {
  return api.post("/api/enrollments", { courseId });
};

// جلب الكورسات اللي الطالب مشترك فيها
export const getMyEnrollments = () => {
  return api.get("/api/enrollments/my-courses");
};

// تحديد الدرس كمكتمل أو غير مكتمل
export const toggleLessonProgress = (courseId, lessonId) => {
  return api.post(`/api/enrollments/courses/${courseId}/lessons/${lessonId}/toggle`);
};

// جلب تفاصيل تقدم الطالب في كورس معين
export const getCourseProgress = (courseId) => {
  return api.get(`/api/enrollments/courses/${courseId}/progress`);
};
