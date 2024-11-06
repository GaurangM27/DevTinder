const express = require("express");

const app = express();

const User = require("./models/user");

const connectDb = require("./config/database");

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "Gaurang",
    lastName: "Mishra",
    emailId: "gaurangmishra2712@gmail.com",
    password: "password123",
    age: 22,
    gender: "Male",
  });

  try {
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error while creating user");
  }
});

connectDb()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
      console.log("Server is running on this port 7777");
    });
  })
  .catch((err) => {
    console.log("Error while connecting to database");
  });
