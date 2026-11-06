const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.model");

// @desc    Enroll student in a course
// @route   POST /api/enrollments
// @access  Private (Student)
const enrollInCourse = async (req, res, next) => {
  try {
    const userId = req.currentUser._id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس مطلوب",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس غير صالح",
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      status: "active",
    });

    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود أو غير متاح حالياً",
      });
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      completedLessons: [],
    });

    return res.status(201).json({
      status: "success",
      message: "تم الاشتراك في الكورس بنجاح",
      data: {
        enrollment,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "أنت مسجل بالفعل في هذا الكورس",
      });
    }

    next(error);
  }
};

// @desc    Get logged-in student's courses with calculated progress
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

    const enrollmentsWithProgress = enrollments.map((enr) => {
      const courseObj = enr.course;
      let totalLessons = 0;

      if (courseObj && Array.isArray(courseObj.sections)) {
        courseObj.sections.forEach((sec) => {
          totalLessons += (sec.lessons || []).length;
        });
      }

      const completedCount = (enr.completedLessons || []).length;
      const progress =
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return {
        ...enr.toObject(),
        progress,
        totalLessons,
        completedCount,
      };
    });

    return res.status(200).json({
      status: "success",
      results: enrollmentsWithProgress.length,
      data: {
        enrollments: enrollmentsWithProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle lesson completion (mark complete / uncomplete)
// @route   POST /api/enrollments/courses/:courseId/lessons/:lessonId/toggle
// @access  Private (Student)
const toggleLessonProgress = async (req, res, next) => {
  try {
    const userId = req.currentUser._id;
    const { courseId, lessonId } = req.params;

    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) {
      return res.status(400).json({
        status: "fail",
        message: "المعرّفات الممررة غير صالحة",
      });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        status: "fail",
        message: "يجب الاشتراك في الكورس أولاً لمتابعة التقدم",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    // Verify lesson exists in course
    let lessonExists = false;
    let totalLessons = 0;

    for (const sec of course.sections) {
      if (sec.lessons.id(lessonId)) {
        lessonExists = true;
      }
      totalLessons += sec.lessons.length;
    }

    if (!lessonExists) {
      return res.status(404).json({
        status: "fail",
        message: "الدرس غير موجود في هذا الكورس",
      });
    }

    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    const isCurrentlyCompleted = enrollment.completedLessons.some((id) =>
      id.equals(lessonObjId)
    );

    let isCompleted = false;

    if (isCurrentlyCompleted) {
      // Unmark complete
      enrollment.completedLessons.pull(lessonObjId);
      isCompleted = false;
    } else {
      // Mark complete
      enrollment.completedLessons.addToSet(lessonObjId);
      isCompleted = true;
    }

    await enrollment.save();

    const completedCount = enrollment.completedLessons.length;
    const progressPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return res.status(200).json({
      status: "success",
      message: isCompleted ? "تم تحديد الدرس كمكتمل" : "تم إلغاء اكتمال الدرس",
      data: {
        isCompleted,
        completedLessons: enrollment.completedLessons,
        progressPercentage,
        totalLessons,
        completedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student progress for specific course
// @route   GET /api/enrollments/courses/:courseId/progress
// @access  Private (Student)
const getCourseProgress = async (req, res, next) => {
  try {
    const userId = req.currentUser._id;
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس غير صالح",
      });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        status: "fail",
        message: "أنت غير مشترك في هذا الكورس",
      });
    }

    const course = await Course.findById(courseId);
    let totalLessons = 0;
    if (course && Array.isArray(course.sections)) {
      course.sections.forEach((sec) => {
        totalLessons += (sec.lessons || []).length;
      });
    }

    const completedCount = enrollment.completedLessons.length;
    const progressPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return res.status(200).json({
      status: "success",
      data: {
        completedLessons: enrollment.completedLessons,
        completedCount,
        totalLessons,
        progressPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  toggleLessonProgress,
  getCourseProgress,
};
