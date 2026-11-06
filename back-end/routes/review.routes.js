const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const {
  getCourseReviews,
  addOrUpdateReview,
  deleteReview,
} = require("../controllers/review.controller");

// Public route to view course reviews
router.get("/course/:courseId", getCourseReviews);

// Authenticated route to add/edit review
router.post("/course/:courseId", verifyToken, addOrUpdateReview);

// Authenticated route to delete review
router.delete("/:reviewId", verifyToken, deleteReview);

module.exports = router;

