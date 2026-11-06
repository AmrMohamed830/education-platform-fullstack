const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const {
  uploadCourseImage,
  uploadAvatar,
  uploadResourceFile,
} = require("../middleware/upload.middleware");

// Helper to construct full public URL
const getFileUrl = (req, folder, filename) => {
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/uploads/${folder}/${filename}`;
};

// ── Course Cover Upload ────────────────────────────────────────────────
router.post(
  "/course-image",
  verifyToken,
  (req, res, next) => {
    uploadCourseImage.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: "fail", message: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: "fail", message: "يرجى تحديد صورة للرفع" });
    }
    const url = getFileUrl(req, "courses", req.file.filename);
    res.status(200).json({
      status: "success",
      data: {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  }
);

// ── User Avatar Upload ────────────────────────────────────────────────
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
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: "fail", message: "يرجى تحديد صورة شخصية للرفع" });
    }
    const url = getFileUrl(req, "avatars", req.file.filename);
    res.status(200).json({
      status: "success",
      data: {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
      },
    });
  }
);

// ── Lesson Resource / Document Upload ──────────────────────────────────
router.post(
  "/resource",
  verifyToken,
  (req, res, next) => {
    uploadResourceFile.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: "fail", message: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: "fail", message: "يرجى تحديد ملف للرفع" });
    }
    const url = getFileUrl(req, "resources", req.file.filename);
    res.status(200).json({
      status: "success",
      data: {
        url,
        title: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  }
);

module.exports = router;

