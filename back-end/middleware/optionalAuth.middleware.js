const jwt = require("jsonwebtoken");
const User = require("../models/auth.model");

const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.currentUser = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const currentUser = await User.findById(decoded.id).select(
      "-password -token"
    );

    req.currentUser = currentUser || null;
    next();
  } catch {
    // If token is invalid or expired, continue as guest
    req.currentUser = null;
    next();
  }
};

module.exports = optionalAuth;

