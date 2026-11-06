import api from "../lib/axios";

// رفع صورة كورس
export const uploadCourseImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/api/upload/course-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// رفع صورة شخصية للمستخدم
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post("/api/upload/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// رفع ملف دراسي / ملحق للدرس
export const uploadResourceFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/upload/resource", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

