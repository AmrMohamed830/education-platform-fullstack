const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const userRoles = require("../utils/userRoles");

// Helper: Check if current user has full access (admin/manager or enrolled student)
const checkFullAccess = async (currentUser, courseId) => {
  if (!currentUser) return false;

  // Admins and Managers have full access
  if ([userRoles.ADMIN, userRoles.MANAGER].includes(currentUser.role)) {
    return true;
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    user: currentUser._id,
    course: courseId,
  });

  return !!enrollment;
};

// @desc    Get course curriculum (with access-based video/resource sanitization)
// @route   GET /courses/:courseId/curriculum
// @access  Public / Optional Auth
const getCourseCurriculum = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس غير صالح",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    const hasFullAccess = await checkFullAccess(req.currentUser, courseId);

    // Sort sections by order
    const sections = (course.sections || []).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    let totalLessons = 0;
    let totalDuration = 0;

    const sanitizedSections = sections.map((sec) => {
      // Sort lessons by order
      const sortedLessons = (sec.lessons || []).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      const lessons = sortedLessons.map((les) => {
        totalLessons += 1;
        totalDuration += les.duration || 0;

        const isAllowed = hasFullAccess || les.isPreview;

        return {
          _id: les._id,
          title: les.title,
          description: les.description,
          duration: les.duration,
          order: les.order,
          isPreview: les.isPreview,
          videoUrl: isAllowed ? les.videoUrl : "",
          resources: isAllowed ? les.resources : [],
          isLocked: !isAllowed,
          createdAt: les.createdAt,
          updatedAt: les.updatedAt,
        };
      });

      return {
        _id: sec._id,
        title: sec.title,
        description: sec.description,
        order: sec.order,
        lessons,
      };
    });

    return res.status(200).json({
      status: "success",
      data: {
        sections: sanitizedSections,
        totalSections: sanitizedSections.length,
        totalLessons,
        totalDuration,
        hasFullAccess,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson content
// @route   GET /courses/:courseId/lessons/:lessonId
// @access  Public for Preview, Private for Enrolled/Admin
const getLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس أو الدرس غير صالح",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    let targetSection = null;
    let targetLesson = null;

    for (const sec of course.sections) {
      const les = sec.lessons.id(lessonId);
      if (les) {
        targetSection = sec;
        targetLesson = les;
        break;
      }
    }

    if (!targetLesson) {
      return res.status(404).json({
        status: "fail",
        message: "الدرس غير موجود",
      });
    }

    // Access check: preview or full access
    if (!targetLesson.isPreview) {
      const hasFullAccess = await checkFullAccess(req.currentUser, courseId);
      if (!hasFullAccess) {
        return res.status(403).json({
          status: "fail",
          message: "هذا الدرس محمي ومتاح فقط للطلاب المشتركين في الكورس",
        });
      }
    }

    return res.status(200).json({
      status: "success",
      data: {
        lesson: targetLesson,
        section: {
          _id: targetSection._id,
          title: targetSection.title,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a section to course
// @route   POST /courses/:courseId/sections
// @access  Private (Admin, Manager)
const addSection = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس غير صالح",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "عنوان الوحدة مطلوب",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    const newOrder = course.sections.length;
    const newSection = {
      title: title.trim(),
      description: description ? description.trim() : "",
      order: newOrder,
      lessons: [],
    };

    course.sections.push(newSection);
    await course.save();

    const createdSection = course.sections[course.sections.length - 1];

    return res.status(201).json({
      status: "success",
      message: "تم إنشاء الوحدة بنجاح",
      data: {
        section: createdSection,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a section
// @route   PATCH /courses/:courseId/sections/:sectionId
// @access  Private (Admin, Manager)
const updateSection = async (req, res, next) => {
  try {
    const { courseId, sectionId } = req.params;
    const { title, description, order } = req.body;

    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس أو الوحدة غير صالح",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({
        status: "fail",
        message: "الوحدة غير موجودة",
      });
    }

    if (title !== undefined) section.title = title.trim();
    if (description !== undefined) section.description = description.trim();
    if (order !== undefined && !isNaN(Number(order))) section.order = Number(order);

    await course.save();

    return res.status(200).json({
      status: "success",
      message: "تم تعديل الوحدة بنجاح",
      data: {
        section,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a section
// @route   DELETE /courses/:courseId/sections/:sectionId
// @access  Private (Admin, Manager)
const deleteSection = async (req, res, next) => {
  try {
    const { courseId, sectionId } = req.params;

    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس أو الوحدة غير صالح",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({
        status: "fail",
        message: "الوحدة غير موجودة",
      });
    }

    course.sections.pull(sectionId);
    await course.save();

    return res.status(200).json({
      status: "success",
      message: "تم حذف الوحدة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add lesson to section
// @route   POST /courses/:courseId/sections/:sectionId/lessons
// @access  Private (Admin, Manager)
const addLesson = async (req, res, next) => {
  try {
    const { courseId, sectionId } = req.params;
    const { title, description, videoUrl, duration, isPreview, resources } = req.body;

    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس أو الوحدة غير صالح",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "عنوان الدرس مطلوب",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({
        status: "fail",
        message: "الوحدة غير موجودة",
      });
    }

    const newOrder = section.lessons.length;
    const newLesson = {
      title: title.trim(),
      description: description ? description.trim() : "",
      videoUrl: videoUrl ? videoUrl.trim() : "",
      duration: duration !== undefined && !isNaN(Number(duration)) ? Number(duration) : 0,
      order: newOrder,
      isPreview: Boolean(isPreview),
      resources: Array.isArray(resources) ? resources : [],
    };

    section.lessons.push(newLesson);
    await course.save();

    const createdLesson = section.lessons[section.lessons.length - 1];

    return res.status(201).json({
      status: "success",
      message: "تمت إضافة الدرس بنجاح",
      data: {
        lesson: createdLesson,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lesson
// @route   PATCH /courses/:courseId/sections/:sectionId/lessons/:lessonId
// @access  Private (Admin, Manager)
const updateLesson = async (req, res, next) => {
  try {
    const { courseId, sectionId, lessonId } = req.params;
    const { title, description, videoUrl, duration, order, isPreview, resources } = req.body;

    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(sectionId) ||
      !mongoose.isValidObjectId(lessonId)
    ) {
      return res.status(400).json({
        status: "fail",
        message: "المعرّفات الممررة غير صالحة",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({
        status: "fail",
        message: "الوحدة غير موجودة",
      });
    }

    const lesson = section.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({
        status: "fail",
        message: "الدرس غير موجود",
      });
    }

    if (title !== undefined) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description.trim();
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl.trim();
    if (duration !== undefined && !isNaN(Number(duration))) lesson.duration = Number(duration);
    if (order !== undefined && !isNaN(Number(order))) lesson.order = Number(order);
    if (isPreview !== undefined) lesson.isPreview = Boolean(isPreview);
    if (resources !== undefined && Array.isArray(resources)) lesson.resources = resources;

    await course.save();

    return res.status(200).json({
      status: "success",
      message: "تم تعديل الدرس بنجاح",
      data: {
        lesson,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lesson
// @route   DELETE /courses/:courseId/sections/:sectionId/lessons/:lessonId
// @access  Private (Admin, Manager)
const deleteLesson = async (req, res, next) => {
  try {
    const { courseId, sectionId, lessonId } = req.params;

    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(sectionId) ||
      !mongoose.isValidObjectId(lessonId)
    ) {
      return res.status(400).json({
        status: "fail",
        message: "المعرّفات الممررة غير صالحة",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({
        status: "fail",
        message: "الوحدة غير موجودة",
      });
    }

    const lesson = section.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({
        status: "fail",
        message: "الدرس غير موجود",
      });
    }

    section.lessons.pull(lessonId);
    await course.save();

    return res.status(200).json({
      status: "success",
      message: "تم حذف الدرس بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder sections and lessons
// @route   PUT /courses/:courseId/curriculum/reorder
// @access  Private (Admin, Manager)
const reorderCurriculum = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { sectionsOrder } = req.body;
    // sectionsOrder: [ { sectionId, order, lessonsOrder: [ { lessonId, order } ] } ]

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        status: "fail",
        message: "معرّف الكورس غير صالح",
      });
    }

    if (!Array.isArray(sectionsOrder)) {
      return res.status(400).json({
        status: "fail",
        message: "بيانات الترتيب غير صالحة",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "الكورس غير موجود",
      });
    }

    for (const secItem of sectionsOrder) {
      const section = course.sections.id(secItem.sectionId);
      if (section) {
        if (secItem.order !== undefined) {
          section.order = secItem.order;
        }

        if (Array.isArray(secItem.lessonsOrder)) {
          for (const lesItem of secItem.lessonsOrder) {
            const lesson = section.lessons.id(lesItem.lessonId);
            if (lesson && lesItem.order !== undefined) {
              lesson.order = lesItem.order;
            }
          }
        }
      }
    }

    await course.save();

    return res.status(200).json({
      status: "success",
      message: "تم تحديث ترتيب المنهج بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseCurriculum,
  getLesson,
  addSection,
  updateSection,
  deleteSection,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderCurriculum,
};

