const User = require("../models/auth.model");
const bcrypt = require("bcrypt");
const generateJwt = require("../utils/generateJWT");

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

  res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});


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
        
  res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});

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

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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
};
