const Course = require("../models/course.model");
const mongoose = require("mongoose");

const getAllCourses = async (req, res) => {
  const courses = await Course.find();
  res.status(200).json({
    status: "success",
    data: {
      courses,
    },
  });
};

const getCourse = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.courseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid course ID",
    });
  }

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }
  return res.json({ status: "success", data: { course } });
};

const addCourse = async (req, res) => {
  const newCourse = new Course(req.body);
  await newCourse.save();

  res.status(201).json({ status: "success", data: { course: newCourse } });
};
const updateCourse = async (req, res) => {
  const courseId = req.params.courseId;

  // Check if ID is valid
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid course ID",
    });
  }

  // Get allowed fields
  const { title, description, price, image } = req.body;

  const updates = {};

  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;
  if (image !== undefined) updates.image = image;

  // Update course
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  );

  // Check if course exists
  if (!updatedCourse) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  return res.status(200).json({
    status: "success",
    data: {
      course: updatedCourse,
    },
  });
};



const deleteCourse = async (req, res) => {
  const courseId = req.params.courseId;

  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid course ID",
    });
  }

  const result = await Course.deleteOne({ _id: courseId });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  return res.status(200).json({
    status: "success",
    data: null,
  });
};
module.exports = { getAllCourses, getCourse, addCourse, updateCourse,deleteCourse };
