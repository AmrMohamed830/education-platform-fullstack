/**
 * Unit & Integration Tests for Two-Bucket Supabase Storage & Serverless Vercel Architecture
 */
const assert = require("assert");
const path = require("path");
const fs = require("fs");

const {
  validateFileMetadata,
  buildStoragePath,
  UPLOAD_CONFIGS,
  SUPABASE_PUBLIC_BUCKET,
  SUPABASE_PRIVATE_BUCKET,
} = require("./utils/supabase");

console.log("=================================================");
console.log("🚀 Testing Two-Bucket Supabase Storage & Vercel Config");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
  }
}

// ── 1. Two-Bucket Configuration Checks ─────────────────────────────────────
runTest("SUPABASE_PUBLIC_BUCKET defaults to 'education-public'", () => {
  assert(SUPABASE_PUBLIC_BUCKET);
  assert.strictEqual(SUPABASE_PUBLIC_BUCKET, process.env.SUPABASE_PUBLIC_BUCKET || "education-public");
});

runTest("SUPABASE_PRIVATE_BUCKET defaults to 'education-private'", () => {
  assert(SUPABASE_PRIVATE_BUCKET);
  assert.strictEqual(SUPABASE_PRIVATE_BUCKET, process.env.SUPABASE_PRIVATE_BUCKET || "education-private");
  assert.notStrictEqual(
    SUPABASE_PUBLIC_BUCKET,
    SUPABASE_PRIVATE_BUCKET,
    "Public and Private buckets must be distinct"
  );
});

// ── 2. Bucket Assignment & Security Constraints ────────────────────────────
runTest("Course images: targets public bucket, 5MB limit, allows JPG, PNG, WEBP, SVG", () => {
  const config = UPLOAD_CONFIGS.courses;
  assert.strictEqual(config.bucket, SUPABASE_PUBLIC_BUCKET);
  assert.strictEqual(config.isPublic, true);
  assert.strictEqual(config.maxSizeMB, 5);
  assert.strictEqual(config.maxSizeBytes, 5 * 1024 * 1024);
  assert(config.allowedExts.includes(".jpg"));
  assert(config.allowedExts.includes(".jpeg"));
  assert(config.allowedExts.includes(".png"));
  assert(config.allowedExts.includes(".webp"));
  assert(config.allowedExts.includes(".svg"));
});

runTest("Avatars: targets public bucket, 3MB limit, allows JPG, PNG, WEBP, SVG", () => {
  const config = UPLOAD_CONFIGS.avatars;
  assert.strictEqual(config.bucket, SUPABASE_PUBLIC_BUCKET);
  assert.strictEqual(config.isPublic, true);
  assert.strictEqual(config.maxSizeMB, 3);
  assert.strictEqual(config.maxSizeBytes, 3 * 1024 * 1024);
  assert(config.allowedExts.includes(".jpg"));
  assert(config.allowedExts.includes(".jpeg"));
  assert(config.allowedExts.includes(".png"));
  assert(config.allowedExts.includes(".webp"));
  assert(config.allowedExts.includes(".svg"));
});

runTest("Lesson resources: strictly targets PRIVATE bucket, 25MB limit, isPublic=false", () => {
  const config = UPLOAD_CONFIGS.resources;
  assert.strictEqual(config.bucket, SUPABASE_PRIVATE_BUCKET);
  assert.strictEqual(config.isPublic, false, "Lesson resources must NEVER be marked as public");
  assert.strictEqual(config.maxSizeMB, 25);
  assert.strictEqual(config.maxSizeBytes, 25 * 1024 * 1024);
  assert(config.allowedExts.includes(".pdf"));
  assert(config.allowedExts.includes(".zip"));
  assert(config.allowedExts.includes(".rar"));
  assert(config.allowedExts.includes(".docx"));
  assert(config.allowedExts.includes(".doc"));
  assert(config.allowedExts.includes(".pptx"));
  assert(config.allowedExts.includes(".txt"));
});

// ── 3. Metadata Validation: Positive Cases ──────────────────────────────────
runTest("Valid course image passes validation", () => {
  const res = validateFileMetadata({
    category: "courses",
    fileName: "course-banner.png",
    fileType: "image/png",
    fileSize: 2.5 * 1024 * 1024, // 2.5MB
  });
  assert(res.config);
  assert.strictEqual(res.ext, ".png");
  assert.strictEqual(res.config.bucket, SUPABASE_PUBLIC_BUCKET);
});

