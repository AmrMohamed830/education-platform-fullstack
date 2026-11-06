const express = require("express");
const app = express();
const path = require("path");

require("dotenv").config()

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors = require("cors");
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

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

app.listen(5000, () => {
  console.log("iam listening");
});
