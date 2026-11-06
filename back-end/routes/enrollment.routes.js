const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const allowedTo = require("../middleware/authorization.middleware");
const userRoles = require("../utils/userRoles");

const {
  enrollInCourse,
  getMyEnrollments,
  toggleLessonProgress,
  getCourseProgress,
} = require("../controllers/enrollment.controller");

// Student authentication and authorization for all enrollment endpoints
router.use(verifyToken, allowedTo(userRoles.USER));

// Enroll in a course
router.post("/", enrollInCourse);

// Get logged-in student's courses with calculated progress
router.get("/my-courses", getMyEnrollments);

// Progress tracking endpoints
router.post("/courses/:courseId/lessons/:lessonId/toggle", toggleLessonProgress);
router.get("/courses/:courseId/progress", getCourseProgress);

module.exports = router;
