const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const {
  getCourseCertificate,
  verifyCertificate,
  getMyCertificates,
} = require("../controllers/certificate.controller");

// Issue or view certificate for a course (authenticated)
router.get("/course/:courseId", verifyToken, getCourseCertificate);

// Public certificate verification
router.get("/verify/:code", verifyCertificate);

// Get all certificates earned by logged-in user
router.get("/my-certificates", verifyToken, getMyCertificates);

module.exports = router;

