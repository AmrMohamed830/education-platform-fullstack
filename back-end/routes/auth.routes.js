const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const allowedTo = require("../middleware/authorization.middleware");
const userRoles = require("../utils/userRoles");
const {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
  getAdminStatsAndStudents,
} = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
} = require("../validations/auth.validation");

const validateMiddleware = require("../middleware/validate.middleware");

router.route("/register").post(registerValidation, validateMiddleware, register);

router.route("/login").post(loginValidation, validateMiddleware, login);

router.route("/me").get(verifyToken, getCurrentUser);

router.route("/profile").patch(verifyToken, updateProfile);

router.route("/change-password").patch(verifyToken, changePassword);

router
  .route("/admin/stats")
  .get(verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), getAdminStatsAndStudents);

router.route("/logout").post(logout);

module.exports = router;