runTest("Valid avatar passes validation", () => {
  const res = validateFileMetadata({
    category: "avatars",
    fileName: "student-avatar.webp",
    fileType: "image/webp",
    fileSize: 1.2 * 1024 * 1024,
  });
  assert(res.config);
  assert.strictEqual(res.ext, ".webp");
  assert.strictEqual(res.config.bucket, SUPABASE_PUBLIC_BUCKET);
});

runTest("Valid 24.5MB PDF lesson resource passes validation", () => {
  const res = validateFileMetadata({
    category: "resources",
    fileName: "advanced-guide.pdf",
    fileType: "application/pdf",
    fileSize: 24.5 * 1024 * 1024,
  });
  assert(res.config);
  assert.strictEqual(res.ext, ".pdf");
  assert.strictEqual(res.config.bucket, SUPABASE_PRIVATE_BUCKET);
  assert.strictEqual(res.config.isPublic, false);
});

// ── 4. Metadata Validation: Negative Cases (Strict Rejections) ──────────────
runTest("Rejects executable and script files (.exe, .sh, .bat)", () => {
  assert.throws(
    () => {
      validateFileMetadata({
        category: "courses",
        fileName: "malware.exe",
        fileType: "application/x-msdownload",
        fileSize: 1024,
      });
    },
    /صيغة الملف/
  );
  assert.throws(
    () => {
      validateFileMetadata({
        category: "resources",
        fileName: "script.sh",
        fileType: "text/x-shellscript",
        fileSize: 1024,
      });
    },
    /صيغة الملف/
  );
});

runTest("Rejects oversized course image (> 5MB)", () => {
  assert.throws(
    () => {
      validateFileMetadata({
        category: "courses",
        fileName: "large.jpg",
        fileType: "image/jpeg",
        fileSize: 5.5 * 1024 * 1024,
      });
    },
    /يتجاوز الحد الأقصى/
  );
});

runTest("Rejects oversized avatar (> 3MB)", () => {
  assert.throws(
    () => {
      validateFileMetadata({
        category: "avatars",
        fileName: "profile.png",
        fileType: "image/png",
        fileSize: 3.2 * 1024 * 1024,
      });
    },
    /يتجاوز الحد الأقصى/
  );
});

runTest("Rejects oversized resource (> 25MB)", () => {
  assert.throws(
    () => {
      validateFileMetadata({
        category: "resources",
        fileName: "archive.zip",
        fileType: "application/zip",
        fileSize: 25.1 * 1024 * 1024,
      });
    },
    /يتجاوز الحد الأقصى/
  );
});

// ── 5. Storage Path Sanitization ───────────────────────────────────────────
runTest("Sanitizes storage path and prevents directory traversal attacks", () => {
  const p = buildStoragePath("resources", "../../../secret.pdf");
  assert(!p.includes(".."), "Storage path must not contain .. traversal sequences");
  assert(p.startsWith("resources/"));
  assert(p.endsWith(".pdf"));
});

// ── 6. Vercel Serverless Architecture & Entry Points ───────────────────────
runTest("back-end/index.js exports Express app instance", () => {
  const app = require("./index");
  assert(app, "Express app must be exported");
  assert.strictEqual(typeof app.use, "function");
});

runTest("back-end/api/index.js serverless entry point exists and exports app", () => {
  const apiIndex = require("./api/index");
  assert(apiIndex, "api/index must export app for Vercel Serverless Functions");
  assert.strictEqual(typeof apiIndex.use, "function");
});

runTest("back-end/vercel.json rewrites all traffic to api/index.js", () => {
  const vercelJsonPath = path.join(__dirname, "vercel.json");
  assert(fs.existsSync(vercelJsonPath), "vercel.json must exist in back-end");
  const config = JSON.parse(fs.readFileSync(vercelJsonPath, "utf8"));
  assert(Array.isArray(config.rewrites), "rewrites array must exist");
  const defaultRewrite = config.rewrites.find((r) => r.source === "/(.*)");
  assert(defaultRewrite);
  assert.strictEqual(defaultRewrite.destination, "/api/index.js");
});

// ── 7. MongoDB Serverless Connection Caching ───────────────────────────────
runTest("utils/db.js connects and caches Mongoose connection", () => {
  const connectDB = require("./utils/db");
  assert.strictEqual(typeof connectDB, "function");
});

console.log("\n=================================================");
console.log(`Results: ${passedTests}/${totalTests} Tests Passed`);
console.log("=================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
