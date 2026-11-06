import api from "../lib/axios";

// جلب كامل منهج الكورس (الوحدات والدروس)
export const getCourseCurriculum = (courseId) => {
  return api.get(`/courses/${courseId}/curriculum`);
};

// جلب تفاصيل درس معين ومحتواه
export const getLesson = (courseId, lessonId) => {
  return api.get(`/courses/${courseId}/lessons/${lessonId}`);
};

// إضافة وحدة (Section) جديدة
export const addSection = (courseId, data) => {
  return api.post(`/courses/${courseId}/sections`, data);
};

// تعديل بيانات وحدة
export const updateSection = (courseId, sectionId, data) => {
  return api.patch(`/courses/${courseId}/sections/${sectionId}`, data);
};

// حذف وحدة
export const deleteSection = (courseId, sectionId) => {
  return api.delete(`/courses/${courseId}/sections/${sectionId}`);
};

// إضافة درس لوحدة معينة
export const addLesson = (courseId, sectionId, data) => {
  return api.post(`/courses/${courseId}/sections/${sectionId}/lessons`, data);
};

// تعديل درس
export const updateLesson = (courseId, sectionId, lessonId, data) => {
  return api.patch(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, data);
};

// حذف درس
export const deleteLesson = (courseId, sectionId, lessonId) => {
  return api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
};

// إعادة ترتيب الوحدات والدروس
export const reorderCurriculum = (courseId, sectionsOrder) => {
  return api.put(`/courses/${courseId}/curriculum/reorder`, { sectionsOrder });
};

