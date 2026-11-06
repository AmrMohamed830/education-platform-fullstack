const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directories exist
const uploadDirs = {
  courses: path.join(__dirname, "../uploads/courses"),
  avatars: path.join(__dirname, "../uploads/avatars"),
  resources: path.join(__dirname, "../uploads/resources"),
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage generator
const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDirs[folderName] || uploadDirs.courses);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const cleanName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "-")
        .substring(0, 30);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    },
  });
};

// Filter for images (covers, avatars)
const imageFilter = (req, file, cb) => {
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && file.mimetype.startsWith("image/")) {
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
    cb(new Error("الملف يجب أن يكون مستند بصيغة (PDF, ZIP, DOCX, PPTX)"), false);
  }
};

const uploadCourseImage = multer({
  storage: createStorage("courses"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadAvatar = multer({
  storage: createStorage("avatars"),
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

const uploadResourceFile = multer({
  storage: createStorage("resources"),
  fileFilter: documentFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

module.exports = {
  uploadCourseImage,
  uploadAvatar,
  uploadResourceFile,
};

