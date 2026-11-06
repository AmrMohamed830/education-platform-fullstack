const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const optionalAuth = require("../middleware/optionalAuth.middleware");
const allowedTo = require("../middleware/authorization.middleware");
const userRoles = require("../utils/userRoles");

const {
  getAllCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/course.controller");

const {
  getCourseCurriculum,
  getLesson,
  addSection,
  updateSection,
  deleteSection,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderCurriculum,
} = require("../controllers/curriculum.controller");

const adminOrManager = [userRoles.ADMIN, userRoles.MANAGER];

// ── Course Base Routes ────────────────────────────────────────────────
router
  .route("/")
  .get(getAllCourses)
  .post(verifyToken, allowedTo(...adminOrManager), addCourse);

router
  .route("/:courseId")
  .get(getCourse)
  .patch(verifyToken, allowedTo(...adminOrManager), updateCourse)
  .delete(verifyToken, allowedTo(...adminOrManager), deleteCourse);

// ── Curriculum Routes ─────────────────────────────────────────────────
router.get("/:courseId/curriculum", optionalAuth, getCourseCurriculum);
router.put("/:courseId/curriculum/reorder", verifyToken, allowedTo(...adminOrManager), reorderCurriculum);

// Single Lesson View
router.get("/:courseId/lessons/:lessonId", optionalAuth, getLesson);

// Section CRUD
router.post("/:courseId/sections", verifyToken, allowedTo(...adminOrManager), addSection);
router.patch("/:courseId/sections/:sectionId", verifyToken, allowedTo(...adminOrManager), updateSection);
router.delete("/:courseId/sections/:sectionId", verifyToken, allowedTo(...adminOrManager), deleteSection);

// Lesson CRUD
router.post("/:courseId/sections/:sectionId/lessons", verifyToken, allowedTo(...adminOrManager), addLesson);
router.patch("/:courseId/sections/:sectionId/lessons/:lessonId", verifyToken, allowedTo(...adminOrManager), updateLesson);
router.delete("/:courseId/sections/:sectionId/lessons/:lessonId", verifyToken, allowedTo(...adminOrManager), deleteLesson);

module.exports = router;
