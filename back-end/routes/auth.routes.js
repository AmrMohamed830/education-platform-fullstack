const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const {
  register,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
} = require("../validations/auth.validation");

const validateMiddleware = require("../middleware/validate.middleware");

router.route("/register").post(registerValidation, validateMiddleware, register);

router.route("/login").post(loginValidation, validateMiddleware, login);

router.route("/me").get(verifyToken, getCurrentUser);

router.route("/logout").post(logout);

module.exports = router;
