const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
    if(!token){
        return res.status(401).json({message:"Token is required"})
    }
    try{
        const currentUser = jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.currentUser=currentUser
        next()
    }catch(err){
        return res.status(401).json({message: "Invalid or expired token"})
    }
};
module.exports = verifyToken;