const jwt = require("jsonwebtoken");
const User = require("../models/auth.model");

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const currentUser = await User.findById(decoded.id).select(
      "-password -token",
    );

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "User not found",
      });
    }

    req.currentUser = currentUser;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid or expired token",
      });
    }

    return next(err);
  }
};

module.exports = verifyToken;
