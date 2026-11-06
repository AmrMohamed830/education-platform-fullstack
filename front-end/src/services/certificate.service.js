import api from "../lib/axios";

// إصدار أو جلب شهادة كورس للطالب الحالي
export const getCourseCertificate = (courseId) => {
  return api.get(`/api/certificates/course/${courseId}`);
};

// التحقق من صحة شهادة برمزها
export const verifyCertificate = (code) => {
  return api.get(`/api/certificates/verify/${code}`);
};

// جلب كل شهادات الطالب المكتسبة
export const getMyCertificates = () => {
  return api.get("/api/certificates/my-certificates");
};

