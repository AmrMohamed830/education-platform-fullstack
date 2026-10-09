const User = require("../models/auth.model");
const bcrypt = require("bcrypt");
const generateJwt = require("../utils/generateJWT");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    return res.status(409).json("user already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  const token = await generateJwt({
    email: newUser.email,
    id: newUser._id,
  });
  newUser.token = token;

  await newUser.save();
  const { password: userPassword, token: userToken, ...userData } = newUser.toObject();
  res.status(201).json({
    status: "success",
    data: {
      user: userData,
      token,
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
      const { password: userPassword, token: userToken, ...userData } = findUserByEmail.toObject();

      res.status(200).json({
        status: "success",
        data: {
          user: userData,
          token,
        },
      });
    } else {
      res.status(401).json("the Email or password are not correct");
    }
  } else {
    return res.status(401).json("the Email or password are not correct");
  }
};

module.exports = {
  register,
  login,
};
