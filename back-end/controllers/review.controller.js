const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const userRoles = require("../utils/userRoles");

// Helper to recalculate and sync course average rating
const updateCourseRatingStats = async (courseId) => {
  const objectId = new mongoose.Types.ObjectId(courseId);
  const stats = await Review.aggregate([
    { $match: { course: objectId } },
    {
      $group: {
        _id: "$course",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const avg = Math.round(stats[0].avgRating * 10) / 10;
    await Course.findByIdAndUpdate(courseId, {
      averageRating: avg,
      ratingsCount: stats[0].count,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 5.0,
      ratingsCount: 0,
    });
  }
};

// ── 1. Get All Reviews For a Course ──────────────────────────────────
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ status: "fail", message: "معرّف الكورس غير صالح" });
    }

    const reviews = await Review.find({ course: courseId }).sort({ createdAt: -1 });

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    reviews.forEach((rev) => {
      if (breakdown[rev.rating] !== undefined) {
        breakdown[rev.rating] += 1;
      }
      totalScore += rev.rating;
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10) / 10 : 5.0;

    res.status(200).json({
      status: "success",
      data: {
        reviews,
        totalReviews,
        averageRating,
        breakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message || "فشل جلب تقييمات الكورس" });
  }
};

// ── 2. Add or Update User Review ─────────────────────────────────────
const addOrUpdateReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.currentUser.id || req.currentUser._id;
    const userName = req.currentUser.name || "مستخدم";
    const userAvatar = req.currentUser.avatar || "";

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ status: "fail", message: "معرّف الكورس غير صالح" });
    }

    // Validate rating
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ status: "fail", message: "التقييم يجب أن يكون بين 1 و 5 نجوم" });
    }

    // Validate comment
    if (!comment || !comment.trim()) {
      return res.status(400).json({ status: "fail", message: "يرجى كتابة نص المراجعة أو التعليق" });
    }

    // Check course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: "fail", message: "الكورس غير موجود" });
    }

    // Check enrollment: Only enrolled students or admins can review
    const isPrivileged = [userRoles.ADMIN, userRoles.MANAGER].includes(req.currentUser.role);
    if (!isPrivileged) {
      const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
      if (!enrollment) {
        return res.status(403).json({
          status: "fail",
          message: "يجب أن تكون مشتركاً في الكورس أولاً حتى تتمكن من تقييمه",
        });
      }
    }

    // Upsert the review
    const updatedReview = await Review.findOneAndUpdate(
      { course: courseId, user: userId },
      {
        course: courseId,
        user: userId,
        userName,
        userAvatar,
        rating: parsedRating,
        comment: comment.trim(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Recalculate course stats
    await updateCourseRatingStats(courseId);

    res.status(200).json({
      status: "success",
      message: "تم حفظ تقييمك بنجاح",
      data: { review: updatedReview },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message || "تعذر حفظ التقييم" });
  }
};

// ── 3. Delete Review ─────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.currentUser.id || req.currentUser._id;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({ status: "fail", message: "معرّف التقييم غير صالح" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ status: "fail", message: "التقييم غير موجود" });
    }

    const isAuthor = review.user.toString() === userId.toString();
    const isPrivileged = [userRoles.ADMIN, userRoles.MANAGER].includes(req.currentUser.role);

    if (!isAuthor && !isPrivileged) {
      return res.status(403).json({ status: "fail", message: "غير مسموح لك بحذف هذا التقييم" });
    }

    const courseId = review.course;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate course stats
    await updateCourseRatingStats(courseId);

    res.status(200).json({
      status: "success",
      message: "تم حذف التقييم بنجاح",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message || "تعذر حذف التقييم" });
  }
};

module.exports = {
  getCourseReviews,
  addOrUpdateReview,
  deleteReview,
};

