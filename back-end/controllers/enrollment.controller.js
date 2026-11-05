const mongoose = require("mongoose");

const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.model");

// @desc    Enroll student in a course
// @route   POST /api/enrollments
// @access  Private (Student)
const enrollInCourse = async (req, res, next) => {
  try {
    // 1. Get user ID from authenticated user
    const userId = req.currentUser._id;
    // 2. Get course ID from request body
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        status: "fail",
        message: "Course ID is required",
      });
    }

    // 3. Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid course ID",
      });
    }

    // 4. Check if course exists and is active
    const course = await Course.findOne({
      _id: courseId,
      status: "active",
    });

    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found or unavailable",
      });
    }

    // 5. Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
    });

    // 6. Send response
    return res.status(201).json({
      status: "success",
      message: "Successfully enrolled in course",
      data: {
        enrollment,
      },
    });
  } catch (error) {
    // Handle duplicate enrollment
    if (error.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "You are already enrolled in this course",
      });
    }

    next(error);
  }
};

// @desc    Get logged-in student's courses
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
const getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.currentUser._id;
    const enrollments = await Enrollment.find({
      user: userId,
    })
      .populate("course")
      .sort({ enrolledAt: -1 });

    return res.status(200).json({
      status: "success",
      results: enrollments.length,
      data: {
        enrollments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
};
