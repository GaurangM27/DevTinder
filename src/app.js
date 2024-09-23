const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  res.send("Welcome to all the users");
});

app.post("/user", (req, res) => {
  res.send("Post new user");
});

app.put("/user", (req, res) => {
  res.send("Update user");
});

app.delete("/user", (req, res) => {
  res.send("Delete user");
});

app.use(
  "/play",
  [
    (req, res, next) => {
      console.log("1");
      res.send("Welcome to the playground");
      next();
    },
    (req, res, next) => {
      console.log("2");
      res.send("Welcome to the playground");
      next();
    },
  ],
  (req, res, next) => {
    res.send("Welcome to the playground");
    next();
  },
  (req, res, next) => {
    res.send("Welcome to the playground");
    //next();
  }
);

app.listen(7777, () => {
  console.log("Server is running on this port 7777");
});
