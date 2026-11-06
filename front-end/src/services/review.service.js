import api from "../lib/axios";

// جلب مراجعات وتقييمات كورس
export const getCourseReviews = (courseId) => {
  return api.get(`/api/reviews/course/${courseId}`);
};

// إضافة أو تعديل تقييم
export const submitReview = (courseId, { rating, comment }) => {
  return api.post(`/api/reviews/course/${courseId}`, { rating, comment });
};

// حذف تقييم
export const deleteReview = (reviewId) => {
  return api.delete(`/api/reviews/${reviewId}`);
};

