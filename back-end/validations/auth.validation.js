const { body } = require("express-validator");

const registerValidation = [
  // Name Validation
  body("name")
    .isString()
    .withMessage("الاسم يجب أن يكون نصًا")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("الاسم مطلوب")
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("الاسم يجب أن يكون من 3 إلى 50 حرفًا"),

  // Email Validation
  body("email")
    .isString()
    .withMessage("البريد الإلكتروني يجب أن يكون نصًا")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("البريد الإلكتروني مطلوب")
    .bail()
    .isLength({ max: 254 })
    .withMessage("البريد الإلكتروني طويل جدًا")
    .bail()
    .isEmail()
    .withMessage("يرجى إدخال بريد إلكتروني صحيح"),

  // Password Validation
  body("password")
    .isString()
    .withMessage("كلمة المرور يجب أن تكون نصًا")
    .bail()
    .notEmpty()
    .withMessage("كلمة المرور مطلوبة")
    .bail()
    .isLength({ min: 8, max: 64 })
    .withMessage("كلمة المرور يجب أن تكون من 8 إلى 64 حرفًا"),
];

module.exports = registerValidation;