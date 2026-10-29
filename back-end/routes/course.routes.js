const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const {
  getAllCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/course.controller");

const allowedTo = require("../middleware/authorization.middleware");
const userRoles = require("../utils/userRoles");



router.route("/")
.get(getAllCourses)
.post(verifyToken,allowedTo(userRoles.ADMIN),addCourse)


router.route('/:courseId')
.get(getCourse)
.patch(verifyToken,allowedTo(userRoles.ADMIN),updateCourse)
.delete(verifyToken,allowedTo(userRoles.ADMIN),deleteCourse)