import api from "../lib/axios";

const getAllCourses = (params = {}) => {
  return api.get("/courses", { params });
};

const getCourse = (courseId) => {
  return api.get(`/courses/${courseId}`);
};

const addCourse = (data) => {
  return api.post("/courses", data);
};

const updateCourse = (courseId, data) => {
  return api.patch(`/courses/${courseId}`, data);
};

const deleteCourse = (courseId) => {
  return api.delete(`/courses/${courseId}`);
};

export { getAllCourses, getCourse, addCourse, updateCourse, deleteCourse };
