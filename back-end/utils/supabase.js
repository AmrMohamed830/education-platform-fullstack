const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

// Separate Buckets for Public vs Private Storage
const SUPABASE_PUBLIC_BUCKET = process.env.SUPABASE_PUBLIC_BUCKET || "education-public";
const SUPABASE_PRIVATE_BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || "education-private";

let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      throw new Error(
        "Supabase credentials (SUPABASE_URL, SUPABASE_SECRET_KEY) are missing in environment variables."
      );
    }

    supabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

const UPLOAD_CONFIGS = {
  courses: {
    allowedExts: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
    allowedMimes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    maxSizeMB: 5,
    isPublic: true,
    bucket: SUPABASE_PUBLIC_BUCKET,
    folder: "courses",
  },
  avatars: {
    allowedExts: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
    allowedMimes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
    maxSizeBytes: 3 * 1024 * 1024, // 3 MB
    maxSizeMB: 3,
    isPublic: true,
    bucket: SUPABASE_PUBLIC_BUCKET,
    folder: "avatars",
  },
  resources: {
    allowedExts: [".pdf", ".zip", ".rar", ".docx", ".doc", ".pptx", ".txt"],
    allowedMimes: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/x-rar-compressed",
      "application/vnd.rar",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
      "text/plain",
      "application/octet-stream",
    ],
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
    maxSizeMB: 25,
    isPublic: false,
    bucket: SUPABASE_PRIVATE_BUCKET,
    folder: "resources",
  },
};

/**
 * Validates file category, extension, mimeType, and size.
 */
function validateFileMetadata({ category, fileName, fileType, fileSize }) {
  const config = UPLOAD_CONFIGS[category];
  if (!config) {
    throw new Error(
      `نوع الرفع غير صالح (${category}). الأنواع المسموحة هي: courses, avatars, resources`
    );
  }

  if (!fileName || typeof fileName !== "string") {
    throw new Error("اسم الملف مطلوب وغير صالح");
  }

  const ext = path.extname(fileName).toLowerCase();
  if (!config.allowedExts.includes(ext)) {
    throw new Error(
      `صيغة الملف (${ext || "بدون صيغة"}) غير مسموحة. الصيغ المدعومة لـ ${category}: ${config.allowedExts.join(
        ", "
      )}`
    );
  }

  if (fileType && config.allowedMimes.length > 0) {
    const normalizedMime = fileType.toLowerCase().split(";")[0].trim();
    const isAllowedMime =
      config.allowedMimes.includes(normalizedMime) ||
      (category !== "resources" && normalizedMime.startsWith("image/"));

    if (!isAllowedMime) {
      throw new Error(`نوع الوسائط MIME (${fileType}) غير مسموح به لهذا الملف`);
    }
  }

  const numericSize = Number(fileSize);
  if (isNaN(numericSize) || numericSize <= 0) {
    throw new Error("حجم الملف غير صالح");
  }

  if (numericSize > config.maxSizeBytes) {
    throw new Error(
      `حجم الملف يتجاوز الحد الأقصى المسموح به (${config.maxSizeMB} ميجابايت)`
    );
  }

  return { config, ext };
}

/**
 * Builds a sanitized, unique path inside the Supabase storage bucket.
 */
function buildStoragePath(category, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const rawBase = path.basename(fileName, ext);
  const cleanBase = rawBase
    .replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 40);

  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `${category}/${timestamp}-${randomSuffix}-${cleanBase || "file"}${ext}`;
}

/**
 * Issues a Signed Upload URL for direct-to-Supabase client uploads.
 * - Public media (courses, avatars) -> SUPABASE_PUBLIC_BUCKET
 * - Private media (resources) -> SUPABASE_PRIVATE_BUCKET
 */
async function generateSignedUploadUrl({ category, fileName, fileType, fileSize }) {
  const { config } = validateFileMetadata({ category, fileName, fileType, fileSize });
  const storagePath = buildStoragePath(category, fileName);
  const supabase = getSupabaseClient();
  const targetBucket = config.isPublic ? SUPABASE_PUBLIC_BUCKET : SUPABASE_PRIVATE_BUCKET;

  const { data, error } = await supabase.storage
    .from(targetBucket)
    .createSignedUploadUrl(storagePath, { upsert: false });

  if (error) {
    console.error("Supabase createSignedUploadUrl error:", error);
    throw new Error(`فشل إنشاء رابط الرفع المؤقت من Supabase: ${error.message}`);
  }

  let publicUrl = null;
  if (config.isPublic) {
    const publicUrlData = supabase.storage
      .from(targetBucket)
      .getPublicUrl(storagePath);
    publicUrl = publicUrlData?.data?.publicUrl || null;
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: storagePath,
    publicUrl,
    isPublic: config.isPublic,
    bucket: targetBucket,
  };
}

/**
 * Issues a Signed Download URL for private files (resources) stored in SUPABASE_PRIVATE_BUCKET.
 */
async function generateSignedDownloadUrl(storagePath, expiresInSeconds = 3600) {
  if (!storagePath || typeof storagePath !== "string") {
    throw new Error("مسار الملف المطلوب غير صالح");
  }

  // Prevent directory traversal or invalid paths
  const normalizedPath = storagePath.replace(/^\/+/, "");
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(SUPABASE_PRIVATE_BUCKET)
    .createSignedUrl(normalizedPath, expiresInSeconds);

  if (error) {
    console.error("Supabase createSignedUrl error:", error);
    throw new Error(`فشل إنشاء رابط التحميل المؤقت: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Upload buffer helper for backward-compatibility with direct server-side uploads.
 * Places public images in SUPABASE_PUBLIC_BUCKET and learning resources in SUPABASE_PRIVATE_BUCKET.
 */
async function uploadFileBuffer({ category, fileName, buffer, mimeType }) {
  const { config } = validateFileMetadata({
    category,
    fileName,
    fileType: mimeType,
    fileSize: buffer.length,
  });

  const storagePath = buildStoragePath(category, fileName);
  const supabase = getSupabaseClient();
  const targetBucket = config.isPublic ? SUPABASE_PUBLIC_BUCKET : SUPABASE_PRIVATE_BUCKET;

  const { error } = await supabase.storage
    .from(targetBucket)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("Supabase uploadBuffer error:", error);
    throw new Error(`فشل رفع الملف إلى Supabase Storage: ${error.message}`);
  }

  let publicUrl = null;
  if (config.isPublic) {
    const publicUrlData = supabase.storage
      .from(targetBucket)
      .getPublicUrl(storagePath);
    publicUrl = publicUrlData?.data?.publicUrl || null;
  }

  return {
    path: storagePath,
    publicUrl,
    isPublic: config.isPublic,
    bucket: targetBucket,
  };
}

module.exports = {
  SUPABASE_PUBLIC_BUCKET,
  SUPABASE_PRIVATE_BUCKET,
  UPLOAD_CONFIGS,
  getSupabaseClient,
  validateFileMetadata,
  buildStoragePath,
  generateSignedUploadUrl,
  generateSignedDownloadUrl,
  uploadFileBuffer,
};
