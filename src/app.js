const express = require("express");

const app = express();

app.use("/home", (req, res) => {
  res.send("Welcome to Home Page");
});

app.use("/test", (req, res) => {
  res.send("Testing Page");
});

app.listen(7777, () => {
  console.log("Server is running on this port 7777");
});
