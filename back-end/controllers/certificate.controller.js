const mongoose = require("mongoose");
const Certificate = require("../models/certificate.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const userRoles = require("../utils/userRoles");

// Generate unique code
const generateCertificateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CERT-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ── 1. Issue or Get Certificate for Course ────────────────────────────
const getCourseCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.currentUser.id || req.currentUser._id;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ status: "fail", message: "معرّف الكورس غير صالح" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: "fail", message: "الكورس غير موجود" });
    }

    // Check if certificate already exists
    let existingCert = await Certificate.findOne({ user: userId, course: courseId });
    if (existingCert) {
      return res.status(200).json({
        status: "success",
        data: { certificate: existingCert },
      });
    }

    // Check enrollment & progress
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    const isPrivileged = [userRoles.ADMIN, userRoles.MANAGER].includes(req.currentUser.role);

    // Calculate total lessons
    let totalLessons = 0;
    if (course.sections && Array.isArray(course.sections)) {
      course.sections.forEach((sec) => {
        totalLessons += (sec.lessons || []).length;
      });
    }

    // Enforce 100% completion for students
    if (!isPrivileged) {
      if (!enrollment) {
        return res.status(403).json({
          status: "fail",
          message: "يجب التسجيل في الكورس أولاً للحصول على الشهادة",
        });
      }

      const completedCount = enrollment.completedLessons ? enrollment.completedLessons.length : 0;
      if (totalLessons > 0 && completedCount < totalLessons) {
        return res.status(400).json({
          status: "fail",
          message: `لم تكمل جميع دروس الكورس بعد. نسبة إنجازك الحالية هي ${Math.round(
            (completedCount / totalLessons) * 100
          )}%`,
        });
      }
    }

    // Create new certificate
    let uniqueCode = generateCertificateCode();
    while (await Certificate.findOne({ certificateCode: uniqueCode })) {
      uniqueCode = generateCertificateCode();
    }

    const newCert = new Certificate({
      certificateCode: uniqueCode,
      user: userId,
      userName: req.currentUser.name || "طالب متميز",
      course: courseId,
      courseTitle: course.title,
      instructor: course.instructor || "المدرب المعتمد",
      issueDate: new Date(),
    });

    await newCert.save();

    res.status(201).json({
      status: "success",
      message: "تهانينا! تم إصدار شهادة إتمام الكورس بنجاح.",
      data: { certificate: newCert },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message || "تعذر إصدار الشهادة" });
  }
};

// ── 2. Public Verification by Code ────────────────────────────────────
const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ status: "fail", message: "رمز الشهادة مطلوب" });
    }

    const certificate = await Certificate.findOne({
      certificateCode: code.toUpperCase().trim(),
    });

    if (!certificate) {
      return res.status(404).json({
        status: "fail",
        message: "هذه الشهادة غير مسجلة في نظام المنصة أو الرمز غير صحيح.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        certificate: {
          certificateCode: certificate.certificateCode,
          userName: certificate.userName,
          courseTitle: certificate.courseTitle,
          instructor: certificate.instructor,
          issueDate: certificate.issueDate,
          isValid: true,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message || "تعذر التحقق من الشهادة" });
  }
};

// ── 3. Get Student's Earned Certificates ──────────────────────────────
const getMyCertificates = async (req, res) => {
  try {
    const userId = req.currentUser.id || req.currentUser._id;
    const certificates = await Certificate.find({ user: userId }).sort({ issueDate: -1 });

    res.status(200).json({
      status: "success",
      data: { certificates },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message || "تعذر جلب الشهادات" });
  }
};

module.exports = {
  getCourseCertificate,
  verifyCertificate,
  getMyCertificates,
};

