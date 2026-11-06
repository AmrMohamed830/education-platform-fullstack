const User = require("../models/auth.model");
const bcrypt = require("bcrypt");
const generateJwt = require("../utils/generateJWT");

const getAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

const register = async (req, res) => {
  const { name, email, password, avatar } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    return res.status(409).json("user already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=4F46E5&color=fff&bold=true`;

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    avatar: avatar || defaultAvatar,
  });

  const token = await generateJwt({
    email: newUser.email,
    id: newUser._id,
  });
  
  await newUser.save();

  res.cookie("token", token, getAuthCookieOptions());


  const { password: userPassword, token: userToken, ...userData } = newUser.toObject();
  res.status(201).json({
    status: "success",
    data: {
      user: userData,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const findUserByEmail = await User.findOne({ email });
  if (findUserByEmail) {
    const matchedPassword = await bcrypt.compare(
      password,
      findUserByEmail.password,
    );
    if (matchedPassword) {
      const token = await generateJwt({
        email: findUserByEmail.email,
        id: findUserByEmail._id,
      });
        
      res.cookie("token", token, getAuthCookieOptions());

      const { password: userPassword, token: userToken, ...userData } = findUserByEmail.toObject();

      res.status(200).json({
        status: "success",
        data: {
          user: userData,
        },
      });
    } else {
      res.status(401).json("the Email or password are not correct");
    }
  } else {
    return res.status(401).json("the Email or password are not correct");
  }
};

const getCurrentUser = async (req, res) => {
  if (req.currentUser) {
    res.status(200).json({
      status: "success",
      data: {
        user: req.currentUser,
      },
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.currentUser.id || req.currentUser._id;
    const { name, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "الاسم مطلوب ولا يمكن تركه فارغاً",
      });
    }

    const updates = { name: name.trim() };
    if (avatar !== undefined) {
      updates.avatar = avatar.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password -token");

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "المستخدم غير موجود",
      });
    }

    res.status(200).json({
      status: "success",
      message: "تم تحديث البيانات الشخصية بنجاح",
      data: { user: updatedUser },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "حدث خطأ أثناء تحديث الملف الشخصي",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.currentUser.id || req.currentUser._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "كلمة المرور الحالية وكلمة المرور الجديدة مطلوبتان",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "المستخدم غير موجود",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        message: "كلمة المرور الحالية غير صحيحة",
      });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    user.password = hashedNew;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "حدث خطأ أثناء تغيير كلمة المرور",
    });
  }
};

const getAdminStatsAndStudents = async (req, res) => {
  try {
    const Course = require("../models/course.model");
    const Enrollment = require("../models/enrollment.model");
    const Review = require("../models/review.model");
    const userRoles = require("../utils/userRoles");

    // Fetch real students
    const students = await User.find({ role: userRoles.USER })
      .select("-password -token")
      .sort({ createdAt: -1 })
      .limit(20);

    // Get total counts
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: userRoles.USER });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Map each student with their enrolled courses
    const studentListWithEnrollments = await Promise.all(
      students.map(async (st) => {
        const enrollments = await Enrollment.find({ user: st._id })
          .populate("course", "title")
          .limit(2);
        const courseNames = enrollments.map((e) => e.course?.title || "كورس").join("، ");
        return {
          id: st._id,
          name: st.name,
          email: st.email,
          avatar: st.avatar,
          course: courseNames || "لم يسجل بعد",
          date: new Date(st.createdAt).toLocaleDateString("ar-EG"),
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalCourses,
          totalStudents,
          totalEnrollments,
          totalReviews,
        },
        students: studentListWithEnrollments,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "حدث خطأ أثناء جلب إحصائيات لوحة الإدارة",
    });
  }
};

const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
  getAdminStatsAndStudents,
};
