import api from "../lib/axios";

// جلب اختبار الكورس ومحاولات الطالب السابقة
export const getCourseQuiz = (courseId) => {
  return api.get(`/api/quizzes/course/${courseId}`);
};

// إنشاء أو تحديث اختبار الكورس (للمدرب/الأدمن)
export const upsertCourseQuiz = (courseId, data) => {
  return api.post(`/api/quizzes/course/${courseId}`, data);
};

// إرسال حل الاختبار وتصحيحه (للطالب)
export const submitQuiz = (courseId, answers) => {
  return api.post(`/api/quizzes/course/${courseId}/submit`, { answers });
};

// جلب جميع المحاولات السابقة لجميع الاختبارات للطالب المسجل
export const getMyQuizAttempts = () => {
  return api.get("/api/quizzes/my-attempts");
};

// جلب محاولات الطالب لكورس معين
export const getCourseQuizAttempts = (courseId) => {
  return api.get(`/api/quizzes/course/${courseId}/attempts`);
};

