const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const allowedTo = require("../middleware/authorization.middleware");
const optionalAuth = require("../middleware/optionalAuth.middleware");
const userRoles = require("../utils/userRoles");

const {
  getCourseQuiz,
  upsertCourseQuiz,
  submitQuiz,
  getMyAttempts,
  getCourseAttempts,
} = require("../controllers/quiz.controller");

// ── Student / User endpoints ──────────────────────────────────────────
router.get("/my-attempts", verifyToken, getMyAttempts);
router.get("/course/:courseId/attempts", verifyToken, getCourseAttempts);
router.get("/course/:courseId", optionalAuth, getCourseQuiz);
router.post("/course/:courseId/submit", verifyToken, submitQuiz);

// ── Admin / Manager endpoints ─────────────────────────────────────────
router.post(
  "/course/:courseId",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.MANAGER),
  upsertCourseQuiz
);
router.put(
  "/course/:courseId",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.MANAGER),
  upsertCourseQuiz
);

module.exports = router;

