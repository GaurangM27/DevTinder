const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const { password, firstName, lastName, emailId } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      about: req.body.about,
      skills: req.body.skills,
      photoUrl: req.body.photoUrl,
    });
    const newUser = await user.save();
    const token = await newUser.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: true, // set to true if using HTTPS
      sameSite: "none",
    });
    res.json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(400).send("Error while creating user: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid email address");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: true, // set to true if using HTTPS
        sameSite: "none",
      });
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: true, // set to true if using HTTPS
    sameSite: "none",
  });
  res.send("Logged out successfully");
});

module.exports = authRouter;
