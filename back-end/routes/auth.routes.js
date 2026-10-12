const express = require("express");
const router=express.Router()
const verifyToken = require("../middleware/auth.middleware");
const {register,login,getCurrentUser,logout} =require("../controllers/auth.controller")

router.route("/register")
        .post(register)

router.route("/login")
        .post(login)


router.route("/me")
        .get(verifyToken,getCurrentUser);

router.route("/logout")
        .post(logout);


module.exports = router;

