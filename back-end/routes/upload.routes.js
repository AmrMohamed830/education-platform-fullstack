const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const allowedTo = require("../middleware/authorization.middleware");
const userRoles = require("../utils/userRoles");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const {
  uploadCourseImage,
  uploadAvatar,
  uploadResourceFile,
} = require("../middleware/upload.middleware");
const {
  generateSignedUploadUrl,
  generateSignedDownloadUrl,
  uploadFileBuffer,
} = require("../utils/supabase");

// ── 1. Direct-to-Supabase Signed Upload URL Endpoint ─────────────────────
// Used by the Frontend to upload directly to Supabase Storage, bypassing
// Vercel Serverless payload (4.5MB) and timeout limits.
router.post("/signed-url", verifyToken, async (req, res, next) => {
  try {
    const { category, fileName, fileType, fileSize } = req.body;

    if (!category || !fileName || !fileSize) {
      return res.status(400).json({
        status: "fail",
        message: "البيانات غير مكتملة (category, fileName, fileSize مطلوبة)",
      });
    }

    // Role-based permission enforcement
    if (category === "courses" || category === "resources") {
      if (![userRoles.ADMIN, userRoles.MANAGER].includes(req.currentUser.role)) {
        return res.status(403).json({
          status: "fail",
          message: "غير مصرح لك برفع وسائط الكورسات أو المصادر التعليمية",
        });
      }
    } else if (category === "avatars") {
      // Any authenticated user can upload their own avatar
      if (!req.currentUser) {
        return res.status(401).json({
          status: "fail",
          message: "يجب تسجيل الدخول لرفع الصورة الشخصية",
        });
      }
    } else {
      return res.status(400).json({
        status: "fail",
        message: `نوع الفئة (${category}) غير مدعوم`,
      });
    }

    const uploadPayload = await generateSignedUploadUrl({
      category,
      fileName,
      fileType,
      fileSize,
    });

    return res.status(200).json({
      status: "success",
      data: {
        signedUrl: uploadPayload.signedUrl,
        token: uploadPayload.token,
        path: uploadPayload.path,
        publicUrl: uploadPayload.publicUrl,
        isPublic: uploadPayload.isPublic,
        bucket: uploadPayload.bucket,
        fileName,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message || "فشل إنشاء رابط الرفع المؤقت",
    });
  }
});

// ── 2. Private Resource Secure Download Endpoint ──────────────────────────
// Verifies enrollment or admin rights, then issues a temporary Signed Download URL.
router.get("/resource-download", verifyToken, async (req, res, next) => {
  try {
    const { path: storagePath, format } = req.query;

    if (!storagePath || typeof storagePath !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "مسار الملف المطلوب غير محدد",
      });
    }

    const isStaff = [userRoles.ADMIN, userRoles.MANAGER].includes(
      req.currentUser.role
    );

    if (!isStaff) {
      // Find course and lesson containing this resource path
      const course = await Course.findOne({
        "sections.lessons.resources.url": storagePath,
      });

      if (!course) {
        return res.status(404).json({
          status: "fail",
          message: "المورد التعليمي المطلوب غير موجود أو تم حذفه",
        });
      }

      // Check if resource belongs to a preview lesson
      let isPreviewLesson = false;
      for (const section of course.sections || []) {
        for (const lesson of section.lessons || []) {
          const match = (lesson.resources || []).some(
            (r) => r.url === storagePath
          );
          if (match && lesson.isPreview) {
            isPreviewLesson = true;
            break;
          }
        }
        if (isPreviewLesson) break;
      }

      if (!isPreviewLesson) {
        const enrollment = await Enrollment.findOne({
          user: req.currentUser._id,
          course: course._id,
        });

        if (!enrollment) {
          return res.status(403).json({
            status: "fail",
            message: "هذا الملف متاح فقط للطلاب المسجلين في هذا الكورس",
          });
        }
      }
    }

    const signedUrl = await generateSignedDownloadUrl(storagePath, 3600);

    if (format === "json") {
      return res.status(200).json({
        status: "success",
        data: { downloadUrl: signedUrl },
      });
    }

    return res.redirect(signedUrl);
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message || "تعذر إنشاء رابط التحميل",
    });
  }
});

// ── 3. Backward-Compatible Course Image Upload Endpoint ──────────────────
router.post(
  "/course-image",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.MANAGER),
  (req, res, next) => {
    uploadCourseImage.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: "fail", message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ status: "fail", message: "يرجى تحديد صورة للرفع" });
      }
      const uploaded = await uploadFileBuffer({
        category: "courses",
        fileName: req.file.originalname,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
      });

      return res.status(200).json({
        status: "success",
        data: {
          url: uploaded.publicUrl,
          path: uploaded.path,
          filename: uploaded.path,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (err) {
      return res.status(400).json({ status: "fail", message: err.message });
    }
  }
);

// ── 4. Backward-Compatible Avatar Upload Endpoint ────────────────────────
router.post(
  "/avatar",
  verifyToken,
  (req, res, next) => {
    uploadAvatar.single("avatar")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: "fail", message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ status: "fail", message: "يرجى تحديد صورة شخصية للرفع" });
      }
      const uploaded = await uploadFileBuffer({
        category: "avatars",
        fileName: req.file.originalname,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
      });

      return res.status(200).json({
        status: "success",
        data: {
          url: uploaded.publicUrl,
          path: uploaded.path,
          filename: uploaded.path,
          originalName: req.file.originalname,
        },
      });
    } catch (err) {
      return res.status(400).json({ status: "fail", message: err.message });
    }
  }
);

// ── 5. Backward-Compatible Resource Upload Endpoint ──────────────────────
router.post(
  "/resource",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.MANAGER),
  (req, res, next) => {
    uploadResourceFile.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: "fail", message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ status: "fail", message: "يرجى تحديد ملف للرفع" });
      }
      const uploaded = await uploadFileBuffer({
        category: "resources",
        fileName: req.file.originalname,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
      });

      return res.status(200).json({
        status: "success",
        data: {
          url: uploaded.path,
          storagePath: uploaded.path,
          title: req.file.originalname,
          filename: uploaded.path,
          size: req.file.size,
        },
      });
    } catch (err) {
      return res.status(400).json({ status: "fail", message: err.message });
    }
  }
);

module.exports = router;
