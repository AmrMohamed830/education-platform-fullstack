import api from "../lib/axios";

// الاشتراك في كورس
export const enrollInCourse = (courseId) => {
  return api.post("/api/enrollments", { courseId });
};

// جلب الكورسات اللي الطالب مشترك فيها
export const getMyEnrollments = () => {
  return api.get("/api/enrollments/my-courses");
};