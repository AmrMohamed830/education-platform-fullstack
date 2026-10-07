const express = require("express");

const app = express();
app.get("/courses", (req, res) => {
  res.send("All courses");
});

app.listen(5000, () => {
  console.log("iam listening");
});
