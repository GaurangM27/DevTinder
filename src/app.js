const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  throw new Error("xyz");
  res.send("Welcome to all the users");
});

app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something went wrong");
  }
});

app.listen(7777, () => {
  console.log("Server is running on this port 7777");
});
