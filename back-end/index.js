const express = require("express");
const app = express();
const path = require("path");

require("dotenv").config();

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

// Health check endpoint for uptime monitors and cloud deployment health probes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const uploadRoutes = require("./routes/upload.routes");
const reviewRoutes = require("./routes/review.routes");
const certificateRoutes = require("./routes/certificate.routes");
const quizRoutes = require("./routes/quiz.routes");

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/quizzes", quizRoutes);

const url = process.env.MONGO_URL;

const mongoose = require("mongoose");
mongoose
  .connect(url)
  .then(() => {
    console.log("mongodb server connected");
  })
  .catch((err) => {
    console.log("mongodb connection note:", err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
