const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const authHeader =req.headers.authorization
    if(!authHeader){
        return res.status(401).json({message:"Token is required"})
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
        return res.status(401).json({message: "Invalid authorization format"});
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