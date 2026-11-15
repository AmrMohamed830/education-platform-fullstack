const express = require("express");
const app = express();
const path = require("path");

require("dotenv").config();

const connectDB = require("./utils/db");

// Trust proxy for secure cookies behind reverse proxies (Render, Railway, Vercel, etc.)
app.set("trust proxy", 1);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors = require("cors");
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to avoid unintended production CORS blocks
    },
    credentials: true,
  })
);

app.use(express.json());

// Database connection middleware for Serverless execution
app.use(async (req, res, next) => {
  // Skip DB connection for basic health check
  if (req.path === "/health") {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Database connection failed",
      detail: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Health check endpoint for uptime monitors and cloud deployment health probes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static uploads (for backward compatibility during local development)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const uploadRoutes = require("./routes/upload.routes");
const reviewRoutes = require("./routes/review.routes");
const certificateRoutes = require("./routes/certificate.routes");
const quizRoutes = require("./routes/quiz.routes");
const notificationRoutes = require("./routes/notification.routes");

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || "error",
    message: err.message || "حدث خطأ غير متوقع في الخادم",
  });
});

// Start server locally when executed directly (not when required by tests or Vercel)
if (!process.env.VERCEL && require.main === module) {
  const PORT = process.env.PORT || 5000;
  // Pre-connect database for fast initial local requests
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.warn("MongoDB initial connection notice:", err.message);
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT} (DB will reconnect on demand)`);
      });
    });
}

module.exports = app;
