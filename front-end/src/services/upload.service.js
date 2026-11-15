import api from "../lib/axios";

/**
 * Direct-to-Supabase Storage file uploader.
 * Requests a secure Signed Upload URL from the backend, then streams the
 * binary file directly to Supabase Storage, bypassing Vercel Serverless payload limits.
 */
async function uploadDirectToSupabase(category, file) {
  try {
    // 1. Request Signed Upload URL from backend
    const signedUrlRes = await api.post("/api/upload/signed-url", {
      category,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
    });

    const { signedUrl, path, publicUrl, isPublic } = signedUrlRes.data.data;

    // 2. Direct upload to Supabase Storage using PUT
    const formData = new FormData();
    formData.append("cacheControl", "3600");
    formData.append("", file);

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json().catch(() => ({}));
      const message =
        errorData.message ||
        errorData.error ||
        `فشل رفع الملف إلى التخزين السحابي (${uploadRes.status})`;
      const err = new Error(message);
      err.response = { data: { message } };
      throw err;
    }

    // 3. Return Axios-compatible response structure
    return {
      data: {
        status: "success",
        data: {
          url: isPublic ? publicUrl : path,
          storagePath: path,
          filename: file.name,
          title: file.name,
          size: file.size,
          isPublic,
        },
      },
    };
  } catch (err) {
    if (!err.response) {
      err.response = { data: { message: err.message || "حدث خطأ أثناء رفع الملف" } };
    }
    throw err;
  }
}

// رفع صورة كورس (مباشر إلى Supabase Storage)
export const uploadCourseImage = async (file) => {
  return uploadDirectToSupabase("courses", file);
};

// رفع صورة شخصية للمستخدم (مباشر إلى Supabase Storage)
export const uploadAvatar = async (file) => {
  return uploadDirectToSupabase("avatars", file);
};

// رفع ملف دراسي / ملحق للدرس (مباشر إلى Supabase Storage)
export const uploadResourceFile = async (file) => {
  return uploadDirectToSupabase("resources", file);
};
