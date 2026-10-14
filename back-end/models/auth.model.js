const mongoose = require("mongoose");
const validator = require('validator');
const userRoles = require("../utils/userRoles");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "filed must be a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  role: {
    type: String, // ["USER", "ADMIN", "MANAGER"]
    enum: [userRoles.USER, userRoles.ADMIN, userRoles.MANAGER],
    default: userRoles.USER,
  },
  avatar: {
    type: String,
    default: function () {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || 'User')}&background=4F46E5&color=fff&bold=true`;
    },
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
