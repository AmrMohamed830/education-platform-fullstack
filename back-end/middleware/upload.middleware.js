const multer = require("multer");
const path = require("path");

// Use memory storage to be 100% compatible with Serverless (Vercel)
const storage = multer.memoryStorage();

// Filter for images (covers, avatars)
const imageFilter = (req, file, cb) => {
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && (file.mimetype.startsWith("image/") || ext === ".svg")) {
    cb(null, true);
  } else {
    cb(new Error("الملف يجب أن يكون صورة بصيغة (JPG, PNG, WEBP, SVG)"), false);
  }
};

// Filter for documents and learning materials
const documentFilter = (req, file, cb) => {
  const allowedExts = [".pdf", ".zip", ".rar", ".docx", ".doc", ".pptx", ".txt"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("الملف يجب أن يكون مستند بصيغة (PDF, ZIP, RAR, DOCX, DOC, PPTX, TXT)"), false);
  }
};

const uploadCourseImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

const uploadResourceFile = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

module.exports = {
  uploadCourseImage,
  uploadAvatar,
  uploadResourceFile,
};
