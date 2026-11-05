const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const allowedTo = require("../middleware/authorization.middleware");
const userRoles = require("../utils/userRoles");

const {
  enrollInCourse,
  getMyEnrollments,
} = require("../controllers/enrollment.controller");

// Student authentication and authorization
router.use(verifyToken, allowedTo(userRoles.USER));

// Enroll in a course
router.post("/", enrollInCourse);

// Get logged-in student's courses
router.get("/my-courses", getMyEnrollments);

module.exports = router;