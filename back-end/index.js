const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config()
const authRoutes=require("./routes/auth.routes")



app.use("/auth", authRoutes);

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
