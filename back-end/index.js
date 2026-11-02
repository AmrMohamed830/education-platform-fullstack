const express = require("express");
const app = express();

require("dotenv").config()

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors = require("cors");
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));


app.use(express.json());

const authRoutes=require("./routes/auth.routes")
const courseRoutes = require("./routes/course.routes");



app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);

const url = process.env.MONGO_URL;

const mongoose = require("mongoose");
mongoose
  .connect(url)
  .then(() => {
    console.log("mongodb server connected");
  })
  .catch((err) => {
    console.log("mongodb connection note:", err.message);
  });

app.listen(5000, () => {
  console.log("iam listening");
});
