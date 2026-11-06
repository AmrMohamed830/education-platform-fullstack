const Course = require("../models/course.model");
const mongoose = require("mongoose");

const getAllCourses = async (req, res) => {
  try {
    const { search, category, priceType, sort, page, limit } = req.query;

    const filter = {};

    // Search by title or description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Category filter
    if (category && category !== "all" && category !== "الكل") {
      filter.category = category;
    }

    // Price filter
    if (priceType === "free") {
      filter.price = 0;
    } else if (priceType === "paid") {
      filter.price = { $gt: 0 };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === "rating") {
      sortOptions = { averageRating: -1, createdAt: -1 };
    } else if (sort === "price-low") {
      sortOptions = { price: 1, createdAt: -1 };
    } else if (sort === "price-high") {
      sortOptions = { price: -1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    // Total count for filters
    const totalCourses = await Course.countDocuments(filter);

    let query = Course.find(filter).sort(sortOptions);

    let currentPage = 1;
    let totalPages = 1;

    // Optional pagination
    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 9);
      currentPage = pageNum;
      totalPages = Math.ceil(totalCourses / limitNum) || 1;
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const courses = await query.exec();

    // Get all distinct categories for filtering
    const categories = await Course.distinct("category");

    res.status(200).json({
      status: "success",
      data: {
        courses,
        totalCourses,
        totalPages,
        currentPage,
        categories: categories.filter(Boolean),
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "حدث خطأ أثناء جلب الكورسات",
    });
  }
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
  const { title, description, price, image, instructor, category, status } = req.body;

  // Validate required fields
  if (!title || !description || !instructor || !category) {
    return res.status(400).json({
      status: "fail",
      message: "title, description, instructor, and category are required",
    });
  }

  const parsedPrice = Number(price);
  if (price === undefined || price === "" || isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({
      status: "fail",
      message: "price must be a valid non-negative number",
    });
  }

  const newCourse = new Course({
    title,
    description,
    price: parsedPrice,
    image: image || "",
    instructor,
    category,
    status: status || "active",
  });

  await newCourse.save();

  res.status(201).json({ status: "success", data: { course: newCourse } });
};

const updateCourse = async (req, res) => {
  const courseId = req.params.courseId;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid course ID",
    });
  }

  const { title, description, price, image, instructor, category, status } = req.body;

  const updates = {};

  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (image !== undefined) updates.image = image;
  if (instructor !== undefined) updates.instructor = instructor;
  if (category !== undefined) updates.category = category;
  if (status !== undefined) updates.status = status;

  // Validate and convert price when provided
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        status: "fail",
        message: "price must be a valid non-negative number",
      });
    }
    updates.price = parsedPrice;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "No valid fields provided for update",
    });
  }

  // Update course with validators
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

module.exports = { getAllCourses, getCourse, addCourse, updateCourse, deleteCourse };
